// Taxonomin bakom Inköp → Mässor & Events. Allt som är fasta listor — kategorier,
// prioriteter, mötesmål, kostnadsslag, checklistor — bor här så att både UI:t,
// datalagret och den framtida AI-researchen läser samma sanning.
//
// Sidan är ett inköpsverktyg, inte en eventkalender: taxonomin är därför byggd
// runt "vad kan vi köpa, av vem, och vad kostar det att åka dit".

/* ─────────────────────────── Eventkategorier ─────────────────────────── */

export type EventCategoryId =
  | "drone-uav"
  | "geospatial"
  | "sensors"
  | "industry"
  | "security"
  | "technology";

export interface EventCategory {
  id: EventCategoryId;
  label: string;
  /** Svensk beskrivning för listvyn. */
  description: string;
  /** Underkategorier — används som taggar på event och som filter. */
  topics: string[];
}

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: "drone-uav",
    label: "Drone / UAV",
    description: "Rena drönarmässor — enterprise-plattformar, kommersiell drift och autonomi.",
    topics: [
      "Enterprise UAV",
      "Commercial Drone",
      "Autonomous Systems",
      "Drone Technology",
      "Drone Operations",
    ],
  },
  {
    id: "geospatial",
    label: "Geospatial",
    description: "Mätning, kartering och reality capture — där payload- och mjukvaruleverantörerna finns.",
    topics: [
      "Surveying",
      "GIS",
      "Mapping",
      "LiDAR",
      "Photogrammetry",
      "Reality Capture",
      "Digital Twins",
    ],
  },
  {
    id: "sensors",
    label: "Sensors",
    description: "Sensor- och payloadtillverkare: LiDAR, termik, EO/IR, multispektralt, GNSS.",
    topics: [
      "LiDAR",
      "Thermal",
      "EO/IR",
      "Multispectral",
      "Hyperspectral",
      "Radar",
      "GNSS",
      "INS",
      "Gas Detection",
    ],
  },
  {
    id: "industry",
    label: "Industry",
    description: "Slutkundsmässor per bransch — visar vilka payloads och tjänster marknaden efterfrågar.",
    topics: [
      "Construction",
      "Mining",
      "Energy",
      "Utilities",
      "Infrastructure",
      "Agriculture",
      "Forestry",
      "Inspection",
    ],
  },
  {
    id: "security",
    label: "Security",
    description: "Blåljus, försvar och gränsbevakning — hög budget, långa ledtider, hård certifiering.",
    topics: [
      "Public Safety",
      "Defence",
      "Security",
      "Border Protection",
      "Emergency Services",
    ],
  },
  {
    id: "technology",
    label: "Technology",
    description: "Underliggande teknik: AI, robotik, autonomi, datorseende, uppkoppling.",
    topics: ["AI", "Robotics", "Autonomy", "Computer Vision", "3D", "IoT", "5G"],
  },
];

export const EVENT_CATEGORY_BY_ID = new Map(EVENT_CATEGORIES.map((c) => [c.id, c]));

/** Alla underkategorier, avdubblade — LiDAR finns både under Geospatial och Sensors. */
export const EVENT_TOPICS: string[] = Array.from(
  new Set(EVENT_CATEGORIES.flatMap((c) => c.topics)),
).sort((a, b) => a.localeCompare(b, "sv"));

/* ───────────────────────────── Eventprioritet ───────────────────────────── */

export type EventPriority = "A" | "B" | "C" | "D";

export interface EventPriorityDef {
  id: EventPriority;
  label: string;
  description: string;
  /** D visas inte i huvudlistan om inte användaren aktivt ber om det. */
  inDefaultList: boolean;
  badgeClass: string;
}

export const EVENT_PRIORITIES: EventPriorityDef[] = [
  {
    id: "A",
    label: "A – Must Attend",
    description: "Mycket hög relevans för EU Drone Company. Ska besökas.",
    inDefaultList: true,
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    id: "B",
    label: "B – Strong Opportunity",
    description: "Relevant men inte nödvändig varje år.",
    inDefaultList: true,
    badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  },
  {
    id: "C",
    label: "C – Monitor",
    description: "Intressant men lägre prioritet. Bevaka.",
    inDefaultList: true,
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "D",
    label: "D – Not Relevant",
    description: "Visas normalt inte i huvudlistan.",
    inDefaultList: false,
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
];

export const EVENT_PRIORITY_BY_ID = new Map(EVENT_PRIORITIES.map((p) => [p.id, p]));

/* ─────────────────────────────── Eventstatus ─────────────────────────────── */

/** Livscykel för själva mässan. Skild från vårt eget besöksbeslut. */
export type EventStatus = "confirmed" | "unconfirmed" | "cancelled" | "past";

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  confirmed: "Bekräftad",
  unconfirmed: "Obekräftad",
  cancelled: "Inställd",
  past: "Genomförd",
};

/** EU Drone Companys beslut om mässan. Driver KPI:n "Planned Visits". */
export type AttendancePlan = "planned" | "considering" | "not-attending" | "attended";

