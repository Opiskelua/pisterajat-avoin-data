# Pisterajat avoimena datana

Ylioppilaskokeiden arvosanojen pisterajat ja korkeakoulujen todistusvalinnan pisterajat koneluettavina tiedostoina. Koonnut [Opiskeluakatemia](https://opiskeluakatemia.fi/avoin-data).

| Tiedosto | Sisältö |
| --- | --- |
| [`data/yo-pisterajat.csv`](data/yo-pisterajat.csv) | Arvosanojen L–A alimmat pistemäärät aineittain ja tutkintokerroittain (YTL) |
| [`data/yo-pisterajat.json`](data/yo-pisterajat.json) | Samat tiedot JSON-muodossa aineiden enimmäispisteineen |
| [`data/korkeakoulujen-pisterajat.csv`](data/korkeakoulujen-pisterajat.csv) | Yliopistojen ja ammattikorkeakoulujen hakukohteiden alimmat ja ylimmät hyväksytyt pisteet todistusvalinnassa, ensikertalaiset ja ei-ensikertalaiset erikseen, uusin ja aiemmat aloituskerrat (Vipunen) |

Sarakkeiden kuvaukset: <https://opiskeluakatemia.fi/avoin-data>. Ajantasaisimmat tiedostot ladataan aina samoista osoitteista:

- https://opiskeluakatemia.fi/avoin-data/yo-pisterajat.csv
- https://opiskeluakatemia.fi/avoin-data/yo-pisterajat.json
- https://opiskeluakatemia.fi/avoin-data/korkeakoulujen-pisterajat.csv

Sama aineisto Hugging Facessa: <https://huggingface.co/datasets/Opiskeluakatemia/pisterajat-avoin-data>

CSV: erottimena pilkku, desimaalierottimena piste, merkistö UTF-8 (BOM).

```python
import pandas as pd
yo = pd.read_csv("https://opiskeluakatemia.fi/avoin-data/yo-pisterajat.csv")
```

**Huom.** Yliopistojen vuoden 2026 todistusvalinnan pisteet eivät ole vertailukelpoisia aiempien vuosien kanssa, koska pisteytystaulukot uudistuivat (sarake `pisteasteikko`).

## Lisenssi ja lähteen mainitseminen

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.fi). Mainitse lähteenä Opiskeluakatemia ja alkuperäinen lähde, esimerkiksi:

> Lähde: Opiskeluakatemia, opiskeluakatemia.fi/avoin-data (aineisto: Ylioppilastutkintolautakunta / Opetushallinnon tilastopalvelu Vipunen).

Yo-kokeiden rajat ovat [Ylioppilastutkintolautakunnan](https://www.ylioppilastutkinto.fi/fi/tutkinnon-suorittaminen/pisterajat) julkaisemia ja korkeakoulujen pisterajat [Vipusen](https://vipunen.fi/) raporteista. Virallinen tieto on aina alkuperäisellä julkaisijalla. Virheistä voi ilmoittaa [yhteydenottolomakkeella](https://opiskeluakatemia.fi/ota-yhteytta) tai tämän repon issueissa.

---

**In English:** Finnish matriculation exam grade boundaries (all subjects and seasons, from the Matriculation Examination Board YTL) and Finnish university and UAS certificate-based admission cutoffs (from Vipunen), as CSV and JSON. Licence CC BY 4.0, attribution: Opiskeluakatemia (opiskeluakatemia.fi/avoin-data) and the original source.
