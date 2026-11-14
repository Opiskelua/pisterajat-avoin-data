// Todistusvalinnan pisteet avoimesta datasta: esimerkkitoteutus.
// Reference implementation: Finnish certificate-based admission (todistusvalinta) points from open data.
//
// Data:  https://opiskeluakatemia.fi/avoin-data/todistusvalinnan-pisteytys.json
// Ohje:  https://opiskeluakatemia.fi/avoin-data/kehittajille
//
// Datan lisenssi on CC BY 4.0. Näytä sovelluksessasi lähde, esimerkiksi:
//   <a href="https://opiskeluakatemia.fi/avoin-data">Data: Opiskeluakatemia</a> (CC BY 4.0)
// Tämän esimerkkikoodin saa kopioida ja muokata vapaasti (CC0). Ei riippuvuuksia.
//
// Käyttö / usage:
//   const data = await fetch('https://opiskeluakatemia.fi/avoin-data/todistusvalinnan-pisteytys.json').then((r) => r.json());
//   const exams = [
//     { subject: 'fi-native', level: 'native', grade: 'E' },
//     { subject: 'math', level: 'long', grade: 'M' },
//     { subject: 'en', level: 'long', grade: 'L' },
//     { subject: 'sv', level: 'medium', grade: 'C' },
//     { subject: 'history', level: 'real', grade: 'E' },
//   ];
//   calculatePoints(data, exams, 'kauppatieteet'); // { points, maxPoints, counted: [{ exam, slot, points }], ... }
//   checkThreshold(data, exams, 'kauppatieteet');  // 'met' | 'unmet' | 'none' | 'manual'

const GRADES = ['L', 'E', 'M', 'C', 'B', 'A'];

const findField = (data, fieldId) => {
  const field = data.fields.find((f) => f.id === fieldId);
  if (!field) throw new Error(`Tuntematon ala (unknown field): ${fieldId}`);
  return field;
};

/**
 * Parhaat mahdolliset todistusvalinnan pisteet annetuille kokeille ja alalle.
 * @param data    todistusvalinnan-pisteytys.json
 * @param exams   [{ subject, level, grade }]: subject = data.subjects[].id, level = native | long | medium | short | real, grade = L…A (I = hylätty)
 * @param fieldId data.fields[].id, esimerkiksi 'kauppatieteet', 'laaketiede' tai 'amk'
 * @param options date (YYYY-MM-DD tai Date): päivä, jonka sääntöjä käytetään. Oletus tänään.
 */
export function calculatePoints(data, exams, fieldId, { date = new Date() } = {}) {
  const field = findField(data, fieldId);
  const table = data.tables.find((t) => t.id === field.table);
  const subjects = Object.fromEntries(data.subjects.map((s) => [s.id, s]));
  const day = typeof date === 'string' ? date : date.toISOString().slice(0, 10);
  const valid = exams.filter((e) => subjects[e.subject]?.levels.includes(e.level) && GRADES.includes(e.grade));
  const natives = valid.filter((e) => subjects[e.subject].kind === 'native');
  const bestNative = Math.min(...natives.map((e) => GRADES.indexOf(e.grade)));
  // Kymmenesosina, jotta liukuluvut eivät pyöristy väärin (36.1 + 28.3 …).
  const tenths = (row, exam) => Math.round(row.points[GRADES.indexOf(exam.grade)] * 10);

  const matches = (match, exam) => {
    const subject = subjects[exam.subject];
    if (match.from && day < match.from) return false;
    if (match.kind && subject.kind !== match.kind) return false;
    // Yliopistojen taulukoissa äidinkielen paikkaan kelpaa vain paras äidinkielen koe.
    if (match.best && GRADES.indexOf(exam.grade) !== bestNative) return false;
    if (match.subjects && !match.subjects.includes(subject.id)) return false;
    if (match.exceptSubjects && match.exceptSubjects.includes(subject.id)) return false;
    if (match.level && exam.level !== match.level) return false;
    if (match.domestic !== undefined && Boolean(subject.domestic) !== match.domestic) return false;
    if (match.targetLanguage && (subject.id !== field.targetLanguage || (field.targetLevels && !field.targetLevels.includes(exam.level)))) return false;
    return true;
  };

  // "Muu aine": taulukon other-rivit.
  const otherPoints = (exam) => {
    const subject = subjects[exam.subject];
    // Haettava kieli pisteytetään vain omassa paikassaan.
    if (field.targetLanguage && subject.group === field.targetLanguage) return 0;
    // Toinen äidinkielen koe pisteytetään pitkänä kielenä; yksi ainoa äidinkieli ei tuota pisteitä täältä.
    const row = subject.kind === 'native'
      ? natives.length >= 2 ? table.other.find((r) => r.match.kind === 'language' && r.match.level === 'long') : undefined
      : table.other.find((r) => matches(r.match, exam));
    return row ? tenths(row, exam) : 0;
  };

  const slots = table.slots.map((slot) => ({
    label: slot.label,
    score: (exam) => {
      if (slot.from === 'other') return slot.kind && subjects[exam.subject].kind !== slot.kind ? 0 : otherPoints(exam);
      const row = slot.rows.find((r) => matches(r.match, exam));
      return row ? tenths(row, exam) : 0;
    },
  }));

  // Sama aine (group) tuottaa pisteitä vain kerran. Käydään läpi kaikki tavat jakaa aineet paikkoihin
  // (enintään 6 paikkaa eli 64 tilaa) ja valitaan suurin summa.
  const groups = new Map();
  for (const exam of valid) {
    const group = subjects[exam.subject].group;
    groups.set(group, [...(groups.get(group) ?? []), exam]);
  }
  let states = new Map([[0, { total: 0, counted: [] }]]);
  for (const alternatives of groups.values()) {
    const next = new Map(states);
    for (const [mask, state] of states) for (const exam of alternatives) slots.forEach((slot, i) => {
      if (mask & (1 << i)) return;
      const points = slot.score(exam);
      if (points <= 0) return;
      const key = mask | (1 << i);
      const total = state.total + points;
      if (!next.has(key) || next.get(key).total < total) next.set(key, { total, counted: [...state.counted, { exam, slot: slot.label, points: points / 10 }] });
    });
    states = next;
  }
  const best = [...states.values()].reduce((a, b) => (b.total > a.total ? b : a));
  return { points: best.total / 10, maxPoints: field.maxPoints ?? table.maxPoints, counted: best.counted, field: field.id, table: table.id, source: table.source };
}

/**
 * Täyttyykö alan kynnysehto: 'met' = täyttyy, 'unmet' = ei täyty, 'none' = alalla ei ole kynnysehtoa,
 * 'manual' = ehtoa ei voi tarkistaa koneellisesti (näytä käyttäjälle field.threshold).
 */
export function checkThreshold(data, exams, fieldId) {
  const field = findField(data, fieldId);
  if (field.noThreshold) return 'none';
  if (!field.rule) return 'manual';
  const passes = (req) => exams.some((e) => req.subjects.includes(e.subject) && (!req.levels || req.levels.includes(e.level)) && GRADES.includes(e.grade) && GRADES.indexOf(e.grade) <= GRADES.indexOf(req.min));
  return field.rule.every((group) => group.some(passes)) ? 'met' : 'unmet';
}

// Suomenkieliset nimet samoille funktioille.
export { calculatePoints as laskePisteet, checkThreshold as tarkistaKynnysehto };
