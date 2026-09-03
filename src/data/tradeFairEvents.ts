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
      "mappnings- och reality capture-kedjan ställer ut på samma golv, vilket gör det till den " +
      "billigaste platsen att på tre dagar täcka av både befintliga leverantörer och nya " +
      "sourcingkandidater för enterprise-payloads.",
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
    priority: "A",
    status: "unconfirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Renodlat kommersiell UAV-mässa med tydlig inköpsvinkel: plattformar, payloads och " +
      "tjänsteleverantörer på samma ställe, i en stad som går att nå på en dag från Sverige.",
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
    verification: "needs-review",
    source:
      "2026 års upplaga hölls på RAI Amsterdam i april 2026 under namnet Commercial UAV Forum. " +
      "Nästa upplaga är inte officiellt annonserad.",
    lastResearched: RESEARCHED,
    notes:
      "Arrangören har bytt varumärke mot 'Commercial UAV Forum' för Amsterdam-upplagan. " +
      "Kontrollera både namn och datum mot arrangörens sida innan resa bokas. Datum lämnas TBC.",
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
    notes: "Lägg in datum först när RAI Amsterdam publicerat dem officiellt.",
  },
  {
    slug: "dronex-2026",
    name: "DroneX Trade Show & Conference 2026",
    organizer: "",
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
      "Arrangörens namn inte verifierat. Entré är normalt kostnadsfri för fackbesökare — " +
      "biljettkostnaden är satt till 0 och ska kontrolleras vid registrering.",
  },
  {
    slug: "dronitaly",
    name: "Dronitaly",
    organizer: "",
    country: "Italien",
    city: "Bologna",
    venue: "",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.dronitaly.it/",
    categories: ["drone-uav", "industry", "security"],
    topics: ["Commercial Drone", "Enterprise UAV", "Drone Operations"],
    targetIndustries: ["Public Safety", "Inspection", "Infrastructure", "Agriculture"],
    priority: "B",
    status: "unconfirmed",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu.",
    lastResearched: RESEARCHED,
    notes: "Arrangör, mässanläggning och datum behöver verifieras mot arrangörens sida.",
  },

  /* ─────────────────────────── PRIORITET B ─────────────────────────── */
  {
    slug: "auvsi-xponential",
    name: "AUVSI XPONENTIAL",
    organizer: "AUVSI (Association for Uncrewed Vehicle Systems International)",
    country: "USA",
    city: "",
    venue: "",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.xponential.org/",
    categories: ["drone-uav", "technology", "sensors"],
    topics: ["Autonomous Systems", "Robotics", "AI", "Enterprise UAV", "Drone Technology"],
    targetIndustries: ["Inspection", "Energy", "Infrastructure", "Public Safety"],
    priority: "B",
    status: "unconfirmed",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu. Ort växlar mellan år.",
    lastResearched: RESEARCHED,
    notes: "Stad och datum växlar årligen — verifiera mot AUVSI innan planering.",
  },
  {
    slug: "commercial-uav-expo-usa",
    name: "Commercial UAV Expo (USA)",
    organizer: "Diversified Communications",
    country: "USA",
    city: "Las Vegas",
    venue: "",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.expouav.com/",
    categories: ["drone-uav", "geospatial", "industry"],
    topics: ["Commercial Drone", "Surveying", "Mapping", "LiDAR", "Inspection"],
    targetIndustries: ["Construction", "Energy", "Utilities", "Infrastructure", "Mining"],
    priority: "B",
    status: "unconfirmed",
    attendancePlan: "considering",
    expectedExhibitors: null,
    expectedVisitors: null,
    whyRelevant:
      "Den amerikanska motsvarigheten till Amsterdam-upplagan, med bredare payloadutbud. " +
      "Värd resan bara om Europaupplagan inte täcker in de leverantörer vi jagar.",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu.",
    lastResearched: RESEARCHED,
    notes: "",
  },
  {
    slug: "drone-world-congress",
    name: "Drone World Congress",
    organizer: "",
    country: "Kina",
    city: "Shenzhen",
    venue: "",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu — officiell webbplats saknas i katalogen.",
    lastResearched: RESEARCHED,
    notes:
      "Namnet används av flera arrangörer i Shenzhen. Slå fast vilken mässa som avses innan " +
      "något planeras — annars riskerar vi att boka fel event.",
  },
  {
    slug: "paris-air-show",
    name: "Paris Air Show (SIAE)",
    organizer: "SIAE / GIFAS",
    country: "Frankrike",
    city: "Paris",
    venue: "Paris–Le Bourget",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.siae.fr/",
    categories: ["drone-uav", "security", "sensors"],
    topics: ["Autonomous Systems", "Enterprise UAV", "EO/IR", "Radar"],
    targetIndustries: ["Defence", "Infrastructure", "Emergency Services"],
    priority: "B",
    status: "unconfirmed",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu. Hålls vartannat år.",
    lastResearched: RESEARCHED,
    notes: "Går udda/jämna år växelvis med Farnborough — verifiera årgång innan planering.",
  },
  {
    slug: "dsei",
    name: "DSEI",
    organizer: "Clarion Events",
    country: "Storbritannien",
    city: "London",
    venue: "ExCeL London",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.dsei.co.uk/",
    categories: ["security", "drone-uav", "sensors"],
    topics: ["Defence", "Security", "Autonomous Systems", "EO/IR", "Radar"],
    targetIndustries: ["Defence", "Border Protection", "Public Safety"],
    priority: "B",
    status: "unconfirmed",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu. Hålls vartannat år.",
    lastResearched: RESEARCHED,
    notes: "Kräver verifierad fackbesökarregistrering — ansök i god tid.",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu. Hålls vartannat år.",
    lastResearched: RESEARCHED,
    notes: "",
  },
  {
    slug: "idex",
    name: "IDEX",
    organizer: "ADNEC Group i samarbete med Tawazun Council",
    country: "Förenade Arabemiraten",
    city: "Abu Dhabi",
    venue: "ADNEC Centre Abu Dhabi",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.idexuae.ae/",
    categories: ["security", "drone-uav", "sensors"],
    topics: ["Defence", "Security", "Autonomous Systems"],
    targetIndustries: ["Defence", "Border Protection"],
    priority: "B",
    status: "unconfirmed",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu. Hålls vartannat år.",
    lastResearched: RESEARCHED,
    notes: "",
  },
  {
    slug: "drone-show-korea",
    name: "Drone Show Korea",
    organizer: "BEXCO",
    country: "Sydkorea",
    city: "Busan",
    venue: "BEXCO",
    startDate: null,
    endDate: null,
    dateStatus: "tbc",
    website: "https://www.droneshowkorea.com/",
    categories: ["drone-uav", "sensors", "technology"],
    topics: ["Drone Technology", "Enterprise UAV", "Autonomous Systems"],
    targetIndustries: ["Inspection", "Infrastructure", "Public Safety"],
    priority: "B",
    status: "unconfirmed",
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
    verification: "unverified",
    source: "Ingen officiell källa kontrollerad ännu.",
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
