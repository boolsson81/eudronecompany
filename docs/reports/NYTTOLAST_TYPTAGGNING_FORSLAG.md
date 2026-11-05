# Förslag: typtaggning av nyttolaster

Status: **genomförd 2026-11-05.** 54 produkter taggade med `nyttolast:<typ>`, 4 dubbletter arkiverade. Kollektionsreglerna är inte ändrade.

Taggkonventionen finns redan i butiken: `nyttolast:<typ>`. Typer och sidor:

| Tagg | Typsida | Kollektion |
|---|---|---|
| `nyttolast:sokljus` | `payload-sokljus` | `sokljus` |
| `nyttolast:hogtalare` | `payload-sokljus-hogtalare` | `sokljus-hogtalare` |
| `nyttolast:tjudrad` | `payload-tjudrad-belysning` | `tjudrad-belysning` |
| `nyttolast:lastslapp` | `payload-lastslapp` | `lastslapp` |
| `nyttolast:kamera` | `payload-kameror` | `nattkameror` |
| `nyttolast:special` | `payload-specialnyttolaster` | `specialnyttolaster` |
| `nyttolast:lidar` | `payload-lidar-kartlaggning` | `lidar-kartlaggning` |

Kombinerade enheter (sökljus + högtalare, LP-serien) får båda taggarna `nyttolast:sokljus` och `nyttolast:hogtalare`.

Alla berörda produkter är `DRAFT` (butiken är opublicerad), så taggningen syns inte för kunder.

## 1. Redan taggade (ingen åtgärd)

`czi-ml200-800w-matrix-light-for-m350-300`, `czi-cz10-tethered-hover-light`, `czi-tk4-110-m` (tjudrad) · `czi-th4-v2-airdrop-kit` (lastsläpp) · Wisson `ap30-p4h-high-pressure-sprayer`, `ap30-p4-atomized-sprayer`, `ap3-p1-aerial-sprayer` (special).

## 2. Förslag: sökljus (`nyttolast:sokljus`)

CZI: `czi-gl10-v2-gimbal-searchlight`, `dubbelaxlad-gimbal-sokarlampa-for-dji-mavic-3e-3t`, `dji-mavic-3-stralkastare-czi-gl10`, `czi-gl60-mini-sokljus`, `czi-gl60-mini-gimbal-spotlight-for-m30`, `czi-gl60-plus-sokljus`, `czi-gl60-spotlight-plus-f-dji-m200-300-3`, `czi-gl300-spotlight-for-dji-m200-300`, `czi-sl60-strobe-searchlight`, `czi-sl60-strobe-searchlight-1`, `czi-fl60-flashing-light-f-dji-m300-350`, `czi-ir3-infared-spotlightfor-m30`, `czi-ir10-ir-808nmlaser-zoomsptlght`

Övriga märken: `jz-t30-dji-mavic-3e-3t-30w-spotlight`, `lktop-lk340-40w-dronarsoklampa`, `lktop-kl340-40w-soklampa-drones`, `dji-al1-spotlight-drones`, `dji-zenmuse-s1`, `jlidrone-matrice-4e-4t-4d-4td-matrix-lamp-t40-dji-dock-3`, `jlidrone-matrice-4e-4t-4d-4td-matrix-lamp-t40l-dji-dock-3`, `jlidrone-matrice-400-matrix-lamp-t90`, `jlidrone-matrice-400-multi-color-zoom-spotlight-t90v2`, `tundra-modular-payloadsystem-ir-light`, `tundra-modular-payloadsystem-ir-light-1`

## 3. Förslag: sökljus + högtalare (båda taggarna)

`czi-lp12-sokljus-dji-m30`, `czi-lp12-speaker-spotlight-for-m30`, `czi-lp20-searchlight-broadcasting-syste`, `czi-lp20-searchlight-and-broadcasting`, `matrice-3d-sokarlampa-dji-matrice-3d-3dt-czi`, `czi-lp35-sokarljus-m350-dji`, `czi-lp35-searchlight-and-broadcasting`, `searchlight-broadcasting-system`, `jlidrone-matrice-4e-4t-4d-4td-speaker-spotlight-system-t40s-dji-dock-3`

## 4. Förslag: högtalare (`nyttolast:hogtalare`)

