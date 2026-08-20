import type { EdpFaqItem } from "@/data/edpIndustryPages";

export type EdpFaqCategory = "plattformar" | "kameror" | "bransch" | "kop" | "regelverk";

export interface EdpFaqArticle {
  handle: string;
  title: string;
  eyebrow: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  category: EdpFaqCategory;
  introParagraphs: string[];
  faq: EdpFaqItem[];
  relatedLinks?: Array<{ label: string; url: string }>;
}

export const EDP_FAQ_BLOG = {
  handle: "vanliga-fragor",
  title: "Vanliga frågor",
  metaTitle: "FAQ — enterprise-drönare & drönarkameror | EuroDroneParts",
  metaDescription:
    "Svar på vanliga frågor om professionella DJI Enterprise-drönare, Zenmuse-kameror, payloads, certifiering och branschlösningar.",
  templateSuffix: "vanliga-fragor",
} as const;

export const EDP_FAQ_ARTICLES: EdpFaqArticle[] = [
  {
    handle: "enterprise-dronare-kop-support",
    title: "Vanliga frågor om köp av enterprise-drönare",
    eyebrow: "Köp & support",
    excerpt:
      "Leverans, garanti, utbildning och finansiering — svar på de vanligaste frågorna när du köper professionella drönare från EuroDroneParts.",
    metaTitle: "FAQ — köp av enterprise-drönare | EuroDroneParts",
    metaDescription:
      "Svar på frågor om pris, leverans, garanti, utbildning och finansiering av DJI Enterprise-drönare i Sverige.",
    tags: ["faq", "köp", "enterprise", "support"],
    category: "kop",
    introParagraphs: [
      "Att investera i enterprise-drönare innebär mer än att välja modell — leverans, support, utbildning och certifiering påverkar hur snabbt ni får värde av investeringen.",
      "Här samlar vi de vanligaste frågorna från företag som köper DJI Enterprise-utrustning via EuroDroneParts.",
    ],
    faq: [
      {
        question: "Vilka enterprise-drönare säljer EuroDroneParts?",
        answer:
          "Vi är auktoriserad DJI Enterprise-partner och erbjuder hela sortimentet — bland annat Matrice 350 RTK, Matrice 400 RTK, Mavic 3 Enterprise-serien, Agras och tillhörande Zenmuse-payloads och tillbehör.",
      },
      {
        question: "Vad kostar en professionell enterprise-drönare?",
        answer:
          "Priset varierar beroende på modell och sensorpaket. DJI Mavic 3 Enterprise börjar runt 30 000 kr, medan DJI Matrice 350 RTK med payload ofta ligger från ca 100 000 kr och uppåt. Kontakta oss för offert anpassad efter ert uppdrag.",
      },
      {
        question: "Hur lång tid tar leveransen?",
        answer:
          "De flesta produkter levereras inom 2–5 arbetsdagar från beställning. Specialkonfigurationer eller beställningsvaror kan ta något längre — vi meddelar alltid förväntad leveranstid vid offert.",
      },
      {
        question: "Ingår utbildning vid köp?",
        answer:
          "Vi erbjuder skräddarsydd utbildning anpassad efter er bransch och tillämpning. Vi kan även förmedla kontakt med certifierade operatörer och hjälpa med tillståndsansökningar enligt EASA.",
      },
      {
        question: "Erbjuder ni leasing eller finansiering?",
        answer:
          "Ja, vi erbjuder flera finansieringsalternativ inklusive leasing och avbetalning. Kontakta vårt B2B-team för ett upplägg som passar ert företag.",
      },
      {
        question: "Vilken support ingår efter köpet?",
        answer:
          "Alla köp inkluderar DJI Enterprise-garanti, teknisk support och tillgång till vår serviceverkstad. Vi erbjuder även DJI Care Enterprise för utökat skydd och snabbare reparation.",
      },
    ],
    relatedLinks: [
      { label: "Enterprise-drönare", url: "/collections/enterprise-drones" },
      { label: "B2B-offert", url: "/pages/b2b" },
    ],
  },
  {
    handle: "dronarkameror-val",
    title: "Vanliga frågor om val av drönarkamera",
    eyebrow: "Drönarkameror",
    excerpt:
      "Hur väljer du rätt Zenmuse-payload? Översikt över inspektion, termisk, fotogrammetri och LiDAR — och vilka plattformar de passar.",
    metaTitle: "FAQ — välja drönarkamera | EuroDroneParts",
    metaDescription:
      "Svar på frågor om Zenmuse-kameror, H30, H20T, P1 och L2. Vilken payload passar inspektion, kartläggning och termisk avbildning?",
    tags: ["faq", "kameror", "zenmuse", "payload"],
    category: "kameror",
    introParagraphs: [
      "Val av drönarkamera avgörs av uppdragstyp — inspektion kräver annan sensor än kartläggning eller räddningsinsats.",
      "Här besvarar vi de vanligaste frågorna om Zenmuse-payloads och hur du matchar kamera med plattform och användningsområde.",
    ],
    faq: [
      {
        question: "Vilken Zenmuse-kamera passar bäst för inspektion?",
        answer:
          "För de flesta inspektionsuppdrag rekommenderar vi Zenmuse H30T om du behöver termisk sensor, eller Zenmuse H30 om du enbart behöver högupplöst zoom. H30-serien erbjuder 40× optisk zoom och förbättrad bildkvalitet jämfört med H20T.",
      },
      {
        question: "Vad är skillnaden mellan H30 och H30T?",
        answer:
          "Zenmuse H30T har en integrerad termisk sensor (1280×1024) utöver vidvinkel- och zoomkamerorna. H30 har samma optiska zoom och laser-avståndsmätare men saknar termisk kamera — vilket gör den något lättare och mer prisvärd.",
      },
      {
        question: "Behöver jag P1 eller L2 för kartläggning?",
        answer:
          "Zenmuse P1 är bäst för fotogrammetri och ortofoton med 45 MP fullformats-sensor. Zenmuse L2 är rätt val om du behöver LiDAR-punktmoln, till exempel för skogskartläggning eller terrängmodeller genom vegetation.",
      },
      {
        question: "Vilka drönare är kamerorna kompatibla med?",
        answer:
          "De flesta Zenmuse-kameror monteras på DJI Matrice 300 RTK och Matrice 350 RTK. H30-serien stöds även på Matrice 400 RTK. Mavic 3 Enterprise har integrerade sensorer. Kontakta oss om du är osäker på kompatibilitet.",
      },
      {
        question: "Kan jag byta kamera mellan olika uppdrag?",
        answer:
          "Ja, Zenmuse-payloads är utbytbara på Matrice-plattformarna. Många kunder har en inspektionskamera (H30T) och en kartläggningspayload (P1 eller L2) som de växlar mellan beroende på uppdrag.",
      },
      {
        question: "Var hittar jag jämförelser mellan kameror?",
        answer:
          "I vår blogg Jämförer kan du jämföra Zenmuse-kameror sida vid sida med specifikationstabeller — till exempel H30T vs H30, P1 vs L2 och fler.",
      },
    ],
    relatedLinks: [
      { label: "Jämför kameror", url: "/blogs/jamforer" },
      { label: "Drönarkameror", url: "/collections/dronar-kameror" },
      { label: "Zenmuse H30T vs H30", url: "/blogs/jamforer/zenmuse-h30t-vs-h30" },
    ],
  },
  {
    handle: "zenmuse-h30-serien",
    title: "Vanliga frågor om Zenmuse H30 & H30T",
    eyebrow: "Zenmuse H30",
    excerpt:
      "Frågor om DJI:s senaste inspektionspayload — 40× zoom, termisk sensor, laser-avståndsmätare och kompatibilitet med Matrice.",
    metaTitle: "FAQ — Zenmuse H30 & H30T | EuroDroneParts",
    metaDescription:
      "Svar på frågor om Zenmuse H30 och H30T: termisk sensor, zoom, vikt, uppgradering från H20T och Matrice-kompatibilitet.",
    tags: ["faq", "zenmuse", "h30", "inspektion"],
    category: "kameror",
    introParagraphs: [
      "Zenmuse H30-serien är DJI:s senaste generation av hybridpayloads med 40× optisk zoom och förbättrad laser-avståndsmätare.",
      "H30T lägger till en radiometrisk termisk sensor med 1280×1024 upplösning — ett stort steg framåt jämfört med H20T.",
    ],
    faq: [
      {
        question: "Kan jag uppgradera från H30 till H30T senare?",
        answer:
          "Ja, båda monteras på samma Matrice-plattformar. Många operatörer börjar med H30 och kompletterar med H30T när termiska uppdrag tillkommer.",
      },
      {
        question: "Hur mycket tyngre är H30T än H30?",
        answer:
          "H30T väger cirka 60 g mer än H30 (ca 920 g vs 860 g) på grund av den integrerade termiska sensorn.",
      },
      {
        question: "Är H30T värt uppgraderingen från H20T?",
        answer:
          "Om du regelbundet inspekterar på långt avstånd, behöver skarpare termiska bilder (1280×1024 vs 640×512) eller mäter avstånd över 1200 meter — ja. H20T är fortfarande kapabelt vid begränsad budget.",
      },
      {
        question: "Vilka Matrice-modeller stöder H30-serien?",
        answer:
          "Zenmuse H30 och H30T fungerar på Matrice 300 RTK, Matrice 350 RTK och Matrice 400 RTK.",
      },
      {
        question: "Har H30 laser-avståndsmätare?",
        answer:
          "Ja, både H30 och H30T har integrerad laser-avståndsmätare (LRF) med räckvidd 3–3000 meter — väsentligt längre än H20T:s 1200 meter.",
      },
    ],
    relatedLinks: [
      { label: "H30T vs H30", url: "/blogs/jamforer/zenmuse-h30t-vs-h30" },
      { label: "H30T vs H20T", url: "/blogs/jamforer/zenmuse-h30t-vs-h20t" },
      { label: "Zenmuse H30", url: "/collections/zenmuse-h30" },
    ],
  },
  {
    handle: "zenmuse-h20-serien",
    title: "Vanliga frågor om Zenmuse H20, H20T & H20N",
    eyebrow: "Zenmuse H20",
    excerpt:
      "Etablerade inspektionspayloads med zoom och termisk sensor. När passar H20-serien och hur skiljer den sig från H30?",
    metaTitle: "FAQ — Zenmuse H20-serien | EuroDroneParts",
    metaDescription:
      "Svar på frågor om Zenmuse H20, H20T och H20N — termisk inspektion, nattläge, zoom och skillnader mot H30-serien.",
    tags: ["faq", "zenmuse", "h20", "termisk"],
    category: "kameror",
    introParagraphs: [
      "Zenmuse H20-serien har varit branschstandard för termisk drönarinspektion i flera år. Serien omfattar H20 (visuell), H20T (termisk + zoom) och H20N (nattförbättrad termisk).",
      "Här besvarar vi vanliga frågor om när H20-serien fortfarande är rätt val — och när det är dags att titta på H30.",
    ],
    faq: [
      {
        question: "Vad är skillnaden mellan H20, H20T och H20N?",
        answer:
          "H20 har vidvinkel och zoom utan termisk sensor. H20T kombinerar zoom med termisk kamera (640×512). H20N har förbättrad natttermisk med starlight-sensor för mörker och svagt ljus.",
      },
      {
        question: "Fungerar H20T på samma drönare som H30T?",
        answer:
          "Ja, båda fungerar på Matrice 300 RTK och Matrice 350 RTK. H30T stöds även på Matrice 400 RTK.",
      },
      {
        question: "När ska jag välja H20T istället för H30T?",
        answer:
          "H20T är ett kostnadseffektivt val om dina inspektionsuppdrag inte kräver 40× zoom, högre termisk upplösning eller längre laser-räckvidd. Många energibolag använder fortfarande H20T framgångsrikt.",
      },
      {
        question: "Vad är H20N:s starlight-sensor?",
        answer:
          "H20N har en termisk sensor optimerad för svagt ljus och nattinspektion. Den passar säkerhetsövervakning och räddningsinsatser där vanlig termisk kamera inte räcker till.",
      },
      {
        question: "Kan jag mäta temperatur med H20T?",
        answer:
          "Ja, H20T har radiometrisk termisk kamera som mäter yttemperatur. För energiinspektion rekommenderas kalibrering och rätt flyghöjd för tillförlitliga mätningar.",
      },
    ],
    relatedLinks: [
      { label: "H20T vs H20N", url: "/blogs/jamforer/zenmuse-h20t-vs-h20n" },
      { label: "H20 vs H20T", url: "/blogs/jamforer/zenmuse-h20-vs-h20t" },
      { label: "Termisk översikt", url: "/blogs/jamforer/jamfor-termiska-kameror" },
    ],
  },
  {
    handle: "fotogrammetri-och-lidar",
    title: "Vanliga frågor om fotogrammetri & LiDAR",
    eyebrow: "Kartläggning",
    excerpt:
      "Zenmuse P1, L1, L2 och L3 — när ska du välja fotogrammetri, när LiDAR, och vilken noggrannhet kan du förvänta dig?",
    metaTitle: "FAQ — fotogrammetri & LiDAR | EuroDroneParts",
    metaDescription:
      "Svar på frågor om Zenmuse P1, L1, L2 och L3. Fotogrammetri vs LiDAR, noggrannhet, filformat och GIS-arbetsflöden.",
    tags: ["faq", "lidar", "fotogrammetri", "gis", "p1", "l2"],
    category: "kameror",
    introParagraphs: [
      "Professionell kartläggning med enterprise-drönare bygger på antingen fotogrammetri (bildbaserad 3D) eller LiDAR (laserbaserade punktmoln).",
      "Båda metoderna har sina styrkor — här besvarar vi de vanligaste frågorna om Zenmuse P1, L1, L2 och L3.",
    ],
    faq: [
      {
        question: "Vad är skillnaden mellan fotogrammetri och LiDAR?",
        answer:
          "Fotogrammetri skapar 3D-modeller från överlappande bilder — kostnadseffektivt och fotorealistiskt. LiDAR mäter avstånd med laser och fungerar genom vegetation och i mörker, men ger inte färgade texturer.",
      },
      {
        question: "Kan jag använda både P1 och L2?",
        answer:
          "Ja — payloads byts snabbt på Matrice-plattformarna. Många kartläggningsföretag har båda och väljer payload per uppdrag.",
      },
      {
        question: "Vilken ger bäst noggrannhet?",
        answer:
          "P1 med RTK ger centimeterprecision i fotogrammetri. L2 levererar upp till 5 cm vertikal noggrannhet med LiDAR, särskilt genom vegetation där fotogrammetri har begränsningar.",
      },
      {
        question: "Vad är skillnaden mellan L1, L2 och L3?",
        answer:
          "L1 var DJI:s första integrerade LiDAR-payload. L2 förbättrar noggrannhet, punkt densitet och har integrerad RGB-kamera. L3 är senaste generationen med ännu högre prestanda för professionell kartläggning.",
      },
      {
        question: "Vilka filformat kan jag exportera till?",
        answer:
          "Branschstandarder inkluderar GeoTIFF, LAS/LAZ (punktmoln), OBJ/FBX (3D-modeller), DXF/DWG (CAD) och IFC (BIM). Data bearbetas i Pix4D, DJI Terra eller Agisoft Metashape.",
      },
      {
        question: "Behöver jag RTK-basstation?",
        answer:
          "För mätningskvalitet rekommenderas RTK. DJI D-RTK 2 basstation ger centimeterprecision. Många operatörer använder även nätverks-RTK (NTRIP/SWEPOS).",
      },
    ],
    relatedLinks: [
      { label: "P1 vs L2", url: "/blogs/jamforer/zenmuse-p1-vs-l2" },
      { label: "L1 vs L2", url: "/blogs/jamforer/zenmuse-l1-vs-l2" },
      { label: "LiDAR-översikt", url: "/blogs/jamforer/jamfor-lidar-sensorer" },
      { label: "GIS & kartläggning", url: "/pages/gis-kartlaggning" },
    ],
  },
  {
    handle: "matrice-vs-mavic-enterprise",
    title: "Vanliga frågor — Matrice vs Mavic Enterprise",
    eyebrow: "Plattformar",
    excerpt:
      "När räcker Mavic 3 Enterprise och när behöver du Matrice 350 RTK? Jämför flygtid, payloads, portabilitet och pris.",
    metaTitle: "FAQ — Matrice vs Mavic Enterprise | EuroDroneParts",
    metaDescription:
      "Svar på frågor om DJI Matrice 350 RTK vs Mavic 3 Enterprise. Payloads, flygtid, portabilitet och vilken plattform som passar ditt företag.",
    tags: ["faq", "matrice", "mavic", "plattformar"],
    category: "plattformar",
    introParagraphs: [
      "DJI erbjuder två huvudsakliga enterprise-plattformar: kompakta Mavic 3 Enterprise för snabba uppdrag och tunga Matrice-serien för utbytbara payloads.",
      "Valet beror på uppdragstyp, sensorbehov och hur ofta ni byter mellan olika kameror.",
    ],
    faq: [
      {
        question: "När räcker Mavic 3 Enterprise?",
        answer:
          "Mavic 3 Enterprise passar snabba inspektioner, mindre kartläggningsområden och räddningsinsatser där portabilitet och snabb utryckning (< 60 sekunder) är viktigast. Integrerad termisk kamera ingår.",
      },
      {
        question: "När behöver jag Matrice 350 RTK?",
        answer:
          "Välj Matrice när du behöver utbytbara Zenmuse-payloads (H30T, P1, L2), längre flygtid (55 min), IP55-väderskydd eller tyngre sensorpaket. Matrice är standard för professionell inspektion och kartläggning.",
      },
      {
        question: "Kan Mavic 3 Enterprise använda Zenmuse-kameror?",
        answer:
          "Nej, Mavic 3 Enterprise har integrerade sensorer och stöder inte utbytbara Zenmuse-payloads. För H30T, P1 eller L2 krävs Matrice-plattform.",
      },
      {
        question: "Vilken har längst flygtid?",
        answer:
          "Matrice 350 RTK erbjuder upp till 55 minuters flygtid beroende på payload. Mavic 3 Enterprise ger upp till 45 minuter — fortfarande marknadsledande i sin klass.",
      },
      {
        question: "Kan jag börja med Mavic och uppgradera till Matrice?",
        answer:
          "Ja, det är en vanlig väg. Många organisationer börjar med Mavic 3 Enterprise för att validera drönararbetsflöden och investerar i Matrice när payload-behovet växer.",
      },
    ],
    relatedLinks: [
      { label: "Mavic 3E vs 3T", url: "/blogs/jamforer/mavic-3e-vs-mavic-3t" },
      { label: "H30 vs Mavic 3E", url: "/blogs/jamforer/h30-vs-mavic-3e" },
      { label: "Matrice-serien", url: "/collections/dji-matrice-series" },
      { label: "Mavic Enterprise", url: "/collections/dji-mavic-enterprise-series" },
    ],
  },
  {
    handle: "termiska-kameror-inspektion",
    title: "Vanliga frågor om termiska drönarkameror",
    eyebrow: "Termisk avbildning",
    excerpt:
      "Hur fungerar termisk inspektion med drönare? Sensorupplösning, radiometri, energiinspektion och räddningstjänst.",
    metaTitle: "FAQ — termiska drönarkameror | EuroDroneParts",
    metaDescription:
      "Svar på frågor om termisk drönarinspektion: H30T, H20T, H20N, radiometri, energiinspektion och persondetektion.",
    tags: ["faq", "termisk", "inspektion", "h30t"],
    category: "kameror",
    introParagraphs: [
      "Termisk avbildning med drönare har blivit standard inom energiinspektion, räddningstjänst och säkerhetsövervakning.",
      "Här besvarar vi frågor om hur termiska sensorer fungerar, vilken upplösning som krävs och vilka payloads som passar olika uppdrag.",
    ],
    faq: [
      {
        question: "Vad är radiometrisk termisk kamera?",
        answer:
          "En radiometrisk termisk sensor mäter faktisk yttemperatur i varje pixel, inte bara visar värmeskillnader. Det krävs för energiinspektion där exakta temperaturvärden dokumenteras.",
      },
      {
        question: "Vilken termisk upplösning behöver jag?",
        answer:
          "640×512 (H20T) räcker för många inspektioner. 1280×1024 (H30T) ger fyrdubblad pixeldensitet och gör det enklare att hitta mindre temperaturavvikelser på avstånd.",
      },
      {
        question: "Fungerar termisk kamera i rök och mörker?",
        answer:
          "Ja. Termisk kamera detekterar värmesignaturer oberoende av synligt ljus. I rök identifierar den hotspots och personer som inte syns med vanlig kamera.",
      },
      {
        question: "Vilken payload passar energiinspektion?",
        answer:
          "Zenmuse H30T är branschledande med 1280×1024 termisk sensor och 40× zoom. H20T är ett kostnadseffektivt alternativ för enklare inspektioner. Mavic 3T passar snabba kontroller.",
      },
      {
        question: "Kan termisk kamera hitta dolda fel i transformatorer?",
        answer:
          "Ja. Termisk drönarinspektion avslöjar överbelastade komponenter, dåliga anslutningar och isolationsfel som inte syns visuellt — ofta månader innan haveri.",
      },
    ],
    relatedLinks: [
      { label: "Termisk översikt", url: "/blogs/jamforer/jamfor-termiska-kameror" },
      { label: "H30T vs H20N", url: "/blogs/jamforer/zenmuse-h30t-vs-h20n" },
      { label: "Energi & infrastruktur", url: "/pages/energi-infrastruktur" },
    ],
  },
  {
    handle: "inspektionskameror-zoom",
    title: "Vanliga frågor om inspektionskameror & zoom",
    eyebrow: "Inspektion",
    excerpt:
      "Optisk zoom, hybridzoom och laser-avståndsmätare — vad betyder det i praktiken vid kraftlednings- och infrastrukturinspektion?",
    metaTitle: "FAQ — inspektionskameror & zoom | EuroDroneParts",
    metaDescription:
      "Svar på frågor om optisk zoom, hybridzoom och laser-avståndsmätare för drönarbaserad infrastrukturinspektion.",
    tags: ["faq", "inspektion", "zoom", "lrf"],
    category: "kameror",
    introParagraphs: [
      "Infrastrukturinspektion med drönare kräver ofta detaljbilder på hundratals meters avstånd — utan att flyga nära objektet.",
      "Optisk zoom, hybridzoom och laser-avståndsmätare (LRF) är centrala verktyg. Här förklarar vi vad de betyder i praktiken.",
    ],
    faq: [
      {
        question: "Vad är skillnaden på optisk och digital zoom?",
        answer:
          "Optisk zoom använder linsrörelse och behåller bildkvalitet. Digital (hybrid) zoom beskär och förstorar — kvaliteten minskar. H30-serien erbjuder 40× optisk och upp till 200× hybrid.",
      },
      {
        question: "Vad används laser-avståndsmätaren till?",
        answer:
          "LRF (Laser Range Finder) mäter exakt avstånd till ett objekt. Vid kraftledningsinspektion identifierar den vilken ledning eller isolator som avses, och koordinater kan dokumenteras i rapporten.",
      },
      {
        question: "Hur nära behöver jag flyga vid 40× zoom?",
        answer:
          "Med 40× optisk zoom kan du inspektera detaljer på kraftledningar och master på säkert avstånd — ofta 50–100 meter — utan att exponera drönaren för elektromagnetiska fält eller fallrisk.",
      },
      {
        question: "Vilken kamera har bäst zoom för inspektion?",
        answer:
          "Zenmuse H30 och H30T erbjuder 40× optisk zoom — marknadsledande bland DJI-payloads. H20T erbjuder 23× optisk zoom, vilket fortfarande räcker för många uppdrag.",
      },
      {
        question: "Kan jag inspektera vindkraftverk med zoomkamera?",
        answer:
          "Ja. Automatiserade flygmönster runt turbinblad med zoomkamera och AI-assisterad skadeklassificering minskar stilleståndstid och eliminerar repelling.",
      },
    ],
    relatedLinks: [
      { label: "Inspektionsöversikt", url: "/blogs/jamforer/jamfor-inspektionskameror" },
      { label: "H30T vs H30", url: "/blogs/jamforer/zenmuse-h30t-vs-h30" },
      { label: "Enterprise-sensorer", url: "/collections/enterprise-sensors" },
    ],
  },
  {
    handle: "energi-infrastruktur-faq",
    title: "Vanliga frågor — drönare för energi & infrastruktur",
    eyebrow: "Energi & infrastruktur",
    excerpt:
      "Kraftledningar, transformatorer, vindkraft och solparker — svar på frågor om termisk inspektion och enterprise-utrustning.",
    metaTitle: "FAQ — drönare för energi & infrastruktur | EuroDroneParts",
    metaDescription:
      "Svar på frågor om drönarinspektion av kraftledningar, transformatorer, vindkraft och solparker. Termisk kamera, RTK och regelverk.",
    tags: ["faq", "energi", "infrastruktur", "termisk"],
    category: "bransch",
    introParagraphs: [
      "Energisektorn är en av de största användarna av enterprise-drönare — termisk inspektion av kraftledningar och transformatorer sparar miljoner i förebyggande underhåll.",
      "Här besvarar vi de vanligaste frågorna från energibolag och infrastrukturägare.",
    ],
    faq: [
      {
        question: "Kan drönare inspektera kraftledningar under drift?",
        answer:
          "Ja. En av de största fördelarna är att inspektionen kan ske utan driftstopp. Med rätt utrustning och certifierad operatör flyger drönaren säkert i närheten av ledningar.",
      },
      {
        question: "Vilken drönare passar bäst för energiinspektion?",
        answer:
          "DJI Matrice 350 RTK med Zenmuse H30T är branschstandard för kraftledningar och transformatorer. För snabbare inspektioner av enskilda objekt räcker DJI Mavic 3 Enterprise med termisk kamera.",
      },
      {
        question: "Hur ofta bör energiinfrastruktur inspekteras med drönare?",
        answer:
          "Vi rekommenderar årlig inspektion av kraftledningar och transformatorer, med extra flygning efter stormar, extrema väderförhållanden eller vid misstanke om skada.",
      },
      {
        question: "Vilka regelverk gäller vid energianläggningar?",
        answer:
          "I Sverige krävs normalt Specific-kategori enligt EASA, operatörsregistrering och ofta tillstånd från nätägare. EuroDroneParts hjälper er med rätt utrustning och kan förmedla certifierade operatörer.",
      },
      {
        question: "Hur mycket billigare är drönare än helikopter?",
        answer:
          "Drönarinspektion kostar typiskt 70–80 % mindre än helikopterinspektion per kilometer ledning, med kortare planeringstid och bättre repeatability via RTK-rutter.",
      },
    ],
    relatedLinks: [
      { label: "Energi & infrastruktur", url: "/pages/energi-infrastruktur" },
      { label: "Matrice-serien", url: "/collections/dji-matrice-series" },
      { label: "Zenmuse H30T", url: "/collections/zenmuse-h30" },
    ],
  },
  {
    handle: "gis-kartlaggning-faq",
    title: "Vanliga frågor — drönare för GIS & kartläggning",
    eyebrow: "GIS & kartläggning",
    excerpt:
      "Noggrannhet, filformat, RTK och mjukvaruintegration — svar på frågor om professionell drönarkartläggning.",
    metaTitle: "FAQ — drönare för GIS & kartläggning | EuroDroneParts",
    metaDescription:
      "Svar på frågor om drönarbaserad kartläggning: noggrannhet, fotogrammetri, LiDAR, RTK och export till GIS.",
    tags: ["faq", "gis", "kartläggning", "lidar"],
    category: "bransch",
    introParagraphs: [
      "Drönarbaserad kartläggning har revolutionerat hur geodata samlas in — med centimeterprecision och bråkdelen av tiden jämfört med traditionell landmätning.",
      "Här besvarar vi frågor om noggrannhet, metoder och arbetsflöden för GIS-professionella.",
    ],
    faq: [
      {
        question: "Hur exakt är drönarbaserad kartläggning?",
        answer:
          "Med RTK-positionering uppnås centimeterprecision (1–3 cm) horisontellt och vertikalt. Med LiDAR (Zenmuse L2) kan vertikal noggrannhet ner till 5 cm uppnås, även genom vegetation.",
      },
      {
        question: "Kan drönardata ersätta traditionell landmätning?",
        answer:
          "För topografikartor, volymberäkningar och terrängmodeller — ja. För juridiskt bindande gränsmätning krävs fortfarande auktoriserad lantmätare, men drönardata är utmärkt som underlag.",
      },
      {
        question: "Hur mycket area kan jag kartlägga per dag?",
        answer:
          "Med Matrice 350 RTK och P1 kan du typiskt kartlägga 50–100 hektar per dag beroende på önskad upplösning (GSD) och terräng.",
      },
      {
        question: "Vilken mjukvara behöver jag?",
        answer:
          "Pix4Dmapper, DJI Terra och Agisoft Metashape är de vanligaste bearbetningsverktygen. Data exporteras till ArcGIS, QGIS och CAD-system.",
      },
      {
        question: "Fotogrammetri eller LiDAR — vad ska jag välja?",
        answer:
          "Fotogrammetri (P1) för ortofoton och 3D-modeller med färg. LiDAR (L2/L3) för punktmoln genom vegetation, skog och i skuggade områden. Många företag har båda.",
      },
    ],
    relatedLinks: [
      { label: "GIS & kartläggning", url: "/pages/gis-kartlaggning" },
      { label: "Kartläggningsöversikt", url: "/blogs/jamforer/jamfor-kartlaggningskameror" },
      { label: "Kartläggningsdrönare", url: "/collections/mapping-survey-drones" },
    ],
  },
  {
    handle: "raddningstjanst-faq",
    title: "Vanliga frågor — drönare för räddningstjänst",
    eyebrow: "Räddningstjänst",
    excerpt:
      "Sök- och räddningsinsatser, brand, termisk detektion och snabb utryckning — svar för räddningstjänst och krisledning.",
    metaTitle: "FAQ — drönare för räddningstjänst | EuroDroneParts",
    metaDescription:
      "Svar på frågor om enterprise-drönare för räddningstjänst, SAR, brand och krisledning. Termisk kamera, utryckningstid och regelverk.",
    tags: ["faq", "räddningstjänst", "sar", "termisk"],
    category: "bransch",
    introParagraphs: [
      "Vid räddningsinsatser räknas varje sekund. Enterprise-drönare ger insatsledningen realtidsöverblick, termisk persondetektion och kommunikation via högtalare.",
      "Här besvarar vi frågor från räddningstjänst, polis och krisledning.",
    ],
    faq: [
      {
        question: "Hur snabbt kan en räddningsdrönare vara i luften?",
        answer:
          "Med DJI Mavic 3 Enterprise kan du vara flygklar på under 60 sekunder. Med DJI Dock 2 kan drönaren lyfta automatiskt vid larm på under 30 sekunder.",
      },
      {
        question: "Fungerar termisk kamera vid sök- och räddningsinsats?",
        answer:
          "Ja. Termisk kamera hittar personer i mörker, tät vegetation och vatten. Täck stora sökområden på bråkdelen av tiden jämfört med markpatrull.",
      },
      {
        question: "Kan drönaren kommunicera med personer på marken?",
        answer:
          "Ja. DJI Mavic 3 Enterprise Speaker och Matrice-serien med CZI-högtalare möjliggör livekommunikation och förinspelade meddelanden under pågående insats.",
      },
      {
        question: "Vilka regelverk gäller för räddningstjänstens drönarflygning?",
        answer:
          "Räddningstjänst kan ofta flyga under Specific-kategori med förenklat tillstånd vid akuta insatser. Krav på operatörsutbildning och registrering gäller fortfarande.",
      },
      {
        question: "Vilken drönare rekommenderas för räddningstjänst?",
        answer:
          "Mavic 3 Enterprise för snabb utryckning och portabilitet. Matrice 350 RTK med H30T för längre flygtid, kraftfullare termisk sensor och utbytbara tillbehör (spotlight, högtalare).",
      },
    ],
    relatedLinks: [
      { label: "Räddningstjänst", url: "/pages/raddningstjanst" },
      { label: "Mavic 3 Enterprise", url: "/collections/dji-mavic-enterprise-series" },
      { label: "Termiska sensorer", url: "/collections/enterprise-sensors" },
    ],
  },
  {
    handle: "certifiering-och-regelverk",
    title: "Vanliga frågor om certifiering & regelverk",
    eyebrow: "Regelverk & EASA",
    excerpt:
      "Open, Specific och Certified — vad gäller för enterprise-drönare i Sverige? Operatörsregistrering, tillstånd och utbildning.",
    metaTitle: "FAQ — certifiering & drönarregelverk | EuroDroneParts",
    metaDescription:
      "Svar på frågor om EASA-regelverk, operatörsregistrering, flygcertifikat och tillstånd för professionella drönare i Sverige.",
    tags: ["faq", "regelverk", "easa", "certifiering"],
    category: "regelverk",
    introParagraphs: [
      "Professionell drönarverksamhet i EU regleras av EASA med nationell tillämpning via Transportstyrelsen i Sverige.",
      "Enterprise-drönare används nästan alltid i Specific-kategorin — här besvarar vi de vanligaste frågorna om certifiering och tillstånd.",
    ],
    faq: [
      {
        question: "Vilken EASA-kategori gäller för enterprise-drönare?",
        answer:
          "De flesta professionella uppdrag (inspektion, kartläggning, energi) faller under Specific-kategorin. Open-kategorin räcker sällan på grund av vikt, avstånd eller överflygning av otillåtna områden.",
      },
      {
        question: "Behöver jag operatörsregistrering?",
        answer:
          "Ja, alla kommersiella operatörer måste registrera sig hos Transportstyrelsen och ha en operatörs-ID (ORG-nummer) synligt på drönaren.",
      },
      {
        question: "Vilken utbildning krävs?",
        answer:
          "För Specific-kategori krävs vanligtvis A1/A3-kunskapsprov plus STS-utbildning (Standard Scenario) eller SORA-baserat tillstånd. EuroDroneParts kan förmedla kontakt med certifierade utbildningspartners.",
      },
      {
        question: "Kan jag flyga BVLOS (bortom synhåll)?",
        answer:
          "BVLOS kräver särskilt tillstånd från Transportstyrelsen. Med DJI Dock 2 och godkänd operatör kan automatiserade BVLOS-uppdrag genomföras inom godkända korridorer.",
      },
      {
        question: "Gäller andra regler vid energi- och räddningsinsatser?",
        answer:
          "Ja. Räddningstjänst kan få förenklat tillstånd vid akuta insatser. Energianläggningar kräver ofta tillstånd från nätägare utöver EASA-regelverket.",
      },
      {
        question: "Hjälper EuroDroneParts med tillståndsansökan?",
        answer:
          "Vi rådgiver om rätt utrustning och dokumentation för er ansökan. Vi kan förmedla kontakt med certifierade operatörer och konsulter som hanterar SORA och tillståndsprocessen.",
      },
    ],
    relatedLinks: [
      { label: "Enterprise-drönare", url: "/collections/enterprise-drones" },
      { label: "B2B-rådgivning", url: "/pages/b2b" },
    ],
  },
  {
    handle: "payload-kompatibilitet",
    title: "Vanliga frågor om payload-kompatibilitet",
    eyebrow: "Kompatibilitet",
    excerpt:
      "Vilka Zenmuse-kameror passar vilken Matrice? Adapter, viktgränser och snabb payload-byte mellan uppdrag.",
    metaTitle: "FAQ — payload-kompatibilitet | EuroDroneParts",
    metaDescription:
      "Svar på frågor om Zenmuse-kompatibilitet med Matrice 300, 350 och 400 RTK. Payload-byte, vikt och adapter.",
    tags: ["faq", "kompatibilitet", "payload", "matrice"],
    category: "plattformar",
    introParagraphs: [
      "En av fördelarna med Matrice-plattformen är utbytbara payloads — men inte alla kombinationer stöds.",
      "Här besvarar vi frågor om vilka Zenmuse-kameror och sensorer som fungerar med vilken drönare.",
    ],
    faq: [
      {
        question: "Vilka payloads passar Matrice 350 RTK?",
        answer:
          "Matrice 350 RTK stöder hela Zenmuse-sortimentet: H30/H30T, H20-serien, P1, L1/L2/L3, och tredjepartstillbehör via SkyPort. Max nyttolast beror på konfiguration och flygtid.",
      },
      {
        question: "Fungerar H30T på Matrice 300 RTK?",
        answer:
          "Ja, Zenmuse H30T är kompatibel med Matrice 300 RTK och Matrice 350 RTK. Kontrollera att du har senaste firmware på både drönare och payload.",
      },
      {
        question: "Stöder Matrice 400 RTK fler payloads?",
        answer:
          "Matrice 400 RTK är DJI:s senaste tunga plattform med utökat stöd för H30-serien och tyngre sensorpaket. Kontakta oss för aktuell kompatibilitetsmatris.",
      },
      {
        question: "Hur lång tid tar det att byta payload?",
        answer:
          "Med SkyPort V2 går byte på under 2 minuter — skruva loss, byt gimbal, kalibrera. Erfarna operatörer byter payload mellan uppdrag på plats.",
      },
      {
        question: "Kan jag använda äldre Zenmuse-kameror på ny Matrice?",
        answer:
          "De flesta Zenmuse XT2, H20 och P1 fungerar på Matrice 350 RTK. Kontrollera alltid DJI:s kompatibilitetslista och firmware-versioner innan köp.",
      },
    ],
    relatedLinks: [
      { label: "Alla Zenmuse-översikt", url: "/blogs/jamforer/jamfor-alla-zenmuse-kameror" },
      { label: "Enterprise-sensorer", url: "/collections/enterprise-sensors" },
      { label: "Matrice-serien", url: "/collections/dji-matrice-series" },
    ],
  },
];

export function getEdpFaqArticleByHandle(handle: string): EdpFaqArticle | undefined {
  return EDP_FAQ_ARTICLES.find((a) => a.handle === handle);
}

export function getEdpFaqArticlesByCategory(category: EdpFaqCategory): EdpFaqArticle[] {
  return EDP_FAQ_ARTICLES.filter((a) => a.category === category);
}
