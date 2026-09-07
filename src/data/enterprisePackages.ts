import type { FaqItem } from "@/lib/faqJsonLd";

/**
 * Enterprise-paketen — färdiga kombinationer av drönare, payload, ström,
 * transport och mjukvara som säljs som en enhet.
 *
 * Paketen låg tidigare inline i `droneConfigurations.ts` och renderades bara
 * som kort på konfigurationssidan. De bor här nu eftersom varje paket har en
 * egen landningssida; konfigurationssidan läser samma lista via
 * `getPackagesForIndustry`. Lägg inte tillbaka paketdata i
 * `droneConfigurations.ts` — då får vi två sanningar igen.
 *
 * `droneSlugs` och `payloadSlugs` pekar på `enterpriseDroneProducts.ts`
 * respektive `enterpriseCameraProducts.ts`. Testerna i
 * `scripts/__tests__/enterprise-packages.test.ts` slår upp varje slug, så en
 * felstavad referens fastnar där.
 */

export type PackageLevel = "standard" | "pro" | "enterprise";

export const PACKAGE_LEVELS: Record<PackageLevel, { label: string; description: string }> = {
  standard: {
    label: "Bas",
    description: "Kom igång med en drönare, en sensor och det du behöver för att flyga skarpt",
  },
  pro: {
    label: "Pro",
    description: "Industriell plattform med rätt payload, RTK och mjukvara för återkommande uppdrag",
  },
  enterprise: {
    label: "Enterprise",
    description: "Flera drönare eller sensorer, redundans och drift i skala",
  },
};

/** Tjänster som ingår i alla paket på respektive nivå. */
export const PACKAGE_SERVICES: Record<PackageLevel, string[]> = {
  standard: [
    "Konfiguration och funktionstest före leverans",
    "Genomgång på plats eller digitalt vid uppstart",
    "Hjälp med registrering hos Transportstyrelsen",
    "Support på svenska under garantitiden",
  ],
  pro: [
    "Konfiguration, kalibrering och funktionstest före leverans",
    "Pilotutbildning anpassad efter uppdragstyp",
    "Hjälp med tillstånd och operativa rutiner",
    "Prioriterad support och serviceavtal på svenska",
  ],
  enterprise: [
    "Projektledd driftsättning av hela systemet",
    "Utbildning för flera piloter och dataansvariga",
    "Stöd för tillstånd, riskbedömning och driftsrutiner",
    "Serviceavtal med prioriterad support och lånemaskin",
  ],
};

export interface EnterprisePackage {
  slug: string;
  name: string;
  level: PackageLevel;
  /** Slug i `commercialDroneIndustries.ts` och `droneConfigurations.ts`. */
  industrySlug: string;
  /** Drönaren eller drönarna som paketet bygger på, i klartext. */
  drone: string;
  /** Slugs i `enterpriseDroneProducts.ts`. */
  droneSlugs: string[];
  /** Slugs i `enterpriseCameraProducts.ts`. Tomt när payloaden är integrerad. */
  payloadSlugs: string[];
  /** Kort beskrivning — används på kort och i listor. */
  description: string;
  heroDesc: string;
  longDesc: string;
  components: string[];
  idealFor: string;
  /** Vad kunden faktiskt får ut av paketet. */
  outcomes: string[];
  /** Tjänster utöver nivåns standardutbud. */
  extraServices?: string[];
  faq: FaqItem[];
  seoTitle: string;
  seoDesc: string;
}

