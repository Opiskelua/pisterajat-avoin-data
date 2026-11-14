// Aja: node examples/laske.mjs
// Laskee esimerkkitodistuksen pisteet kolmelle alalle tämän repon datasta (ei verkkoyhteyttä).
// Run: node examples/laske.mjs — scores a sample certificate for three fields from the data in this repo.
import { readFileSync } from 'node:fs';
import { calculatePoints, checkThreshold } from './todistusvalinta-esimerkki.mjs';

const data = JSON.parse(readFileSync(new URL('../data/todistusvalinnan-pisteytys.json', import.meta.url), 'utf8'));
// Verkosta / from the web:
// const data = await fetch('https://opiskeluakatemia.fi/avoin-data/todistusvalinnan-pisteytys.json').then((r) => r.json());

const exams = [
  { subject: 'fi-native', level: 'native', grade: 'E' },
  { subject: 'math', level: 'long', grade: 'M' },
  { subject: 'en', level: 'long', grade: 'L' },
  { subject: 'sv', level: 'medium', grade: 'C' },
  { subject: 'history', level: 'real', grade: 'E' },
];

for (const fieldId of ['kauppatieteet', 'oikeustieteet', 'amk']) {
  const field = data.fields.find((f) => f.id === fieldId);
  const result = calculatePoints(data, exams, fieldId);
  console.log(`${field.name}: ${result.points} / ${result.maxPoints} p. (kynnysehto: ${checkThreshold(data, exams, fieldId)})`);
  for (const { exam, slot, points } of result.counted) console.log(`  ${slot}: ${exam.subject} ${exam.level} ${exam.grade} = ${points}`);
}
console.log('\nData: Opiskeluakatemia (opiskeluakatemia.fi/avoin-data), CC BY 4.0');
