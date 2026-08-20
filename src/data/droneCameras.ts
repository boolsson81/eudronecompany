/**
 * Enterprise drone camera / payload catalog for side-by-side comparisons.
 * Specs sourced from DJI Zenmuse product documentation.
 */

export type DroneCameraCategory = "inspection" | "mapping" | "thermal" | "cinema" | "compact" | "multispectral";

export interface DroneCameraSpec {
  label: string;
  value: string;
}

export interface DroneCamera {
  id: string;
  name: string;
  shortDesc: string;
  category: DroneCameraCategory;
  badge?: string;
  imageUrl?: string;
  shopUrl?: string;
  /** EuroDroneParts collection or product link */
  edpUrl?: string;
  specs: DroneCameraSpec[];
}

export const CAMERA_CATEGORIES: Record<DroneCameraCategory, { label: string; emoji: string }> = {
  inspection: { label: "Inspektion & zoom", emoji: "🔍" },
  thermal: { label: "Termisk & hybrid", emoji: "🌡️" },
  mapping: { label: "Kartläggning & LiDAR", emoji: "🗺️" },
  cinema: { label: "Film & foto", emoji: "🎬" },
  compact: { label: "Kompakta enterprise", emoji: "🚁" },
  multispectral: { label: "Multispektral", emoji: "🌾" },
};

/** Shared spec row order for comparison tables */
export const COMPARISON_SPEC_LABELS = [
  "Typ",
  "Användningsområde",
  "Vidvinkelssensor",
  "Zoomsensor",
  "Optisk zoom",
  "Termisk sensor",
  "Laser-avståndsmätare",
  "LiDAR",
  "Max upplösning",
  "Vikt",
  "Kompatibla plattformar",
] as const;

