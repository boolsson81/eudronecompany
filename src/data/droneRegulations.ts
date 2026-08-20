import type { LucideIcon } from "lucide-react";
import { Shield, GraduationCap, Scale, AlertTriangle, Plane, Weight, Eye, TreePine, Map, Zap, Camera, Building2 } from "lucide-react";

/* ─── EASA / Transportstyrelsen drone categories ─── */

export interface DroneCategory {
  slug: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  description: string;
  maxWeight: string;
  requiresRegistration: boolean;
  requiresInsurance: boolean;
  pilotAge: string;
  trainingRequired: string;
  examRequired: boolean;
  operationalLimitations: string[];
  allowedDrones: DroneInCategory[];
  seoTitle: string;
  seoDesc: string;
}

export interface DroneInCategory {
  name: string;
  weight: string;
  category: string;
  classLabel: string;
  notes: string;
}

export interface TrainingRequirement {
  slug: string;
  title: string;
  industrySlug: string;
  icon: LucideIcon;
  description: string;
  requiredCategory: string;
  requiredTraining: string;
  certifications: string[];
  additionalRequirements: string[];
  recommendedDrones: string[];
  seoTitle: string;
  seoDesc: string;
}

export const DRONE_CATEGORIES: DroneCategory[] = [
  {
    slug: "open-a1",
    name: "Open A1",
    subtitle: "Flygning över människor",
    icon: Plane,
    description: "Kategori A1 tillåter flygning över människor (men inte folksamlingar) med drönare under 250g eller C0/C1-klassade drönare. Kräver onlineutbildning och prov via Transportstyrelsen.",
    maxWeight: "< 250g (C0) eller < 900g (C1)",
    requiresRegistration: true,
    requiresInsurance: true,
    pilotAge: "Minst 16 år (undantag för leksaksdrönare)",
    trainingRequired: "A1/A3 onlinekurs + prov hos Transportstyrelsen",
    examRequired: true,
    operationalLimitations: [
      "Max flyghöjd 120 meter över marken",
      "Drönaren ska alltid vara inom synhåll (VLOS)",
      "Flygning över folksamlingar ej tillåten",
      "C0-drönare (< 250g) får flyga över enskilda personer",
      "C1-drönare (< 900g) får flyga nära men inte direkt över omedvetna personer",
      "Flygning i kontrollerad zon kräver tillstånd",
    ],
    allowedDrones: [
      { name: "DJI Mini 4 Pro", weight: "249g", category: "C0", classLabel: "Open A1", notes: "Kan flygas nära människor tack vare låg vikt." },
      { name: "DJI Air 3", weight: "720g", category: "C1", classLabel: "Open A1/A2", notes: "C1-märkt — kräver A1/A3-utbildning. Får flygas nära människor." },
    ],
    seoTitle: "Drönare Open A1 — Regler & Krav | ActionKing",
    seoDesc: "Allt om EASA Open A1 för drönare i Sverige. Vilka drönare, utbildning och regler som gäller. Läs mer hos ActionKing.",
  },
  {
    slug: "open-a2",
    name: "Open A2",
    subtitle: "Nära människor med medelstora drönare",
    icon: Shield,
    description: "Kategori A2 tillåter flygning nära människor (minst 30m, eller 5m i låghastighetsläge) med C2-klassade drönare upp till 4 kg. Kräver A1/A3-utbildning plus separat A2-certifikat med praktiskt prov.",
    maxWeight: "< 4 kg (C2)",
    requiresRegistration: true,
    requiresInsurance: true,
    pilotAge: "Minst 16 år",
    trainingRequired: "A1/A3-utbildning + A2-certifikat (teori + praktisk självstudier)",
    examRequired: true,
    operationalLimitations: [
      "Max flyghöjd 120 meter över marken",
      "Minst 30 meters avstånd till oberoende personer (5m i slow mode)",
      "Drönaren ska alltid vara inom synhåll (VLOS)",
      "Flygning över folksamlingar ej tillåten",
      "Flygning i kontrollerad zon kräver tillstånd",
      "Piloten ska kunna visa upp kompetensbevis",
    ],
    allowedDrones: [
      { name: "DJI Mavic 3 Enterprise", weight: "920g", category: "C2 (med tillbehör)", classLabel: "Open A2", notes: "Med termisk/RTK — kräver A2-certifikat för professionellt bruk nära människor." },
      { name: "DJI Mavic 3 Pro", weight: "958g", category: "C1/C2", classLabel: "Open A1/A2", notes: "Perfekt för film & foto. A2-certifikat rekommenderas." },
    ],
    seoTitle: "Drönare Open A2 — Certifikat & Regler | ActionKing",
    seoDesc: "Open A2 drönarkategori i Sverige. A2-certifikat, utbildningskrav och godkända drönare. Läs mer hos ActionKing.",
  },
  {
    slug: "open-a3",
    name: "Open A3",
    subtitle: "Flygning i öppna områden",
    icon: Map,
    description: "Kategori A3 gäller flygning bort från bebyggelse och folksamlingar med drönare upp till 25 kg. Det mest grundläggande kravet — onlineutbildning och prov via Transportstyrelsen räcker.",
    maxWeight: "< 25 kg (C2/C3/C4 eller privat)",
    requiresRegistration: true,
    requiresInsurance: true,
    pilotAge: "Minst 16 år",
    trainingRequired: "A1/A3 onlinekurs + prov hos Transportstyrelsen",
    examRequired: true,
    operationalLimitations: [
      "Max flyghöjd 120 meter över marken",
      "Minst 150 meters avstånd till bostads-, kommersiella och industriområden",
      "Drönaren ska alltid vara inom synhåll (VLOS)",
      "Inga oberoende personer i flygområdet",
      "Flygning i kontrollerad zon kräver tillstånd",
    ],
    allowedDrones: [
      { name: "DJI Matrice 350 RTK", weight: "6,47 kg", category: "Kräver Specific*", classLabel: "Specific / Open A3*", notes: "Över 4 kg — kräver normalt Specific-kategori. Kan flyga i A3 om långt från människor och bebyggelse." },
      { name: "DJI Agras T50", weight: "52 kg", category: "Specific", classLabel: "Specific", notes: "Tung lantbruksdrönare — kräver alltid Specific-tillstånd." },
    ],
    seoTitle: "Drönare Open A3 — Regler för Öppna Områden | ActionKing",
    seoDesc: "Open A3 regler för drönare i Sverige. Flygning i öppna områden med drönare upp till 25 kg. Läs mer hos ActionKing.",
  },
  {
    slug: "specific",
    name: "Specific",
    subtitle: "Tillståndsbaserad flygning för professionella",
    icon: Scale,
    description: "Specific-kategorin gäller operationer som inte ryms inom Open-kategorin — t.ex. flygning med tyngre drönare, BVLOS, i bebyggelse, eller nära flygplatser. Kräver riskanalys (SORA) och operativt tillstånd från Transportstyrelsen.",
    maxWeight: "Ingen övre gräns (riskbaserat)",
    requiresRegistration: true,
    requiresInsurance: true,
    pilotAge: "Enligt operatörens manual",
    trainingRequired: "STS-scenariobaserad utbildning eller fullständig SORA-riskanalys + tillstånd",
    examRequired: true,
    operationalLimitations: [
      "Kräver operativt tillstånd (OA) från Transportstyrelsen",
      "Riskanalys (SORA) krävs för icke-standardscenarier",
      "Standardscenarier (STS-01, STS-02) förenklar processen",
      "BVLOS möjligt med STS-02 eller specifikt tillstånd",
      "Operatören måste ha en drifthandbok (Operations Manual)",
      "Krav på händelserapportering till Transportstyrelsen",
    ],
    allowedDrones: [
      { name: "DJI Matrice 350 RTK", weight: "6,47 kg", category: "Specific", classLabel: "Specific", notes: "Industriell flaggskepp — vanligast inom Specific för inspektion, kartläggning och energi." },
      { name: "DJI Agras T50", weight: "52 kg", category: "Specific", classLabel: "Specific", notes: "Lantbruksdrönare — kräver Specific-tillstånd p.g.a. vikt och kemikaliehantering." },
      { name: "DJI Inspire 3", weight: "3,99 kg", category: "C2/Specific", classLabel: "Open A2 / Specific", notes: "Under 4 kg — kan flyga i Open A2, men Specific behövs för kommersiell filmning i bebyggelse." },
    ],
    seoTitle: "Specific-kategorin — Drönarttillstånd för Proffs | ActionKing",
    seoDesc: "Allt om Specific-kategorin för drönare i Sverige. SORA, tillstånd och utbildningskrav. Kontakta ActionKing.",
  },
];