export const ATTENDANCE_PLAN_LABEL: Record<AttendancePlan, string> = {
  planned: "Planerat besök",
  considering: "Övervägs",
  "not-attending": "Åker inte",
  attended: "Besökt",
};

/** Hur säkra vi är på uppgifterna. Källpolicyn i docs/TRADE_FAIR_MODULE.md styr. */
export type VerificationStatus = "verified" | "unverified" | "needs-review";

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "Verifierad mot officiell källa",
  unverified: "Ej verifierad",
  "needs-review": "Behöver kontrolleras",
};

/* ──────────────────────── Event Opportunity Score ──────────────────────── */

export type ScoreFactorId =
  | "supplierRelevance"
  | "productRelevance"
  | "enterpriseUavRelevance"
  | "payloadRelevance"
  | "resellerOpportunities"
  | "serviceOpportunities"
  | "networking"
  | "geographicValue";

export interface ScoreFactor {
  id: ScoreFactorId;
  label: string;
  max: number;
  help: string;
}

/**
 * Viktningen är den som beställdes. Observera att de åtta vikterna summerar till
 * 95, inte 100 — se SCORE_RAW_MAX. `opportunityScore` normaliseras därför till
 * 0–100 så att kolumnen i databasen betyder det den heter. Vill man hellre ha
 * råpoängen är den kvar i `scoreRaw`.
 */
export const SCORE_FACTORS: ScoreFactor[] = [
  { id: "supplierRelevance", label: "Supplier relevance", max: 25, help: "Hur många relevanta tillverkare/leverantörer ställer ut?" },
  { id: "productRelevance", label: "Product relevance", max: 20, help: "Hur relevant är produktutbudet för vårt sortiment?" },
  { id: "enterpriseUavRelevance", label: "Enterprise UAV relevance", max: 15, help: "Hur relevant är mässan för Enterprise UAV?" },
  { id: "payloadRelevance", label: "Payload relevance", max: 10, help: "LiDAR, thermal, EO/IR, multispektralt m.m." },
  { id: "resellerOpportunities", label: "Reseller opportunities", max: 10, help: "Potential för distributörs- och återförsäljaravtal." },
  { id: "serviceOpportunities", label: "Service opportunities", max: 5, help: "Potential för servicecenter och reservdelsavtal." },
  { id: "networking", label: "Networking", max: 5, help: "Möjlighet att träffa beslutsfattare." },
  { id: "geographicValue", label: "Geographic value", max: 5, help: "Strategisk geografisk relevans." },
];

export const SCORE_RAW_MAX = SCORE_FACTORS.reduce((sum, f) => sum + f.max, 0); // 95

export type ScoreBreakdown = Record<ScoreFactorId, number>;

/* ────────────────────────── Utställarprioritet ────────────────────────── */

export type ExhibitorPriority =
  | "must-meet"
  | "high-priority"
  | "interesting"
  | "existing-supplier"
  | "competitor"
  | "research";

export interface ExhibitorPriorityDef {
  id: ExhibitorPriority;
  label: string;
  description: string;
  badgeClass: string;
}

