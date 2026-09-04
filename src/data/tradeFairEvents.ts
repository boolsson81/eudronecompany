// Mässkatalogen bakom Inköp → Mässor & Events.
//
// Katalogen ligger i kod, inte i databasen, av samma skäl som droneRegulations.ts
// och enterpriseCameraProducts.ts gör det: den är kurerad referensdata som ska
// granskas i en diff innan den blir sanning. Allt som inköparen *skriver* —
// utställare, möten, agenda, inköpslista, kostnader, uppföljningar, rapporter —
// ligger i databasen (se src/lib/tradeFairDb.ts).
//
// KÄLLPOLICY (docs/TRADE_FAIR_MODULE.md § Research Source Policy):
// Ett datum får bara stå som `confirmed` om det är verifierat mot arrangörens
// egen sida eller mässanläggningens officiella kalender. Är nästa upplaga inte
// officiellt annonserad står `dateStatus: "tbc"` och `status: "unconfirmed"` —
// datum hittas aldrig på.

import type {
  AttendancePlan,
  EventCategoryId,
  EventPriority,
  EventStatus,
  ScoreBreakdown,
  VerificationStatus,
} from "./tradeFairTaxonomy";
import { SCORE_FACTORS, SCORE_RAW_MAX } from "./tradeFairTaxonomy";

export interface EventCostEstimate {
  /** Per person, i EUR. Planeringsvärden — ersätts av utfall i event_costs. */
  travel: number;
  accommodation: number;
  ticket: number;
  /** Mat, lokala transporter, övrigt. */
  other: number;
}

export interface SeedExhibitor {
  /** Namnet som det står i utställarkatalogen. */
  name: string;
  /** Taggar ur EXHIBITOR_FILTERS. */
  tags: string[];
  /** Varför de är intressanta för oss. */
  note: string;
}

export interface TradeFairEvent {
  slug: string;
  name: string;
  /** Officiell arrangör. Tom sträng = inte verifierad ännu. */
  organizer: string;
  country: string;
  city: string;
  /** Mässanläggning. Tom sträng = inte publicerad/verifierad. */
  venue: string;
  /** ISO-datum. null när nästa upplaga inte är officiellt annonserad. */
  startDate: string | null;
  endDate: string | null;
  dateStatus: "confirmed" | "tbc";
  website: string;
  categories: EventCategoryId[];
  /** Underkategorier ur EVENT_CATEGORIES[].topics. */
  topics: string[];
  targetIndustries: string[];
  priority: EventPriority;
  status: EventStatus;
  attendancePlan: AttendancePlan;
  /** Arrangörens egna siffror. null = inte publicerat. */
  expectedExhibitors: number | null;
  expectedVisitors: number | null;
  /** Varför mässan är relevant för EU Drone Company — inköpsperspektiv. */
  whyRelevant: string;
  score: ScoreBreakdown;
  /** Relevanstalet ur uppdragsbeskrivningen, sparat för spårbarhet. */
  statedRelevance: number;
  costs: EventCostEstimate;
  /** Utställare vi vet eller tror ställer ut. Måste stämmas av mot officiell katalog. */
  knownExhibitors: SeedExhibitor[];
  verification: VerificationStatus;
  /** Var uppgifterna kommer ifrån. */
  source: string;
  /** ISO-datum för senaste research. */
  lastResearched: string;
  notes: string;
}

const RESEARCHED = "2026-09-03";