export const DRONE_CAMERAS: DroneCamera[] = [
  {
    id: "zenmuse-h30t",
    name: "Zenmuse H30T",
    shortDesc: "DJI:s mest avancerade hybridpayload med termisk sensor, 40× zoom och laser-avståndsmätare.",
    category: "thermal",
    badge: "Ny",
    shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30t-dronarkamera",
    edpUrl: "/collections/zenmuse-h30",
    specs: [
      { label: "Typ", value: "Hybrid multi-sensor (vidvinkel + zoom + termisk + LRF)" },
      { label: "Användningsområde", value: "Inspektion, säkerhet, räddning, energi" },
      { label: "Vidvinkelssensor", value: "1/1,8\" CMOS, 48 MP" },
      { label: "Zoomsensor", value: "1/1,5\" CMOS, 48 MP" },
      { label: "Optisk zoom", value: "40× optisk (upp till 200× hybrid)" },
      { label: "Termisk sensor", value: "1280×1024 @ 30 Hz, radiometrisk" },
      { label: "Laser-avståndsmätare", value: "3–3000 m" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "48 MP (foto)" },
      { label: "Vikt", value: "ca 920 g" },
      { label: "Kompatibla plattformar", value: "Matrice 300/350/400 RTK" },
    ],
  },
  {
    id: "zenmuse-h30",
    name: "Zenmuse H30",
    shortDesc: "Avancerad hybridpayload med 40× optisk zoom och laser-avståndsmätare — utan termisk sensor.",
    category: "inspection",
    badge: "Ny",
    shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30-dronarkamera",
    edpUrl: "/collections/zenmuse-h30",
    specs: [
      { label: "Typ", value: "Hybrid multi-sensor (vidvinkel + zoom + LRF)" },
      { label: "Användningsområde", value: "Inspektion, kartläggning, säkerhet" },
      { label: "Vidvinkelssensor", value: "1/1,8\" CMOS, 48 MP" },
      { label: "Zoomsensor", value: "1/1,5\" CMOS, 48 MP" },
      { label: "Optisk zoom", value: "40× optisk (upp till 200× hybrid)" },
      { label: "Termisk sensor", value: "—" },
      { label: "Laser-avståndsmätare", value: "3–3000 m" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "48 MP (foto)" },
      { label: "Vikt", value: "ca 860 g" },
      { label: "Kompatibla plattformar", value: "Matrice 300/350/400 RTK" },
    ],
  },
  {
    id: "zenmuse-h20t",
    name: "Zenmuse H20T",
    shortDesc: "Etablerad quad-sensor med termisk kamera, 23× zoom och laser-avståndsmätare.",
    category: "thermal",
    shopUrl: "https://actionking.se/search?q=zenmuse+h20t",
    edpUrl: "/collections/enterprise-sensors",
    specs: [
      { label: "Typ", value: "Quad-sensor (vidvinkel + zoom + termisk + LRF)" },
      { label: "Användningsområde", value: "Inspektion, energi, säkerhet" },
      { label: "Vidvinkelssensor", value: "1/2,3\" CMOS, 12 MP" },
      { label: "Zoomsensor", value: "1/1,7\" CMOS, 20 MP" },
      { label: "Optisk zoom", value: "23× optisk (upp till 200× hybrid)" },
      { label: "Termisk sensor", value: "640×512 @ 30 Hz, radiometrisk" },
      { label: "Laser-avståndsmätare", value: "3–1200 m" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "20 MP (foto)" },
      { label: "Vikt", value: "ca 828 g" },
      { label: "Kompatibla plattformar", value: "Matrice 300/350 RTK" },
    ],
  },
  {
    id: "zenmuse-h20n",
    name: "Zenmuse H20N",
    shortDesc: "Nattseende-hybrid med starlight-sensor, termisk kamera och zoom — optimerad för mörker.",
    category: "thermal",
    shopUrl: "https://actionking.se/search?q=zenmuse+h20n",
    edpUrl: "/collections/enterprise-sensors",
    specs: [
      { label: "Typ", value: "Hybrid multi-sensor (starlight + zoom + termisk + LRF)" },
      { label: "Användningsområde", value: "Nattinspektion, säkerhet, räddning" },
      { label: "Vidvinkelssensor", value: "1/1,8\" CMOS starlight, 4 MP" },
      { label: "Zoomsensor", value: "1/1,7\" CMOS starlight, 4 MP" },
      { label: "Optisk zoom", value: "20× optisk (upp till 128× hybrid)" },
      { label: "Termisk sensor", value: "640×512 @ 30 Hz, radiometrisk" },
      { label: "Laser-avståndsmätare", value: "3–1200 m" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "4 MP (foto)" },
      { label: "Vikt", value: "ca 878 g" },
      { label: "Kompatibla plattformar", value: "Matrice 300/350 RTK" },
    ],
  },
  {
    id: "zenmuse-p1",
    name: "Zenmuse P1",
    shortDesc: "45 MP fullformats fotogrammetrikamera med mekanisk slutare och utbytbara objektiv.",
    category: "mapping",
    badge: "Populär",
    shopUrl: "https://actionking.se/search?q=zenmuse+p1",
    edpUrl: "/collections/zenmuse-p1",
    specs: [
      { label: "Typ", value: "Fullformats fotogrammetrikamera" },
      { label: "Användningsområde", value: "Fotogrammetri, 3D-modellering, GIS" },
      { label: "Vidvinkelssensor", value: "Fullformat CMOS, 45 MP" },
      { label: "Zoomsensor", value: "—" },
      { label: "Optisk zoom", value: "—" },
      { label: "Termisk sensor", value: "—" },
      { label: "Laser-avståndsmätare", value: "—" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "45 MP (foto)" },
      { label: "Vikt", value: "ca 800 g (kamera)" },
      { label: "Kompatibla plattformar", value: "Matrice 300/350 RTK" },
    ],
  },
  {
    id: "zenmuse-l2",
    name: "Zenmuse L2",
    shortDesc: "Integrerad LiDAR-sensor med RGB-kamera för högprecisionskartläggning och punktmoln.",
    category: "mapping",
    badge: "Populär",
    shopUrl: "https://actionking.se/search?q=zenmuse+l2",
    edpUrl: "/collections/zenmuse-l2",
    specs: [
      { label: "Typ", value: "LiDAR + RGB-kamera" },
      { label: "Användningsområde", value: "LiDAR-kartläggning, skog, infrastruktur" },
      { label: "Vidvinkelssensor", value: "4/3\" CMOS RGB, 20 MP" },
      { label: "Zoomsensor", value: "—" },
      { label: "Optisk zoom", value: "—" },
      { label: "Termisk sensor", value: "—" },
      { label: "Laser-avståndsmätare", value: "—" },
      { label: "LiDAR", value: "5 returer, 250 m räckvidd, 240 000 pts/s" },
      { label: "Max upplösning", value: "20 MP (RGB-foto)" },
      { label: "Vikt", value: "ca 905 g" },
      { label: "Kompatibla plattformar", value: "Matrice 300/350 RTK" },
    ],
  },
  {
    id: "zenmuse-h20",
    name: "Zenmuse H20",
    shortDesc: "Quad-sensor med vidvinkel, zoom och laser-avståndsmätare — utan termisk sensor.",
    category: "inspection",
    edpUrl: "/collections/enterprise-sensors",
    specs: [
      { label: "Typ", value: "Quad-sensor (vidvinkel + zoom + LRF)" },
      { label: "Användningsområde", value: "Visuell inspektion, kartläggning" },
      { label: "Vidvinkelssensor", value: "1/2,3\" CMOS, 12 MP" },
      { label: "Zoomsensor", value: "1/1,7\" CMOS, 20 MP" },
      { label: "Optisk zoom", value: "23× optisk (upp till 200× hybrid)" },
      { label: "Termisk sensor", value: "—" },
      { label: "Laser-avståndsmätare", value: "3–1200 m" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "20 MP (foto)" },
      { label: "Vikt", value: "ca 747 g" },
      { label: "Kompatibla plattformar", value: "Matrice 300/350 RTK" },
    ],
  },
  {
    id: "zenmuse-l1",
    name: "Zenmuse L1",
    shortDesc: "DJI:s första integrerade LiDAR-payload med RGB-kamera för luftburen kartläggning.",
    category: "mapping",
    edpUrl: "/collections/enterprise-sensors",
    specs: [
      { label: "Typ", value: "LiDAR + RGB-kamera" },
      { label: "Användningsområde", value: "LiDAR-kartläggning, grundläggande punktmoln" },
      { label: "Vidvinkelssensor", value: "1\" CMOS RGB, 20 MP" },
      { label: "Zoomsensor", value: "—" },
      { label: "Optisk zoom", value: "—" },
      { label: "Termisk sensor", value: "—" },
      { label: "Laser-avståndsmätare", value: "—" },
      { label: "LiDAR", value: "1 retur, 240 m räckvidd, 240 000 pts/s" },
      { label: "Max upplösning", value: "20 MP (RGB-foto)" },
      { label: "Vikt", value: "ca 930 g" },
      { label: "Kompatibla plattformar", value: "Matrice 300/350 RTK" },
    ],
  },
  {
    id: "zenmuse-l3",
    name: "Zenmuse L3",
    shortDesc: "Nästa generations LiDAR med 950 m räckvidd, 16 returer och dubbla 100 MP-kameror.",
    category: "mapping",
    badge: "Ny",
    edpUrl: "/collections/zenmuse-l2",
    specs: [
      { label: "Typ", value: "LiDAR + dubbla RGB-kameror" },
      { label: "Användningsområde", value: "Storskalig LiDAR-kartläggning, infrastruktur" },
      { label: "Vidvinkelssensor", value: "Dubbla 4/3\" CMOS, 100 MP vardera" },
      { label: "Zoomsensor", value: "—" },
      { label: "Optisk zoom", value: "—" },
      { label: "Termisk sensor", value: "—" },
      { label: "Laser-avståndsmätare", value: "—" },
      { label: "LiDAR", value: "Upp till 16 returer, 950 m räckvidd, 2 MHz puls" },
      { label: "Max upplösning", value: "100 MP (RGB-foto)" },
      { label: "Vikt", value: "ca 1 600 g" },
      { label: "Kompatibla plattformar", value: "Matrice 400 RTK" },
    ],
  },
  {
    id: "mavic-3e",
    name: "DJI Mavic 3 Enterprise",
    shortDesc: "Kompakt enterprise-drönare med 4/3\"-sensor, mekanisk slutare och 56× zoom — idealisk för fotogrammetri.",
    category: "compact",
    badge: "Populär",
    edpUrl: "/collections/enterprise-drones",
    specs: [
      { label: "Typ", value: "Integrerad enterprise-kamera (ej utbytbar payload)" },
      { label: "Användningsområde", value: "Snabbinspektion, fotogrammetri, kartläggning" },
      { label: "Vidvinkelssensor", value: "4/3\" CMOS, 20 MP, mekanisk slutare" },
      { label: "Zoomsensor", value: "1/2\" CMOS tele, 12 MP" },
      { label: "Optisk zoom", value: "56× hybrid (7× optisk tele)" },
      { label: "Termisk sensor", value: "—" },
      { label: "Laser-avståndsmätare", value: "—" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "20 MP (foto)" },
      { label: "Vikt", value: "ca 915 g (hel drönare)" },
      { label: "Kompatibla plattformar", value: "Integrerad (fristående drönare)" },
    ],
  },
  {
    id: "mavic-3t",
    name: "DJI Mavic 3T",
    shortDesc: "Kompakt enterprise-drönare med termisk sensor (640×512), zoom och snabb utryckning.",
    category: "compact",
    edpUrl: "/collections/enterprise-drones",
    specs: [
      { label: "Typ", value: "Integrerad enterprise-kamera med termisk sensor" },
      { label: "Användningsområde", value: "Termisk inspektion, räddning, säkerhet" },
      { label: "Vidvinkelssensor", value: "1/2\" CMOS, 48 MP" },
      { label: "Zoomsensor", value: "1/2\" CMOS tele, 12 MP" },
      { label: "Optisk zoom", value: "56× hybrid (7× optisk tele)" },
      { label: "Termisk sensor", value: "640×512 @ 30 Hz, radiometrisk" },
      { label: "Laser-avståndsmätare", value: "—" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "48 MP (vidvinkel)" },
      { label: "Vikt", value: "ca 920 g (hel drönare)" },
      { label: "Kompatibla plattformar", value: "Integrerad (fristående drönare)" },
    ],
  },
  {
    id: "mavic-3m",
    name: "DJI Mavic 3 Multispectral",
    shortDesc: "Enterprise-drönare med RGB- och multispektral sensor för precisionsjordbruk och NDVI-analys.",
    category: "multispectral",
    edpUrl: "/collections/enterprise-drones",
    specs: [
      { label: "Typ", value: "Integrerad RGB + multispektral kamera" },
      { label: "Användningsområde", value: "Precisionsjordbruk, NDVI, växtstress" },
      { label: "Vidvinkelssensor", value: "4/3\" CMOS RGB, 20 MP, mekanisk slutare" },
      { label: "Zoomsensor", value: "—" },
      { label: "Optisk zoom", value: "—" },
      { label: "Termisk sensor", value: "—" },
      { label: "Laser-avståndsmätare", value: "—" },
      { label: "LiDAR", value: "—" },
      { label: "Max upplösning", value: "20 MP (RGB) + 4× 5 MP multispektral" },
      { label: "Vikt", value: "ca 951 g (hel drönare)" },
      { label: "Kompatibla plattformar", value: "Integrerad (fristående drönare)" },
    ],
  },
];