export const ENTERPRISE_PACKAGES: EnterprisePackage[] = [
  // ---------------------------------------------------------------- Inspektion
  {
    slug: "inspektion-bas",
    name: "Inspektionspaket Bas",
    level: "standard",
    industrySlug: "inspektion",
    drone: "DJI Mavic 3 Enterprise",
    droneSlugs: ["mavic-3-enterprise"],
    payloadSlugs: [],
    description: "Kompakt och snabbt redo — perfekt för enklare inspektioner av tak och fasader.",
    heroDesc:
      "Allt du behöver för att börja inspektera tak och fasader professionellt: drönare med termisk och visuell kamera, batterier för en arbetsdag och transportväska.",
    longDesc:
      "Inspektionspaket Bas är till för dig som ska ersätta lift och byggnadsställning med drönare utan att bygga en hel drönaravdelning. Mavic 3T ger både visuell dokumentation och termisk avbildning, vilket räcker för de flesta tak-, fasad- och solpanelsuppdrag. Tre batterier och laddhubb täcker en normal arbetsdag, och hela paketet ryms i en väska du bär själv.",
    components: [
      "DJI Mavic 3T (termisk + visuell kamera)",
      "DJI RC Pro Enterprise-kontroll",
      "3 × Intelligent Flight Battery",
      "Laddhubb för 3 batterier",
      "DJI Fly More Kit",
      "Transportväska (hårdplast)",
    ],
    idealFor: "Fastighetsbolag, takläggare och konsulter som behöver snabba inspektioner.",
    outcomes: [
      "Takinspektion på 15–30 minuter i stället för en dag med ställning",
      "Termisk dokumentation som visar fuktinträngning och värmeläckage",
      "Bildunderlag som kan bifogas direkt i besiktnings- och försäkringsärenden",
      "En operatör klarar hela uppdraget utan extra utrustning på plats",
    ],
    faq: [
      {
        question: "Räcker Mavic 3T för försäkrings- och besiktningsärenden?",
        answer:
          "Ja. Den termiska sensorn är radiometrisk, vilket innebär att varje bildpunkt har en temperatur och att underlaget håller för dokumentation. Behöver du mäta på långt avstånd eller inspektera högspänning är Pro-paketet rätt nivå.",
      },
      {
        question: "Hur många inspektioner hinner jag på ett batteriset?",
        answer:
          "Tre batterier ger cirka två timmars flygtid totalt, vilket i praktiken räcker till fyra till sex takinspektioner per dag inklusive förflyttning mellan objekt.",
      },
    ],
    seoTitle: "Inspektionspaket Bas — drönarpaket för tak & fasad | EU Drone Company",
    seoDesc:
      "Komplett inspektionspaket med DJI Mavic 3T, batterier, laddhubb och väska. Klart för tak-, fasad- och solpanelsinspektion. Begär offert.",
  },
  {
    slug: "inspektion-pro",
    name: "Inspektionspaket Pro",
    level: "pro",
    industrySlug: "inspektion",
    drone: "DJI Matrice 350 RTK",
    droneSlugs: ["matrice-350-rtk"],
    payloadSlugs: ["zenmuse-h20t"],
    description: "Industriell plattform med termisk zoom och RTK-precision för krävande inspektionsuppdrag.",
    heroDesc:
      "Matrice 350 RTK med Zenmuse H20T, egen RTK-basstation och batteridrift för hela dagar i fält. Paketet för dig som inspekterar på uppdrag varje vecka.",
    longDesc:
      "Inspektionspaket Pro är byggt för verksamheter där inspektion är kärnaffären. Matrice 350 RTK tål väder, bär tunga sensorer och flyger upp till 55 minuter per batteripar. Zenmuse H20T kombinerar termisk kamera, zoom, vidvinkel och laser-avståndsmätare i ett gimbal-system, så att du kan dokumentera detaljer och värmeanomalier på avstånd. Med D-RTK 2 basstationen blir flygningarna repeterbara — du kan återvända till exakt samma positioner och jämföra samma objekt över tid.",
    components: [
      "DJI Matrice 350 RTK",
      "Zenmuse H20T (termisk + 20 MP zoom + 12 MP vidvinkel + LRF)",
      "DJI RC Plus-kontroll",
      "4 × TB65 Intelligent Battery",
      "BS65 laddstation",
      "DJI D-RTK 2 basstation",
      "Transportlåda (IP67)",
    ],
    idealFor: "Inspektionsföretag, energibolag och myndigheter med krävande inspektionsuppdrag.",
    outcomes: [
      "Inspektion på avstånd utan att komma nära anläggningen",
      "Repeterbara flygningar som går att jämföra mellan år",
      "Termiska anomalier upptäcks innan de blir haverier",
      "Flygning i lätt regn och blåst tack vare IP55-skyddet",
    ],
    faq: [
      {
        question: "Varför behövs en egen RTK-basstation?",
        answer:
          "Basstationen ger centimeterprecision oberoende av mobiltäckning, vilket krävs för att kunna återbesöka exakt samma positioner. Det är förutsättningen för att jämföra inspektioner över tid i stället för att börja om varje gång.",
      },
      {
        question: "Kan jag byta H20T mot en annan payload senare?",
        answer:
          "Ja. Matrice 350 RTK är en bärande plattform — samma drönare tar H30T, L2 och P1. Många kunder börjar med H20T och kompletterar med en LiDAR- eller fotogrammetripayload när uppdragen breddas.",
      },
      {
        question: "Hur lång är leveranstiden?",
        answer:
          "Paketet konfigureras och funktionstestas innan leverans. Aktuell leveranstid beror på lagerläge för plattform och payload — vi lämnar besked i offerten.",
      },
    ],
    seoTitle: "Inspektionspaket Pro — Matrice 350 RTK & H20T | EU Drone Company",
    seoDesc:
      "Inspektionspaket med DJI Matrice 350 RTK, Zenmuse H20T, D-RTK 2 och TB65-batterier. För professionella inspektionsuppdrag. Begär offert.",
  },
  {
    slug: "inspektion-enterprise",
    name: "Inspektionspaket Enterprise",
    level: "enterprise",
    industrySlug: "inspektion",
    drone: "DJI Matrice 350 RTK + Mavic 3 Enterprise",
    droneSlugs: ["matrice-350-rtk", "mavic-3-enterprise"],
    payloadSlugs: ["zenmuse-h20t"],
    description: "Komplett flotta med två drönare — snabb screening med Mavic 3E och detaljerad inspektion med M350.",
    heroDesc:
      "Två drönare, två arbetssätt: Mavic 3 Enterprise screenar av beståndet snabbt, Matrice 350 RTK går in på djupet där något hittats. Med FlightHub 2 för central drift.",
    longDesc:
      "Inspektionspaket Enterprise är för organisationer som inspekterar dagligen och behöver skala arbetet över flera team. Mavic 3 Enterprise används för snabb screening — flygklar på under en minut, enkel att skicka med en tekniker. Matrice 350 RTK med Zenmuse H20T tar de uppdrag som kräver zoom, termisk analys och precision. FlightHub 2 håller ihop flygningar, loggar och material från båda drönarna i en plattform, så att rapportering och uppföljning inte hänger på enskilda piloter.",
    components: [
      "DJI Matrice 350 RTK med Zenmuse H20T",
      "DJI Mavic 3 Enterprise (snabbinspektion)",
      "DJI D-RTK 2 basstation",
      "8 × batterier (blandade)",
      "Dubbla laddstationer",
      "DJI FlightHub 2-licens (1 år)",
      "2 × transportlådor",
      "Inspektionsmjukvara (DJI Terra eller Pix4D)",
    ],
    idealFor: "Stora inspektionsföretag och energibolag med dagliga inspektionsuppdrag.",
    outcomes: [
      "Två team kan arbeta parallellt på olika objekt",
      "Screening och djupinspektion i samma arbetsflöde",
      "All flygdata och alla loggar samlade i FlightHub 2",
      "Redundans — verksamheten står inte still om en drönare är på service",
    ],
    extraServices: [
      "Uppsättning av FlightHub 2 med användare, roller och projektstruktur",
      "Framtagning av rapportmall för era inspektionsleveranser",
    ],
    faq: [
      {
        question: "Behöver vi verkligen två drönare?",
        answer:
          "Om ni inspekterar dagligen, ja. Den stora vinsten är att en enkel screening inte binder upp den dyra plattformen, och att verksamheten inte stannar när en drönare är på service eller på ett annat uppdrag.",
      },
      {
        question: "Vad gör FlightHub 2 för oss?",
        answer:
          "Den samlar flygningar, livestream, loggar och material från alla piloter på ett ställe. Det gör uppföljning och rapportering till en rutin i stället för något som varje pilot löser på sitt sätt.",
      },
      {
        question: "Kan paketet anpassas efter vår befintliga utrustning?",
        answer:
          "Ja. Har ni redan en Matrice-plattform eller payloads justerar vi innehållet så att ni bara betalar för det som saknas. Hör av er med er nuvarande uppsättning så räknar vi på det.",
      },
    ],
    seoTitle: "Inspektionspaket Enterprise — två drönare | EU Drone Company",
    seoDesc:
      "Enterprise-paket med DJI Matrice 350 RTK, Mavic 3 Enterprise, H20T och FlightHub 2. För dagliga inspektionsuppdrag i skala. Begär offert.",
  },

  // ------------------------------------------------------------------ Lantbruk
  {
    slug: "lantbruk-bas",
    name: "Kartläggningspaket Fält",
    level: "standard",
    industrySlug: "lantbruk",
    drone: "DJI Mavic 3 Multispectral",
    droneSlugs: ["mavic-3-multispectral"],
    payloadSlugs: [],
    description: "Kompakt multispektral drönare för fältkartläggning och växtanalys.",
    heroDesc:
      "Multispektral kartläggning med RTK och DJI Terra-licens. Paketet som ger dig kartunderlaget innan du investerar i sprutdrönare.",
    longDesc:
      "Kartläggningspaket Fält är ingången till precisionsodling. Mavic 3 Multispectral mäter grödornas hälsa med fyra multispektrala sensorer och en RGB-kamera, och RTK-modulen ger kartor du kan lita på år efter år. DJI Terra-licensen ingår så att du kan bearbeta flygningarna till ortomosaiker och indexkartor själv, utan att köpa in bearbetningen.",
    components: [
      "DJI Mavic 3 Multispectral",
      "DJI RC Pro Enterprise-kontroll",
      "3 × Intelligent Flight Battery",
      "Laddhubb",
      "RTK-modul",
      "DJI Terra-licens (1 år)",
    ],
    idealFor: "Mindre och medelstora gårdar som vill komma igång med precisionsodling.",
    outcomes: [
      "NDVI-kartor över hela gården inom en arbetsdag",
      "Stresszoner syns 2–3 veckor innan de går att se på plats",
      "Underlag för variabel giva och riktad behandling",
      "Dokumentation som kan användas i stöd- och certifieringsärenden",
    ],
    faq: [
      {
        question: "Behöver jag kunna bildbehandling för att använda paketet?",
        answer:
          "Nej. DJI Terra bygger ortomosaiker och indexkartor automatiskt från flygningen. Vi går igenom arbetsflödet vid uppstart så att du kommer igång med din egen data.",
      },
      {
        question: "Hur stor areal hinner jag kartlägga?",
        answer:
          "Vid kartläggningsflygning räcker paketet till uppemot 200 hektar per dag beroende på flyghöjd och överlappning.",
      },
    ],
    seoTitle: "Kartläggningspaket Fält — NDVI-paket för lantbruk | EU Drone Company",
    seoDesc:
      "Paket med DJI Mavic 3 Multispectral, RTK-modul och DJI Terra-licens för NDVI-kartor och växtanalys. Kom igång med precisionsodling.",
  },
  {
    slug: "lantbruk-pro",
    name: "Sprutningspaket Pro",
    level: "pro",
    industrySlug: "lantbruk",
    drone: "DJI Agras T50",
    droneSlugs: ["agras-t50"],
    payloadSlugs: [],
    description: "Komplett sprutningspaket för precisionsbesprutning med terrängföljning och AI-styrning.",
    heroDesc:
      "Agras T50 med fyra batterier, fyrkanalig laddstation, spridningspaket och SmartFarm-licens. Redo att spruta och sprida från första dagen.",
    longDesc:
      "Sprutningspaket Pro innehåller det som faktiskt krävs för att köra sprutdrönare i produktion, inte bara drönaren. Fyra batterier och en fyrkanalig laddstation är det som avgör hur många hektar du hinner per dag — sprutflygningarna är korta och laddningen blir flaskhalsen om den underdimensioneras. Spridningspaketet gör att samma drönare kan sprida granulat och utsäde, och SmartFarm-licensen håller ordning på fält, behandlingar och loggar.",
    components: [
      "DJI Agras T50",
      "DJI RC Plus-kontroll",
      "4 × Intelligent Battery",
      "Laddstation (4-kanal)",
      "Spruttank 40L med filter",
      "Spridningspaket (granulat)",
      "DJI SmartFarm Platform-licens",
    ],
    idealFor: "Professionella lantbrukare och maskinringar som vill automatisera besprutning.",
    outcomes: [
      "Täckning upp till 20 hektar per timme i sprutläge",
      "Behandling av blöta och lutande fält utan markpackning",
      "Sprutning och granulatspridning i samma plattform",
      "Loggade behandlingar som håller för dokumentationskrav",
    ],
    extraServices: [
      "Genomgång av kraven för hantering av växtskyddsmedel",
      "Uppsättning av fält och behandlingsloggar i SmartFarm",
    ],
    faq: [
      {
        question: "Vilka behörigheter krävs för att spruta med drönare?",
        answer:
          "Utöver operatörsbehörighet för drönare krävs behörighet för hantering av växtskyddsmedel enligt gällande kemikalielagstiftning. Vi går igenom vad som gäller för din verksamhet innan leverans.",
      },
      {
        question: "Räcker fyra batterier?",
        answer:
          "För en halvdag i fält, ja. Kör du hela dagar i högsäsong bör du räkna med sex till åtta batterier — vi justerar antalet i offerten efter din areal.",
      },
      {
        question: "Kan drönaren spruta utan kartunderlag?",
        answer:
          "Den kan spruta heltäckande, men den stora besparingen kommer först med behandlingskartor. Många kombinerar därför paketet med Mavic 3 Multispectral, vilket är precis vad Lantbrukspaket Enterprise innehåller.",
      },
    ],
    seoTitle: "Sprutningspaket Pro — DJI Agras T50-paket | EU Drone Company",
    seoDesc:
      "Sprutningspaket med DJI Agras T50, fyra batterier, laddstation, spridningspaket och SmartFarm-licens. Precisionssprutning i produktion.",
  },
  {
    slug: "lantbruk-enterprise",
    name: "Lantbrukspaket Enterprise",
    level: "enterprise",
    industrySlug: "lantbruk",
    drone: "DJI Agras T50 + Mavic 3 Multispectral",
    droneSlugs: ["agras-t50", "mavic-3-multispectral"],
    payloadSlugs: [],
    description: "Komplett system med sprutdrönare och kartläggningsdrönare — skanna, analysera och behandla.",
    heroDesc:
      "Hela kedjan i ett system: kartlägg med Mavic 3 Multispectral, analysera i SmartFarm och Terra, behandla riktat med Agras T50.",
    longDesc:
      "Lantbrukspaket Enterprise stänger cirkeln i precisionsodling. Mavic 3 Multispectral kartlägger fälten och visar var beståndet är stressat, DJI Terra och SmartFarm gör om mätningarna till behandlingskartor, och Agras T50 kör behandlingen bara där den behövs. Det är i den kombinationen besparingen på växtskyddsmedel uppstår — en sprutdrönare utan kartunderlag sprutar fortfarande heltäckande. Utbildningspaketet på två dagar täcker båda plattformarna och arbetsflödet mellan dem.",
    components: [
      "DJI Agras T50 (sprutning & spridning)",
      "DJI Mavic 3 Multispectral (kartläggning)",
      "8 × batterier (blandade)",
      "Dubbla laddstationer",
      "RTK-basstation",
      "DJI SmartFarm Platform + DJI Terra",
      "Utbildningspaket (2 dagar)",
    ],
    idealFor: "Stora lantbruk och jordbruksentreprenörer med fullskalig precisionsodling.",
    outcomes: [
      "Riktad behandling som kan sänka kemikalieförbrukningen med upp till 30 procent",
      "Kartläggning och behandling i samma arbetsvecka",
      "Egen kapacitet för både analys och utförande",
      "Behandlingshistorik per fält och säsong",
    ],
    extraServices: [
      "Två dagars utbildning på plats för kartläggning och sprutning",
      "Uppsättning av fältstruktur och arbetsflöde mellan Terra och SmartFarm",
    ],
    faq: [
      {
        question: "Kan vi börja med sprutdrönaren och komplettera senare?",
        answer:
          "Det går, men de flesta får bättre avkastning av att börja med kartläggningen. Utan kartunderlag styr du inte behandlingen, och då uteblir den besparing som motiverar sprutdrönaren.",
      },
      {
        question: "Vem bör gå utbildningen?",
        answer:
          "Minst två personer — en som flyger och en som hanterar data och behandlingsplaner. Det gör verksamheten oberoende av att en enskild person är på plats.",
      },
    ],
    seoTitle: "Lantbrukspaket Enterprise — Agras T50 & NDVI | EU Drone Company",
    seoDesc:
      "Komplett lantbrukssystem med DJI Agras T50, Mavic 3 Multispectral, SmartFarm, Terra och utbildning. Kartlägg, analysera och behandla riktat.",
  },

  // -------------------------------------------------------------- Kartläggning
  {
    slug: "kartlaggning-bas",
    name: "Kartläggningspaket Bas",
    level: "standard",
    industrySlug: "kartlaggning",
    drone: "DJI Mavic 3 Enterprise",
    droneSlugs: ["mavic-3-enterprise"],
    payloadSlugs: [],
    description: "Kompakt och effektiv kartläggning med mekanisk slutare och RTK.",
    heroDesc:
      "Portabel fotogrammetri med 4/3-sensor, mekanisk slutare och RTK-modul. Med DJI Terra-licens för bearbetning i egen regi.",
    longDesc:
      "Kartläggningspaket Bas ger dig fotogrammetrisk kapacitet i ett format du bär med dig. Den mekaniska slutaren är avgörande vid kartläggning — den eliminerar den skevhet som rullande slutare ger i rörelse, vilket annars sätter taket för hur exakt modellen kan bli. RTK-modulen ger centimeterprecision utan markstöd, och DJI Terra-licensen gör att du levererar ortomosaiker och 3D-modeller själv.",
    components: [
      "DJI Mavic 3 Enterprise",
      "RTK-modul",
      "DJI RC Pro Enterprise",
      "3 × Intelligent Flight Battery",
      "Laddhubb",
      "DJI Terra-licens (1 år)",
    ],
    idealFor: "Konsulter och mätningsfirmor som behöver portabel kartläggning.",
    outcomes: [
      "Ortomosaiker och 3D-modeller från egna flygningar",
      "Centimeterprecision utan att sätta ut markstöd",
      "Utrustning som ryms i en ryggsäck mellan uppdrag",
      "Leverans till kund samma dag som flygningen",
    ],
    faq: [
      {
        question: "Vad är skillnaden mot Kartläggningspaket Pro?",
        answer:
          "Bas-paketet är portabelt och räcker för mindre och medelstora ytor. Pro bygger på Matrice 350 RTK med Zenmuse P1, vilket ger högre noggrannhet, längre flygtid och möjlighet att byta till LiDAR när uppdragen kräver det.",
      },
      {
        question: "Behöver jag GCP-markörer?",
        answer:
          "Med RTK klarar du dig utan i många uppdrag. Ska modellen användas som juridiskt mätunderlag rekommenderar vi ändå markstöd för kontrollpunkter.",
      },
    ],
    seoTitle: "Kartläggningspaket Bas — portabel fotogrammetri | EU Drone Company",
    seoDesc:
      "Kartläggningspaket med DJI Mavic 3 Enterprise, RTK-modul och DJI Terra-licens. Portabel fotogrammetri för konsulter och mätningsfirmor.",
  },
  {
    slug: "kartlaggning-pro",
    name: "Kartläggningspaket Pro",
    level: "pro",
    industrySlug: "kartlaggning",
    drone: "DJI Matrice 350 RTK",
    droneSlugs: ["matrice-350-rtk"],
    payloadSlugs: ["zenmuse-p1"],
    description: "Professionell fotogrammetri och LiDAR-kartläggning med centimeterprecision.",
    heroDesc:
      "Matrice 350 RTK med Zenmuse P1, egen basstation och Terra Pro-licens. Fotogrammetri för uppdrag där noggrannheten ska kunna försvaras.",
    longDesc:
      "Kartläggningspaket Pro är byggt för mätuppdrag som levereras till beställare med krav. Zenmuse P1 är en fullformatskamera med mekanisk slutare framtagen för fotogrammetri, och tillsammans med Matrice 350 RTK och D-RTK 2 basstationen får du repeterbara flygningar med känd absolut noggrannhet. Terra Pro-licensen täcker bearbetning av större projekt, och transportlådan gör att utrustningen tål att åka med i fält varje dag.",
    components: [
      "DJI Matrice 350 RTK",
      "Zenmuse P1 (45MP full-frame fotogrammetri)",
      "DJI D-RTK 2 basstation",
      "4 × TB65 batterier",
      "BS65 laddstation",
      "DJI Terra Pro-licens (1 år)",
      "Transportlåda",
    ],
    idealFor: "Lantmäterifirmor, bygg- och gruvföretag med höga precisionskrav.",
    outcomes: [
      "Fotogrammetri med känd och dokumenterbar noggrannhet",
      "Volymberäkningar för massbalans och lagerhållning",
      "Samma plattform kan bära LiDAR när uppdraget kräver det",
      "Flygtid som räcker för stora ytor per fältdag",
    ],
    faq: [
      {
        question: "När räcker fotogrammetri och när behövs LiDAR?",
        answer:
          "Fotogrammetri är utmärkt på öppna ytor, byggnader och massberäkningar. Så fort vegetation skymmer marken behöver du LiDAR, som penetrerar krontaket — det är då Zenmuse L2 och Enterprise-nivån blir aktuell.",
      },
      {
        question: "Kan vi använda SWEPOS i stället för egen basstation?",
        answer:
          "Ja, nätverks-RTK fungerar där täckningen är god. Den egna basstationen gör dig oberoende av mobilnätet, vilket i praktiken avgör i skog, gruvmiljö och glesbygd.",
      },
      {
        question: "Ingår utbildning i mätflöde?",
        answer:
          "Pilotutbildning ingår på Pro-nivå. Vi anpassar den efter era uppdrag, till exempel flygplanering, markstöd och kvalitetskontroll av modellen.",
      },
    ],
    seoTitle: "Kartläggningspaket Pro — Matrice 350 & P1 | EU Drone Company",
    seoDesc:
      "Fotogrammetripaket med DJI Matrice 350 RTK, Zenmuse P1, D-RTK 2 och Terra Pro. Centimeterprecision för mätning och kartläggning.",
  },
  {
    slug: "kartlaggning-enterprise",
    name: "LiDAR Enterprise",
    level: "enterprise",
    industrySlug: "kartlaggning",
    drone: "DJI Matrice 350 RTK",
    droneSlugs: ["matrice-350-rtk"],
    payloadSlugs: ["zenmuse-l2", "zenmuse-p1"],
    description: "LiDAR-baserad kartläggning för skog, terräng och infrastruktur med punktmolnsgenerering.",
    heroDesc:
      "Zenmuse L2 och P1 på samma plattform, sex batterier, Terra Cluster och fältkit. Kartläggning i skog och terräng där fotogrammetri inte räcker.",
    longDesc:
      "LiDAR Enterprise är uppsättningen för organisationer som kartlägger terräng och infrastruktur i produktion. Zenmuse L2 ger punktmoln som penetrerar vegetation och skapar terrängmodeller där fotogrammetri bara ser krontak. Zenmuse P1 följer med som utbytbar payload för de uppdrag där högupplöst bildunderlag är det som efterfrågas. Terra Cluster-licensen bearbetar stora projekt på flera maskiner, och GCP-markörerna gör det möjligt att kontrollera och belägga noggrannheten i leveransen.",
    components: [
      "DJI Matrice 350 RTK",
      "Zenmuse L2 (LiDAR + kamera)",
      "Zenmuse P1 (utbytbart)",
      "DJI D-RTK 2 basstation",
      "6 × TB65 batterier",
      "BS65 laddstation",
      "DJI Terra Cluster-licens",
      "GCP-markör-set (20 st)",
      "Transportlåda + fältkit",
    ],
    idealFor: "Stora kartläggningsföretag, skogsbolag och infrastrukturprojekt.",
    outcomes: [
      "Terrängmodeller under vegetation med LiDAR",
      "Byte mellan LiDAR och fotogrammetri utan att byta drönare",
      "Bearbetning av stora projekt utan att blockera en arbetsstation",
      "Kontrollpunkter som gör noggrannheten dokumenterbar",
    ],
    extraServices: [
      "Uppsättning av bearbetningsflöde för punktmoln och leveransformat",
      "Genomgång av kontrollpunkter och kvalitetssäkring i fält",
    ],
    faq: [
      {
        question: "Varför ingår både L2 och P1?",
        answer:
          "De löser olika uppgifter. L2 ger terräng och struktur under vegetation, P1 ger högupplöst bildunderlag för ortofoto och visuell dokumentation. Med båda på samma plattform väljer du sensor per uppdrag i stället för per drönare.",
      },
      {
        question: "Klarar sex batterier en hel fältdag?",
        answer:
          "Ja, i normalfallet. LiDAR-flygningar är längre och färre än inspektionsflygningar, och BS65-stationen laddar medan ni flyger på nästa uppsättning.",
      },
    ],
    seoTitle: "LiDAR Enterprise — Zenmuse L2 & P1 på Matrice 350 | EU Drone Company",
    seoDesc:
      "LiDAR-paket med DJI Matrice 350 RTK, Zenmuse L2, Zenmuse P1, Terra Cluster och GCP-set. Kartläggning av skog, terräng och infrastruktur.",
  },

  // ------------------------------------------------------------------ Säkerhet
  {
    slug: "sakerhet-bas",
    name: "Insatspaket Snabb",
    level: "standard",
    industrySlug: "sakerhet",
    drone: "DJI Mavic 3 Enterprise",
    droneSlugs: ["mavic-3-enterprise"],
    payloadSlugs: [],
    description: "Snabb deployment med termisk kamera, spotlight och högtalare — flygklar på 60 sekunder.",
    heroDesc:
      "Mavic 3T med spotlight och högtalare i en väska som går att ha i fordonet. Från larm till lägesbild på någon minut.",
    longDesc:
      "Insatspaket Snabb är byggt kring en enda sak: tiden från larm till lägesbild. Mavic 3T är flygklar på under en minut och ger termisk bild som hittar personer i mörker och i terräng. Spotlight och högtalare gör att drönaren inte bara observerar utan också kan lysa upp och kommunicera med den som söks. Hela paketet ligger i en snabbväska som kan ligga färdigpackad i utryckningsfordonet.",
    components: [
      "DJI Mavic 3T (termisk)",
      "DJI RC Pro Enterprise",
      "DJI Spotlight",
      "DJI Speaker (högtalare)",
      "3 × Intelligent Flight Battery",
      "Snabbväska",
    ],
    idealFor: "Väktarbolag, räddningstjänst och polis för snabba utryckningar.",
    outcomes: [
      "Lägesbild från luften inom minuter efter larm",
      "Termisk sökning av personer i mörker och terräng",
      "Kommunikation och belysning direkt från drönaren",
      "Utrustning som kan ligga färdigpackad i fordonet",
    ],
    faq: [
      {
        question: "Får vi flyga i mörker?",
        answer:
          "Ja, med rätt operatörsbehörighet och anti-kollisionsljus enligt gällande krav. Vi går igenom vad som gäller för er verksamhet och kompletterar paketet med nattflygningskit vid behov.",
      },
      {
        question: "Räcker termisk sensor på 640×512 för eftersök?",
        answer:
          "För eftersök av personer i öppen terräng och tätort, ja. Ska ni söka på längre avstånd eller kombinera med kraftig zoom är Bevakningspaket Pro med Zenmuse H20T rätt nivå.",
      },
    ],
    seoTitle: "Insatspaket Snabb — drönare för utryckning | EU Drone Company",
    seoDesc:
      "Insatspaket med DJI Mavic 3T, spotlight, högtalare och snabbväska. Lägesbild från luften inom minuter. För räddningstjänst och säkerhet.",
  },
  {
    slug: "sakerhet-pro",
    name: "Bevakningspaket Pro",
    level: "pro",
    industrySlug: "sakerhet",
    drone: "DJI Matrice 350 RTK",
    droneSlugs: ["matrice-350-rtk"],
    payloadSlugs: ["zenmuse-h20t"],
    description: "Professionell bevakning med termisk zoom och lång flygtid för utdragna operationer.",
    heroDesc:
      "Matrice 350 RTK med Zenmuse H20T och FlightHub 2. Byggt för långa pass, stora ytor och insatser som leds från en ledningscentral.",
    longDesc:
      "Bevakningspaket Pro är till för verksamheter där drönaren är en del av den operativa förmågan, inte ett verktyg som plockas fram ibland. Matrice 350 RTK flyger länge och tål väder, Zenmuse H20T identifierar personer och fordon på avstånd med termisk kamera, zoom och laser-avståndsmätare. FlightHub 2 gör att ledningscentralen ser samma bild som piloten i realtid och att varje insats loggas.",
    components: [
      "DJI Matrice 350 RTK",
      "Zenmuse H20T (termisk + zoom + LRF)",
      "DJI RC Plus",
      "4 × TB65 batterier",
      "BS65 laddstation",
      "DJI FlightHub 2-licens",
      "Transportlåda",
    ],
    idealFor: "Säkerhetsföretag, hamnar och kritisk infrastruktur.",
    outcomes: [
      "Identifiering av personer och fordon på långt avstånd, dag som natt",
      "Realtidsbild till ledningscentral via FlightHub 2",
      "Långa pass utan att behöva avbryta för laddning",
      "Loggade insatser som håller för efterhandsgranskning",
    ],
    faq: [
      {
        question: "Vad ger laser-avståndsmätaren i en bevakningsinsats?",
        answer:
          "Den ger koordinater till det du tittar på, inte bara en bild. Det gör att markresurser kan skickas till rätt punkt utan att piloten behöver beskriva platsen i ord.",
      },
      {
        question: "Kan flera operatörer se strömmen samtidigt?",
        answer:
          "Ja, det är precis vad FlightHub 2 gör. Ledningscentral och fältchef kan följa flygningen live medan piloten flyger.",
      },
      {
        question: "Går paketet att uppgradera till dockningslösning?",
        answer:
          "Ja. Bevakningspaket Enterprise bygger på samma plattform och payload men lägger till DJI Dock 2 för schemalagda flygningar utan pilot på plats.",
      },
    ],
    seoTitle: "Bevakningspaket Pro — Matrice 350 RTK & H20T | EU Drone Company",
    seoDesc:
      "Bevakningspaket med DJI Matrice 350 RTK, Zenmuse H20T och FlightHub 2. Termisk zoom och realtidsbild för säkerhet och kritisk infrastruktur.",
  },
  {
    slug: "sakerhet-enterprise",
    name: "Bevakningspaket Enterprise",
    level: "enterprise",
    industrySlug: "sakerhet",
    drone: "DJI Matrice 350 RTK + DJI Dock 2",
    droneSlugs: ["matrice-350-rtk"],
    payloadSlugs: ["zenmuse-h20t"],
    description: "Helautomatiserad dockningslösning för dygnet-runt-bevakning utan pilot på plats.",
    heroDesc:
      "Matrice 350 RTK i DJI Dock 2 med H20T och FlightHub 2 Enterprise. Schemalagda flygningar dygnet runt, utan pilot på anläggningen.",
    longDesc:
      "Bevakningspaket Enterprise flyttar drönaren från att vara ett verktyg någon hämtar till att vara en installerad del av anläggningens skydd. Drönaren står i DJI Dock 2, startar enligt schema eller på larm, flyger sin rutt och landar för laddning utan att någon är på plats. Zenmuse H20T ger termisk och optisk bild dygnet runt, och FlightHub 2 Enterprise håller ihop scheman, larm, livevideo och loggar. Installation och driftsättning ingår, eftersom en dockningslösning är en anläggning och inte ett paket man packar upp själv.",
    components: [
      "DJI Matrice 350 RTK",
      "DJI Dock 2 (automatisk landning/laddning/start)",
      "Zenmuse H20T",
      "DJI FlightHub 2 Enterprise",
      "Nätverksanslutning (4G/5G)",
      "Installation och driftsättning",
    ],
    idealFor: "Stora industrianläggningar och kritisk infrastruktur med behov av 24/7-bevakning.",
    outcomes: [
      "Schemalagda ronder dygnet runt utan pilot på plats",
      "Utryckning från luften på larm inom någon minut",
      "Konsekvent bilddokumentation från samma rutter över tid",
      "Bemanning som kan fokusera på bedömning i stället för på flygning",
    ],
    extraServices: [
      "Platsbesök och projektering av dockplacering, ström och nät",
      "Installation, driftsättning och överlämning till driftorganisationen",
    ],
    faq: [
      {
        question: "Vad krävs på plats för att installera DJI Dock 2?",
        answer:
          "Ström, nätverk och en placering med fri sikt uppåt och godkänt luftrum. Vi gör ett platsbesök och projekterar innan installation, så att förutsättningarna är klara innan utrustningen levereras.",
      },
      {
        question: "Behövs ändå en pilot?",
        answer:
          "Ja, ansvaret för flygningen ligger fortfarande hos en behörig operatör, men den behöver inte stå vid dockan. Vi går igenom regelverk och driftsrutiner för automatiserade flygningar i er miljö.",
      },
      {
        question: "Vad händer vid dåligt väder?",
        answer:
          "Dockan och drönaren har väderövervakning och flygningar ställs in vid förhållanden utanför gränsvärdena. Rutinerna för det sätts upp vid driftsättningen.",
      },
    ],
    seoTitle: "Bevakningspaket Enterprise — DJI Dock 2-lösning | EU Drone Company",
    seoDesc:
      "Automatiserad bevakning med DJI Matrice 350 RTK, Dock 2, Zenmuse H20T och FlightHub 2 Enterprise. Dygnet-runt-ronder utan pilot på plats.",
  },

  // -------------------------------------------------------------------- Energi
  {
    slug: "energi-bas",
    name: "Elnätspaket Bas",
    level: "standard",
    industrySlug: "energi",
    drone: "DJI Mavic 3 Enterprise",
    droneSlugs: ["mavic-3-enterprise"],
    payloadSlugs: [],
    description: "Portabelt inspektionskit för enstaka master, ställverk och transformatorer.",
    heroDesc:
      "Mavic 3T med RTK-modul och väska — det kit en driftstekniker kan ha i bilen för punktinspektion av master och ställverk.",
    longDesc:
      "Elnätspaket Bas är kittet för punktinsatser i nätet. Mavic 3T ger termisk bild som visar överhettade anslutningar och komponenter innan de går sönder, och drönaren är liten nog att en tekniker kan ta med den på ordinarie rond. RTK-modulen gör att samma position kan flygas om vid nästa inspektion, så att bilderna går att jämföra över tid i stället för att bara dokumentera ett tillfälle.",
    components: [
      "DJI Mavic 3T (termisk)",
      "DJI RC Pro Enterprise",
      "3 × Intelligent Flight Battery",
      "Laddhubb",
      "RTK-modul",
      "Transportväska",
    ],
    idealFor: "Elnätsbolag och konsulter för snabba punktinspektioner.",
    outcomes: [
      "Termisk kontroll av transformatorer och ställverk utan driftstopp",
      "Inspektion av enskilda master utan klättring",
      "Dokumentation som kan jämföras mellan inspektionstillfällen",
      "Utrustning som ryms i driftteknikerns fordon",
    ],
    faq: [
      {
        question: "Kan vi inspektera under drift?",
        answer:
          "Ja, det är en av de största vinsterna. Drönaren flyger på säkert avstånd och inspektionen kan göras utan att koppla bort anläggningen.",
      },
      {
        question: "När behöver vi gå upp till Pro-nivån?",
        answer:
          "När ni inspekterar ledningsgator och långa sträckor snarare än enskilda punkter. Då krävs zoom på avstånd och längre flygtid, vilket Kraftledningspaket Pro med Zenmuse H20T ger.",
      },
    ],
    seoTitle: "Elnätspaket Bas — termisk inspektion av elnät | EU Drone Company",
    seoDesc:
      "Portabelt elnätspaket med DJI Mavic 3T, RTK-modul och väska. Termisk punktinspektion av master, ställverk och transformatorer.",
  },
  {
    slug: "energi-pro",
    name: "Kraftledningspaket Pro",
    level: "pro",
    industrySlug: "energi",
    drone: "DJI Matrice 350 RTK",
    droneSlugs: ["matrice-350-rtk"],
    payloadSlugs: ["zenmuse-h20t"],
    description: "Professionell ledningsinspektion med långdistanszoom och termisk kamera.",
    heroDesc:
      "Matrice 350 RTK med Zenmuse H20T, basstation och FlightHub 2. Byggt för återkommande inspektionsprogram i transmissions- och distributionsnät.",
    longDesc:
      "Kraftledningspaket Pro är uppsättningen för nätbolag med schemalagda inspektionsprogram. Zenmuse H20T ger termisk avbildning och zoom som räcker för att granska isolatorer och skarvar utan att flyga nära ledningen, och laser-avståndsmätaren ger koordinater till varje anmärkning. D-RTK 2 basstationen gör flygrutterna repeterbara år efter år, och FlightHub 2 håller ihop planering, loggar och material mellan fältteam och driftorganisation.",
    components: [
      "DJI Matrice 350 RTK",
      "Zenmuse H20T",
      "DJI D-RTK 2 basstation",
      "4 × TB65 batterier",
      "BS65 laddstation",
      "DJI FlightHub 2-licens",
      "Transportlåda IP67",
    ],
    idealFor: "Nätbolag med regelbundna inspektionsprogram för transmissions- och distributionsnät.",
    outcomes: [
      "Ledningsinspektion utan driftstopp och utan klättring",
      "Termiska anomalier lokaliserade med koordinater",
      "Repeterbara rutter som gör årsjämförelser möjliga",
      "Inspektionskostnad långt under helikopterinspektion",
    ],
    faq: [
      {
        question: "Hur nära ledningen behöver drönaren flyga?",
        answer:
          "Med H20T:s zoom kan granskningen göras på avstånd. Det minskar både risken för störningar och behovet av att flyga in i ledningsgatan.",
      },
      {
        question: "Vad kostar drönarinspektion jämfört med helikopter?",
        answer:
          "Drönarinspektion kostar typiskt 70–80 procent mindre än helikopterinspektion, och datakvaliteten är ofta högre eftersom flygningen sker närmare objektet.",
      },
      {
        question: "Kan vi lägga till vegetationsanalys?",
        answer:
          "Ja, med Zenmuse L2 mäts avståndet mellan vegetation och ledning i punktmoln. Den kombinationen ingår i Energipaket Enterprise.",
      },
    ],
    seoTitle: "Kraftledningspaket Pro — inspektion av elnät | EU Drone Company",
    seoDesc:
      "Kraftledningspaket med DJI Matrice 350 RTK, Zenmuse H20T, D-RTK 2 och FlightHub 2. Termisk ledningsinspektion utan driftstopp.",
  },
  {
    slug: "energi-enterprise",
    name: "Energipaket Enterprise",
    level: "enterprise",
    industrySlug: "energi",
    drone: "DJI Matrice 350 RTK + LiDAR",
    droneSlugs: ["matrice-350-rtk"],
    payloadSlugs: ["zenmuse-h20t", "zenmuse-l2"],
    description: "Komplett system med termisk, visuell och LiDAR-sensor för vegetationsanalys och ledningsinspektion.",
    heroDesc:
      "H20T för inspektion och L2 för vegetationsanalys på samma plattform, med sex batterier, FlightHub 2 Enterprise och dubbla transportlådor.",
    longDesc:
      "Energipaket Enterprise täcker båda halvorna av underhållet i ett ledningsnät: teknisk status och vegetation. Zenmuse H20T hittar termiska anomalier och skador på komponenter, Zenmuse L2 mäter avståndet mellan vegetation och ledning i punktmoln så att röjning kan planeras på data i stället för på uppskattning. Sex TB65-batterier ger uthållighet för långa ledningsavsnitt per fältdag, och FlightHub 2 Enterprise gör att flera team arbetar mot samma planering och samma dataunderlag.",
    components: [
      "DJI Matrice 350 RTK",
      "Zenmuse H20T (inspektion)",
      "Zenmuse L2 (LiDAR — vegetationsanalys)",
      "DJI D-RTK 2 basstation",
      "6 × TB65 batterier",
      "BS65 laddstation",
      "DJI FlightHub 2 Enterprise",
      "DJI Terra + inspektionsmjukvara",
      "Transportlåda × 2",
    ],
    idealFor: "Stora energibolag och transmissionsoperatörer med storskaliga inspektionsprogram.",
    outcomes: [
      "Teknisk inspektion och vegetationsanalys i samma program",
      "Röjningsplanering baserad på uppmätta avstånd",
      "Flera team som arbetar mot gemensam planering och data",
      "Uthållighet för långa ledningsavsnitt per fältdag",
    ],
    extraServices: [
      "Uppsättning av inspektionsprogram och rutter i FlightHub 2",
      "Utbildning för både inspektions- och vegetationsflöde",
    ],
    faq: [
      {
        question: "Varför LiDAR för vegetation i stället för bilder?",
        answer:
          "Punktmoln ger uppmätta avstånd mellan vegetation och ledning. Bilder visar att det växer nära, men inte hur nära — och det är avståndet som avgör om röjning krävs.",
      },
      {
        question: "Kan samma pilot köra båda payloadsen?",
        answer:
          "Ja, det är samma plattform och samma fjärrkontroll. Arbetsflödet för bearbetning skiljer sig dock, så utbildningen täcker båda delarna.",
      },
    ],
    seoTitle: "Energipaket Enterprise — vegetationsanalys | EU Drone Company",
    seoDesc:
      "Energipaket med DJI Matrice 350 RTK, Zenmuse H20T, Zenmuse L2 och FlightHub 2 Enterprise. Ledningsinspektion och vegetationsanalys i ett system.",
  },

  // ---------------------------------------------------------------- Film & media
  {
    slug: "film-media-bas",
    name: "Kreativt Bas-paket",
    level: "standard",
    industrySlug: "film-media",
    drone: "DJI Mavic 3 Pro",
    droneSlugs: ["mavic-3-pro"],
    payloadSlugs: [],
    description: "Tre kameror i ett kompakt format — perfekt för fastighetsfoto och enklare produktioner.",
    heroDesc:
      "Mavic 3 Pro med Fly More Kit, ND-filter och väska. Allt som krävs för att leverera flygbilder och video till kund samma dag.",
    longDesc:
      "Kreativt Bas-paket är arbetsredskapet för fastighetsfoto, marknadsföringsvideo och innehållsproduktion. Mavic 3 Pro har tre kameror, vilket ger dig olika bildutsnitt utan att flytta drönaren, och ND-filtren är det som skiljer amatörmaterial från proffsmaterial i starkt ljus — utan dem tvingas du upp i slutartid och tappar naturlig rörelseoskärpa. Med Fly More Kit har du batterier för en hel fotodag.",
    components: [
      "DJI Mavic 3 Pro (Hasselblad trippelkamera)",
      "DJI RC Pro",
      "DJI Fly More Kit (3 batterier + laddhubb + ND-filter)",
      "ND-filterkit (ND8/16/32/64)",
      "Transportväska",
    ],
    idealFor: "Fastighetsfotografer, content creators och marknadsföringsbyråer.",
    outcomes: [
      "Flygbilder och video redo för leverans samma dag",
      "Tre bildutsnitt utan att byta position eller objektiv",
      "Naturlig rörelseoskärpa även i starkt solljus",
      "Utrustning som ryms i en väska mellan uppdrag",
    ],
    faq: [
      {
        question: "Räcker Mavic 3 Pro för betalda uppdrag?",
        answer:
          "Ja, för fastighetsfoto, marknadsföringsvideo, dokumentär och B-roll. När beställaren kräver fullformat, ProRes RAW eller utbytbara objektiv är Filmpaket Pro med Inspire 3 rätt nivå.",
      },
      {
        question: "Varför ingår två uppsättningar ND-filter?",
        answer:
          "Fly More Kit innehåller ett grundset. Det separata kitet täcker fler tätheter så att du kan hålla rätt slutartid från morgonljus till full sol utan att kompromissa.",
      },
    ],
    seoTitle: "Kreativt Bas-paket — DJI Mavic 3 Pro | EU Drone Company",
    seoDesc:
      "Filmpaket med DJI Mavic 3 Pro, Fly More Kit, ND-filter och väska. För fastighetsfoto, marknadsföringsvideo och innehållsproduktion.",
  },
  {
    slug: "film-media-pro",
    name: "Filmpaket Pro",
    level: "pro",
    industrySlug: "film-media",
    drone: "DJI Inspire 3",
    droneSlugs: ["inspire-3"],
    payloadSlugs: [],
    description: "8K RAW-video med utbytbara objektiv — branschstandard för professionell filmning.",
    heroDesc:
      "Inspire 3 med Zenmuse X9, tre DL-objektiv, fyra TB51-batterier och cine-ND. Uppsättningen produktionsbolag faktiskt bokas för.",
    longDesc:
      "Filmpaket Pro är Inspire 3 i den konfiguration som produktioner efterfrågar. Zenmuse X9-8K Air ger fullformat och ProRes RAW, och de tre DL-objektiven på 24, 35 och 50 mm täcker de brännvidder som används mest i luften. Fyra TB51-batterier och laddstation håller inspelningsdagen igång, och cine-ND-filtren gör att du kan hålla 180-gradersregeln oavsett ljus. RC Motion 2 finns med för de tagningar där FPV-känslan är poängen.",
    components: [
      "DJI Inspire 3",
      "DJI Zenmuse X9-8K Air gimbal + kamera",
      "DL 24mm f/2.8 objektiv",
      "DL 35mm f/2.8 objektiv",
      "DL 50mm f/2.8 objektiv",
      "TB51 batterier × 4",
      "Laddstation",
      "DJI RC Motion 2 (FPV-styrning)",
      "ND-filterkit (Cine-grade)",
      "Transportlåda",
    ],
    idealFor: "Produktionsbolag, TV-producenter och filmteam med höga krav.",
    outcomes: [
      "Fullformat och ProRes RAW som matchar markkamerorna i graderingen",
      "Tre brännvidder utan att behöva boka in extra utrustning",
      "Dubbeloperatörsläge för pilot och kameraoperatör",
      "Inspelningsdagar som inte stannar av på batteribyten",
    ],
    faq: [
      {
        question: "Varför just 24, 35 och 50 mm?",
        answer:
          "Det är de brännvidder som täcker merparten av luftburna tagningar — vidvinkel för etablering, normal för rörelse och 50 mm för komprimerade utsnitt. Fler brännvidder kan läggas till efter produktionens behov.",
      },
      {
        question: "Behöver vi två operatörer?",
        answer:
          "Inte tekniskt, men dubbeloperatörsläget är hela poängen med Inspire 3. Piloten flyger banan medan kameraoperatören komponerar — skillnaden syns direkt i materialet.",
      },
      {
        question: "Kan vi hyra i stället för att köpa?",
        answer:
          "Hör av er med produktionsupplägget så återkommer vi med vad som är möjligt utifrån tidsplan och tillgänglighet.",
      },
    ],
    seoTitle: "Filmpaket Pro — DJI Inspire 3 med DL-objektiv | EU Drone Company",
    seoDesc:
      "Filmpaket med DJI Inspire 3, Zenmuse X9-8K Air, DL-objektiv 24/35/50 mm, TB51-batterier och cine-ND. För professionell filmproduktion.",
  },
  {
    slug: "film-media-enterprise",
    name: "Produktionspaket Enterprise",
    level: "enterprise",
    industrySlug: "film-media",
    drone: "DJI Inspire 3 + DJI Mavic 3 Pro",
    droneSlugs: ["inspire-3", "mavic-3-pro"],
    payloadSlugs: [],
    description: "Dubbeldrönarsystem — Inspire 3 för huvudscener och Mavic 3 Pro för B-roll och scouting.",
    heroDesc:
      "Två drönare, tio batterier och extern HDR-monitor. Uppsättningen för produktionsbolag som kör flera enheter samma dag.",
    longDesc:
      "Produktionspaket Enterprise är byggt för produktionsbolag som inte kan låta en inspelningsdag hänga på en enda drönare. Inspire 3 tar huvudscenerna med fullformat och ProRes RAW, medan Mavic 3 Pro används för scouting, B-roll och de tagningar där uppriggningen inte får ta tid. Den externa HDR-monitorn gör att regissör och fotograf kan bedöma bilden under flygning i stället för efteråt, och tio batterier plus dubbla laddstationer håller båda enheterna i luften genom dagen.",
    components: [
      "DJI Inspire 3 (full objektivuppsättning)",
      "DJI Mavic 3 Pro (scouting & B-roll)",
      "DJI RC Motion 2",
      "10 × batterier (blandade)",
      "Dubbla laddstationer",
      "ND-filterkit (Cine-grade + standard)",
      "Monitor-kit (extern 7\" HDR)",
      "Transportlådor × 2",
    ],
    idealFor: "Produktionsbolag med storskaliga film- och reklamproduktioner.",
    outcomes: [
      "Huvudscener och B-roll fångas parallellt samma dag",
      "Regissör och fotograf ser bilden i HDR under flygning",
      "Redundans om en enhet går ner mitt i inspelning",
      "Scouting utan att rigga upp den stora plattformen",
    ],
    extraServices: [
      "Genomgång av arbetsflöde för material från båda enheterna",
      "Rådgivning kring bemanning och rollfördelning på inspelning",
    ],
    faq: [
      {
        question: "Varför två drönare i stället för fler batterier?",
        answer:
          "Därför att tid på inspelning kostar mer än utrustning. Med två enheter riggas den ena medan den andra flyger, och en teknisk stopp på en enhet stoppar inte hela dagen.",
      },
      {
        question: "Ingår objektiven i paketet?",
        answer:
          "Ja, Inspire 3 levereras med full objektivuppsättning i det här paketet. Vi går igenom vilka brännvidder som ska ingå utifrån vilka produktioner ni tar.",
      },
    ],
    seoTitle: "Produktionspaket Enterprise — två drönare | EU Drone Company",
    seoDesc:
      "Dubbeldrönarpaket med DJI Inspire 3, Mavic 3 Pro, HDR-monitor och tio batterier. För produktionsbolag med storskaliga produktioner.",
  },
];