export const TRADE_FAIR_EVENTS: TradeFairEvent[] = [
  /* ─────────────────────────── PRIORITET A ─────────────────────────── */
  {
    slug: "intergeo-2026",
    name: "INTERGEO 2026",
    organizer: "HINTE Expo & Conference på uppdrag av DVW e.V.",
    country: "Tyskland",
    city: "München",
    venue: "Messe München",
    startDate: "2026-09-15",
    endDate: "2026-09-17",
    dateStatus: "confirmed",
    website: "https://www.intergeo.de/",
    categories: ["geospatial", "sensors", "drone-uav", "technology"],
    topics: [
      "Surveying",
      "GIS",
      "Mapping",
      "LiDAR",
      "Photogrammetry",
      "Reality Capture",
      "Digital Twins",
      "Enterprise UAV",
      "Thermal",
      "GNSS",
    ],
    targetIndustries: ["Construction", "Infrastructure", "Utilities", "Energy", "Mining", "Forestry"],
    priority: "A",
    status: "confirmed",
    attendancePlan: "planned",
    expectedExhibitors: 530,
    expectedVisitors: 18500,
    whyRelevant:
      "Tätast koncentration av payload- och sensortillverkare i Europa. Nästan hela LiDAR-, " +
      "mappnings- och reality capture-kedjan ställer ut på samma golv. Det är också den mässa " +
      "som täcker vår faktiska lucka: leverantörsregistret innehåller i dag bara distributörer " +
      "och sourcingagenter, ingen enda payloadtillverkare vi köper direkt av.",
    score: {
      supplierRelevance: 25,
      productRelevance: 20,
      enterpriseUavRelevance: 15,
      payloadRelevance: 10,
      resellerOpportunities: 10,
      serviceOpportunities: 5,
      networking: 5,
      geographicValue: 5,
    },
    statedRelevance: 100,
    costs: { travel: 320, accommodation: 660, ticket: 100, other: 220 },
    knownExhibitors: [
      { name: "YellowScan", tags: ["LiDAR", "Sensors", "OEM"], note: "Enterprise-LiDAR för UAV. Kandidat för återförsäljaravtal." },
      { name: "RIEGL", tags: ["LiDAR", "Sensors", "Survey", "OEM"], note: "Högsta segmentet av UAV-LiDAR." },
      { name: "GeoCue", tags: ["LiDAR", "Software", "Mapping"], note: "LiDAR-system och efterbearbetning." },
      { name: "Leica Geosystems", tags: ["Survey", "Sensors", "Mapping"], note: "Del av Hexagon. Survey-grade instrument." },
      { name: "Trimble", tags: ["Survey", "Mapping", "Software", "Sensors"], note: "GNSS/RTK och surveyprogramvara." },
      { name: "Hexagon", tags: ["Survey", "Sensors", "Software"], note: "Koncernen bakom Leica. Reality capture." },
      { name: "DJI", tags: ["UAV", "Thermal", "OEM", "Distributor"], note: "Enterprise-plattformar och Zenmuse-payloads. Befintlig produktlinje." },
    ],
    verification: "verified",
    source:
      "Messe München och DVW/INTERGEO officiella eventsidor (datum, plats, 530+ utställare, 18 500+ besökare).",
    lastResearched: RESEARCHED,
    notes:
      "Utställarlistan här är kandidater att stämma av mot den officiella utställarkatalogen " +
      "innan möten bokas — den är inte hämtad ur katalogen.",
  },
  {
    slug: "xponential-europe-2027",
    name: "XPONENTIAL Europe 2027",
    organizer: "Messe Düsseldorf i samarbete med AUVSI",
    country: "Tyskland",
    city: "Düsseldorf",
    venue: "Messe Düsseldorf",
    startDate: "2027-03-16",
    endDate: "2027-03-18",
    dateStatus: "confirmed",
    website: "https://www.xponential-europe.com/",
    categories: ["drone-uav", "technology", "sensors"],
    topics: [
      "Enterprise UAV",
      "Autonomous Systems",
      "Robotics",
      "AI",
      "Autonomy",
      "Computer Vision",
      "Drone Technology",
    ],
    targetIndustries: ["Inspection", "Infrastructure", "Energy", "Utilities", "Construction"],
    priority: "A",
    status: "confirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Europas AUVSI-mässa för obemannade och autonoma system. Här finns UAV-plattformar och " +
      "komponenttillverkare som inte kommer till de geospatiala mässorna, och den europeiska " +
      "distributionsdiskussionen förs på plats i stället för via mejl till USA.",
    score: {
      supplierRelevance: 25,
      productRelevance: 20,
      enterpriseUavRelevance: 15,
      payloadRelevance: 9,
      resellerOpportunities: 10,
      serviceOpportunities: 5,
      networking: 5,
      geographicValue: 5,
    },
    statedRelevance: 100,
    costs: { travel: 280, accommodation: 660, ticket: 90, other: 220 },
    knownExhibitors: [],
    verification: "verified",
    source: "XPONENTIAL Europe officiella eventsida (datum och plats för 2027 års upplaga).",
    lastResearched: RESEARCHED,
    notes: "Utställarkatalogen för 2027 är inte publicerad — kör AI Research när den öppnar.",
  },
  {
    slug: "commercial-uav-expo-europe",
    name: "Commercial UAV Expo Europe",
    organizer: "Diversified Communications",
    country: "Nederländerna",
    city: "Amsterdam",
    venue: "RAI Amsterdam",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.expouav.com/",
    categories: ["drone-uav", "geospatial", "industry"],
    topics: ["Commercial Drone", "Enterprise UAV", "LiDAR", "Mapping", "Surveying", "Inspection"],
    targetIndustries: ["Infrastructure", "Energy", "Utilities", "Construction", "Inspection"],
    // Nedgraderad från A: en inställd mässa hör inte hemma i huvudlistan.
    priority: "D",
    status: "cancelled",
    attendancePlan: "not-attending",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Var den renodlat kommersiella UAV-mässan i Europa, en dagsresa från Sverige. " +
      "Inställd — det europeiska inköpsbehovet får täckas av INTERGEO och XPONENTIAL Europe, " +
      "eller av Las Vegas-upplagan om sortimentet kräver de amerikanska tillverkarna.",
    score: {
      supplierRelevance: 24,
      productRelevance: 19,
      enterpriseUavRelevance: 15,
      payloadRelevance: 10,
      resellerOpportunities: 9,
      serviceOpportunities: 4,
      networking: 4,
      geographicValue: 5,
    },
    statedRelevance: 95,
    costs: { travel: 260, accommodation: 600, ticket: 120, other: 200 },
    knownExhibitors: [],
    verification: "verified",
    source:
      "Arrangörens eget meddelande via Commercial UAV News och expouav.com, publicerat " +
      "2026-01-09: Commercial UAV Forum ställs in.",
    lastResearched: RESEARCHED,
    notes:
      "Europaupplagan hette Commercial UAV Forum och skulle hållits 22–23 april 2026 på RAI " +
      "Amsterdam. Diversified Communications ställde in den och koncentrerar resurserna till " +
      "Las Vegas-upplagan. Ingen ersättare i Europa är annonserad. Behåll posten så länge — " +
      "den förklarar varför A-listan krympte — och återaktivera om arrangören kommer tillbaka.",
  },
  {
    slug: "amsterdam-drone-week",
    name: "Amsterdam Drone Week",
    organizer: "RAI Amsterdam",
    country: "Nederländerna",
    city: "Amsterdam",
    venue: "RAI Amsterdam",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.amsterdamdroneweek.com/",
    categories: ["drone-uav", "technology", "security"],
    topics: ["Drone Operations", "Autonomous Systems", "Drone Technology", "Commercial Drone"],
    targetIndustries: ["Inspection", "Infrastructure", "Emergency Services", "Utilities"],
    priority: "A",
    status: "unconfirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Regelverksmässan — U-space, BVLOS och EASA-frågorna avgörs här. Mindre ren " +
      "produktsourcing än INTERGEO, men avgör vilka produkter som ens blir sålbara i EU, " +
      "och samlar de operatörer som är våra slutkunder.",
    score: {
      supplierRelevance: 21,
      productRelevance: 18,
      enterpriseUavRelevance: 15,
      payloadRelevance: 8,
      resellerOpportunities: 9,
      serviceOpportunities: 4,
      networking: 5,
      geographicValue: 5,
    },
    statedRelevance: 90,
    costs: { travel: 260, accommodation: 600, ticket: 150, other: 200 },
    knownExhibitors: [],
    verification: "needs-review",
    source: "Arrangörens eventsida. 2027 års datum är inte officiellt bekräftade.",
    lastResearched: RESEARCHED,
    notes:
      "Branschlistningar uppger att ADW går samman med Intertraffic Amsterdam 2028 (7–10 mars " +
      "2028) och att ingen 2027-upplaga är satt. Obekräftat av RAI Amsterdam. Kontrollera om " +
      "det blir en 2027-upplaga alls innan mässan budgeteras.",
  },
  {
    slug: "dronex-2026",
    name: "DroneX Trade Show & Conference 2026",
    organizer: "Fortem International",
    country: "Storbritannien",
    city: "London",
    venue: "ExCeL London",
    startDate: "2026-09-29",
    endDate: "2026-09-30",
    dateStatus: "confirmed",
    website: "https://dronexpo.co.uk/",
    categories: ["drone-uav", "industry", "security"],
    topics: ["Commercial Drone", "Enterprise UAV", "Drone Technology", "Drone Operations"],
    targetIndustries: ["Inspection", "Construction", "Energy", "Public Safety"],
    priority: "B",
    status: "confirmed",
    attendancePlan: "considering",
    expectedExhibitors: 300,
    expectedVisitors: 4000,
    whyRelevant:
      "Brittiska drönarmarknadens samlingspunkt och en billig tvådagarsresa. Bra på komponenter, " +
      "tjänsteleverantörer och mindre tillverkare som inte har råd med INTERGEO — alltså precis " +
      "de leverantörer vi annars missar.",
    score: {
      supplierRelevance: 20,
      productRelevance: 17,
      enterpriseUavRelevance: 13,
      payloadRelevance: 8,
      resellerOpportunities: 9,
      serviceOpportunities: 4,
      networking: 5,
      geographicValue: 5,
    },
    statedRelevance: 85,
    costs: { travel: 260, accommodation: 440, ticket: 0, other: 180 },
    knownExhibitors: [],
    verification: "verified",
    source: "ExCeL Londons officiella evenemangskalender (datum, plats, 300+ utställare, 4 000+ besökare).",
    lastResearched: RESEARCHED,
    notes:
      "Arrangören är Fortem International enligt mässans kontaktuppgifter, inte enligt en " +
      "officiell om-oss-sida. Entré är normalt kostnadsfri för fackbesökare — biljettkostnaden " +
      "är satt till 0 och ska kontrolleras vid registrering.",
  },
  {
    slug: "dronitaly",
    name: "Dronitaly",
    organizer: "BolognaFiere Water&Energy i samarbete med Mirumir",
    country: "Italien",
    city: "Bologna",
    venue: "Bologna Congress Center",
    startDate: "2027-04-07",
    endDate: "2027-04-09",
    dateStatus: "confirmed",
    website: "https://www.dronitaly.it/",
    categories: ["drone-uav", "industry", "security"],
    topics: ["Commercial Drone", "Enterprise UAV", "Drone Operations"],
    targetIndustries: ["Public Safety", "Inspection", "Infrastructure", "Agriculture"],
    priority: "B",
    status: "confirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Italiens professionella drönarmässa. Södra Europas tillverkare och integratörer syns " +
      "sällan norrut, och blåljussegmentet är starkt — relevant för termik och EO/IR.",
    score: {
      supplierRelevance: 19,
      productRelevance: 16,
      enterpriseUavRelevance: 12,
      payloadRelevance: 7,
      resellerOpportunities: 8,
      serviceOpportunities: 4,
      networking: 5,
      geographicValue: 5,
    },
    statedRelevance: 80,
    costs: { travel: 340, accommodation: 440, ticket: 60, other: 200 },
    knownExhibitors: [],
    verification: "verified",
    source:
      "dronitaly.it — tolfte upplagan, 7–9 april 2027 på Bologna Congress Center. " +
      "Fristående listningar som anger 24–26 mars är felaktiga.",
    lastResearched: RESEARCHED,
    notes: "Entré är fri för fackbesökare efter registrering — kontrollera vid anmälan.",
  },

  /* ─────────────────────────── PRIORITET B ─────────────────────────── */
  {
    slug: "auvsi-xponential",
    name: "AUVSI XPONENTIAL",
    organizer: "AUVSI (Association for Uncrewed Vehicle Systems International)",
    country: "USA",
    city: "Miami Beach",
    venue: "Miami Beach Convention Center",
    startDate: "2027-05-17",
    endDate: "2027-05-20",
    dateStatus: "confirmed",
    website: "https://www.xponential.org/",
    categories: ["drone-uav", "technology", "sensors"],
    topics: ["Autonomous Systems", "Robotics", "AI", "Enterprise UAV", "Drone Technology"],
    targetIndustries: ["Inspection", "Energy", "Infrastructure", "Public Safety"],
    priority: "B",
    status: "confirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Störst i världen på obemannade system. Amerikanska tillverkare söker EU-distributörer här, " +
      "vilket är den snabbaste vägen till ett återförsäljaravtal — men resan kostar tre gånger " +
      "en europeisk mässa.",
    score: {
      supplierRelevance: 21,
      productRelevance: 17,
      enterpriseUavRelevance: 14,
      payloadRelevance: 8,
      resellerOpportunities: 8,
      serviceOpportunities: 4,
      networking: 5,
      geographicValue: 4,
    },
    statedRelevance: 85,
    costs: { travel: 1100, accommodation: 1200, ticket: 900, other: 500 },
    knownExhibitors: [],
    verification: "needs-review",
    source:
      "Samstämmiga branschlistningar anger 17–20 maj 2027 på Miami Beach Convention Center. " +
      "AUVSI:s egen sida gick inte att nå härifrån.",
    lastResearched: RESEARCHED,
    notes: "Stad och datum växlar årligen. Bekräfta mot xponential.org innan resa bokas.",
  },
  {
    slug: "commercial-uav-expo-usa",
    name: "Commercial UAV Expo (USA)",
    organizer: "Diversified Communications",
    country: "USA",
    city: "Las Vegas",
    venue: "Caesars Forum",
    startDate: "2026-09-01",
    endDate: "2026-09-03",
    dateStatus: "confirmed",
    website: "https://www.expouav.com/",
    categories: ["drone-uav", "geospatial", "industry"],
    topics: ["Commercial Drone", "Surveying", "Mapping", "LiDAR", "Inspection"],
    targetIndustries: ["Construction", "Energy", "Utilities", "Infrastructure", "Mining"],
    priority: "B",
    status: "confirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Sedan Europaupplagan ställdes in är det här arrangörens enda mässa, och därmed enda " +
      "vägen till de amerikanska tillverkare som inte ställer ut i Europa. Bredare payloadutbud " +
      "än INTERGEO på plattformssidan, men en dyr resa för det.",
    score: {
      supplierRelevance: 21,
      productRelevance: 18,
      enterpriseUavRelevance: 14,
      payloadRelevance: 9,
      resellerOpportunities: 8,
      serviceOpportunities: 4,
      networking: 4,
      geographicValue: 3,
    },
    statedRelevance: 85,
    costs: { travel: 1100, accommodation: 1000, ticket: 700, other: 450 },
    knownExhibitors: [],
    verification: "verified",
    source:
      "Arrangörens eget meddelande via Commercial UAV News och expouav.com (2026-01-09), " +
      "som anger 1–3 september 2026 i Las Vegas.",
    lastResearched: RESEARCHED,
    notes:
      "2027 års datum är inte annonserade. Posten avser 2026 års upplaga, som avslutas " +
      "2026-09-03 — uppdatera när nästa upplaga publiceras.",
  },
  {
    slug: "drone-world-congress",
    name: "Drone World Congress & Shenzhen International UAV Expo",
    organizer: "World UAV Federation",
    country: "Kina",
    city: "Shenzhen",
    venue: "Shenzhen Futian Convention and Exhibition Center",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://droneworldcongress.com/",
    categories: ["drone-uav", "sensors", "technology"],
    topics: ["Drone Technology", "Enterprise UAV", "Autonomous Systems"],
    targetIndustries: ["Inspection", "Agriculture", "Infrastructure"],
    priority: "B",
    status: "unconfirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Den mest sourcingtäta mässan på listan. Shenzhen är där komponenterna faktiskt tillverkas — " +
      "batterier, propellrar, gimbals, docks — och där MOQ, marginal och private label går att " +
      "förhandla direkt med tillverkaren i stället för via en europeisk mellanhand. " +
      "Motvikten är EU-compliance: allt som köps här måste genom samma GPSR- och HS-kontroll " +
      "som Sunsky-sortimentet.",
    score: {
      supplierRelevance: 21,
      productRelevance: 15,
      enterpriseUavRelevance: 9,
      payloadRelevance: 7,
      resellerOpportunities: 8,
      serviceOpportunities: 3,
      networking: 3,
      geographicValue: 0,
    },
    statedRelevance: 70,
    costs: { travel: 1000, accommodation: 700, ticket: 200, other: 400 },
    knownExhibitors: [],
    verification: "needs-review",
    source:
      "World UAV Federation (wuavf.org) och droneworldcongress.com. 2026 var tionde upplagan, " +
      "21–23 maj 2026 i Futian. Arrangörens sida nämner en elfte upplaga 2027 utan datum.",
    lastResearched: RESEARCHED,
    notes:
      "Flera Shenzhen-mässor bär liknande namn. Den här är World UAV Federations, samlokaliserad " +
      "med Shenzhen International UAV Expo. Datum för 2027 är inte publicerade.",
  },
  {
    slug: "paris-air-show",
    name: "Paris Air Show (SIAE)",
    organizer: "SIAE / GIFAS",
    country: "Frankrike",
    city: "Paris",
    venue: "Paris–Le Bourget",
    startDate: "2027-06-14",
    endDate: "2027-06-20",
    dateStatus: "confirmed",
    website: "https://www.siae.fr/",
    categories: ["drone-uav", "security", "sensors"],
    topics: ["Autonomous Systems", "Enterprise UAV", "EO/IR", "Radar"],
    targetIndustries: ["Defence", "Infrastructure", "Emergency Services"],
    priority: "B",
    status: "confirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Flyg- och försvarsmässa där sensorleverantörer i det övre segmentet finns. Sourcing " +
      "är sekundärt; värdet ligger i EO/IR- och radarkontakter som inte ställer ut civilt.",
    score: {
      supplierRelevance: 16,
      productRelevance: 13,
      enterpriseUavRelevance: 10,
      payloadRelevance: 7,
      resellerOpportunities: 7,
      serviceOpportunities: 3,
      networking: 5,
      geographicValue: 5,
    },
    statedRelevance: 70,
    costs: { travel: 300, accommodation: 700, ticket: 250, other: 250 },
    knownExhibitors: [],
    verification: "verified",
    source: "siae.fr — 56:e upplagan, 14–20 juni 2027 på Paris–Le Bourget.",
    lastResearched: RESEARCHED,
    notes:
      "De fyra första dagarna är fackbesök, de tre sista publika. Planera besöket till " +
      "fackdagarna. Hålls vartannat år, växelvis med Farnborough.",
  },
  {
    slug: "dsei",
    name: "DSEI",
    organizer: "Clarion Events",
    country: "Storbritannien",
    city: "London",
    venue: "ExCeL London",
    startDate: "2027-09-07",
    endDate: "2027-09-10",
    dateStatus: "confirmed",
    website: "https://www.dsei.co.uk/",
    categories: ["security", "drone-uav", "sensors"],
    topics: ["Defence", "Security", "Autonomous Systems", "EO/IR", "Radar"],
    targetIndustries: ["Defence", "Border Protection", "Public Safety"],
    priority: "B",
    status: "confirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Försvarsmässa med tung sensor- och autonomidel. Relevant för EO/IR och robusta " +
      "plattformar, men inköpen kräver exportkontroll och certifiering vi inte har idag.",
    score: {
      supplierRelevance: 16,
      productRelevance: 13,
      enterpriseUavRelevance: 10,
      payloadRelevance: 7,
      resellerOpportunities: 7,
      serviceOpportunities: 3,
      networking: 5,
      geographicValue: 5,
    },
    statedRelevance: 70,
    costs: { travel: 260, accommodation: 660, ticket: 0, other: 220 },
    knownExhibitors: [],
    verification: "verified",
    source: "dsei.co.uk — 7–10 september 2027 på ExCeL London, arrangerad av Clarion Defence & Security.",
    lastResearched: RESEARCHED,
    notes:
      "Kräver verifierad fackbesökarregistrering — ansök i god tid. Krockar med INTERGEO-veckan " +
      "vissa år; stäm av mot INTERGEO 2027 när de datumen publiceras.",
  },
  {
    slug: "eurosatory",
    name: "Eurosatory",
    organizer: "COGES Events (GICAT)",
    country: "Frankrike",
    city: "Paris",
    venue: "Paris Nord Villepinte",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.eurosatory.com/",
    categories: ["security", "drone-uav", "sensors"],
    topics: ["Defence", "Security", "Robotics", "EO/IR"],
    targetIndustries: ["Defence", "Border Protection", "Emergency Services"],
    priority: "B",
    status: "unconfirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Markförsvarsmässa med växande UAV- och robotikdel. Samma begränsning som DSEI: " +
      "intressanta sensorer, men inköpsvägen går via exportkontroll.",
    score: {
      supplierRelevance: 16,
      productRelevance: 13,
      enterpriseUavRelevance: 10,
      payloadRelevance: 7,
      resellerOpportunities: 7,
      serviceOpportunities: 3,
      networking: 5,
      geographicValue: 5,
    },
    statedRelevance: 70,
    costs: { travel: 300, accommodation: 700, ticket: 200, other: 250 },
    knownExhibitors: [],
    verification: "needs-review",
    source:
      "Ingen officiell källa nådd. Branschlistningar anger 19–23 juni 2028 på Paris Nord " +
      "Villepinte, men eurosatory.com har inte bekräftat det härifrån.",
    lastResearched: RESEARCHED,
    notes:
      "Datum lämnas TBC med flit: källpolicyn kräver arrangörens egen bekräftelse. Uppgivet " +
      "19–23 juni 2028 — fyll i när COGES publicerat det. Hålls vartannat år.",
  },
  {
    slug: "idex",
    name: "IDEX",
    organizer: "ADNEC Group i samarbete med Tawazun Council",
    country: "Förenade Arabemiraten",
    city: "Abu Dhabi",
    venue: "ADNEC Centre Abu Dhabi",
    startDate: "2027-01-25",
    endDate: "2027-01-29",
    dateStatus: "confirmed",
    website: "https://www.idexuae.ae/",
    categories: ["security", "drone-uav", "sensors"],
    topics: ["Defence", "Security", "Autonomous Systems"],
    targetIndustries: ["Defence", "Border Protection"],
    priority: "B",
    status: "confirmed",
    attendancePlan: "not-attending",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Bred försvarsmässa i Gulfregionen. Lägst inköpsvärde på listan för vår del — tas med " +
      "för fullständighet snarare än för att den bör besökas.",
    score: {
      supplierRelevance: 15,
      productRelevance: 13,
      enterpriseUavRelevance: 10,
      payloadRelevance: 6,
      resellerOpportunities: 7,
      serviceOpportunities: 3,
      networking: 5,
      geographicValue: 3,
    },
    statedRelevance: 65,
    costs: { travel: 750, accommodation: 800, ticket: 250, other: 350 },
    knownExhibitors: [],
    verification: "verified",
    source:
      "ADNEC Groups eget pressmeddelande och idexuae.ae — 25–29 januari 2027 på ADNEC Centre " +
      "Abu Dhabi. En fristående listning anger 21–25 februari och är felaktig.",
    lastResearched: RESEARCHED,
    notes: "Hålls vartannat år. Står som Åker inte — tas med för fullständighet.",
  },
  {
    slug: "drone-show-korea",
    name: "Drone Show Korea",
    organizer: "BEXCO",
    country: "Sydkorea",
    city: "Busan",
    venue: "BEXCO",
    startDate: "2027-02-24",
    endDate: "2027-02-26",
    dateStatus: "confirmed",
    website: "https://www.droneshowkorea.com/",
    categories: ["drone-uav", "sensors", "technology"],
    topics: ["Drone Technology", "Enterprise UAV", "Autonomous Systems"],
    targetIndustries: ["Inspection", "Infrastructure", "Public Safety"],
    priority: "B",
    status: "confirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Koreanska komponent- och sensortillverkare som varken syns i Europa eller i Shenzhen. " +
      "Alternativ sourcingväg när kinesiskt ursprung är ett problem för kunden.",
    score: {
      supplierRelevance: 15,
      productRelevance: 13,
      enterpriseUavRelevance: 10,
      payloadRelevance: 6,
      resellerOpportunities: 7,
      serviceOpportunities: 3,
      networking: 4,
      geographicValue: 4,
    },
    statedRelevance: 65,
    costs: { travel: 1000, accommodation: 600, ticket: 100, other: 350 },
    knownExhibitors: [],
    verification: "verified",
    source: "eng.droneshowkorea.com — DSK 2027, 24–26 februari 2027 på BEXCO i Busan.",
    lastResearched: RESEARCHED,
    notes: "",
  },
];

