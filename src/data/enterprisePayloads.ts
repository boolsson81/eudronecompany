import zenmuseS1Img from "@/assets/dji-zenmuse-s1.png";
import zenmuseV1Img from "@/assets/dji-zenmuse-v1.png";
import agrasImg from "@/assets/dji-agras-t50.jpg";

/**
 * Icke-kamera-payloads: sprutning/spridning, belysning/ljud, positionering
 * och specialbyggda system som tvätt/spol. Kameror och sensorer (hybrid,
 * termisk, LiDAR, fotogrammetri) ligger kvar i `enterpriseCameraProducts.ts`
 * och listas separat på /kommersiella-dronare/kameror — den här filen
 * kompletterar med payload-typerna som inte är kameror, för översiktssidan
 * på /kommersiella-dronare/payloads.
 *
 * Specsiffror här är kopierade från redan faktagranskade källor
 * (`droneAccessories.ts`, `enterpriseCameraProducts.ts`) — se
 * `scripts/__tests__/dji-spec-claims.test.ts`. Lägg inte till nya siffror
 * utan källa.
 */

export type PayloadCategory =
  | "spraying"
  | "lighting-audio"
  | "positioning"
  | "cleaning"
  | "custom";

export interface PayloadCategoryMeta {
  label: string;
  description: string;
}

export const PAYLOAD_CATEGORIES: Record<PayloadCategory, PayloadCategoryMeta> = {
  spraying: {
    label: "Sprutning & spridning",
    description: "Lantbrukspayloads för bekämpning, gödsling och utsädesspridning",
  },
  "lighting-audio": {
    label: "Belysning & ljud",
    description: "Sökljus och röstförstärkare för nattliga insatser, säkerhet och räddning",
  },
  positioning: {
    label: "Positionering & mätning",
    description: "RTK-moduler och marksstationer för centimeterprecision",
  },
  cleaning: {
    label: "Tvätt- & spolsystem",
    description: "Skräddarsydda spol- och sprutpayloads för industriell rengöring på höjd",
  },
  custom: {
    label: "Specialtillverkade payloads",
    description: "Egen konstruktion när inget färdigt fäste eller system finns",
  },
};

export interface PayloadItem {
  name: string;
  category: PayloadCategory;
  desc: string;
  badge?: string;
  shopUrl?: string;
  /** Länk till en befintlig produkt- eller kamerasida i det här repot. */
  internalUrl?: string;
  imageUrl?: string;
}

export const ENTERPRISE_PAYLOADS: PayloadItem[] = [
  // Sprutning & spridning — DJI Agras T50
  {
    name: "Agras T50 Spridartank 40L",
    category: "spraying",
    desc: "40-liters spruttank med terrängföljningssystem.",
    shopUrl: "https://actionking.se/search?q=agras+t50+tank",
    imageUrl: agrasImg,
    internalUrl: "/kommersiella-dronare/produkter/agras-t50",
  },
  {
    name: "Agras T50 Spridartank 50 kg (Granulat)",
    category: "spraying",
    desc: "50 kg kapacitet för granulat, utsäde och gödsel.",
    shopUrl: "https://actionking.se/search?q=agras+t50+spridare",
    internalUrl: "/kommersiella-dronare/produkter/agras-t50",
  },
  {
    name: "Agras T50 Laddstation",
    category: "spraying",
    desc: "Snabbladdare för Agras-batterier. Ladda 2 batterier samtidigt.",
    shopUrl: "https://actionking.se/search?q=agras+t50+laddare",
    internalUrl: "/kommersiella-dronare/produkter/agras-t50",
  },

  // Belysning & ljud — Zenmuse S1/V1 och Mavic 3E-tillbehör
  {
    name: "Zenmuse S1",
    category: "lighting-audio",
    desc: "Sökljus-payload med 10 000 lumen och belysning upp till 500 m. Perfekt för nattliga insatser och räddningsoperationer.",
    badge: "Ny",
    shopUrl: "https://www.actionking.se/products/dji-zenmuse-s1-dronarkamera",
    imageUrl: zenmuseS1Img,
    internalUrl: "/kommersiella-dronare/kameror/zenmuse-s1",
  },
  {
    name: "Zenmuse V1",
    category: "lighting-audio",
    desc: "Röstförstärkare med 129 dB och 700 m effektiv räckvidd. Idealisk för räddning, säkerhet och crowd management.",
    badge: "Ny",
    shopUrl: "https://www.actionking.se/products/dji-zenmuse-v1-kamerastabilisator",
    imageUrl: zenmuseV1Img,
    internalUrl: "/kommersiella-dronare/kameror/zenmuse-v1",
  },
  {
    name: "DJI Mavic 3E Spotlight",
    category: "lighting-audio",
    desc: "Kraftfull spotlight för nattliga insatser och sök-och-räddning.",
    shopUrl: "https://actionking.se/search?q=mavic+3+enterprise+spotlight",
  },
  {
    name: "DJI Mavic 3E Speaker",
    category: "lighting-audio",
    desc: "Hög-volyms högtalare för varningar, kommunikation och räddningsinsatser.",
    shopUrl: "https://actionking.se/search?q=mavic+3+enterprise+speaker",
  },

  // Positionering & mätning — RTK
  {
    name: "DJI D-RTK 2 Mobile Station",
    category: "positioning",
    desc: "Hög-precision GNSS-mottagare för centimeterpositionering utan nätverks-RTK.",
    shopUrl: "https://actionking.se/search?q=d-rtk+2",
  },
  {
    name: "RTK-modul (Mavic 3E)",
    category: "positioning",
    desc: "Centimeter-precision med nätverks-RTK. Snabb montering.",
    badge: "Populär",
    shopUrl: "https://actionking.se/search?q=mavic+3+enterprise+rtk",
    internalUrl: "/kommersiella-dronare/produkter/mavic-3-enterprise",
  },
  {
    name: "RTK-modul (Mavic 3M)",
    category: "positioning",
    desc: "Centimeterprecision för exakt kartläggning och NDVI-analys.",
    badge: "Rekommenderat",
    shopUrl: "https://actionking.se/search?q=mavic+3+multispectral+rtk",
    internalUrl: "/kommersiella-dronare/produkter/mavic-3-multispectral",
  },
  {
    name: "DJI Agras D-RTK 2 Marksstation",
    category: "positioning",
    desc: "RTK-basstation för centimeterprecision vid sprut- och spridningsflygningar.",
    shopUrl: "https://actionking.se/search?q=agras+d-rtk",
  },
];

export function getPayloadsByCategory(category: PayloadCategory): PayloadItem[] {
  return ENTERPRISE_PAYLOADS.filter((p) => p.category === category);
}
