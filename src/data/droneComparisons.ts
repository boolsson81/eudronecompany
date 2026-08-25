import type { FaqItem } from "@/data/commercialDroneIndustries";

export interface ComparisonSpec {
  label: string;
  droneA: string;
  droneB: string;
}

export interface UseCaseWinner {
  useCase: string;
  winner: "a" | "b" | "tie";
  reason: string;
}

export interface DroneComparisonArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  droneA: { name: string; tagline: string };
  droneB: { name: string; tagline: string };
  intro: string;
  specs: ComparisonSpec[];
  useCaseWinners: UseCaseWinner[];
  sections: { heading: string; paragraphs: string[] }[];
  verdict: string;
  faq: FaqItem[];
}

export const DRONE_COMPARISONS: DroneComparisonArticle[] = [
  {
    slug: "mavic-3-enterprise-vs-matrice-350-rtk",
    title: "DJI Mavic 3 Enterprise vs Matrice 350 RTK — vilken passar din inspektion?",
    excerpt:
      "Kompakt portabilitet eller industriell kraft? Vi jämför DJI:s två mest populära inspektionsdrönare punkt för punkt — flygtid, kamera, väderskydd och totalkostnad.",
    date: "2026-03-01",
    readTime: "9 min",
    category: "Inspektion",
    droneA: {
      name: "DJI Mavic 3 Enterprise",
      tagline: "Kompakt allround för snabba inspektioner",
    },
    droneB: {
      name: "DJI Matrice 350 RTK",
      tagline: "Industriell plattform för krävande uppdrag",
    },
    intro:
      "När företag ska investera i sin första professionella inspektionsdrönare hamnar valet nästan alltid mellan DJI Mavic 3 Enterprise och DJI Matrice 350 RTK. Båda är etablerade på marknaden, men de riktar sig till olika typer av uppdrag och budgetar. I den här guiden går vi igenom de viktigaste skillnaderna så att du kan välja rätt modell från start.",
    specs: [
      { label: "Flygtid", droneA: "upp till 45 min", droneB: "upp till 55 min" },
      { label: "Max vindtålighet", droneA: "12 m/s", droneB: "12 m/s" },
      { label: "Väderskydd", droneA: "Inget IP-klassat", droneB: "IP45" },
      { label: "Vikt (startvikt)", droneA: "ca 915 g", droneB: "ca 3 770 g" },
      { label: "Kamera", droneA: "Bred + zoom + termisk (M3T)", droneB: "Utbytbar payload (H20T, H30T m.fl.)" },
      { label: "Zoom", droneA: "56× hybridzoom", droneB: "Upp till 200× (beroende på payload)" },
      { label: "RTK-positionering", droneA: "Valfri RTK-modul", droneB: "Inbyggd RTK" },
      { label: "Portabilitet", droneA: "Får plats i ryggsäck", droneB: "Kräver transportväska/fordon" },
      { label: "Typiskt pris (exkl. tillbehör)", droneA: "från ca 35 000 kr", droneB: "från ca 110 000 kr" },
      { label: "Bäst för", droneA: "Snabba fältinspektioner, mindre team", droneB: "Storskalig infrastruktur, tunga sensorer" },
    ],
    useCaseWinners: [
      {
        useCase: "Tak- och fasadinspektion i tätbebyggelse",
        winner: "a",
        reason: "Mavic 3 Enterprise är snabb att packa upp, tystare och enklare att manövrera mellan byggnader.",
      },
      {
        useCase: "Vindkraft och storskalig infrastruktur",
        winner: "b",
        reason: "Matrice 350 RTK tål väder bättre, bär tyngre kameror och har längre flygtid per batteribyte.",
      },
      {
        useCase: "Termisk inspektion av solceller",
        winner: "tie",
        reason: "Båda klarar termisk inspektion — Mavic 3T är smidigare på mindre tak, Matrice 350 RTK vinner på stora anläggningar.",
      },
      {
        useCase: "Budget och snabb ROI",
        winner: "a",
        reason: "Lägre inköpspris och enklare logistik ger snabbare avkastning för mindre inspektionsbolag.",
      },
    ],
    sections: [
      {
        heading: "Portabilitet vs kapacitet",
        paragraphs: [
          "Mavic 3 Enterprise är byggd för operatörer som behöver vara på plats snabbt. Du kan flyga samma dag som du får uppdraget utan att lasta bilen med specialutrustning. Matrice 350 RTK kräver mer planering men ger dig en plattform som växer med verksamheten — du kan byta payload mellan uppdrag utan att köpa en ny drönare.",
          "För konsulter som reser mellan kunder är Mavic 3 Enterprise ofta det naturliga valet. För energibolag, fastighetsägare med stora bestånd eller inspektionsbolag med fasta team på fält tenderar Matrice 350 RTK att ge lägre kostnad per inspektion över tid.",
        ],
      },
      {
        heading: "Kamera och sensorer",
        paragraphs: [
          "Mavic 3 Enterprise (särskilt M3T-varianten) kombinerar bred vidvinkel, zoom och termisk kamera i ett kompakt paket. Det räcker för de flesta rutininspektioner av tak, fasader och solpaneler.",
          "Matrice 350 RTK är en bärande plattform — du väljer payload efter uppdrag. Zenmuse H30T ger betydligt mer zoom och avancerad termisk analys, vilket är avgörande när du ska inspektera vindkraftverk, högspänningsledningar eller detaljer på hundratals meters avstånd.",
        ],
      },
      {
        heading: "Drift och totalkostnad",
        paragraphs: [
          "Räkna inte bara inköpspriset. Matrice 350 RTK har dyrare batterier och payloads, men kortare flygtid per uppdrag på stora objekt kan kompensera det. Mavic 3 Enterprise har lägre tröskel men kan kräva fler flygningar på samma yta.",
          "EU Drone Company hjälper dig räkna på totalkostnad baserat på dina typiska uppdrag — antal inspektioner per månad, medelstorlek på objekt och vilken rapportkvalitet kunden kräver.",
        ],
      },
    ],
    verdict:
      "Välj DJI Mavic 3 Enterprise om du vill komma igång snabbt med professionella inspektioner till en rimlig investering. Välj DJI Matrice 350 RTK om du har återkommande, krävande uppdrag där väderskydd, utbytbar kamera och maximal flygtid motiverar en högre initial kostnad.",
    faq: [
      {
        question: "Kan jag uppgradera från Mavic 3 Enterprise till Matrice 350 RTK senare?",
        answer:
          "Ja, många kunder börjar med Mavic 3 Enterprise och investerar i Matrice 350 RTK när uppdragsvolymen växer. Pilotutbildning och grundläggande flygteknik är överförbar mellan modellerna.",
      },
      {
        question: "Vilken modell kräver enklare tillstånd?",
        answer:
          "Båda kräver registrering hos Transportstyrelsen och rätt operatörsbehörighet i de flesta kommersiella sammanhang. EU Drone Company hjälper dig med tillståndsprocessen oavsett modell.",
      },
      {
        question: "Ingår RTK i båda modellerna?",
        answer:
          "Matrice 350 RTK har inbyggd RTK. Mavic 3 Enterprise kan utrustas med en separat RTK-modul — viktigt om du behöver centimeterprecision vid återkommande inspektioner.",
      },
    ],
  },
  {
    slug: "agras-t50-vs-mavic-3-multispectral",
    title: "DJI Agras T50 vs Mavic 3 Multispectral — rätt drönare för lantbruket",
    excerpt:
      "Sprutning eller växtanalys? Jämför DJI Agras T50 och Mavic 3 Multispectral för precisionslantbruk — täckning, sensorer, reglering och avkastning.",
    date: "2026-02-15",
    readTime: "8 min",
    category: "Lantbruk",
    droneA: {
      name: "DJI Agras T50",
      tagline: "Automatiserad precisionsspruta",
    },
    droneB: {
      name: "DJI Mavic 3 Multispectral",
      tagline: "Fältkartläggning och växtanalys",
    },
    intro:
      "Inom precisionslantbruk används drönare på två helt olika sätt: att spruta växtskyddsmedel med hög precision, och att kartlägga fält för att hitta stress och sjukdomar tidigt. DJI Agras T50 och DJI Mavic 3 Multispectral representerar vardera sitt spår. Här jämför vi dem så att du investerar i rätt verktyg — eller ser om du faktiskt behöver båda.",
    specs: [
      { label: "Primärt användningsområde", droneA: "Sprutning & utsädning", droneB: "NDVI-kartor & växtanalys" },
      { label: "Tank / sensor", droneA: "40 L spruttank", droneB: "Multispektral + RGB-kamera" },
      { label: "Täckning", droneA: "upp till 20 ha/timme", droneB: "upp till 200 ha/dag (kartläggning)" },
      { label: "Flygtid", droneA: "ca 7–10 min (full last)", droneB: "upp till 43 min" },
      { label: "Precision", droneA: "RTK, centimeternivå", droneB: "RTK, centimeternivå" },
      { label: "Nyttolast", droneA: "40 kg vätska eller 50 kg granulat", droneB: "Kamera/sensor" },
      { label: "Regelverk", droneA: "Kemikaliehantering, särskild utbildning", droneB: "Standard drönarregler" },
      { label: "Typiskt pris", droneA: "från ca 250 000 kr", droneB: "från ca 55 000 kr" },
      { label: "ROI-drivare", droneA: "Minskad kemikalieförbrukning (upp till 30 %)", droneB: "Tidig skadedetektion, variabel gödsling" },
    ],
    useCaseWinners: [
      {
        useCase: "Växtskyddssprutning i spannmål",
        winner: "a",
        reason: "Agras T50 är byggd för att spruta — inget annat i DJI:s sortiment matchar tankvolym och genomströmning.",
      },
      {
        useCase: "NDVI-kartor och gödslingsplanering",
        winner: "b",
        reason: "Mavic 3 Multispectral skapar detaljerade vältskartor som Agras T50 inte kan producera.",
      },
      {
        useCase: "Komplett precisionslantbruk",
        winner: "tie",
        reason: "Många gårdar använder Mavic 3 Multispectral för kartläggning och Agras T50 för riktad behandling baserat på kartorna.",
      },
      {
        useCase: "Lägsta startinvestering",
        winner: "b",
        reason: "Mavic 3 Multispectral kostar en bråkdel av Agras T50 och ger omedelbar insikt i grödors hälsa.",
      },
    ],
    sections: [
      {
        heading: "Kartläggning först, sprutning sedan",
        paragraphs: [
          "Det vanligaste misstaget är att köpa en sprutdrönare utan att ha data att styra den med. Mavic 3 Multispectral kartlägger fältet och visar exakt var stress, sjukdom eller ogräs finns. Agras T50 behandlar sedan bara de zoner som behöver det — det är kombinationen som ger 20–30 % lägre kemikalieåtgång.",
          "Om du redan har satellitdata eller markbaserade sensorer kan du gå direkt på Agras T50. Saknar du kartunderlag börjar de flesta med Mavic 3 Multispectral.",
        ],
      },
      {
        heading: "Regler och certifiering",
        paragraphs: [
          "Agras T50 kräver att operatören hanterar växtskyddsmedel enligt gällande kemikalielagstiftning — utöver vanliga drönarregler. Mavic 3 Multispectral har inga särskilda kemikaliekrav men kräver förståelse för multispektral analys och tolkning av NDVI-data.",
          "EU Drone Company erbjuder utbildning anpassad efter vilken modell du väljer, inklusive certifieringsstöd för sprutning.",
        ],
      },
      {
        heading: "Ekonomisk kalkyl",
        paragraphs: [
          "Agras T50 har hög inköpskostnad men kan betala sig på en säsong för gårdar över ca 200 hektar med intensiv odling. Mavic 3 Multispectral ger snabbare avkastning genom bättre beslutsunderlag — optimerad gödsling och tidig skadedetektion sparar ofta mer än drönarens pris redan första året.",
        ],
      },
    ],
    verdict:
      "DJI Agras T50 och Mavic 3 Multispectral är komplement snarare än konkurrenter. Behöver du spruta eller sprida utsäde? Välj Agras T50. Behöver du förstå hur dina grödor mår och skapa behandlingskartor? Börja med Mavic 3 Multispectral. De flesta professionella lantbrukare med stora arealer investerar i båda över tid.",
    faq: [
      {
        question: "Kan Agras T50 skapa NDVI-kartor?",
        answer:
          "Nej, Agras T50 saknar multispektral sensor. Den flyger behandlingsmönster baserat på kartor importerade från Mavic 3 Multispectral eller annat GIS-system.",
      },
      {
        question: "Vilken hektargräns motiverar Agras T50?",
        answer:
          "Som riktlinje börjar ROI bli tydlig runt 150–200 hektar årlig behandlingsyta, men det beror på gröda, kemikaliekostnad och tillgänglighet till markbaserade alternativ.",
      },
      {
        question: "Kan samma pilot flyga båda?",
        answer:
          "Ja, grundläggande drönarkompetens är gemensam. Sprutning kräver dock tilläggsutbildning i växtskydd och kemikaliehantering.",
      },
    ],
  },
  {
    slug: "inspire-3-vs-mavic-3-pro",
    title: "DJI Inspire 3 vs Mavic 3 Pro — filmproduktion och avancerad foto",
    excerpt:
      "Fullformat cinema eller kompakt flaggskepp? Vi jämför DJI Inspire 3 och Mavic 3 Pro för professionell film, reklam och fotografering.",
    date: "2026-02-01",
    readTime: "7 min",
    category: "Film & Foto",
    droneA: {
      name: "DJI Inspire 3",
      tagline: "Cinema-drönare med fullformatssensor",
    },
    droneB: {
      name: "DJI Mavic 3 Pro",
      tagline: "Trekamera-flaggskepp i fickformat",
    },
    intro:
      "För filmproducenter, reklambyråer och professionella fotografer är valet mellan DJI Inspire 3 och DJI Mavic 3 Pro en avvägning mellan maximal bildkvalitet och produktionseffektivitet. Inspire 3 sätter standarden för luftburen cinema — Mavic 3 Pro packar tre objektiv och 5.1K-inspelning i en drönare du bär i ryggsäcken.",
    specs: [
      { label: "Sensor", droneA: "Fullformat 8K (Zenmuse X9)", droneB: "4/3 CMOS Hasselblad + två tele" },
      { label: "Videoupplösning", droneA: "upp till 8K/75fps", droneB: "upp till 5.1K/50fps" },
      { label: "Dynamiskt omfång", droneA: "14+ stops (ProRes RAW)", droneB: "12.8 stops (Apple ProRes)" },
      { label: "Flygtid", droneA: "upp till 28 min", droneB: "upp till 43 min" },
      { label: "Max hastighet", droneA: "94 km/h", droneB: "75 km/h" },
      { label: "Setup-tid", droneA: "5–10 min (två operatörer)", droneB: "under 1 min" },
      { label: "Teamstorlek", droneA: "Pilot + kameraman rekommenderas", droneB: "En operatör räcker" },
      { label: "Typiskt pris", droneA: "från ca 130 000 kr", droneB: "från ca 28 000 kr" },
      { label: "Bäst för", droneA: "Spelfilm, reklam, high-end produktion", droneB: "Dokumentär, B-roll, snabba produktioner" },
    ],
    useCaseWinners: [
      {
        useCase: "Spelfilm och high-end reklam",
        winner: "a",
        reason: "Inspire 3 med Zenmuse X9 ger fullformat, ProRes RAW och dubbeloperatörsläge som matchar cinema-kameror.",
      },
      {
        useCase: "Dokumentär och run-and-gun",
        winner: "b",
        reason: "Mavic 3 Pro är redo att flyga på sekunder och ger utmärkt bildkvalitet utan stor crew.",
      },
      {
        useCase: "Nattinspelning och svagt ljus",
        winner: "a",
        reason: "Fullformatsensorn på Inspire 3 presterar markant bättre i mörker med lägre brus.",
      },
      {
        useCase: "Budget och flexibilitet",
        winner: "b",
        reason: "Mavic 3 Pro kostar en bråkdel och passar i handbagage på flyg.",
      },
    ],
    sections: [
      {
        heading: "Bildkvalitet i praktiken",
        paragraphs: [
          "Inspire 3 med Zenmuse X9 är byggd för produktioner där varje bild ska tåla färggrading i postproduktion. ProRes RAW och fullformat ger maximalt dynamiskt omfång och detaljrikedom — särskilt i motljus och skuggor.",
          "Mavic 3 Pro imponerar med tre objektiv (vidvinkel, medium tele, tele) utan att byta linser. För de flesta kommersiella produktioner, eventfilmning och sociala medier räcker kvaliteten mer än väl — och du sparar timmar i setup per inspelningsdag.",
        ],
      },
      {
        heading: "Produktionsworkflow",
        paragraphs: [
          "Inspire 3 kräver mer planering: större transport, längre uppstart och helst två operatörer (pilot + gimbal-operatör). Resultatet är en produktionsupplevelse närmare traditionell filmutrustning.",
          "Mavic 3 Pro passar team som behöver fånga B-roll snabbt mellan scener, resa lätt eller arbeta ensam. Många produktioner använder faktiskt båda — Inspire 3 för hero-shots och Mavic 3 Pro för allt däremellan.",
        ],
      },
      {
        heading: "Vilken ska du hyra eller köpa?",
        paragraphs: [
          "Hyrs Inspire 3 ofta per projekt för reklamfilm och större produktioner. Mavic 3 Pro ägs oftare av frilansande filmare och mindre produktionsbolag som flyger regelbundet.",
          "EU Drone Company erbjuder båda modellerna med rådgivning kring rätt konfiguration, försäkring och utbildning.",
        ],
      },
    ],
    verdict:
      "DJI Inspire 3 är rätt val när bildkvaliteten är det viktigaste och budgeten tillåter en dedikerad produktionsplattform. DJI Mavic 3 Pro är det smarta valet för professionella som behöver hög kvalitet utan att offra hastighet och portabilitet. Många produktionsbolag har båda i utrustningsparken.",
    faq: [
      {
        question: "Kan Inspire 3 flygas av en person?",
        answer:
          "Ja, men dubbeloperatörsläge (pilot + kameraman) rekommenderas för professionella produktioner. Mavic 3 Pro är designad för enmansbruk.",
      },
      {
        question: "Spelar Mavic 3 Pro in i ProRes?",
        answer:
          "Ja, Mavic 3 Pro stöder Apple ProRes 422 HQ och ProRes 422. Inspire 3 går steget längre med ProRes RAW på fullformat.",
      },
      {
        question: "Vilken har bättre undvikande av hinder?",
        answer:
          "Mavic 3 Pro har omnidirektionellt hinderundvikande i alla riktningar. Inspire 3 förlitar sig mer på pilotens skicklighet men har front- och bottensensorer.",
      },
    ],
  },
];

export function getComparisonBySlug(slug: string): DroneComparisonArticle | undefined {
  return DRONE_COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return DRONE_COMPARISONS.map((c) => c.slug);
}
