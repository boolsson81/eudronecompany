import type { FaqItem } from "@/lib/faqJsonLd";
import matriceImg from "@/assets/dji-matrice-350-rtk.jpg";
import mavicEntImg from "@/assets/dji-mavic-3-enterprise.jpg";
import agrasImg from "@/assets/dji-agras-t50.jpg";
import mavicMultiImg from "@/assets/dji-mavic-3-multispectral.jpg";
import inspireImg from "@/assets/dji-inspire-3.jpg";
import mavicProImg from "@/assets/dji-mavic-3-pro.jpg";

/**
 * Landningssidor för drönarplattformarna i Enterprise-sortimentet.
 *
 * Katalogen är medvetet skild från `commercialDroneIndustries.ts`, där samma
 * drönare bara förekommer som korta rekommendationskort per bransch. Här ligger
 * innehållet en egen sida behöver: specar, användningsområden, kompatibla
 * payloads och FAQ.
 *
 * Alla specsiffror är hämtade från de påståenden som redan är faktagranskade i
 * repot (jämförelseartiklarna, kamerakatalogen och Shopify-temat) — se
 * `scripts/__tests__/dji-spec-claims.test.ts`. Lägg inte till nya siffror utan
 * källa; skriv hellre ingen spec alls.
 */

export type DroneProductCategory = "platform" | "compact" | "agriculture" | "cinema" | "infrastructure";

export const DRONE_PRODUCT_CATEGORIES: Record<
  DroneProductCategory,
  { label: string; description: string }
> = {
  platform: {
    label: "Industriella plattformar",
    description: "Bärande Matrice-plattformar med utbytbara Zenmuse-payloads",
  },
  compact: {
    label: "Kompakta enterprise-drönare",
    description: "Integrerade sensorer i ett format som ryms i ryggsäcken",
  },
  agriculture: {
    label: "Lantbruk & precision",
    description: "Sprutning, spridning och multispektral växtanalys",
  },
  cinema: {
    label: "Film & media",
    description: "Cinemaplattformar och kompakta kameradrönare",
  },
  infrastructure: {
    label: "Autonoma system & logistik",
    description: "Dockningsstationer för obemannad drift och transportdrönare för lastleverans",
  },
};

export interface DroneProductSpec {
  label: string;
  value: string;
}

export interface EnterpriseDroneProduct {
  slug: string;
  name: string;
  /** Tillverkare, t.ex. "DJI". Sortimentet väntas omfatta fler märken framöver. */
  brand: string;
  tag: string;
  category: DroneProductCategory;
  heroTitle: string;
  heroDesc: string;
  longDesc: string;
  features: string[];
  specs: DroneProductSpec[];
  applications: string[];
  /** Slugs i `enterpriseCameraProducts.ts`. Tomt för drönare med fast kamera. */
  compatiblePayloads: string[];
  /** Slugs i `commercialDroneIndustries.ts`. */
  industries: string[];
  /** Slug i `droneComparisons.ts` — jämförelseartikeln som nämner drönaren. */
  comparisonSlug?: string;
  shopUrl?: string;
  imageUrl?: string;
  youtubeId?: string;
  badge?: string;
  faq: FaqItem[];
  seoTitle: string;
  seoDesc: string;
}