`czi-mp120-broadcasting-light`, `czi-mp130-v2-h-gtalare`, `czi-mp130-pro-digital-voice-broadcasting`, `czi-mp130-spreaker-for-dji-m200-300`, `czi-mp140-digital-voice-broadcasting`, `czi-mp140-digital-voice-broadcasting-1`, `czi-mp10e-sound-boradcast-sound-pickup-s`, `czi-pk10-ljudupptagare`, `dji-matrice-as1-speaker`, `dji-zenmuse-v1`, `jlidrone-h150a-light-loudspeaker-for-dji-matrice-400`

## 5. Förslag: tjudrad (`nyttolast:tjudrad`)

`czi-ml200-400w-matrix-light`, `czi-ml200-800w-matrix-light`, `czi-ml200-800w-matrix-light-1`

## 6. Förslag: lastsläpp (`nyttolast:lastslapp`)

`czi-th4-v2-throwinghook-f-dji-m200-300`, `czi-throwing-hook-matrice-4`, `czi-th6-for-flycart-100-agras-t100`, `czi-fs32-logistic-payloads-kit`, `czi-fs32-fc30-payload-set`, `czi-fs35-appearance`, `tundra-modular-payloadsystem-dropper`

## 7. Förslag: kamera (`nyttolast:kamera`)

`czi-dt1-k-night-vision-camera`, `czi-dt1-k-night-vision-camera-1`, `czi-c30n-thermal-camera`, `dji-zenmuse-h20`, `dji-zenmuse-h20t`, `dji-zenmuse-h20n`, `dji-zenmuse-h30`, `dji-zenmuse-h30-1`, `dji-zenmuse-h30t`

## 8. Förslag: special (`nyttolast:special`)

`czi-dh100-multi-function-high-pressure-water-system`, `czi-ft10-v2-flame-thrower`, `czi-ft10-v2-flame-thrower-1`, `czi-es638-for-m400-350-300-electronic-launcherhigh-loading-capacity-stable-firing-quick-mount-and-release`, `wisson-orion-ap30-n1-pliabot-flygburen-manipulator-dji-fc30`, `wisson-orion-ap3-p3-pro-pliabot®-fjarrstyrt-flygande-rengoringssystem` (flyttad tagg, se avsnitt 10)

## 9. Behöver ditt beslut

- **Dubbletter.** Flera CZI-produkter finns två gånger (`...-1`, produkttyp "Drone accessories" respektive "Enterprise Payload"). Förslaget taggar båda. Bättre är att slå ihop eller arkivera dubbletterna innan lansering.
- **Fel i dagens `sokljus`-kollektion.** `czi-ml200-800w-matrix-light-for-m350-300` (hör hemma i tjudrad) och `dji-m400-rostsystem-czi-mp130-pro` (arkiverad röstsändare) ligger i sökljus på grund av taggen `Searchlight`. De försvinner först när kollektionsregeln byts från äldre taggar till `nyttolast:*`.
- **Lidar och kartläggning** (`dji-zenmuse-l2-lidar`, `dji-zenmuse-l3`, `dji-zenmuse-p1`, `dji-lidar-avstandsmatare-fokusmatare`, `tundra-modular-payloadsyst-range-finder`, `payload-lidar-mapping`) passar ingen av de sex typerna. Förslag: egen typ `nyttolast:lidar` med egen typsida senare. Tills vidare lämnas de otaggade.
- **`czi-mf30-m4-m30`** (flödesmätare, tillbehör till vattensystem) är utelämnad. Ska den tillhöra special?
- **Wisson.** Övriga Wisson-produkter (`AP3-S1`, `AP3-P5`, `AP30-P2`) ligger inte i det jag hämtade. Jag kontrollerar dem vid taggningen.
- **Byte av kollektionsregler** till `tag = nyttolast:<typ>` görs i Admin eller via API efter taggningen. Det gäller även specialnyttolaster, som i dag bara består av Wisson.

## 10. Dubbletter: arkiverade 2026-11-05

Regel: arkivera dubbletter som bara har lager hos Boston, eller som är minst kompletta i text och bilder. Arkivering går att ångra (sätt tillbaka status).

- **Redan arkiverade tidigare:** de flesta CZI-dubbletter (`...-1`, SKU 471xxx, lager Boston_Nordic 1) var redan arkiverade. De bästa kopiorna med text och bilder är kvar som utkast.
- **Arkiverade nu:** `ap30-n1-aerial-manipulator` (2 bilder, ersätts av `wisson-orion-ap30-n1-...` med 7) och `ap3-p3-tethered-cleaning-system` (2 bilder, ersätts av `wisson-orion-ap3-p3-pro-pliabot...` med 6). Den senare bar taggen `nyttolast:special`, som ska flyttas till den kvarvarande produkten vid taggningen.

