/**
 * Tillbehör och konfigurationsråd per bransch.
 *
 * Paketen ligger inte här längre — de bor i `enterprisePackages.ts` eftersom
 * varje paket har en egen landningssida. Hämta dem med
 * `getPackagesForIndustry(config.slug)`.
 */
import type { LucideIcon } from "lucide-react";
import { Building2, TreePine, Map, Eye, Zap, Camera, Battery, Thermometer, Radar, HardDrive, Antenna, Wind, Droplets, SunMedium, Glasses, BriefcaseMedical, Box, Shield } from "lucide-react";

export interface AccessoryItem {
  name: string;
  description: string;
  why: string; // why it's needed for this industry
  icon: LucideIcon;
}

export interface IndustryConfig {
  slug: string;
  industrySlug: string;
  title: string;
  icon: LucideIcon;
  description: string;
  accessories: AccessoryItem[];
  seoTitle: string;
  seoDesc: string;
}

export const INDUSTRY_CONFIGS: IndustryConfig[] = [
  {
    slug: "inspektion",
    industrySlug: "inspektion",
    title: "Inspektion & Underhåll",
    icon: Building2,
    description: "Rätt konfiguration för professionell inspektion sparar tid och ger bättre data. Här är våra rekommenderade paket och tillbehör för tak-, fasad-, vindkraft- och solpanelsinspektioner.",
    accessories: [
      { name: "Zenmuse H20T", description: "Termisk + visuell + zoom + laser-avståndsmätare i ett gimbal-system.", why: "Essentiell för att identifiera värmeläckor, fuktskador och dolda defekter i tak och fasader.", icon: Thermometer },
      { name: "DJI D-RTK 2 Basstation", description: "Centimeterprecision i realtid utan SWEPOS-abonnemang.", why: "Kritiskt för att kunna återbesöka exakt samma positioner och jämföra inspektioner över tid.", icon: Antenna },
      { name: "Extra batterier (TB65)", description: "Intelligent batterier med värmesystem för M350 RTK.", why: "Mer flygtid = fler inspektioner per dag utan avbrott för laddning.", icon: Battery },
      { name: "DJI FlightHub 2", description: "Molnbaserad flyghanteringsplattform med livestreaming och loggning.", why: "Centraliserad övervakning och dokumentation av alla inspektionsflygningar.", icon: Radar },
      { name: "Transportlåda IP67", description: "Stöt- och vattentålig väska för säker transport.", why: "Skyddar utrustningen vid transport till inspektionsplatser i alla väder.", icon: Box },
      { name: "Pix4Dinspect", description: "Mjukvara för automatiserad inspektionsanalys och rapportgenerering.", why: "Automatiserar rapportering och gör det enkelt att dela resultat med kunder.", icon: HardDrive },
    ],
    seoTitle: "Drönarkonfiguration för Inspektion — Paket & Tillbehör | EU Drone Company",
    seoDesc: "Kompletta konfigurationspaket för drönarinspektion. Termisk kamera, RTK och tillbehör. Begär offert från EU Drone Company.",
  },
  {
    slug: "lantbruk",
    industrySlug: "lantbruk",
    title: "Lantbruk & Precision",
    icon: TreePine,
    description: "Maximera ditt lantbruks effektivitet med rätt drönarkonfiguration. Från precisionssprutning till multispektral kartläggning — vi rekommenderar paket anpassade för svenska förhållanden.",
    accessories: [
      { name: "Spridningspaket (granulat)", description: "Omvandlar T50 till granulat- och fröspridare med 50 kg kapacitet.", why: "Möjliggör gödslings- och utsädesspridning utan markpackning.", icon: Droplets },
      { name: "RTK-basstation", description: "D-RTK 2 eller SWEPOS-anslutning för centimeterprecision.", why: "Nödvändigt för exakt sprutmönster och kartläggning med minimal överlappning.", icon: Antenna },
      { name: "Extra batterier", description: "Intelligent batterier anpassade för T50 och Mavic 3M.", why: "Långa arbetsdagar kräver fler batterier — räkna med 6-8 st för en hel arbetsdag.", icon: Battery },
      { name: "DJI SmartFarm Platform", description: "Molnplattform för fältplanering, karthantering och sprutningsloggning.", why: "Central hantering av alla fält, behandlingar och drönardata.", icon: HardDrive },
      { name: "Väderstationskit", description: "Portabel väderstation med vind-, temperatur- och fuktighetsmätning.", why: "Avgörande för att veta om sprutningsvillkoren är godkända (vindstyrka, temperatur).", icon: Wind },
      { name: "Solskydd & markör-set", description: "GCP-markörer och skärm för utomhusanvändning.", why: "Solskydd för kontrollenheten och markpunkter för exakt kartläggning.", icon: SunMedium },
    ],
    seoTitle: "Drönarkonfiguration för Lantbruk — Paket & Tillbehör | EU Drone Company",
    seoDesc: "Kompletta konfigurationspaket för lantbruksdrönare. Sprutning, kartläggning och tillbehör. Begär offert från EU Drone Company.",
  },
  {
    slug: "kartlaggning",
    industrySlug: "kartlaggning",
    title: "Kartläggning & Mätning",
    icon: Map,
    description: "Exakta 3D-modeller, ortomosaiker och volymberäkningar kräver rätt kombination av drönare, sensorer och mjukvara. Här är våra rekommenderade konfigurationer.",
    accessories: [
      { name: "Zenmuse P1", description: "45MP full-frame kamera med mekanisk slutare för fotogrammetri.", why: "Branschstandard för fotogrammetrisk kartläggning med maximal noggrannhet.", icon: Camera },
      { name: "Zenmuse L2", description: "LiDAR-sensor med integrerad kamera för punktmolnsgenerering.", why: "Penetrerar vegetation — perfekt för skogskartläggning och terrängmodeller.", icon: Radar },
      { name: "DJI D-RTK 2", description: "RTK-basstation för centimeterprecision utan SWEPOS.", why: "Nödvändigt för mätningskvalitet som uppfyller branschkrav.", icon: Antenna },
      { name: "GCP-markörer", description: "Ground Control Points i reflekterande material.", why: "Förbättrar absolut noggrannhet i fotogrammetriska modeller.", icon: Box },
      { name: "DJI Terra", description: "Mjukvara för ortomosaikgenerering, 3D-modeller och volymberäkning.", why: "Komplett bearbetningskedja från drönarbilder till leveransfärdiga modeller.", icon: HardDrive },
      { name: "Extra batterier (TB65)", description: "Intelligent batterier med värmesystem.", why: "Kartläggning av stora ytor kräver lång flygtid — extra batterier är ett måste.", icon: Battery },
    ],
    seoTitle: "Drönarkonfiguration för Kartläggning — Paket & Tillbehör | EU Drone Company",
    seoDesc: "Kompletta konfigurationspaket för drönarkartläggning. LiDAR, fotogrammetri och tillbehör. Begär offert från EU Drone Company.",
  },
  {
    slug: "sakerhet",
    industrySlug: "sakerhet",
    title: "Säkerhet & Övervakning",
    icon: Eye,
    description: "Drönare för säkerhet och övervakning kräver termisk kamera, spotlight och lång flygtid. Rätt tillbehör gör skillnad vid snabba insatser och nattetid.",
    accessories: [
      { name: "DJI Spotlight", description: "Kraftfull spotlight som monteras på Mavic 3 Enterprise.", why: "Nödvändigt vid nattliga insatser och eftersökning i mörker.", icon: SunMedium },
      { name: "DJI Speaker", description: "Högtalare med mikrofon för tvåvägskommunikation.", why: "Möjliggör varningar och kommunikation på avstånd vid insatser.", icon: Wind },
      { name: "Zenmuse H20T", description: "Termisk + visuell + zoom + laser-avståndsmätare.", why: "Identifiera personer och fordon på långt avstånd, dag som natt.", icon: Thermometer },
      { name: "DJI Dock 2", description: "Automatiserad dockningsstation för obemannad operation.", why: "Möjliggör schemalagda bevakningsflygningar utan pilot.", icon: Box },
      { name: "DJI FlightHub 2", description: "Centraliserad flyghantering med livestreaming och larmhantering.", why: "Kontrollcentral för alla drönaroperationer med realtidsvideo.", icon: Radar },
      { name: "Nattflygnings-kit", description: "Anti-kollisionsljus och stroboskop enligt EASA-krav.", why: "Obligatoriskt vid flygning under mörker och skymning.", icon: Glasses },
    ],
    seoTitle: "Drönarkonfiguration för Säkerhet — Paket & Tillbehör | EU Drone Company",
    seoDesc: "Kompletta säkerhetspaket med drönare. Termisk kamera, spotlight och dockningslösningar. Begär offert från EU Drone Company.",
  },
  {
    slug: "energi",
    industrySlug: "energi",
    title: "Energi & Elnät",
    icon: Zap,
    description: "Inspektion av kraftledningar och energiinfrastruktur kräver specialiserad utrustning. Rätt konfiguration med termisk kamera och zoom sparar driftstopp och minskar risker.",
    accessories: [
      { name: "Zenmuse H20T", description: "Fyra sensorer i ett: termisk, zoom (200×), vidvinkel och LRF.", why: "Identifiera hotspots i transformatorer och isolatorskador på avstånd.", icon: Thermometer },
      { name: "Zenmuse L2", description: "LiDAR-sensor med RGB-kamera.", why: "Mät vegetationsavstånd till kraftledningar — kritiskt för underhåll av ledningsgator.", icon: Radar },
      { name: "EMI-skärmning", description: "Elektromagnetisk skärmning för drönare vid högsänning.", why: "Skyddar drönarelektronik vid flygning nära högspänningsledningar.", icon: Shield },
      { name: "DJI FlightHub 2", description: "Molnbaserad operationsplattform.", why: "Planera inspektionsrutter och dela resultat med fältteam i realtid.", icon: HardDrive },
      { name: "Nattflygnings-kit", description: "Positionsljus och stroboskop.", why: "Möjliggör inspektion under tidiga morgnar och sena kvällar.", icon: SunMedium },
      { name: "Extra batterier (TB65)", description: "Kraftfulla batterier med värmesystem.", why: "Ledningsinspektion kräver lång flygtid — planera för 6+ batterier per dag.", icon: Battery },
    ],
    seoTitle: "Drönarkonfiguration för Energi & Elnät — Paket & Tillbehör | EU Drone Company",
    seoDesc: "Konfigurationspaket för drönarinspektion av elnät och energi. Termisk, LiDAR och tillbehör. Begär offert från EU Drone Company.",
  },
  {
    slug: "film-media",
    industrySlug: "film-media",
    title: "Film & Media",
    icon: Camera,
    description: "Professionell filmproduktion kräver rätt objektiv, ND-filter och tillbehör. Här är våra rekommenderade konfigurationer för allt från fastighetsfoto till storproduktioner.",
    accessories: [
      { name: "DL-objektiv (24/35/50mm)", description: "Utbytbara objektiv med fullformatsensor för DJI Inspire 3.", why: "Olika brännvidder ger kreativ frihet och cinematisk look.", icon: Camera },
      { name: "ND-filterkit (Cine-grade)", description: "Professionella ND-filter för att kontrollera slutartid i starkt ljus.", why: "Essentiellt för att behålla 180°-regeln och naturlig rörelseoskärpa.", icon: Glasses },
      { name: "DJI RC Motion 2", description: "FPV-kontroll för intuitiv kamerastyrning.", why: "Möjliggör dynamiska kamerarörelser och intuitiv FPV-flygning.", icon: Radar },
      { name: "Extern monitor (7\" HDR)", description: "Fältmonitor med HDR för exakt färgbedömning.", why: "Regissör och fotograf behöver se bilden i hög kvalitet under flygning.", icon: HardDrive },
      { name: "Extra batterier (TB51)", description: "Intelligent batterier för Inspire 3.", why: "Filmproduktion kräver många tagningar — planera för minst 6 batterier.", icon: Battery },
      { name: "Medicinsk nödväska", description: "Första hjälpen-kit för fältarbete.", why: "Säkerhetskrav vid professionella filmproduktioner med drönare.", icon: BriefcaseMedical },
    ],
    seoTitle: "Drönarkonfiguration för Film & Media — Paket & Tillbehör | EU Drone Company",
    seoDesc: "Konfigurationspaket för drönarfilm. Inspire 3, Mavic 3 Pro, objektiv och tillbehör. Begär offert från EU Drone Company.",
  },
];

export function getConfigBySlug(slug: string): IndustryConfig | undefined {
  return INDUSTRY_CONFIGS.find((c) => c.slug === slug);
}