export const ENTERPRISE_DRONE_PRODUCTS: EnterpriseDroneProduct[] = [
  {
    slug: "matrice-400",
    name: "DJI Matrice 400",
    brand: "DJI",
    tag: "Tung plattform",
    category: "platform",
    heroTitle: "DJI Matrice 400 — plattformen för tunga sensorer och LiDAR",
    heroDesc:
      "DJI:s nuvarande flaggskeppsplattform för tunga sensorer, LiDAR och avancerade inspektionsuppdrag. Upp till 6 kg nyttolast.",
    longDesc:
      "Matrice 400 är den plattform du väljer när uppdragen kräver mer än vad Matrice 350 RTK bär. Med upp till 6 kg nyttolast tar den DJI:s tyngsta sensorpaket, inklusive Zenmuse L3 som bara flyger på den här plattformen. Kombinationen av tung last, RTK-positionering och stöd för H30-serien gör den till förstahandsvalet för storskalig LiDAR-kartläggning, korridorinspektion och insatser där flera sensorer ska upp i samma flygning.",
    features: [
      "Upp till 6 kg nyttolast",
      "Enda plattformen för Zenmuse L3",
      "Stöd för H30-seriens hybridpayloads",
      "RTK-positionering på centimeternivå",
      "Sökljus och högtalare för nattinsatser",
      "Byggd för storskalig kartläggning och korridorinspektion",
    ],
    specs: [
      { label: "Typ", value: "Bärande plattform med utbytbar payload" },
      { label: "Nyttolast", value: "Upp till 6 kg" },
      { label: "Positionering", value: "RTK, centimeternivå" },
      { label: "Payloadstöd", value: "Zenmuse L3, H30/H30T, S1, V1" },
      { label: "Primärt användningsområde", value: "LiDAR, tung inspektion, räddningsinsats" },
      { label: "Segment", value: "Enterprise flaggskepp" },
    ],
    applications: [
      "Storskalig LiDAR-kartläggning med Zenmuse L3",
      "Korridorinspektion av kraftledningar och järnväg",
      "Nattinsatser med sökljus och högtalare",
      "Uppdrag där flera sensorer krävs i samma flygning",
    ],
    compatiblePayloads: ["zenmuse-l3", "zenmuse-h30t", "zenmuse-h30", "zenmuse-s1", "zenmuse-v1"],
    industries: ["energi", "kartlaggning", "sakerhet"],
    shopUrl: "https://actionking.se/search?q=dji+matrice+400",
    badge: "Flaggskepp",
    faq: [
      {
        question: "Vad skiljer Matrice 400 från Matrice 350 RTK?",
        answer:
          "Matrice 400 tar upp till 6 kg nyttolast och är den plattform Zenmuse L3 kräver. Matrice 350 RTK är den etablerade arbetsplattformen för H30-, H20-, L2- och P1-payloads. Behöver du L3 eller tyngre sensorpaket är Matrice 400 rätt val.",
      },
      {
        question: "Vilka Zenmuse-payloads fungerar på Matrice 400?",
        answer:
          "H30 och H30T, Zenmuse L3, sökljuset S1 och högtalaren V1. Kompatibilitetsmatrisen utökas löpande av DJI — kontakta oss för aktuellt läge innan du beställer.",
      },
      {
        question: "Kan jag flytta över payloads från min Matrice 350 RTK?",
        answer:
          "H30-seriens payloads stöds på både Matrice 350 RTK och Matrice 400. Zenmuse L3 är däremot exklusiv för Matrice 400 och kan inte monteras på tidigare plattformar.",
      },
    ],
    seoTitle: "DJI Matrice 400 — flaggskeppsplattform | EU Drone Company",
    seoDesc:
      "DJI Matrice 400 med upp till 6 kg nyttolast och stöd för Zenmuse L3, H30 och H30T. Plattformen för LiDAR och tung inspektion. Begär offert.",
  },
  {
    slug: "matrice-350-rtk",
    name: "DJI Matrice 350 RTK",
    brand: "DJI",
    tag: "Industriell arbetsplattform",
    category: "platform",
    heroTitle: "DJI Matrice 350 RTK — den industriella arbetshästen",
    heroDesc:
      "Robust plattform med 55 minuters flygtid, IP55-skydd och utbytbara Zenmuse-payloads för inspektion, kartläggning och räddning.",
    longDesc:
      "Matrice 350 RTK är den mest använda enterprise-plattformen i inspektions- och energisektorn. Du väljer payload efter uppdrag — Zenmuse H30T för termisk hybridinspektion, L2 för LiDAR, P1 för fotogrammetri — och behåller samma drönare, batterier och arbetsflöde. IP55-skyddet gör att den kan flyga när vädret inte är perfekt, och inbyggd RTK ger repeterbara flygningar som går att jämföra över tid.",
    features: [
      "Upp till 55 min flygtid",
      "IP55 väderskydd",
      "Inbyggd RTK för centimeterprecision",
      "Utbytbara Zenmuse-payloads",
      "Upp till 200× zoom beroende på payload",
      "TB65-batterier med BS65 laddstation",
    ],
    specs: [
      { label: "Typ", value: "Bärande plattform med utbytbar payload" },
      { label: "Flygtid", value: "Upp till 55 min" },
      { label: "Väderskydd", value: "IP55" },
      { label: "Startvikt", value: "ca 6,47 kg (med två TB65)" },
      { label: "Max vindtålighet", value: "12 m/s" },
      { label: "Positionering", value: "Inbyggd RTK" },
      { label: "Zoom", value: "Upp till 200× beroende på payload" },
      { label: "Payloadstöd", value: "Zenmuse H30/H30T, H20-serien, L1/L2, P1, S1, V1" },
      { label: "Fjärrkontroll", value: "DJI RC Plus" },
    ],
    applications: [
      "Inspektion av kraftledningar, transformatorer och master",
      "Vindkraft- och solpanelsinspektion med termisk payload",
      "LiDAR-kartläggning och volymberäkning",
      "Sök och räddning dygnet runt med H30T",
    ],
    compatiblePayloads: [
      "zenmuse-h30t",
      "zenmuse-h30",
      "zenmuse-h20t",
      "zenmuse-h20n",
      "zenmuse-h20",
      "zenmuse-l2",
      "zenmuse-l1",
      "zenmuse-p1",
      "zenmuse-s1",
      "zenmuse-v1",
    ],
    industries: ["inspektion", "energi", "kartlaggning", "sakerhet"],
    comparisonSlug: "mavic-3-enterprise-vs-matrice-350-rtk",
    shopUrl: "https://actionking.se/search?q=dji+matrice+350+rtk",
    imageUrl: matriceImg,
    youtubeId: "JPPHG5dSpwM",
    badge: "Populär",
    faq: [
      {
        question: "Hur många payloads kan Matrice 350 RTK bära samtidigt?",
        answer:
          "Plattformen har både övre och undre monteringspunkter, så du kan kombinera till exempel en hybridkamera undertill med ett sökljus ovanpå. Vilken kombination som är möjlig beror på vikt och gimbalfäste — vi går igenom din uppsättning innan beställning.",
      },
      {
        question: "Klarar Matrice 350 RTK dåligt väder?",
        answer:
          "IP55-skyddet innebär att den klarar lätt regn och damm, och den är godkänd för vind upp till 12 m/s. Vid kraftig storm eller nederbörd rekommenderar vi ändå att skjuta upp flygningen.",
      },
      {
        question: "Behöver jag en egen RTK-basstation?",
        answer:
          "Nej, RTK-korrektion kan hämtas från nätverkstjänst. En D-RTK 2 basstation ger dock oberoende av mobiltäckning och används i våra Pro- och Enterprise-paket för inspektion och kartläggning.",
      },
    ],
    seoTitle: "DJI Matrice 350 RTK — industriell drönarplattform | EU Drone Company",
    seoDesc:
      "DJI Matrice 350 RTK med 55 min flygtid, IP55 och utbytbara Zenmuse-payloads. Plattform för inspektion, kartläggning och räddning. Begär offert.",
  },
  {
    slug: "mavic-3-enterprise",
    name: "DJI Mavic 3 Enterprise",
    brand: "DJI",
    tag: "Kompakt allround",
    category: "compact",
    heroTitle: "DJI Mavic 3 Enterprise — professionell inspektion i ryggsäcken",
    heroDesc:
      "4/3-sensor med mekanisk slutare, 56× hybridzoom och 45 minuters flygtid i ett format som är flygklart på under en minut.",
    longDesc:
      "Mavic 3 Enterprise är ingången till professionell drönarinspektion. Vidvinkelkameran har 4/3-sensor med mekanisk slutare, vilket ger skarpa bilder för fotogrammetri utan rullande slutare, och telekameran ger 56× hybridzoom för detaljgranskning på avstånd. Behöver du termisk avbildning väljer du 3T-varianten, som byter vidvinkeln mot en 48 MP-sensor och lägger till en radiometrisk termisk sensor på 640×512.",
    features: [
      "Upp till 45 min flygtid",
      "4/3\" CMOS, 20 MP med mekanisk slutare",
      "56× hybridzoom (7× optisk tele)",
      "Termisk sensor 640×512 på 3T-varianten",
      "Valfri RTK-modul för centimeterprecision",
      "Flygklar på under en minut",
    ],
    specs: [
      { label: "Typ", value: "Integrerad enterprise-kamera (ej utbytbar payload)" },
      { label: "Flygtid", value: "Upp till 45 min" },
      { label: "Vidvinkelssensor", value: "4/3\" CMOS, 20 MP, mekanisk slutare" },
      { label: "Zoomsensor", value: "1/2\" CMOS tele, 12 MP" },
      { label: "Optisk zoom", value: "56× hybrid (7× optisk tele)" },
      { label: "Termisk sensor", value: "640×512 @ 30 Hz på Mavic 3T" },
      { label: "Vikt", value: "ca 915 g (hel drönare)" },
      { label: "Väderskydd", value: "Inget IP-klassat" },
      { label: "Positionering", value: "Valfri RTK-modul" },
    ],
    applications: [
      "Tak- och fasadinspektion i tätbebyggelse",
      "Snabb screening av solcellsanläggningar",
      "Fotogrammetri och mindre kartläggningsuppdrag",
      "Utryckning och lägesbild för räddningstjänst (3T)",
    ],
    compatiblePayloads: [],
    industries: ["inspektion", "energi", "sakerhet"],
    comparisonSlug: "mavic-3-enterprise-vs-matrice-350-rtk",
    shopUrl: "https://actionking.se/search?q=dji+mavic+3+enterprise",
    imageUrl: mavicEntImg,
    youtubeId: "KH-ZReRtoec",
    badge: "Populär",
    faq: [
      {
        question: "Vad är skillnaden mellan Mavic 3E och Mavic 3T?",
        answer:
          "3E har en 4/3\"-vidvinkel på 20 MP med mekanisk slutare och är byggd för kartläggning och fotogrammetri. 3T byter till en 48 MP-vidvinkel och lägger till en radiometrisk termisk sensor på 640×512 — valet om du inspekterar tak, solceller eller elanläggningar termiskt.",
      },
      {
        question: "Behöver jag RTK-modulen?",
        answer:
          "Bara om du kräver centimeterprecision utan markstöd, till exempel vid återkommande kartläggning av samma objekt. För visuell inspektion och dokumentation räcker standardpositionering.",
      },
      {
        question: "Kan jag flyga i regn med Mavic 3 Enterprise?",
        answer:
          "Nej. Till skillnad från Matrice 350 RTK har Mavic 3 Enterprise ingen IP-klassning. Behöver du flyga i väder är Matrice-plattformen rätt val.",
      },
    ],
    seoTitle: "DJI Mavic 3 Enterprise — kompakt inspektionsdrönare | EU Drone Company",
    seoDesc:
      "DJI Mavic 3 Enterprise med 45 min flygtid, 4/3-sensor och 56× hybridzoom. Termisk sensor på 3T. Kompakt inspektion för proffs. Begär offert.",
  },
  {
    slug: "mavic-3-multispectral",
    name: "DJI Mavic 3 Multispectral",
    brand: "DJI",
    tag: "Växtanalys & NDVI",
    category: "agriculture",
    heroTitle: "DJI Mavic 3 Multispectral — kartlägg grödornas hälsa",
    heroDesc:
      "RGB- och multispektral sensor i samma drönare. NDVI-kartor och behandlingsunderlag med RTK-precision, upp till 43 minuters flygtid.",
    longDesc:
      "Mavic 3 Multispectral kombinerar en 20 MP RGB-kamera med fyra multispektrala sensorer, så att du kan mäta grödornas hälsa i stället för att gissa. NDVI- och NDRE-kartor visar var beståndet är stressat veckor innan det syns med blotta ögat, och underlaget kan exporteras till fältkartor för variabel giva. För gårdar som redan har en sprutdrönare är den här drönaren det som gör behandlingen riktad i stället för heltäckande.",
    features: [
      "Upp till 43 min flygtid",
      "4/3\" CMOS RGB, 20 MP med mekanisk slutare",
      "Fyra multispektrala sensorer på 5 MP",
      "NDVI- och NDRE-kartor för växtanalys",
      "RTK-precision på centimeternivå",
      "Underlag för variabel giva och behandlingskartor",
    ],
    specs: [
      { label: "Typ", value: "Integrerad RGB + multispektral kamera" },
      { label: "Flygtid", value: "Upp till 43 min" },
      { label: "RGB-sensor", value: "4/3\" CMOS, 20 MP, mekanisk slutare" },
      { label: "Multispektralt", value: "4× 5 MP (grön, röd, red edge, NIR)" },
      { label: "Vikt", value: "ca 951 g (hel drönare)" },
      { label: "Positionering", value: "RTK, centimeternivå" },
      { label: "Täckning", value: "Upp till 200 ha per dag (kartläggning)" },
      { label: "Primärt användningsområde", value: "Precisionsjordbruk, NDVI, växtstress" },
    ],
    applications: [
      "NDVI-kartor och gödslingsplanering",
      "Tidig detektion av sjukdom och skadedjur",
      "Behandlingskartor till sprutdrönare",
      "Dokumentation för EU-stöd och miljöcertifiering",
    ],
    compatiblePayloads: [],
    industries: ["lantbruk", "kartlaggning"],
    comparisonSlug: "agras-t50-vs-mavic-3-multispectral",
    shopUrl: "https://actionking.se/search?q=dji+mavic+3+multispectral",
    imageUrl: mavicMultiImg,
    youtubeId: "4f8NiLApHLk",
    faq: [
      {
        question: "Behöver jag Mavic 3 Multispectral om jag redan har en Agras T50?",
        answer:
          "De löser olika problem. Agras T50 behandlar, Mavic 3 Multispectral talar om var behandlingen behövs. Utan kartunderlag sprutar du heltäckande, vilket är just den kostnaden en sprutdrönare ska sänka.",
      },
      {
        question: "Hur tidigt syns växtstress i multispektral data?",
        answer:
          "Med RTK-positionering och multispektral analys kan stresszoner identifieras 2–3 veckor innan de syns med blotta ögat, vilket ger tid att sätta in riktade åtgärder.",
      },
      {
        question: "Kan jag använda kartorna i mitt befintliga system?",
        answer:
          "Ja. Ortomosaiker och indexkartor exporteras i standardformat och kan läsas in i de vanligaste Farm Management-systemen för variabel giva.",
      },
    ],
    seoTitle: "DJI Mavic 3 Multispectral — NDVI & växtanalys | EU Drone Company",
    seoDesc:
      "DJI Mavic 3 Multispectral med RGB- och multispektral sensor för NDVI-kartor, växtanalys och variabel giva. 43 min flygtid. Begär offert.",
  },
  {
    slug: "agras-t50",
    name: "DJI Agras T50",
    brand: "DJI",
    tag: "Sprutning & spridning",
    category: "agriculture",
    heroTitle: "DJI Agras T50 — precisionssprutning i industriskala",
    heroDesc:
      "40 liters spruttank, terrängföljning och RTK-precision. Täck upp till 20 hektar i timmen och minska kemikalieförbrukningen.",
    longDesc:
      "Agras T50 är byggd för fältarbete i skala. Med 40 liters spruttank, 40 kg vätskelast och en spridarlast på 50 kg täcker den upp till 20 hektar i timmen. Terrängföljning håller sprutbommen på rätt höjd även i kuperad terräng, och RTK ger centimeterprecision så att behandlingen hamnar exakt där kartunderlaget säger. För gårdar med blöta eller lutande fält gör den jobbet utan markpackning från tunga maskiner.",
    features: [
      "40 L spruttank",
      "40 kg vätskelast, 50 kg spridarlast",
      "Täckning upp till 20 ha per timme",
      "Terrängföljning i kuperad terräng",
      "RTK-precision på centimeternivå",
      "Sprutning och granulatspridning i samma plattform",
    ],
    specs: [
      { label: "Typ", value: "Spridnings- och sprutdrönare" },
      { label: "Spruttank", value: "40 L" },
      { label: "Last", value: "40 kg vätska eller 50 kg granulat" },
      { label: "Täckning", value: "Upp till 20 ha per timme" },
      { label: "Flygtid", value: "ca 7–10 min vid full last" },
      { label: "Positionering", value: "RTK, centimeternivå" },
      { label: "Primärt användningsområde", value: "Sprutning, gödsling och utsädning" },
      { label: "Regelverk", value: "Kräver kemikaliehantering och särskild utbildning" },
    ],
    applications: [
      "Växtskyddssprutning i spannmål och oljeväxter",
      "Gödsling av blöta eller lutande fält",
      "Utsädes- och kalkspridning",
      "Riktad behandling utifrån NDVI-kartor",
    ],
    compatiblePayloads: [],
    industries: ["lantbruk"],
    comparisonSlug: "agras-t50-vs-mavic-3-multispectral",
    shopUrl: "https://actionking.se/search?q=dji+agras+t50",
    imageUrl: agrasImg,
    youtubeId: "G8gjm2HALEM",
    faq: [
      {
        question: "Vilken utbildning krävs för att spruta med drönare?",
        answer:
          "Utöver operatörsbehörigheten för drönare krävs behörighet för hantering av växtskyddsmedel enligt gällande kemikalielagstiftning. Vi går igenom vad som gäller för din verksamhet och hjälper till med utbildningsupplägget.",
      },
      {
        question: "När räknar sig en sprutdrönare?",
        answer:
          "Agras T50 har hög inköpskostnad men kan betala sig på en säsong för gårdar över cirka 200 hektar med intensiv odling. Den största besparingen kommer från minskad kemikalieförbrukning, upp till 30 procent vid riktad behandling.",
      },
      {
        question: "Kan Agras T50 kartlägga fält själv?",
        answer:
          "Nej, den saknar multispektral sensor. Den flyger behandlingsmönster utifrån kartor som importerats från Mavic 3 Multispectral eller ett annat GIS-system.",
      },
    ],
    seoTitle: "DJI Agras T50 — sprutdrönare för lantbruk | EU Drone Company",
    seoDesc:
      "DJI Agras T50 med 40 L spruttank, terrängföljning och RTK. Täck upp till 20 ha/timme och minska kemikalieförbrukningen. Begär offert.",
  },
  {
    slug: "inspire-3",
    name: "DJI Inspire 3",
    brand: "DJI",
    tag: "Fullformat cinema",
    category: "cinema",
    heroTitle: "DJI Inspire 3 — fullformat 8K för filmproduktion",
    heroDesc:
      "Zenmuse X9 med fullformatssensor, 8K ProRes RAW och dubbeloperatörsläge. Plattformen för reklam, dokumentär och spelfilm.",
    longDesc:
      "Inspire 3 är DJI:s cinemaplattform. Zenmuse X9-kameran har fullformatssensor, spelar in i upp till 8K och levererar över 14 stops dynamiskt omfång i ProRes RAW. DL-fattningen tar utbytbara objektiv, och dubbeloperatörsläget låter piloten flyga medan kameraoperatören komponerar bilden — samma arbetssätt som på en filminspelning med kranarm. RTK-positionering gör repeterbara flygningar möjliga när samma tagning ska köras om.",
    features: [
      "Fullformatssensor i Zenmuse X9",
      "Upp till 8K/75fps",
      "14+ stops dynamiskt omfång i ProRes RAW",
      "Utbytbara objektiv med DL-fattning",
      "Dubbeloperatörsläge för pilot och kameraoperatör",
      "RTK för repeterbara tagningar",
    ],
    specs: [
      { label: "Typ", value: "Cinemaplattform med integrerad Zenmuse X9" },
      { label: "Sensor", value: "Fullformat 8K (Zenmuse X9)" },
      { label: "Videoupplösning", value: "Upp till 8K/75fps" },
      { label: "Dynamiskt omfång", value: "14+ stops (ProRes RAW)" },
      { label: "Flygtid", value: "Upp till 28 min" },
      { label: "Max hastighet", value: "94 km/h" },
      { label: "Objektiv", value: "Utbytbara, DL-fattning" },
      { label: "Batteri", value: "TB51" },
      { label: "Teamstorlek", value: "Pilot + kameraoperatör rekommenderas" },
    ],
    applications: [
      "Spelfilm och high-end reklamproduktion",
      "Dokumentär och TV-produktion",
      "Musikvideo och event med cinemakrav",
      "Flygtagningar där ProRes RAW krävs i efterproduktion",
    ],
    compatiblePayloads: [],
    industries: ["film-media"],
    comparisonSlug: "inspire-3-vs-mavic-3-pro",
    shopUrl: "https://actionking.se/search?q=dji+inspire+3",
    imageUrl: inspireImg,
    youtubeId: "IwIoeaGim6Q",
    faq: [
      {
        question: "Behöver jag två operatörer för Inspire 3?",
        answer:
          "Inte tekniskt, men det rekommenderas. Dubbeloperatörsläget låter piloten fokusera på flygbanan medan kameraoperatören styr gimbal, zoom och fokus — skillnaden syns direkt i materialet.",
      },
      {
        question: "Vilka objektiv passar Zenmuse X9?",
        answer:
          "X9 använder DJI:s DL-fattning med utbytbara objektiv i flera brännvidder. Vi hjälper dig sätta ihop ett objektivpaket utifrån vilka produktioner du tar.",
      },
      {
        question: "Hur lång är setup-tiden jämfört med Mavic 3 Pro?",
        answer:
          "Räkna med 5–10 minuter för Inspire 3 med två operatörer, mot under en minut för Mavic 3 Pro. Det är den avvägning du gör mot fullformat och ProRes RAW.",
      },
    ],
    seoTitle: "DJI Inspire 3 — fullformat 8K cinemadrönare | EU Drone Company",
    seoDesc:
      "DJI Inspire 3 med Zenmuse X9, fullformatssensor, 8K ProRes RAW och utbytbara objektiv. Cinemaplattform för professionell film. Begär offert.",
  },
  {
    slug: "mavic-3-pro",
    name: "DJI Mavic 3 Pro",
    brand: "DJI",
    tag: "Kompakt kameradrönare",
    category: "cinema",
    heroTitle: "DJI Mavic 3 Pro — tre objektiv i ryggsäcksformat",
    heroDesc:
      "Hasselblad-kamera med 4/3-sensor plus två telekameror. 5.1K-video och 43 minuters flygtid, flygklar på under en minut.",
    longDesc:
      "Mavic 3 Pro packar tre kameror i en drönare som ryms i en ryggsäck: en 4/3-sensor från Hasselblad för huvudbilden och två telekameror som ger dig komprimerade bildutsnitt utan att flytta drönaren. Med 5.1K-inspelning, Apple ProRes och 43 minuters flygtid är den arbetsredskapet för dokumentär, B-roll och produktioner där tempot är högt och crewet litet.",
    features: [
      "Tre kameror — 4/3 Hasselblad plus två tele",
      "Upp till 5.1K/50fps",
      "12,8 stops dynamiskt omfång (Apple ProRes)",
      "Upp till 43 min flygtid",
      "Flygklar på under en minut",
      "En operatör räcker",
    ],
    specs: [
      { label: "Typ", value: "Kompakt kameradrönare med integrerade kameror" },
      { label: "Sensor", value: "4/3 CMOS Hasselblad + två telekameror" },
      { label: "Videoupplösning", value: "Upp till 5.1K/50fps" },
      { label: "Dynamiskt omfång", value: "12,8 stops (Apple ProRes)" },
      { label: "Flygtid", value: "Upp till 43 min" },
      { label: "Max hastighet", value: "75 km/h" },
      { label: "Batteri", value: "5000 mAh Intelligent Battery" },
      { label: "Setup-tid", value: "Under 1 min" },
    ],
    applications: [
      "Dokumentär och B-roll",
      "Fastighetsfotografi och virtuella turer",
      "Marknadsförings- och varumärkesvideo",
      "Snabba produktioner med litet team",
    ],
    compatiblePayloads: [],
    industries: ["film-media"],
    comparisonSlug: "inspire-3-vs-mavic-3-pro",
    shopUrl: "https://actionking.se/search?q=dji+mavic+3+pro",
    imageUrl: mavicProImg,
    youtubeId: "BNEmDcQr6hk",
    faq: [
      {
        question: "Räcker Mavic 3 Pro för kommersiella produktioner?",
        answer:
          "För dokumentär, reklam på webb och sociala kanaler samt B-roll räcker den gott. När beställaren kräver fullformat, ProRes RAW eller utbytbara objektiv är Inspire 3 rätt verktyg.",
      },
      {
        question: "Vad använder man telekamerorna till?",
        answer:
          "De ger komprimerade bildutsnitt som skiljer sig visuellt från vidvinkeln, utan att du flyger närmare motivet. Praktiskt när du inte får eller kan komma nära, till exempel över trafik eller vatten.",
      },
      {
        question: "Behöver jag ND-filter?",
        answer:
          "Ja, om du filmar i starkt ljus och vill hålla slutartiden på 1/50 för naturlig rörelseoskärpa. Ett ND-kit på ND8 till ND64 täcker de flesta situationer.",
      },
    ],
    seoTitle: "DJI Mavic 3 Pro — kompakt kameradrönare | EU Drone Company",
    seoDesc:
      "DJI Mavic 3 Pro med tre kameror, 5.1K-video och 43 min flygtid. Kompakt drönare för dokumentär, B-roll och fastighetsfoto. Begär offert.",
  },
  {
    slug: "matrice-4e",
    name: "DJI Matrice 4E",
    tag: "Kompakt allround (RC Plus 2)",
    category: "compact",
    heroTitle: "DJI Matrice 4E — nästa generations kompakta inspektionsdrönare",
    heroDesc:
      "Uppdaterad kompaktserie med inbyggd dubbel RTK, ny O4 Enterprise-länk och integrerad vidvinkel- och telekamera. Efterträdare till Mavic 3 Enterprise.",
    longDesc:
      "Matrice 4E bygger vidare på Mavic 3 Enterprise-konceptet men med uppdaterad sensor, längre räckvidd och RTK inbyggt som standard — ingen tillvalsmodul krävs. Vidvinkelkameran ger hög upplösning för kartläggning och dokumentation, medan telekameran ger räckviddszoom för detaljgranskning utan att flyga nära objektet. Passar som uppgradering för verksamheter som redan kör Mavic 3 Enterprise.",
    features: [
      "Inbyggd dubbel RTK-positionering — inget tillval krävs",
      "Uppdaterad O4 Enterprise-länk med längre räckvidd",
      "Integrerad vidvinkel- och telekamera",
      "IP55 väderskydd",
      "Snabbytbart batteri",
      "Flygklar på under en minut",
    ],
    specs: [
      { label: "Typ", value: "Integrerad enterprise-kamera (ej utbytbar payload)" },
      { label: "Segment", value: "Efterträdare till Mavic 3 Enterprise" },
      { label: "Väderskydd", value: "IP55" },
      { label: "Positionering", value: "Inbyggd dubbel RTK" },
      { label: "Länk", value: "DJI O4 Enterprise-transmission" },
      { label: "Styrenhet", value: "DJI RC Plus 2" },
    ],
    applications: [
      "Tak- och fasadinspektion",
      "Screening av solcellsanläggningar",
      "Fotogrammetri och mindre kartläggningsuppdrag",
      "Uppgradering för befintliga Mavic 3 Enterprise-flottor",
    ],
    compatiblePayloads: [],
    industries: ["inspektion", "energi", "sakerhet"],
    shopUrl: "https://actionking.se/search?q=dji+matrice+4e",
    badge: "Ny",
    faq: [
      {
        question: "Är Matrice 4E samma sak som Mavic 3 Enterprise?",
        answer:
          "Nej, Matrice 4E är efterträdaren i samma kompakta segment, med bland annat inbyggd RTK och uppdaterad O4 Enterprise-länk. Mavic 3 Enterprise finns kvar i sortimentet så länge lager räcker.",
      },
      {
        question: "Behöver jag en separat RTK-modul till Matrice 4E?",
        answer:
          "Nej. Till skillnad från Mavic 3 Enterprise har Matrice 4E dubbel RTK inbyggd som standard.",
      },
      {
        question: "Vilken fjärrkontroll används till Matrice 4E?",
        answer:
          "DJI RC Plus 2, som är ny för Matrice 4-serien och inte kompatibel med tidigare Mavic 3 Enterprise-kontroller.",
      },
    ],
    seoTitle: "DJI Matrice 4E — kompakt enterprise-drönare | EU Drone Company",
    seoDesc:
      "DJI Matrice 4E med inbyggd RTK, O4 Enterprise-länk och integrerad kamera. Efterträdare till Mavic 3 Enterprise. Begär offert.",
  },
  {
    slug: "matrice-4t",
    name: "DJI Matrice 4T",
    tag: "Kompakt termisk (RC Plus 2)",
    category: "compact",
    heroTitle: "DJI Matrice 4T — kompakt termisk inspektion med inbyggd RTK",
    heroDesc:
      "Samma kompakta plattform som Matrice 4E men med termisk sensor integrerad — för inspektion, sök och räddning där temperaturdata behövs direkt.",
    longDesc:
      "Matrice 4T byter vidvinkelsensorn i Matrice 4E mot en radiometrisk termisk kamera, kompletterad med telekamera för visuell detaljgranskning. Med inbyggd dubbel RTK och samma robusta väderskydd passar den insatser där temperaturdata behöver kombineras med precisionspositionering, till exempel elnätsinspektion och sök- och räddningsuppdrag.",
    features: [
      "Radiometrisk termisk kamera integrerad",
      "Telekamera för visuell detaljgranskning",
      "Inbyggd dubbel RTK-positionering",
      "IP55 väderskydd",
      "Uppdaterad O4 Enterprise-länk",
      "Flygklar på under en minut",
    ],
    specs: [
      { label: "Typ", value: "Integrerad termisk- och telekamera (ej utbytbar payload)" },
      { label: "Segment", value: "Termisk variant i Matrice 4-serien" },
      { label: "Väderskydd", value: "IP55" },
      { label: "Positionering", value: "Inbyggd dubbel RTK" },
      { label: "Länk", value: "DJI O4 Enterprise-transmission" },
      { label: "Styrenhet", value: "DJI RC Plus 2" },
    ],
    applications: [
      "Elnäts- och transformatorinspektion",
      "Sök och räddning med termisk detektion",
      "Solpanels- och byggnadsinspektion",
      "Nattinsatser för säkerhet och bevakning",
    ],
    compatiblePayloads: [],
    industries: ["inspektion", "energi", "sakerhet"],
    shopUrl: "https://actionking.se/search?q=dji+matrice+4t",
    badge: "Ny",
    faq: [
      {
        question: "Vad skiljer Matrice 4T från Matrice 4E?",
        answer:
          "4T byter vidvinkelkameran mot en radiometrisk termisk sensor och behåller telekameran — valet när uppdraget kräver temperaturdata, till exempel elnätsinspektion eller sök och räddning.",
      },
      {
        question: "Kan Matrice 4T mäta temperatur, inte bara visa värmebild?",
        answer:
          "Ja, den termiska kameran är radiometrisk, vilket innebär att varje bildpunkt bär temperaturdata — inte bara en färgkodad bild.",
      },
    ],
    seoTitle: "DJI Matrice 4T — kompakt termisk enterprise-drönare | EU Drone Company",
    seoDesc:
      "DJI Matrice 4T med radiometrisk termisk kamera, inbyggd RTK och O4 Enterprise-länk. Kompakt inspektion och sök & räddning. Begär offert.",
  },
  {
    slug: "matrice-4d",
    name: "DJI Matrice 4D",
    tag: "Dockningsbar (Dock 3)",
    category: "compact",
    heroTitle: "DJI Matrice 4D — för obemannad drift med DJI Dock 3",
    heroDesc:
      "Dockningskompatibel systervariant till Matrice 4E, byggd för automatiserade uppdrag från DJI Dock 3 utan pilot på plats.",
    longDesc:
      "Matrice 4D delar sensoruppsättning med Matrice 4E men är anpassad för att docka, laddas och starta automatiskt från DJI Dock 3. Tillsammans bildar de ett system för schemalagda eller händelsestyrda flygningar — perimeterbevakning, återkommande inspektion och kartläggning — utan att en pilot behöver vara på plats för varje flygning.",
    features: [
      "Dockningskompatibel med DJI Dock 3",
      "Integrerad vidvinkel- och telekamera",
      "Inbyggd dubbel RTK-positionering",
      "IP55 väderskydd",
      "Automatisk laddning och start via dock",
      "Uppdaterad O4 Enterprise-länk",
    ],
    specs: [
      { label: "Typ", value: "Dockningskompatibel enterprise-kamera" },
      { label: "Kompatibel dock", value: "DJI Dock 3" },
      { label: "Väderskydd", value: "IP55" },
      { label: "Positionering", value: "Inbyggd dubbel RTK" },
      { label: "Driftläge", value: "Autonom drift via dock eller manuell flygning" },
      { label: "Länk", value: "DJI O4 Enterprise-transmission" },
    ],
    applications: [
      "Automatiserad perimeterbevakning",
      "Återkommande anläggningsinspektion utan pilot på plats",
      "Schemalagd kartläggning av samma objekt över tid",
      "Snabb första-insats vid larm",
    ],
    compatiblePayloads: [],
    industries: ["sakerhet", "energi", "inspektion"],
    shopUrl: "https://actionking.se/search?q=dji+matrice+4d",
    badge: "Ny",
    faq: [
      {
        question: "Kan Matrice 4D flygas manuellt också?",
        answer:
          "Ja. Den fungerar både för manuell flygning med DJI RC Plus 2 och för autonom drift via DJI Dock 3 — samma drönare täcker båda driftlägena.",
      },
      {
        question: "Måste jag ha DJI Dock 3 för att köpa Matrice 4D?",
        answer:
          "Nej, men dockningsfunktionen kräver DJI Dock 3 för att användas. Utan dock fungerar den som en vanlig manuellt styrd Matrice 4E-motsvarighet.",
      },
    ],
    seoTitle: "DJI Matrice 4D — dockningskompatibel drönare | EU Drone Company",
    seoDesc:
      "DJI Matrice 4D för autonom drift med DJI Dock 3. Inbyggd RTK, IP55 och integrerad kamera. Obemannad bevakning och inspektion. Begär offert.",
  },
  {
    slug: "matrice-4td",
    name: "DJI Matrice 4TD",
    tag: "Dockningsbar termisk (Dock 3)",
    category: "compact",
    heroTitle: "DJI Matrice 4TD — termisk dockningsdrönare för DJI Dock 3",
    heroDesc:
      "Termisk systervariant till Matrice 4D — kombinerar radiometrisk termisk avbildning med autonom drift från DJI Dock 3.",
    longDesc:
      "Matrice 4TD för samman termisk avbildning med dockningskompatibilitet: samma radiometriska sensor som Matrice 4T, men byggd för att starta, flyga och laddas automatiskt från DJI Dock 3. Passar verksamheter som vill ha kontinuerlig termisk övervakning — till exempel brandvakt, nattlig perimeterbevakning och återkommande energiinspektion — utan att skicka ut en pilot för varje flygning.",
    features: [
      "Radiometrisk termisk kamera integrerad",
      "Dockningskompatibel med DJI Dock 3",
      "Inbyggd dubbel RTK-positionering",
      "IP55 väderskydd",
      "Automatisk laddning och start via dock",
      "Telekamera för visuell detaljgranskning",
    ],
    specs: [
      { label: "Typ", value: "Dockningskompatibel termisk- och telekamera" },
      { label: "Kompatibel dock", value: "DJI Dock 3" },
      { label: "Väderskydd", value: "IP55" },
      { label: "Positionering", value: "Inbyggd dubbel RTK" },
      { label: "Driftläge", value: "Autonom drift via dock eller manuell flygning" },
      { label: "Primärt användningsområde", value: "Kontinuerlig termisk bevakning" },
    ],
    applications: [
      "Automatiserad brandvakt och tidig branddetektion",
      "Nattlig perimeterbevakning",
      "Återkommande termisk energiinspektion",
      "Sök och räddning utan pilot på plats vid larm",
    ],
    compatiblePayloads: [],
    industries: ["sakerhet", "energi", "inspektion"],
    shopUrl: "https://actionking.se/search?q=dji+matrice+4td",
    badge: "Ny",
    faq: [
      {
        question: "Vad skiljer Matrice 4TD från Matrice 4D?",
        answer:
          "4TD byter vidvinkelkameran mot en radiometrisk termisk sensor, precis som skillnaden mellan 4E och 4T. Båda är dockningskompatibla med DJI Dock 3.",
      },
      {
        question: "Kan Matrice 4TD larma automatiskt vid avvikande temperatur?",
        answer:
          "Larmlogik och tröskelvärden konfigureras i DJI FlightHub 2, som stationen kopplas mot. Vi hjälper till att sätta upp bevakningsregler för din anläggning.",
      },
    ],
    seoTitle: "DJI Matrice 4TD — termisk dockningsdrönare | EU Drone Company",
    seoDesc:
      "DJI Matrice 4TD med radiometrisk termisk kamera för autonom drift med DJI Dock 3. Kontinuerlig bevakning utan pilot på plats. Begär offert.",
  },
  {
    slug: "agras-t25",
    name: "DJI Agras T25",
    tag: "Kompakt sprutning & spridning",
    category: "agriculture",
    heroTitle: "DJI Agras T25 — kompakt sprutdrönare för mindre och medelstora fält",
    heroDesc:
      "Den mindre modellen i Agras-serien — samma terrängföljning och RTK-precision som T50, i ett lättare format för gårdar som inte behöver full T50-kapacitet.",
    longDesc:
      "Agras T25 riktar sig till gårdar och entreprenörer med mindre eller mer svårtillgängliga fält än vad T50 är dimensionerad för. Den delar grundteknik med resten av Agras-serien — terrängföljning, RTK-precision och samma typ av spridarsystem — men i ett lättare och mer kompakt format som är enklare att transportera och hantera för en ensam operatör.",
    features: [
      "Kompakt format för en operatörs hantering",
      "Terrängföljning i kuperad terräng",
      "RTK-precision på centimeternivå",
      "Sprutning och granulatspridning i samma plattform",
      "Snabbare uppsättning och transport än T50",
    ],
    specs: [
      { label: "Typ", value: "Spridnings- och sprutdrönare" },
      { label: "Segment", value: "Kompakt modell i Agras-serien, under T50" },
      { label: "Positionering", value: "RTK, centimeternivå" },
      { label: "Terrängföljning", value: "Ja, för kuperade fält" },
      { label: "Primärt användningsområde", value: "Sprutning och spridning på mindre fältstorlekar" },
      { label: "Regelverk", value: "Kräver kemikaliehantering och särskild utbildning" },
    ],
    applications: [
      "Växtskyddssprutning på mindre och medelstora gårdar",
      "Fält med begränsad åtkomst för större maskiner",
      "Kompletterande spridarkapacitet vid sidan av T50",
      "Entreprenörer som servar flera mindre kunder",
    ],
    compatiblePayloads: [],
    industries: ["lantbruk"],
    shopUrl: "https://actionking.se/search?q=dji+agras+t25",
    faq: [
      {
        question: "Vad skiljer Agras T25 från Agras T50?",
        answer:
          "T25 är den lättare och mer kompakta modellen i samma serie, riktad mot mindre eller mer svårtillgängliga fält. T50 har högre kapacitet och passar bättre för storskalig drift. Kontakta oss för att jämföra kapacitet mot din fältstorlek.",
      },
      {
        question: "Kan Agras T25 spruta och sprida granulat?",
        answer:
          "Ja, precis som övriga Agras-modeller hanterar den både vätske- och granulatspridning med rätt tillbehör.",
      },
    ],
    seoTitle: "DJI Agras T25 — kompakt sprutdrönare | EU Drone Company",
    seoDesc:
      "DJI Agras T25 för mindre och medelstora fält. RTK-precision och terrängföljning i ett lättare format än T50. Begär offert.",
  },
  {
    slug: "agras-t100",
    name: "DJI Agras T100",
    tag: "Storskalig sprutning & spridning",
    category: "agriculture",
    heroTitle: "DJI Agras T100 — DJI:s mest kapacitetsstarka sprutdrönare",
    heroDesc:
      "Den största modellen i Agras-serien — högre tank- och spridarvolym än T50 för gårdar och entreprenörer med stora sammanhängande arealer.",
    longDesc:
      "Agras T100 är byggd för verksamheter som redan har vuxit ur T50:s kapacitet. Med större tank- och spridarvolym täcker den fler hektar per flygning, vilket minskar antalet återfyllnadsstopp på stora sammanhängande arealer. Den delar RTK-precision och terrängföljning med resten av Agras-serien, men är dimensionerad för hög beläggning snarare än kompakthet.",
    features: [
      "Högre tank- och spridarvolym än Agras T50",
      "Terrängföljning i kuperad terräng",
      "RTK-precision på centimeternivå",
      "Färre återfyllnadsstopp på stora arealer",
      "Sprutning och granulatspridning i samma plattform",
    ],
    specs: [
      { label: "Typ", value: "Spridnings- och sprutdrönare" },
      { label: "Segment", value: "Största modellen i Agras-serien, över T50" },
      { label: "Positionering", value: "RTK, centimeternivå" },
      { label: "Terrängföljning", value: "Ja, för kuperad terräng" },
      { label: "Primärt användningsområde", value: "Storskalig sprutning och spridning" },
      { label: "Regelverk", value: "Kräver kemikaliehantering och särskild utbildning" },
    ],
    applications: [
      "Storskalig växtskyddssprutning på sammanhängande arealer",
      "Entreprenörsdrift med hög årlig beläggning",
      "Gödsel- och utsädesspridning över stora ytor",
      "Verksamheter som vuxit ur Agras T50:s kapacitet",
    ],
    compatiblePayloads: [],
    industries: ["lantbruk"],
    shopUrl: "https://actionking.se/search?q=dji+agras+t100",
    faq: [
      {
        question: "När passar Agras T100 bättre än T50?",
        answer:
          "När fältstorleken och den årliga beläggningen gör att antalet återfyllnadsstopp med T50 börjar kosta mer tid än den högre tank- och spridarvolymen på T100 sparar. Vi hjälper dig räkna på var brytpunkten ligger för din verksamhet.",
      },
      {
        question: "Kräver Agras T100 samma utbildning som T50?",
        answer:
          "Ja, samma krav på operatörsbehörighet och kemikaliehantering gäller. Storleken påverkar hanteringsvana snarare än vilken utbildning som krävs.",
      },
    ],
    seoTitle: "DJI Agras T100 — storskalig sprutdrönare | EU Drone Company",
    seoDesc:
      "DJI Agras T100, den mest kapacitetsstarka modellen i Agras-serien. Högre tankvolym än T50 för stora arealer. Begär offert.",
  },
  {
    slug: "dji-dock-2",
    name: "DJI Dock 2",
    tag: "Autonom dockningsstation",
    category: "infrastructure",
    heroTitle: "DJI Dock 2 — dockningsstation för obemannad drönardrift",
    heroDesc:
      "Väderskyddad dockningsstation som laddar, skyddar och skickar upp din drönare automatiskt — för schemalagda eller händelsestyrda uppdrag utan pilot på plats.",
    longDesc:
      "DJI Dock 2 gör det möjligt att driva en drönare helt obemannat: stationen laddar drönaren mellan flygningar, skyddar den från väder och startar automatiskt enligt schema eller vid larm. Tillsammans med en dockningskompatibel drönare och DJI FlightHub 2 för flottstyrning bygger den ett system för återkommande inspektion, bevakning och kartläggning där en fjärroperatör kan hantera flera platser samtidigt.",
    features: [
      "Automatisk laddning och start av drönaren",
      "Väderskyddad — tål utomhusdrift året runt",
      "Schemalagda eller händelsestyrda flygningar",
      "Integrerad med DJI FlightHub 2 för flottstyrning",
      "Fjärrstyrning från valfri plats via mobilnät",
    ],
    specs: [
      { label: "Typ", value: "Autonom dockningsstation, ej flygande enhet" },
      { label: "Väderskydd", value: "Utomhusklassad, väderskyddad" },
      { label: "Kompatibla drönare", value: "Dockningskompatibla Matrice-modeller" },
      { label: "Styrning", value: "DJI FlightHub 2, fjärranslutet" },
      { label: "Driftläge", value: "Schemalagd eller händelsestyrd autonom flygning" },
    ],
    applications: [
      "Automatiserad perimeterbevakning av industriområden",
      "Återkommande anläggnings- och energiinspektion",
      "Snabb första-insats vid larm utan pilot på plats",
      "Flottstyrning av flera platser från ett kontrollrum",
    ],
    compatiblePayloads: [],
    industries: ["sakerhet", "energi", "inspektion"],
    shopUrl: "https://actionking.se/search?q=dji+dock+2",
    faq: [
      {
        question: "Vilken drönare används tillsammans med DJI Dock 2?",
        answer:
          "Dock 2 kräver en dockningskompatibel drönarmodell. Vi går igenom vilken kombination som passar din anläggning och ditt uppdrag innan beställning.",
      },
      {
        question: "Behöver vi en pilot på plats när Dock 2 är installerad?",
        answer:
          "Nej, det är hela poängen med systemet — drönaren startar, flyger och landar automatiskt enligt schema eller larm, och en fjärroperatör kan ingripa manuellt vid behov.",
      },
    ],
    seoTitle: "DJI Dock 2 — dockningsstation för obemannad drift | EU Drone Company",
    seoDesc:
      "DJI Dock 2 laddar, skyddar och startar din drönare automatiskt. Obemannad bevakning och inspektion via DJI FlightHub 2. Begär offert.",
  },
  {
    slug: "dji-dock-3",
    name: "DJI Dock 3",
    tag: "Kompakt autonom dockningsstation",
    category: "infrastructure",
    heroTitle: "DJI Dock 3 — nästa generations dockningsstation, mer kompakt",
    heroDesc:
      "Uppdaterad, mer kompakt dockningsstation byggd för Matrice 4D/4TD — enklare installation och snabbare driftsättning än DJI Dock 2.",
    longDesc:
      "DJI Dock 3 är efterträdaren till Dock 2 — mindre och lättare att installera, med samma grundfunktion: automatisk laddning, väderskydd och start av en dockningskompatibel drönare enligt schema eller vid larm. Den är byggd tillsammans med Matrice 4D och Matrice 4TD och passar verksamheter som vill sätta upp obemannad drift på fler platser utan lika mycket installationsarbete som Dock 2 krävde.",
    features: [
      "Mer kompakt och lättare än DJI Dock 2",
      "Automatisk laddning och start av drönaren",
      "Väderskyddad — tål utomhusdrift året runt",
      "Snabbare installation och driftsättning",
      "Integrerad med DJI FlightHub 2 för flottstyrning",
    ],
    specs: [
      { label: "Typ", value: "Autonom dockningsstation, ej flygande enhet" },
      { label: "Segment", value: "Efterträdare till DJI Dock 2, mer kompakt" },
      { label: "Väderskydd", value: "Utomhusklassad, väderskyddad" },
      { label: "Kompatibla drönare", value: "Matrice 4D, Matrice 4TD" },
      { label: "Styrning", value: "DJI FlightHub 2, fjärranslutet" },
    ],
    applications: [
      "Snabb utrullning av obemannad drift på flera platser",
      "Perimeterbevakning där installationsutrymme är begränsat",
      "Återkommande inspektion utan pilot på plats",
      "Komplement till befintliga Dock 2-installationer",
    ],
    compatiblePayloads: [],
    industries: ["sakerhet", "energi", "inspektion"],
    shopUrl: "https://actionking.se/search?q=dji+dock+3",
    badge: "Ny",
    faq: [
      {
        question: "Kan DJI Dock 3 användas tillsammans med Dock 2 i samma flotta?",
        answer:
          "Ja, båda hanteras via DJI FlightHub 2, så en flotta kan blanda Dock 2- och Dock 3-installationer beroende på vad respektive plats kräver.",
      },
      {
        question: "Vilka drönare fungerar med DJI Dock 3?",
        answer:
          "Matrice 4D och Matrice 4TD, som är byggda för att docka, laddas och starta automatiskt från Dock 3.",
      },
    ],
    seoTitle: "DJI Dock 3 — kompakt dockningsstation | EU Drone Company",
    seoDesc:
      "DJI Dock 3, efterträdaren till Dock 2. Mer kompakt station för Matrice 4D/4TD och obemannad drönardrift. Begär offert.",
  },
  {
    slug: "flycart-30",
    name: "DJI FlyCart 30",
    tag: "Transport & leverans",
    category: "infrastructure",
    heroTitle: "DJI FlyCart 30 — tung transportdrönare för last och leverans",
    heroDesc:
      "Industriell lastdrönare som bär upp till 40 kg i enkelbatteriläge eller 30 kg tur och retur i dubbelbatteriläge — för leverans till svårtillgängliga platser.",
    longDesc:
      "FlyCart 30 flyttar gods dit vägar och terräng gör markleverans långsam eller omöjlig — till otillgängliga byggarbetsplatser, mellan öar, upp till bergsstationer eller vid katastrofinsatser. I dubbelbatteriläge bär den upp till 30 kg tur och retur; i enkelbatteriläge, utan returflygning, ökar lastkapaciteten till 40 kg. En inbyggd vinsch kan sänka godset utan att drönaren behöver landa, vilket gör den användbar även där det inte finns en säker landningsyta.",
    features: [
      "Upp till 40 kg last i enkelbatteriläge",
      "Upp till 30 kg last tur och retur i dubbelbatteriläge",
      "Vinschsystem för leverans utan landning",
      "IP55 väderskydd",
      "Lång räckvidd för leverans till otillgängliga platser",
    ],
    specs: [
      { label: "Typ", value: "Industriell transport- och leveransdrönare" },
      { label: "Max last (enkelbatteri)", value: "40 kg" },
      { label: "Max last (dubbelbatteri, tur och retur)", value: "30 kg" },
      { label: "Väderskydd", value: "IP55" },
      { label: "Leveransmetod", value: "Landning eller vinschning utan landning" },
      { label: "Primärt användningsområde", value: "Godstransport till svårtillgängliga platser" },
    ],
    applications: [
      "Materialtransport till otillgängliga byggarbetsplatser",
      "Leverans mellan öar och till avlägsna anläggningar",
      "Katastrof- och nödhjälpsleverans",
      "Transport av tunga reservdelar till vindkraft- och energianläggningar",
    ],
    compatiblePayloads: [],
    industries: ["bygg-anlaggning", "sakerhet"],
    shopUrl: "https://actionking.se/search?q=dji+flycart+30",
    badge: "Ny",
    faq: [
      {
        question: "Hur mycket kan FlyCart 30 lyfta?",
        answer:
          "Upp till 40 kg i enkelbatteriläge (enkelriktad flygning) eller 30 kg tur och retur i dubbelbatteriläge, beroende på räckvidd och uppdrag.",
      },
      {
        question: "Måste FlyCart 30 landa för att leverera lasten?",
        answer:
          "Nej. Den inbyggda vinschen kan sänka lasten till marken utan att drönaren landar, vilket är användbart där det saknas en säker landningsyta.",
      },
    ],
    seoTitle: "DJI FlyCart 30 — transport- och leveransdrönare | EU Drone Company",
    seoDesc:
      "DJI FlyCart 30 bär upp till 40 kg last till svårtillgängliga platser, med vinsch för leverans utan landning. Begär offert.",
  },
];

export function getDroneProductBySlug(slug: string): EnterpriseDroneProduct | undefined {
  return ENTERPRISE_DRONE_PRODUCTS.find((p) => p.slug === slug);
}

export function getDroneProductsByCategory(category: DroneProductCategory): EnterpriseDroneProduct[] {
  return ENTERPRISE_DRONE_PRODUCTS.filter((p) => p.category === category);
}

/** Andra drönare i samma kategori — används i "Relaterade drönare" på detaljsidan. */
export function getRelatedDroneProducts(slug: string, limit = 3): EnterpriseDroneProduct[] {
  const product = getDroneProductBySlug(slug);
  if (!product) return [];
  const sameCategory = ENTERPRISE_DRONE_PRODUCTS.filter(
    (p) => p.slug !== slug && p.category === product.category,
  );
  const rest = ENTERPRISE_DRONE_PRODUCTS.filter(
    (p) => p.slug !== slug && p.category !== product.category,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

/** Sökväg till landningssidan för en drönare som anges med sitt fulla namn. */
export function getDroneProductPathByName(name: string): string | undefined {
  const product = ENTERPRISE_DRONE_PRODUCTS.find((p) => p.name === name);
  return product ? `/kommersiella-dronare/produkter/${product.slug}` : undefined;
}