Oklara fall, inget gjort:

| Par | Läge |
|---|---|
| `dubbelaxlad-gimbal-sokarlampa-for-dji-mavic-3e-3t` / `dji-mavic-3-stralkastare-czi-gl10` | Båda utkast med full text. 7 respektive 6 bilder. Förslag: arkivera `dji-mavic-3-stralkastare-czi-gl10`. |
| `czi-mp130-pro-digital-voice-broadcasting` / `czi-mp130-spreaker-for-dji-m200-300` | Samma beskrivning (MP130 Pro), 5 bilder vardera. Den förra har lager Boston 1 och svensk text. |
| `czi-fs32-logistic-payloads-kit` / `czi-fs32-fc30-payload-set` | Ingen text. 4 respektive 1 bild. Kan vara två olika kit. Förslag: arkivera `czi-fs32-fc30-payload-set` om det är samma. |
| `wisson-orion-ap3-p3-pliabot-fasadtvattsystem-dji-m400` | Tredje versionen av AP3-P3 (4 bilder, utkast). |
| `ap30-p4-atomized-sprayer` / `wisson-orion-ap30-p4-pliabot-flygburen-dimspruta` | Båda 2 bilder. Samma för P4H. Avgörs på textlängd. |
| `tundra-modular-payloadsystem-ir-light` | Har text men inga bilder, lager Boston 1. Kopian `-1` är redan arkiverad. Behålls. |

## 11. Utfört 2026-11-05

- Arkiverade ytterligare: `dji-mavic-3-stralkastare-czi-gl10` och `czi-fs32-fc30-payload-set`. Arkiverade tidigare i dag: `ap30-n1-aerial-manipulator`, `ap3-p3-tethered-cleaning-system`.
- Taggade: sökljus 18, sökljus + högtalare 4, högtalare 10, tjudrad 1, lastsläpp 5, kamera 7, special 5. Inga fel från Shopify.
- Ej taggade, väntar på beslut: lidar/kartläggning, `czi-mf30-m4-m30`, `tundra-modular-payloadsyst-range-finder`, oklara dubbletter enligt avsnitt 10.
- Kollektionsreglerna är bytta 2026-11-05: alla sex styrs nu av en enda tagg `nyttolast:<typ>`. Tidigare regler (för återställning): `sokljus` = Searchlight ELLER Gimbal Searchlight, `sokljus-hogtalare` = Broadcasting, `nattkameror` = Thermal Camera ELLER Night Vision. De tre övriga hade redan `nyttolast:*`.
- Resultat: sokljus 22, sokljus-hogtalare 14, nattkameror 7, tjudrad-belysning 4, lastslapp 6, specialnyttolaster 8 (efter att taggen togs bort från den arkiverade AP3-P3-dubbletten).
- Nya produkter av typen läggs i rätt kollektion genom att de får taggen. Inget mer behöver ändras.

## 12. Ny typ: lidar och kartläggning (2026-11-05)

- Sida: `payload-lidar-kartlaggning` (mall `page.payload-lidar-kartlaggning.json`, genererad av `scripts/payloads/build-type-pages.mjs`). Sidan är märkesneutral och länkar till kollektionen.
- Kollektion: `lidar-kartlaggning`, smart kollektion på taggen `nyttolast:lidar`.
- Taggade (9): `dji-zenmuse-l1`, `dji-zenmuse-l2-lidar`, `dji-zenmuse-l3`, `dji-zenmuse-l3-eu-sp-plus`, `dji-zenmuse-p1`, `livox-mid-360`, `livox-mid-360s`, `livox-mid-70-lidar`, `livox-avia`.
- Utelämnade: Livox-kablar och kontakter (tillbehör), paketen M350/M400 + P1, `dji-care-enterprise-basic-zenmuse-p1`, `dji-lidar-avstandsmatare-fokusmatare` (fokushjälp, inte kartläggning) och `tundra-modular-payloadsyst-range-finder`.
- Möjlig dubblett: `dji-zenmuse-p1-camera` (vendor DJI, tagg "Also") mot `dji-zenmuse-p1`. Otaggad tills det avgjorts.
- Den äldre engelska kollektionen `payload-lidar-mapping` finns kvar orörd.
