# Todistusvalinnan pisteytys ja pisterajat avoimena datana

Data todistusvalintalaskurin rakentamiseen: yliopistojen ja ammattikorkeakoulujen **pisteytystaulukot**, alojen **kynnysehdot**, hakukohteiden **pisterajat** ja ylioppilaskokeiden **arvosanarajat** koneluettavina JSON- ja CSV-tiedostoina. Ei API-avainta, CORS auki, pysyvät osoitteet, lisenssi CC BY 4.0. Koonnut [Opiskeluakatemia](https://opiskeluakatemia.fi/avoin-data).

*In English: open data for building a Finnish university admission points calculator (todistusvalintalaskuri). See [below](#in-english).*

| Tiedosto | Sisältö |
| --- | --- |
| [`data/todistusvalinnan-pisteytys.json`](data/todistusvalinnan-pisteytys.json) | Aineet, yliopistojen 11 pisteytystaulukkoa (2026 alkaen), ammattikorkeakoulujen taulukko, alat kynnysehtoineen ja laskentasäännöt. Tämä yksi tiedosto riittää pisteiden laskemiseen. |
| [`data/korkeakoulujen-pisterajat.json`](data/korkeakoulujen-pisterajat.json) | Hakukohteiden alimmat ja ylimmät hyväksytyt pisteet todistusvalinnassa, ensikertalaiset ja ei-ensikertalaiset erikseen, uusin ja aiemmat aloituskerrat, pisteytystaulukon numero joka rivillä (Vipunen) |
| [`data/korkeakoulujen-pisterajat.csv`](data/korkeakoulujen-pisterajat.csv) | Samat pisterajat CSV-muodossa |
| [`data/yo-pisterajat.json`](data/yo-pisterajat.json) | Ylioppilaskokeiden arvosanojen L–A alimmat pistemäärät aineittain ja tutkintokerroittain sekä kokeiden enimmäispisteet (YTL) |
| [`data/yo-pisterajat.csv`](data/yo-pisterajat.csv) | Samat arvosanarajat CSV-muodossa |
| [`examples/todistusvalinta-esimerkki.mjs`](examples/todistusvalinta-esimerkki.mjs) | Esimerkkitoteutus ilman riippuvuuksia: `calculatePoints` ja `checkThreshold` |

Ajantasaisimmat tiedostot ladataan aina samoista osoitteista:

- https://opiskeluakatemia.fi/avoin-data/todistusvalinnan-pisteytys.json
- https://opiskeluakatemia.fi/avoin-data/korkeakoulujen-pisterajat.json
- https://opiskeluakatemia.fi/avoin-data/korkeakoulujen-pisterajat.csv
- https://opiskeluakatemia.fi/avoin-data/yo-pisterajat.json
- https://opiskeluakatemia.fi/avoin-data/yo-pisterajat.csv
- https://opiskeluakatemia.fi/avoin-data/todistusvalinta-esimerkki.mjs

Ohje kehittäjille: <https://opiskeluakatemia.fi/avoin-data/kehittajille>. Sarakkeiden kuvaukset: <https://opiskeluakatemia.fi/avoin-data>. Sama aineisto Hugging Facessa: <https://huggingface.co/datasets/Opiskeluakatemia/pisterajat-avoin-data>

## Rakenna todistusvalintalaskuri

```js
import { calculatePoints, checkThreshold } from './examples/todistusvalinta-esimerkki.mjs';

const data = await fetch('https://opiskeluakatemia.fi/avoin-data/todistusvalinnan-pisteytys.json').then((r) => r.json());

const exams = [
  { subject: 'fi-native', level: 'native', grade: 'E' },
  { subject: 'math', level: 'long', grade: 'M' },
  { subject: 'en', level: 'long', grade: 'L' },
  { subject: 'sv', level: 'medium', grade: 'C' },
  { subject: 'history', level: 'real', grade: 'E' },
];

calculatePoints(data, exams, 'kauppatieteet');
// { points: 116.4, maxPoints: 149.9, counted: [{ exam, slot, points }, …], table: 3, … }
checkThreshold(data, exams, 'kauppatieteet'); // 'met' | 'unmet' | 'none' | 'manual'
```

Kokeile ilman verkkoyhteyttä: `node examples/laske.mjs`.

Esimerkkitoteutus antaa samat pisteet kuin Opiskeluakatemian oma [todistusvalintalaskuri](https://opiskeluakatemia.fi/todistusvalintalaskuri): automaattinen testi vertaa niitä kaikilla aloilla tuhansilla satunnaisilla todistuksilla.

### Näin pisteet lasketaan

Jokaisella alalla (`fields`) on pisteytystaulukko (`tables`), ja taulukossa on paikkoja (`slots`). Säännöt ovat myös tiedoston `rules`-kentässä:

1. Jokaiseen paikkaan tulee enintään yksi koe ja jokainen koe enintään yhteen paikkaan. Valitaan se jako, joka tuottaa eniten pisteitä.
2. Sama aine tuottaa pisteitä vain kerran (`subjects[].group`): esimerkiksi pitkästä ja lyhyestä matematiikasta lasketaan parempi.
3. Paikka, jossa on `rows`, pisteyttää kokeen ensimmäisellä rivillä, jonka `match`-ehdot täyttyvät. Paikka, jossa on `from: "other"`, pisteyttää kokeen taulukon `other`-riveillä.
4. Yliopistojen taulukoissa äidinkielen paikkaan kelpaa vain paras äidinkielen koe. Toinen äidinkielen koe pisteytetään pitkänä kielenä.
5. Kielten taulukossa 7 haettava kieli pisteytetään vain omassa paikassaan.
6. Pisteet ovat arvosanajärjestyksessä L, E, M, C, B, A. Hylätty (I) on 0 pistettä.

### Kehote tekoälylle

Jos teet laskurin tekoälyn avulla (Cursor, Claude Code, Lovable, v0, ChatGPT), anna sille tämä:

```text
Rakenna todistusvalintalaskuri suomalaiseen korkeakoulujen yhteishakuun. Käytä Opiskeluakatemian avointa dataa äläkä keksi pisteitä tai pisterajoja itse:
- Pisteytystaulukot, alat, kynnysehdot ja laskentasäännöt: https://opiskeluakatemia.fi/avoin-data/todistusvalinnan-pisteytys.json
- Pisterajat hakukohteittain: https://opiskeluakatemia.fi/avoin-data/korkeakoulujen-pisterajat.json
- Laskennan esimerkkitoteutus: https://opiskeluakatemia.fi/avoin-data/todistusvalinta-esimerkki.mjs
- Ohje: https://opiskeluakatemia.fi/avoin-data/kehittajille
Lue pisteytystiedoston rules-kenttä ennen kuin kirjoitat laskennan. Lisää sivun alalaitaan lähdemaininta: <a href="https://opiskeluakatemia.fi/avoin-data">Data: Opiskeluakatemia</a> (CC BY 4.0). Kerro, että laskuri on epävirallinen.
```

## Muu käyttö

CSV: erottimena pilkku, desimaalierottimena piste, merkistö UTF-8 (BOM).

```python
import pandas as pd
yo = pd.read_csv("https://opiskeluakatemia.fi/avoin-data/yo-pisterajat.csv")
rajat = pd.read_csv("https://opiskeluakatemia.fi/avoin-data/korkeakoulujen-pisterajat.csv")
```

**Huom.** Yliopistojen vuoden 2026 todistusvalinnan pisteet eivät ole vertailukelpoisia aiempien vuosien kanssa, koska pisteytystaulukot uudistuivat (sarake `pisteasteikko`).

## Julkaisija

[Opiskeluakatemia](https://opiskeluakatemia.fi) on suomalainen verkkopalvelu, jolla on verkossa omaan tahtiin tehtävät abikurssit pitkän englannin ja keskipitkän ruotsin ylioppilaskokeisiin. Tästä aineistosta on tehty maksuttomat [yo-kokeiden pisterajat](https://opiskeluakatemia.fi/yo-pisterajat), [todistusvalintalaskuri](https://opiskeluakatemia.fi/todistusvalintalaskuri), [korkeakoulujen pisterajat](https://opiskeluakatemia.fi/pisterajat) ja [tavoitearvosanan laskuri](https://opiskeluakatemia.fi/tavoitearvosana). Oppaat yo-kokeisiin ja abikurssin valintaan: <https://opiskeluakatemia.fi/artikkelit>.

## Lisenssi ja lähteen mainitseminen

Data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.fi). Saat käyttää sitä myös kaupallisissa sovelluksissa, kunhan lähde näkyy sovelluksessasi, esimerkiksi sivun alalaidassa:

```html
<a href="https://opiskeluakatemia.fi/avoin-data">Data: Opiskeluakatemia</a> (CC BY 4.0)
```

Esimerkkikoodin (`examples/`) saa kopioida ja muokata vapaasti (CC0).

Pisteytystaulukot perustuvat [yliopistovalinnat.fi](https://yliopistovalinnat.fi/todistusvalinnan-pisteytykset-vuodesta-2026)- ja [ammattikorkeakouluun.fi](https://www.ammattikorkeakouluun.fi/hakijalle/valintatavat/todistusvalinta/)-sivustojen julkaisuihin, yo-kokeiden rajat [Ylioppilastutkintolautakunnan](https://www.ylioppilastutkinto.fi/fi/tutkinnon-suorittaminen/pisterajat) julkaisuihin ja korkeakoulujen pisterajat [Vipusen](https://vipunen.fi/) raportteihin. Kooste on epävirallinen: virallinen tieto on aina alkuperäisellä julkaisijalla ja Opintopolussa. Virheistä voi ilmoittaa [yhteydenottolomakkeella](https://opiskeluakatemia.fi/ota-yhteytta) tai tämän repon issueissa.

---

## In English

Open data for building a **Finnish university admission points calculator** (*todistusvalintalaskuri*). Finnish universities and universities of applied sciences (AMK) admit a large share of their students on matriculation exam grades (*todistusvalinta*, certificate-based admission). This repository has what a calculator needs:

- [`data/todistusvalinnan-pisteytys.json`](data/todistusvalinnan-pisteytys.json): matriculation exam subjects, the 11 university scoring tables valid from 2026, the AMK table, fields of study with their minimum requirements (*kynnysehto*) and the scoring rules. Read the `rules` and `descriptionEn` fields first.
- [`data/korkeakoulujen-pisterajat.json`](data/korkeakoulujen-pisterajat.json) / `.csv`: lowest and highest admitted points per programme and intake, first-time applicants separately (source: Vipunen).
- [`data/yo-pisterajat.json`](data/yo-pisterajat.json) / `.csv`: matriculation exam grade boundaries for every subject and exam season (source: the Matriculation Examination Board, YTL).
- [`examples/todistusvalinta-esimerkki.mjs`](examples/todistusvalinta-esimerkki.mjs): dependency-free reference implementation, `calculatePoints(data, exams, fieldId)` and `checkThreshold(data, exams, fieldId)`, tested against Opiskeluakatemia's own calculator. Try `node examples/laske.mjs`.

The same files are served with CORS enabled and no API key from `https://opiskeluakatemia.fi/avoin-data/…` (URLs above); documentation: <https://opiskeluakatemia.fi/avoin-data/kehittajille>.

Licence CC BY 4.0. Attribution is required: show `Data: Opiskeluakatemia (opiskeluakatemia.fi/avoin-data), CC BY 4.0` with a link in your app. The data is an unofficial compilation; official information is published by the universities and on Opintopolku. Opiskeluakatemia is a Finnish online service with self-paced prep courses (abikurssi) for the matriculation exam in advanced English and intermediate Swedish; English summary: <https://opiskeluakatemia.fi/en>.
