import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  Antenna,
  ArrowDownToLine,
  Boxes,
  Camera,
  Flashlight,
  Package,
  Ruler,
  Satellite,
  Scan,
  ShieldAlert,
  SprayCan,
  Sprout,
  Thermometer,
} from "lucide-react";

/**
 * Payload- och sensorkategorier för den publika översiktssidan. Detta är en
 * separat, enklare kategorisering än `data/edp-payload-taxonomy.json` i
 * repo-roten (Shopify-metaobjektens sanningskälla) — de två listorna är
 * medvetet inte sammanslagna, se AGENTS.md § Gränser mot DigitalSignal.
 */
export interface PayloadCategory {
  slug: string;
  name: string;
  icon: LucideIcon;
  examples: string[];
}

export const PAYLOAD_CATEGORIES: PayloadCategory[] = [
  {
    slug: "kamera-bildbehandling",
    name: "Kamera & bildbehandling",
    icon: Camera,
    examples: ["RGB-kameror", "Gimbals", "Filmkameror", "Zoomkameror"],
  },
  {
    slug: "termisk-infrarod",
    name: "Termisk & infraröd",
    icon: Thermometer,
    examples: ["Termiska kameror", "IR-sensorer", "Radiometriska payloads"],
  },
  {
    slug: "lidar-kartlaggning",
    name: "LiDAR & kartläggning",
    icon: Scan,
    examples: ["LiDAR", "Laserskanning", "3D-mappning"],
  },
  {
    slug: "inspektion-matning",
    name: "Inspektion & mätning",
    icon: Ruler,
    examples: ["Inspektionskameror", "Mätinstrument", "NDT-sensorer"],
  },
  {
    slug: "lantmateri-positionering",
    name: "Lantmäteri & positionering",
    icon: Satellite,
    examples: ["RTK", "GNSS", "PPK", "Landmätning"],
  },
  {
    slug: "sprutning-rengoring",
    name: "Sprutning & rengöring",
    icon: SprayCan,
    examples: ["Spraysystem", "Tvättsystem", "Rengöringsmunstycken"],
  },
  {
    slug: "leverans-transport",
    name: "Leverans & transport",
    icon: Package,
    examples: ["Lastboxar", "Transportbehållare", "Leveranssystem"],
  },
  {
    slug: "lyft-bogsering",
    name: "Lyft & bogsering",
    icon: Anchor,
    examples: ["Lyftsystem", "Vinschar", "Linor", "Krokar"],
  },
  {
    slug: "slapp-utplacering",
    name: "Släpp & utplacering",
    icon: ArrowDownToLine,
    examples: ["Släppmekanismer", "Dispensrar", "Markeringssystem"],
  },
  {
    slug: "belysning",
    name: "Belysning",
    icon: Flashlight,
    examples: ["Strålkastare", "Sökljus", "Belysningssystem"],
  },
  {
    slug: "sakerhet",
    name: "Allmän säkerhet",
    icon: ShieldAlert,
    examples: ["Högtalare", "Sirener", "Söksystem", "Säkerhetspayloads"],
  },
  {
    slug: "kommunikation-rela",
    name: "Kommunikation & relä",
    icon: Antenna,
    examples: ["Kommunikationsreläer", "Radiosystem", "Nätverksbryggor"],
  },
  {
    slug: "jordbruk-miljo",
    name: "Jordbruk & miljö",
    icon: Sprout,
    examples: ["Spridare", "Sensorer", "Jord-/miljömätning"],
  },
  {
    slug: "specialpayloads",
    name: "Specialpayloads",
    icon: Boxes,
    examples: ["Industriella payloads", "Kundanpassade payloads"],
  },
];