export const TRAINING_REQUIREMENTS: TrainingRequirement[] = [
  {
    slug: "inspektion",
    title: "Utbildningskrav för Inspektion & Underhåll",
    industrySlug: "inspektion",
    icon: Building2,
    description: "Professionell drönarinspektion av byggnader, vindkraftverk och infrastruktur kräver ofta Specific-kategori och A2-certifikat. Här är vad du behöver.",
    requiredCategory: "Open A2 eller Specific (beroende på uppdragets natur)",
    requiredTraining: "A1/A3-utbildning + A2-certifikat. För tyngre drönare (Matrice 350 RTK) krävs Specific-tillstånd med STS-utbildning.",
    certifications: [
      "A1/A3 fjärrpilotkompetens (grundkrav)",
      "A2 fjärrpilotkompetensbevis (för arbete nära byggnader/människor)",
      "STS-01 utbildning (för Specific-scenarion i bebyggelse, VLOS)",
      "Termograficertifiering (rekommenderas för termisk inspektion)",
    ],
    additionalRequirements: [
      "Operatörsregistrering hos Transportstyrelsen",
      "Ansvarsförsäkring för drönare",
      "Drifthandbok vid Specific-kategori",
      "Riskanalys (SORA) för icke-standardscenarier",
    ],
    recommendedDrones: ["DJI Matrice 350 RTK", "DJI Mavic 3 Enterprise"],
    seoTitle: "Drönarpilot för Inspektion — Utbildning & Krav | ActionKing",
    seoDesc: "Vilken utbildning behövs för att flyga drönare för inspektion? A2-certifikat, Specific-tillstånd och mer. Läs mer hos ActionKing.",
  },
  {
    slug: "lantbruk",
    title: "Utbildningskrav för Lantbruk & Precision",
    industrySlug: "lantbruk",
    icon: TreePine,
    description: "Lantbruksdrönare som DJI Agras T50 kräver Specific-tillstånd p.g.a. vikt och kemikaliehantering. Kartläggningsdrönare kan ofta flygas i Open A3.",
    requiredCategory: "Specific (sprutdrönare) / Open A3 (kartläggning)",
    requiredTraining: "A1/A3-utbildning + STS-utbildning för Specific. Sprutdrönare kräver även kemikaliehanteringskurs.",
    certifications: [
      "A1/A3 fjärrpilotkompetens (grundkrav)",
      "STS-utbildning för Specific-kategori (sprutdrönare)",
      "Behörighet för växtskyddsmedel (Jordbruksverket)",
      "Multispektral dataanalys (rekommenderas)",
    ],
    additionalRequirements: [
      "Operatörsregistrering hos Transportstyrelsen",
      "Ansvarsförsäkring",
      "Tillstånd för spridning av växtskyddsmedel (Kemikalieinspektionen)",
      "Drifthandbok och riskanalys (SORA) för sprutning",
      "Anmälan till Jordbruksverket vid bekämpningsmedelsanvändning",
    ],
    recommendedDrones: ["DJI Agras T50", "DJI Mavic 3 Multispectral"],
    seoTitle: "Drönarpilot för Lantbruk — Utbildning & Tillstånd | ActionKing",
    seoDesc: "Utbildningskrav för lantbruksdrönare i Sverige. Specific-tillstånd, kemikaliehantering och certifiering. Läs mer hos ActionKing.",
  },
  {
    slug: "kartlaggning",
    title: "Utbildningskrav för Kartläggning & Mätning",
    industrySlug: "kartlaggning",
    icon: Map,
    description: "Professionell kartläggning kräver ofta Specific-tillstånd vid användning av tyngre drönare som Matrice 350 RTK. Lättare drönare kan användas i Open A2/A3.",
    requiredCategory: "Open A2/A3 (lättare drönare) eller Specific (Matrice 350 RTK)",
    requiredTraining: "A1/A3-utbildning + A2-certifikat (Enterprise-drönare). STS-utbildning för tyngre plattformar.",
    certifications: [
      "A1/A3 fjärrpilotkompetens",
      "A2 fjärrpilotkompetensbevis (vid arbete i bebyggelse)",
      "STS-01 utbildning (Matrice 350 RTK i bebyggelse)",
      "Fotogrammetri/GIS-utbildning (rekommenderas)",
    ],
    additionalRequirements: [
      "Operatörsregistrering",
      "Ansvarsförsäkring",
      "RTK-basstation eller SWEPOS-abonnemang",
      "Förståelse för geodetiska referenssystem (SWEREF 99)",
    ],
    recommendedDrones: ["DJI Matrice 350 RTK", "DJI Mavic 3 Enterprise"],
    seoTitle: "Drönarpilot för Kartläggning — Utbildning & Krav | ActionKing",
    seoDesc: "Utbildningskrav för drönarkartläggning i Sverige. RTK-precision, certifikat och Specific-tillstånd. Läs mer hos ActionKing.",
  },
  {
    slug: "sakerhet",
    title: "Utbildningskrav för Säkerhet & Övervakning",
    industrySlug: "sakerhet",
    icon: Eye,
    description: "Drönarbaserad säkerhet och övervakning kräver ofta Specific-tillstånd, särskilt vid flygning i bebyggelse och under mörker. BVLOS kräver ytterligare tillstånd.",
    requiredCategory: "Open A2 (enklare uppdrag) / Specific (bebyggelse, natt, BVLOS)",
    requiredTraining: "A1/A3 + A2-certifikat. STS-utbildning krävs för Specific. BVLOS kräver STS-02 eller specifikt OA-tillstånd.",
    certifications: [
      "A1/A3 fjärrpilotkompetens",
      "A2 fjärrpilotkompetensbevis",
      "STS-01 (VLOS i bebyggelse) och/eller STS-02 (BVLOS)",
      "Säkerhetsprövning (kan krävas vid myndighetssamarbete)",
    ],
    additionalRequirements: [
      "Operatörsregistrering",
      "Ansvarsförsäkring",
      "Tillstånd för kameraövervakning (enligt kamerabevakningslagen)",
      "Samordning med polis vid räddningsinsatser",
      "Nattflygningsutrustning (ljus enligt EASA-krav)",
    ],
    recommendedDrones: ["DJI Matrice 350 RTK", "DJI Mavic 3 Enterprise"],
    seoTitle: "Drönarpilot för Säkerhet — Utbildning & Tillstånd | ActionKing",
    seoDesc: "Utbildningskrav för säkerhetsdrönare. Specific-tillstånd, BVLOS och kamerabevakningslagen. Läs mer hos ActionKing.",
  },
  {
    slug: "energi",
    title: "Utbildningskrav för Energi & Elnät",
    industrySlug: "energi",
    icon: Zap,
    description: "Inspektion av kraftledningar, vindkraftverk och energiinfrastruktur kräver normalt Specific-tillstånd. Speciella säkerhetskrav gäller nära högspänning.",
    requiredCategory: "Specific (i de flesta fall)",
    requiredTraining: "A1/A3 + A2-certifikat + STS-utbildning. Specialutbildning för arbete nära högspänning rekommenderas starkt.",
    certifications: [
      "A1/A3 fjärrpilotkompetens",
      "A2 fjärrpilotkompetensbevis",
      "STS-01 utbildning (VLOS i bebyggelse)",
      "Elsäkerhetsutbildning (arbete nära högspänning)",
      "Termografiutbildning (rekommenderas)",
    ],
    additionalRequirements: [
      "Operatörsregistrering",
      "Ansvarsförsäkring",
      "Samordning med nätägare vid kraftledningsinspektion",
      "Riskanalys för elektromagnetisk interferens",
      "Säkerhetsavstånd till högspänningsledningar",
    ],
    recommendedDrones: ["DJI Matrice 350 RTK", "DJI Mavic 3 Enterprise"],
    seoTitle: "Drönarpilot för Energi — Utbildning & Säkerhet | ActionKing",
    seoDesc: "Utbildningskrav för drönarinspektion av elnät och energi. Specific-tillstånd och elsäkerhet. Läs mer hos ActionKing.",
  },
  {
    slug: "film-media",
    title: "Utbildningskrav för Film & Media",
    industrySlug: "film-media",
    icon: Camera,
    description: "Kommersiell filmproduktion med drönare i bebyggelse kräver ofta A2-certifikat eller Specific-tillstånd. Enklare flygning i öppna områden klaras med A1/A3.",
    requiredCategory: "Open A1/A2 (lättare drönare) / Specific (film i bebyggelse med tyngre drönare)",
    requiredTraining: "A1/A3-utbildning + A2-certifikat (arbete nära människor). STS-01 vid filmning i stadsmiljö med tyngre drönare.",
    certifications: [
      "A1/A3 fjärrpilotkompetens",
      "A2 fjärrpilotkompetensbevis (filmning nära människor)",
      "STS-01 (Specific VLOS i bebyggelse, t.ex. Inspire 3)",
    ],
    additionalRequirements: [
      "Operatörsregistrering",
      "Ansvarsförsäkring",
      "Filmtillstånd vid offentliga platser (kommun)",
      "Samordning med polis vid stängda inspelningsområden",
      "GDPR-hänsyn vid filmning av identifierbara personer",
    ],
    recommendedDrones: ["DJI Inspire 3", "DJI Mavic 3 Pro"],
    seoTitle: "Drönarpilot för Film — Utbildning & Filmtillstånd | ActionKing",
    seoDesc: "Utbildningskrav för drönarfilm. A2-certifikat, filmtillstånd och Specific-kategori. Läs mer hos ActionKing.",
  },
];

export function getCategoryBySlug(slug: string): DroneCategory | undefined {
  return DRONE_CATEGORIES.find((c) => c.slug === slug);
}

export function getTrainingBySlug(slug: string): TrainingRequirement | undefined {
  return TRAINING_REQUIREMENTS.find((t) => t.slug === slug);
}
