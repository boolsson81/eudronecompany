import {
  HardHat,
  Zap,
  Factory,
  Wheat,
  ShieldAlert,
  Truck,
  Ship,
  Mountain,
  Leaf,
  Clapperboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Branschlösningar — en bredare "efter kundens bransch"-taxonomi som
 * kompletterar de användningsområden (INDUSTRY_DATA) som redan finns i
 * commercialDroneIndustries.ts. Detta är en mall: fälten är medvetet
 * hållna enkla tills varje bransch fylls med egna lösningar, rekommenderade
 * drönare och vanliga frågor.
 */
export interface IndustrySolutionVertical {
  slug: string;
  icon: LucideIcon;
  title: string;
  titleEn: string;
  omfattar: string[];
}

export const INDUSTRY_SOLUTIONS: IndustrySolutionVertical[] = [
  {
    slug: "infrastruktur-bygg",
    icon: HardHat,
    title: "Infrastruktur & Bygg",
    titleEn: "Infrastructure & Construction",
    omfattar: ["Bygg", "Fastigheter", "Vägar", "Broar", "Tunnlar", "Anläggningar"],
  },
  {
    slug: "energi-forsorjning",
    icon: Zap,
    title: "Energi & Försörjning",
    titleEn: "Energy & Utilities",
    omfattar: ["El", "Kraft", "Vatten", "VA", "Fjärrvärme", "Vindkraft"],
  },
  {
    slug: "industri-tillverkning",
    icon: Factory,
    title: "Industri & Tillverkning",
    titleEn: "Industry & Manufacturing",
    omfattar: ["Tillverkning", "Fabriker", "Processindustri", "Kemi"],
  },
  {
    slug: "lantbruk-skogsbruk",
    icon: Wheat,
    title: "Lantbruk & Skogsbruk",
    titleEn: "Agriculture & Forestry",
    omfattar: ["Jordbruk", "Skogsbruk", "Vegetation", "Naturresurser"],
  },
  {
    slug: "sakerhet-raddning",
    icon: ShieldAlert,
    title: "Säkerhet & Räddning",
    titleEn: "Public Safety & Security",
    omfattar: ["Räddningstjänst", "Polis", "Säkerhet", "Bevakning"],
  },
  {
    slug: "logistik-transport",
    icon: Truck,
    title: "Logistik & Transport",
    titleEn: "Logistics & Transportation",
    omfattar: ["Logistik", "Lager", "Transport", "Järnväg", "Trafik"],
  },
  {
    slug: "sjofart-offshore",
    icon: Ship,
    title: "Sjöfart & Offshore",
    titleEn: "Maritime & Offshore",
    omfattar: ["Sjöfart", "Hamnar", "Offshore", "Kustnära verksamhet"],
  },
  {
    slug: "gruvdrift-ravaror",
    icon: Mountain,
    title: "Gruvdrift & Råvaror",
    titleEn: "Mining & Resources",
    omfattar: ["Gruvor", "Stenbrott", "Täkter", "Råvaruutvinning"],
  },
  {
    slug: "miljo-forskning",
    icon: Leaf,
    title: "Miljö & Forskning",
    titleEn: "Environmental & Research",
    omfattar: ["Miljöövervakning", "Natur", "Forskning", "Universitet"],
  },
  {
    slug: "media-tjanster",
    icon: Clapperboard,
    title: "Media & Tjänsteföretag",
    titleEn: "Media & Professional Services",
    omfattar: ["Film", "Foto", "Media", "Inspektion", "Serviceföretag"],
  },
];

export function getIndustrySolutionBySlug(slug: string): IndustrySolutionVertical | undefined {
  return INDUSTRY_SOLUTIONS.find((i) => i.slug === slug);
}