export const EXHIBITOR_PRIORITIES: ExhibitorPriorityDef[] = [
  { id: "must-meet", label: "Must Meet", description: "Måste träffas.", badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" },
  { id: "high-priority", label: "High Priority", description: "Bör träffas.", badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  { id: "interesting", label: "Interesting", description: "Om tid finns.", badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30" },
  { id: "existing-supplier", label: "Existing Supplier", description: "Befintlig leverantör.", badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  { id: "competitor", label: "Competitor", description: "Konkurrent — bevaka, köp inte.", badgeClass: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30" },
  { id: "research", label: "Research", description: "Behöver undersökas.", badgeClass: "bg-muted text-muted-foreground border-border" },
];

export const EXHIBITOR_PRIORITY_BY_ID = new Map(EXHIBITOR_PRIORITIES.map((p) => [p.id, p]));

/** Filtren i Exhibitor Intelligence. Matchas mot utställarens taggar. */
export const EXHIBITOR_FILTERS = [
  "UAV",
  "LiDAR",
  "Thermal",
  "Mapping",
  "Survey",
  "Sensors",
  "Components",
  "Software",
  "Service",
  "Distributor",
  "OEM",
] as const;

export type ExhibitorFilter = (typeof EXHIBITOR_FILTERS)[number];

/* ──────────────────────────── Möten ──────────────────────────── */

export type MeetingStatus = "requested" | "confirmed" | "rescheduled" | "completed" | "cancelled";

export const MEETING_STATUSES: { id: MeetingStatus; label: string; badgeClass: string }[] = [
  { id: "requested", label: "Requested", badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  { id: "confirmed", label: "Confirmed", badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  { id: "rescheduled", label: "Rescheduled", badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30" },
  { id: "completed", label: "Completed", badgeClass: "bg-muted text-muted-foreground border-border" },
  { id: "cancelled", label: "Cancelled", badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" },
];

export const MEETING_STATUS_BY_ID = new Map(MEETING_STATUSES.map((s) => [s.id, s]));

export type MeetingType = "booth" | "conference-room" | "dinner" | "demo" | "walk-up";

export const MEETING_TYPE_LABEL: Record<MeetingType, string> = {
  booth: "Montermöte",
  "conference-room": "Konferensrum",
  dinner: "Middag / after fair",
  demo: "Demo / flygning",
  "walk-up": "Drop-in",
};

/** Vad vi vill ha ut av mötet. Flerval — ett möte kan ha flera mål. */
export const MEETING_OBJECTIVES = [
  "Reseller agreement",
  "Distributor agreement",
  "Service agreement",
  "Spare parts",
  "Pricing",
  "MOQ",
  "Margin",
  "OEM",
  "Private label",
  "Product sourcing",
  "New products",
  "Technical partnership",
  "EU distribution",
  "Warranty",
  "Certification",
  "CAD",
  "API",
  "Logistics",
] as const;

export type MeetingObjective = (typeof MEETING_OBJECTIVES)[number];

/* ─────────────────────── Förberedelser & inköpslista ─────────────────────── */

export interface PrepChecklistItem {
  id: string;
  label: string;
  /** Grupperar checklistan så att researchsteg inte blandas med resebokning. */
  group: "research" | "meetings" | "purchasing" | "logistics";
}

export const PREP_CHECKLIST: PrepChecklistItem[] = [
  { id: "research-exhibitors", label: "Research exhibitors", group: "research" },
  { id: "identify-target-suppliers", label: "Identify target suppliers", group: "research" },
  { id: "competitor-analysis", label: "Prepare competitor analysis", group: "research" },
  { id: "request-meetings", label: "Request meetings", group: "meetings" },
  { id: "prepare-questions", label: "Prepare questions", group: "meetings" },
  { id: "purchasing-requirements", label: "Prepare purchasing requirements", group: "purchasing" },
  { id: "product-gaps", label: "Prepare current product gaps", group: "purchasing" },
  { id: "book-travel", label: "Book travel", group: "logistics" },
  { id: "book-hotel", label: "Book hotel", group: "logistics" },
  { id: "register", label: "Register", group: "logistics" },
  { id: "business-cards", label: "Prepare business cards/contact information", group: "logistics" },
];

export const PREP_GROUP_LABEL: Record<PrepChecklistItem["group"], string> = {
  research: "Research",
  meetings: "Möten",
  purchasing: "Inköp",
  logistics: "Resa & registrering",
};

/** Startvärden för Purchasing Wishlist — vad EU Drone Company saknar i sortimentet. */
export const WISHLIST_SUGGESTIONS = [
  "Enterprise LiDAR",
  "Thermal payload",
  "RTK module",
  "Heavy-lift drone",
  "Drone batteries",
  "Propellers",
  "Gimbals",
  "Drone docks",
] as const;

export type WishlistPriority = "must-source" | "should-source" | "nice-to-have";

export const WISHLIST_PRIORITY_LABEL: Record<WishlistPriority, string> = {
  "must-source": "Måste hittas",
  "should-source": "Bör hittas",
  "nice-to-have": "Bra att ha",
};

/* ──────────────────────────── Kostnader & ROI ──────────────────────────── */

export type CostType = "ticket" | "travel" | "hotel" | "food" | "local-transport" | "other";

export const COST_TYPES: { id: CostType; label: string }[] = [
  { id: "ticket", label: "Biljett" },
  { id: "travel", label: "Resa" },
  { id: "hotel", label: "Hotell" },
  { id: "food", label: "Mat" },
  { id: "local-transport", label: "Lokala transporter" },
  { id: "other", label: "Övrigt" },
];

export const COST_TYPE_LABEL = Object.fromEntries(COST_TYPES.map((c) => [c.id, c.label])) as Record<CostType, string>;

/* ─────────────────────────── Uppföljningar ─────────────────────────── */

export type FollowUpStatus = "open" | "in-progress" | "done" | "dropped";

export const FOLLOWUP_STATUS_LABEL: Record<FollowUpStatus, string> = {
  open: "Öppen",
  "in-progress": "Pågår",
  done: "Klar",
  dropped: "Avskriven",
};

/** Notifieringsschema. Arkitekturen finns; utskicket byggs i fas 3. */
export const NOTIFICATION_OFFSETS_BEFORE_DAYS = [30, 14, 7, 1] as const;
export const NOTIFICATION_OFFSETS_AFTER_DAYS = [1, 7, 14, 30] as const;

/* ───────────────────────── Källpolicy ───────────────────────── */

/** Prioritetsordning för research. Lägre index = starkare källa. */
export const SOURCE_PRIORITY = [
  "Official event website",
  "Official exhibitor directory",
  "Official conference program",
  "Official organizer",
  "Reliable industry source",
] as const;

export type SourceTier = (typeof SOURCE_PRIORITY)[number];
