/**
 * Fristående verktyg och fältutrustning för drönare — inte kopplat till en
 * specifik drönarmodell (jämför src/data/droneAccessories.ts).
 * shopUrl länkar till actionking.se, se AGENTS.md "Shoplänkarna pekar på ActionKing".
 */

export type DroneToolCategory = "underhall" | "kalibrering" | "matning" | "transport" | "falt";

export interface DroneTool {
  name: string;
  category: DroneToolCategory;
  desc: string;
  shopUrl?: string;
  /** Highlight tag, e.g. "Populär" */
  badge?: string;
  imageUrl?: string;
}

export const TOOL_CATEGORIES: Record<DroneToolCategory, { label: string; description: string }> = {
  underhall: {
    label: "Underhåll & reparation",
    description: "Skruvmejselset, propellerbyte och rengöring för daglig drift.",
  },
  kalibrering: {
    label: "Kalibrering & test",
    description: "Testplattor och verktyg för sensor- och kompasskalibrering.",
  },
  matning: {
    label: "Mätning & diagnos",
    description: "Batteritestare och signalmätare för säker flygdrift.",
  },
  falt: {
    label: "Fältutrustning",
    description: "Landningsplattformar, powerbanks och belysning för uppdrag utomhus.",
  },
  transport: {
    label: "Väskor & transport",
    description: "Skyddande transport för verktyg och tillbehör mellan uppdrag.",
  },
};

export const DRONE_TOOLS: DroneTool[] = [
  {
    name: "Precisionsskruvmejselset",
    category: "underhall",
    desc: "Magnetiska bits i flera storlekar för service av propellrar, gimbal och hölje.",
    badge: "Populär",
    shopUrl: "https://actionking.se/search?q=skruvmejselset+drönare",
  },
  {
    name: "Verktyg för propellerbyte",
    category: "underhall",
    desc: "Snabbverktyg för att lossa och montera quick-release-propellrar utan att skada axeln.",
    shopUrl: "https://actionking.se/search?q=propellerverktyg+drönare",
  },
  {
    name: "Rengöringskit för optik & sensorer",
    category: "underhall",
    desc: "Mikrofiberdukar, blåspensel och rengöringsvätska anpassad för kamerlinser och gimbal.",
    shopUrl: "https://actionking.se/search?q=rengoringskit+kamera+drönare",
  },
  {
    name: "Gimbal-lås & transportskydd",
    category: "underhall",
    desc: "Skyddar gimbal och kamera mot vibrationsskador vid transport och förvaring.",
    shopUrl: "https://actionking.se/search?q=gimbal+lock+drönare",
  },
  {
    name: "Kompasskalibreringsplatta",
    category: "kalibrering",
    desc: "Markering för säker kompass- och IMU-kalibrering utan magnetiska störningar.",
    shopUrl: "https://actionking.se/search?q=kompasskalibrering+drönare",
  },
  {
    name: "ND-filterkit",
    category: "kalibrering",
    desc: "ND8/16/32/64-filter för korrekt slutartid vid filmning i starkt dagsljus.",
    badge: "Populär",
    shopUrl: "https://actionking.se/search?q=nd+filter+drönare",
  },
  {
    name: "RTK-testutrustning",
    category: "kalibrering",
    desc: "Verktyg för att verifiera RTK-fix och positioneringsnoggrannhet innan uppdrag.",
    shopUrl: "https://actionking.se/search?q=rtk+test+drönare",
  },
  {
    name: "Batteritestare & analysator",
    category: "matning",
    desc: "Mäter cellspänning, kapacitet och hälsostatus på intelligenta LiPo-batterier.",
    shopUrl: "https://actionking.se/search?q=batteritestare+drönare",
  },
  {
    name: "Signalstyrkemätare (2,4/5,8 GHz)",
    category: "matning",
    desc: "Kontrollerar länkkvalitet och stör-källor på plats innan flygning.",
    shopUrl: "https://actionking.se/search?q=signalstyrkemätare+drönare",
  },
  {
    name: "Vindmätare",
    category: "matning",
    desc: "Handhållen anemometer för att kontrollera vindförhållanden mot drönarens gränsvärden.",
    shopUrl: "https://actionking.se/search?q=vindmatare",
  },
  {
    name: "Vikbar landningsplattform",
    category: "falt",
    desc: "Skyddar mot damm, snö och lös grund vid start och landning i fält.",
    badge: "Populär",
    shopUrl: "https://actionking.se/search?q=landningsplattform+drönare",
  },
  {
    name: "Powerbank för fjärrkontroll & surfplatta",
    category: "falt",
    desc: "Snabbladdning i fält för fjärrkontroller, RC Plus och styrsurfplattor.",
    shopUrl: "https://actionking.se/search?q=powerbank+fjärrkontroll",
  },
  {
    name: "LED-arbetsbelysning",
    category: "falt",
    desc: "Batteridriven belysning för förberedelser och service vid skymning eller inomhus.",
    shopUrl: "https://actionking.se/search?q=led+arbetsbelysning",
  },
  {
    name: "Hårdväska för verktyg & tillbehör",
    category: "transport",
    desc: "IP-klassad väska med skuminredning, anpassad för service- och kalibreringsverktyg.",
    shopUrl: "https://actionking.se/search?q=verktygsvaska+drönare",
  },
  {
    name: "Batteriväska (LiPo-säker)",
    category: "transport",
    desc: "Brandsäker förvaring och transport av intelligenta flygbatterier.",
    shopUrl: "https://actionking.se/search?q=lipo+batteriväska",
  },
];

export function getToolsByCategory(category: DroneToolCategory): DroneTool[] {
  return DRONE_TOOLS.filter((tool) => tool.category === category);
}