export function getPackageBySlug(slug: string): EnterprisePackage | undefined {
  return ENTERPRISE_PACKAGES.find((p) => p.slug === slug);
}

/** Paketen för en bransch, i ordningen Bas → Pro → Enterprise. */
export function getPackagesForIndustry(industrySlug: string): EnterprisePackage[] {
  return ENTERPRISE_PACKAGES.filter((p) => p.industrySlug === industrySlug);
}

/** Paketen på samma nivå i andra branscher — används i "Liknande paket". */
export function getRelatedPackages(slug: string, limit = 3): EnterprisePackage[] {
  const pkg = getPackageBySlug(slug);
  if (!pkg) return [];
  const sameIndustry = ENTERPRISE_PACKAGES.filter(
    (p) => p.slug !== slug && p.industrySlug === pkg.industrySlug,
  );
  const sameLevel = ENTERPRISE_PACKAGES.filter(
    (p) => p.slug !== slug && p.industrySlug !== pkg.industrySlug && p.level === pkg.level,
  );
  return [...sameIndustry, ...sameLevel].slice(0, limit);
}

/** Paket som bygger på en viss drönare — länkas från produktsidan. */
export function getPackagesForDrone(droneSlug: string): EnterprisePackage[] {
  return ENTERPRISE_PACKAGES.filter((p) => p.droneSlugs.includes(droneSlug));
}

/** Alla tjänster som ingår i ett paket — nivåns standard plus paketets egna. */
export function getPackageServices(pkg: EnterprisePackage): string[] {
  return [...PACKAGE_SERVICES[pkg.level], ...(pkg.extraServices ?? [])];
}