export const COMPARISON_PRESETS: { id: string; label: string; description: string; cameraIds: string[] }[] = [
  {
    id: "inspection",
    label: "Inspektionskameror",
    description: "Jämför hybrid-zoompayloads för inspektion och säkerhet.",
    cameraIds: ["zenmuse-h30t", "zenmuse-h30", "zenmuse-h20t"],
  },
  {
    id: "thermal",
    label: "Termiska kameror",
    description: "Jämför termiska sensorer och nattseende-funktioner.",
    cameraIds: ["zenmuse-h30t", "zenmuse-h20t", "zenmuse-h20n"],
  },
  {
    id: "mapping",
    label: "Kartläggningskameror",
    description: "Jämför fotogrammetri och LiDAR för GIS och mätning.",
    cameraIds: ["zenmuse-p1", "zenmuse-l2", "zenmuse-l3"],
  },
  {
    id: "compact",
    label: "Kompakta enterprise",
    description: "Jämför integrerade kameror i Mavic 3 Enterprise-serien.",
    cameraIds: ["mavic-3e", "mavic-3t", "mavic-3m"],
  },
  {
    id: "lidar",
    label: "LiDAR-sensorer",
    description: "Jämför Zenmuse LiDAR-payloads mellan generationer.",
    cameraIds: ["zenmuse-l1", "zenmuse-l2", "zenmuse-l3"],
  },
  {
    id: "all",
    label: "Alla kameror",
    description: "Fullständig översikt av Zenmuse-kameror och sensorer.",
    cameraIds: DRONE_CAMERAS.map((c) => c.id),
  },
];

export function getCameraById(id: string): DroneCamera | undefined {
  return DRONE_CAMERAS.find((c) => c.id === id);
}

export function getCamerasByIds(ids: string[]): DroneCamera[] {
  return ids.map(getCameraById).filter((c): c is DroneCamera => c !== undefined);
}

export function getSpecValue(camera: DroneCamera, label: string): string {
  return camera.specs.find((s) => s.label === label)?.value ?? "—";
}
