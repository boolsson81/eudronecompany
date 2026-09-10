# Inköpsprospect

Ett inköpsprospect är en leverantör eller produkt vi överväger att köpa in. De
kommer från två håll: kartläggningar under `docs/reports/` (till exempel
`TVATTSYSTEM_LEVERANTORER_2026-09.md`) och sådant du själv hittar på en mässa,
i ett mejl eller hos en konkurrent. Registret i `data/inkopsprospekt.json`
samlar båda i samma format, så att de går att jämföra.

Registret är en fil i repot, inte en tabell. Databasen delas med DigitalSignal
och migreringar får inte skapas härifrån (se `AGENTS.md`), och ett prospekt bör
ändå granskas i en PR innan det blir underlag för ett inköp.

## Lägga till ett prospekt

Minsta möjliga post är leverantör och produkt:

```bash
npm run prospekt:add -- --leverantor "Drone Volt" --produkt "Hercules 20 HIGH-DRA"
```

Med pris, kontakt och taggar:

```bash
npm run prospekt:add -- \
  --leverantor "Drone Volt" --produkt "Hercules 20 HIGH-DRA" \
  --kategori tvattsystem --land FR \
  --pris 46850 --valuta EUR --basis listpris --moms exkl \
  --url "https://www.dronevolt.com/en/" --telefon "+33 1 80 89 44 44" \
  --ledtid 60 --tagg tak --tagg fasad \
  --anteckning "C5-certifiering ej verifierad hos EASA." --av bo
```

`--torrkorning` visar vad som skulle skrivas utan att röra filen, och `--hjalp`
listar alla flaggor. Har du posten som JSON går den in direkt med `--json
'<objekt>'`, och en hel omgång med `--fil prospekt.json` (en post eller en
lista).

Id sätts automatiskt från leverantör och produkt (`drone-volt-hercules-20-high-dra`)
så att en diff går att läsa. Krockar får ett löpnummer i stället för att skriva
över ett befintligt prospekt. Vill du styra det själv finns `--id`.

## Läsa registret

```bash
npm run prospekt:list                                  # alla
npm run prospekt:list -- --status offert               # filtrera
npm run prospekt:list -- --kategori tvattsystem --tagg tak
npm run prospekt:list -- --rapport                     # docs/reports/INKOPSPROSPEKT.md
```

Filtren `--status`, `--kalla`, `--kategori`, `--tagg` och `--leverantor` går att
kombinera. Rapporten är genererad — ändra registret, inte markdownfilen.

## Fält

| Fält | Krävs | Innebörd |
| --- | --- | --- |
| `id` | ja | Slug, sätts automatiskt. Unikt i registret. |
| `leverantor` | ja | Leverantör eller tillverkare. |
| `produkt` | ja | Modell eller sortiment. |
| `status` | ja | `ny`, `utvarderas`, `kontaktad`, `offert`, `avvisad`, `inkopt`. Standard `ny`. |
| `kalla` | ja | `egen` för något du hittat själv, `kartlaggning` för en post ur en rapport. |
| `tillagd` / `uppdaterad` | ja | Datum, `ÅÅÅÅ-MM-DD`. Sätts till idag. |
| `tillagd_av` | nej | Vem som lade till prospektet. |
| `kategori` | nej | Fri text, till exempel `tvattsystem`. |
| `land` | nej | Tvåbokstavig landskod. |
| `url` | nej | Produkt- eller källsida. |
| `kontakt` | nej | `namn`, `epost`, `telefon`, `webb`. |
| `pris` | nej | `belopp`, `valuta`, `basis`, `moms`, `per`. Antingen hela objektet eller inget. |
| `moq` | nej | Minsta orderkvantitet, positivt heltal. |
| `ledtid_dagar` | nej | Ledtid i dagar, positivt heltal. |
| `taggar` | nej | Sluggade nyckelord. |
| `anteckning` | nej | Fri text. Hamnar under Anteckningar i rapporten. |

### Priser

`pris.basis` säger vad beloppet faktiskt är: `listpris`, `dealerpris`, `offert`,
`inkopspris` eller `okant`. Ett publikt listpris är inte vårt inköpspris — det
blir det först när en offert landat, och landat inköpspris (varuvärde + frakt +
tull) räknas separat, som i `data/wisson-inkopspriser-202607.json`.

`pris.moms` är `exkl`, `inkl` eller `okant`. Källor anger det ofta inte, och då
ska det stå `okant` i stället för att gissas.

## Validering

`scripts/lib/inkopsprospekt.mjs` äger schemat och validerar varje post innan den
skrivs. En post som saknar leverantör, har ett pris utan valuta, en okänd status
eller ett id som redan finns avvisas med ett felmeddelande i stället för att
hamna i filen.

`npm test` kör samma validering över hela `data/inkopsprospekt.json`, så en post
som redigerats för hand men blivit fel fångas i CI.