/* ─────────────────────────── Härledda värden ─────────────────────────── */

/** Råpoäng 0–95 enligt viktningen i SCORE_FACTORS. */
export function scoreRaw(score: ScoreBreakdown): number {
  return SCORE_FACTORS.reduce((sum, f) => sum + Math.min(Math.max(score[f.id] ?? 0, 0), f.max), 0);
}

/** Opportunity Score 0–100. Råpoängen skalas eftersom vikterna summerar till 95. */
export function opportunityScore(score: ScoreBreakdown): number {
  return Math.round((scoreRaw(score) / SCORE_RAW_MAX) * 100);
}

/** Total planerad kostnad per person i EUR. */
export function totalEstimatedCost(costs: EventCostEstimate): number {
  return costs.travel + costs.accommodation + costs.ticket + costs.other;
}

export function getEventBySlug(slug: string): TradeFairEvent | undefined {
  return TRADE_FAIR_EVENTS.find((e) => e.slug === slug);
}

/** Kommande event, tidigast först. Event utan datum sorteras sist. */
export function upcomingEvents(from: Date = new Date()): TradeFairEvent[] {
  const iso = from.toISOString().slice(0, 10);
  return TRADE_FAIR_EVENTS.filter(
    (e) => e.status !== "cancelled" && (e.endDate === null || e.endDate >= iso),
  ).sort(sortByDate);
}

export function sortByDate(a: TradeFairEvent, b: TradeFairEvent): number {
  if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
  if (a.startDate) return -1;
  if (b.startDate) return 1;
  return opportunityScore(b.score) - opportunityScore(a.score);
}
