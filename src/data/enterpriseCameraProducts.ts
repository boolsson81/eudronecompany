import type { FaqItem } from "@/lib/faqJsonLd";
import zenmuseH30TImg from "@/assets/dji-zenmuse-h30t.png";
import zenmuseH30Img from "@/assets/dji-zenmuse-h30.png";
import zenmuseS1Img from "@/assets/dji-zenmuse-s1.png";
import zenmuseV1Img from "@/assets/dji-zenmuse-v1.png";

export type CameraCategory = "hybrid" | "thermal" | "lidar" | "photogrammetry" | "utility";

export const CAMERA_CATEGORIES: Record<CameraCategory, { label: string; description: string }> = {
  hybrid: { label: "Hybrid multi-sensor", description: "Zoom, vidvinkel och laser i ett gimbal-system" },
  thermal: { label: "Termisk & nattseende", description: "Radiometrisk termisk avbildning och nattoperationer" },
  lidar: { label: "LiDAR & kartläggning", description: "Punktmoln och terrängmodeller med hög noggrannhet" },
  photogrammetry: { label: "Fotogrammetri", description: "Fullformats-kameror för mätning och 3D-modellering" },
  utility: { label: "Belysning & kommunikation", description: "Sökljus, högtalare och specialpayloads" },
};

export interface CameraSpec {
  label: string;
  value: string;
}

export interface EnterpriseCameraProduct {
  slug: string;
  name: string;
  tag: string;
  category: CameraCategory;
  heroTitle: string;
  heroDesc: string;
  longDesc: string;
  features: string[];
  specs: CameraSpec[];
  applications: string[];
  compatibleDrones: string[];
  shopUrl?: string;
  imageUrl?: string;
  youtubeId?: string;
  badge?: string;
  faq: FaqItem[];
  seoTitle: string;
  seoDesc: string;
}

export const ENTERPRISE_CAMERA_PRODUCTS: EnterpriseCameraProduct[] = [
  {
    slug: "zenmuse-h30t",
    name: "Zenmuse H30T",
    tag: "Flaggskepp hybrid",
    category: "hybrid",
    heroTitle: "Zenmuse H30T — Hybrid multi-sensor med termisk kamera",
    heroDesc: "DJI:s mest avancerade enterprise-payload med bred vidvinkel, 40× optisk zoom, laser-avståndsmätare och radiometrisk termisk kamera.",
    longDesc:
      "Zenmuse H30T kombinerar fem sensorer i ett integrerat gimbal-system: bred vidvinkel, zoom, laser-avståndsmätare (LRF) och termisk kamera med upplösning 1280×1024. Perfekt för inspektion, säkerhet och räddningsinsatser där du behöver se både detaljer och värmesignaturer — dag som natt.",
    features: [
      "40× optisk zoom med Super Resolution",
      "Termisk kamera 1280×1024, radiometrisk",
      "Laser-avståndsmätare (LRF) upp till 3000 m",
      "NIR-auxiliary light för nattseende",
      "IP54-skydd mot damm och fukt",
    ],
    specs: [
      { label: "Zoom", value: "40× optisk (upp till 200× digital)" },
      { label: "Termisk", value: "1280×1024, radiometrisk" },
      { label: "Vidvinkel", value: "48 MP, 1/1,8\" CMOS" },
      { label: "LRF", value: "3–3000 m" },
      { label: "Kompatibilitet", value: "Matrice 350/300/400 RTK" },
    ],
    applications: [
      "Kraftlednings- och transformatorinspektion",
      "Sök-och-räddning med termisk detektering",
      "Säkerhetsövervakning dag och natt",
      "Infrastrukturinspektion med avståndsmätning",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK", "DJI Matrice 400"],
    shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30t-dronarkamera",
    imageUrl: zenmuseH30TImg,
    youtubeId: "fKkR6D-UGq0",
    badge: "Ny",
    faq: [
      {
        question: "Vilka drönare är Zenmuse H30T kompatibel med?",
        answer: "Zenmuse H30T monteras på DJI Matrice 350 RTK, Matrice 300 RTK och Matrice 400. Kontakta EU Drone Company för komplett konfiguration med fjärrkontroll och mjukvara.",
      },
      {
        question: "Vad är skillnaden mellan H30T och H30?",
        answer: "H30T inkluderar en radiometrisk termisk kamera (1280×1024) utöver zoom, vidvinkel och LRF. H30 har samma optiska sensorer men saknar termisk kamera — ett mer kostnadseffektivt alternativ när termisk avbildning inte behövs.",
      },
      {
        question: "Kan H30T användas för nattinspektioner?",
        answer: "Ja. Termisk kameran fungerar oberoende av synligt ljus, och NIR-auxiliary light förbättrar nattseende med den optiska kameran.",
      },
    ],
    seoTitle: "Zenmuse H30T — Termisk hybridkamera för Matrice | EU Drone Company",
    seoDesc: "Zenmuse H30T med 40× zoom, termisk kamera och laser-avståndsmätare. Enterprise-payload för inspektion och räddning. Begär offert hos EU Drone Company.",
  },
  {
    slug: "zenmuse-h30",
    name: "Zenmuse H30",
    tag: "Hybrid utan termisk",
    category: "hybrid",
    heroTitle: "Zenmuse H30 — Avancerad hybridkamera utan termisk sensor",
    heroDesc: "Samma kraftfulla optiska system som H30T — 40× zoom, bred vidvinkel och LRF — i ett mer kostnadseffektivt format.",
    longDesc:
      "Zenmuse H30 levererar DJI:s senaste optiska teknologi med 40× optisk zoom, 48 MP vidvinkel och integrerad laser-avståndsmätare. Idealisk för inspektioner och kartläggning där termisk avbildning inte krävs, men där zoom och precision är avgörande.",
    features: [
      "40× optisk zoom med Super Resolution",
      "48 MP bred vidvinkel",
      "Laser-avståndsmätare (LRF)",
      "NIR-auxiliary light",
      "IP54-skydd",
    ],
    specs: [
      { label: "Zoom", value: "40× optisk" },
      { label: "Vidvinkel", value: "48 MP, 1/1,8\" CMOS" },
      { label: "LRF", value: "3–3000 m" },
      { label: "Kompatibilitet", value: "Matrice 350/300/400 RTK" },
    ],
    applications: [
      "Fasad- och broinspektion",
      "Detaljerad dokumentation med zoom",
      "Kartläggning med avståndsmätning",
      "Infrastrukturunderhåll",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK", "DJI Matrice 400"],
    shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30-dronarkamera",
    imageUrl: zenmuseH30Img,
    youtubeId: "fKkR6D-UGq0",
    badge: "Ny",
    faq: [
      {
        question: "När ska jag välja H30 framför H30T?",
        answer: "Välj H30 om du inte behöver termisk avbildning — till exempel vid ren visuell inspektion, fasadkontroll eller kartläggning. Du sparar kostnad utan att kompromissa med zoom och LRF.",
      },
      {
        question: "Har H30 samma zoom som H30T?",
        answer: "Ja, båda har 40× optisk zoom med Super Resolution och samma vidvinkel-sensor.",
      },
    ],
    seoTitle: "Zenmuse H30 — Hybridkamera 40× zoom | EU Drone Company",
    seoDesc: "Zenmuse H30 med 40× optisk zoom och laser-avståndsmätare för DJI Matrice. Kostnadseffektiv enterprise-kamera. Kontakta EU Drone Company.",
  },
  {
    slug: "zenmuse-h20t",
    name: "Zenmuse H20T",
    tag: "Quad-sensor",
    category: "thermal",
    heroTitle: "Zenmuse H20T — Termisk quad-sensor för professionell inspektion",
    heroDesc: "Fyra sensorer i ett: 20 MP zoom, vidvinkel, laser-avståndsmätare och radiometrisk termisk kamera — beprövad lösning för enterprise-inspektion.",
    longDesc:
      "Zenmuse H20T är en etablerad enterprise-payload med zoom (23×), vidvinkel, LRF och termisk kamera (640×512). Används brett inom energi, säkerhet och infrastrukturinspektion. Ett kostnadseffektivt alternativ till H30-serien med beprövad driftsäkerhet.",
    features: [
      "23× optisk zoom (200× digital)",
      "Termisk kamera 640×512, radiometrisk",
      "Laser-avståndsmätare",
      "20 MP vidvinkel",
      "Beprövad Matrice-kompatibilitet",
    ],
    specs: [
      { label: "Zoom", value: "23× optisk, 200× digital" },
      { label: "Termisk", value: "640×512, radiometrisk" },
      { label: "Vidvinkel", value: "20 MP" },
      { label: "LRF", value: "3–1200 m" },
      { label: "Kompatibilitet", value: "Matrice 350/300 RTK" },
    ],
    applications: [
      "Energi- och kraftledningsinspektion",
      "Säkerhetsövervakning med termisk detektering",
      "Solpanelsinspektion (hotspot-detektering)",
      "Brand- och räddningsinsatser",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK"],
    shopUrl: "https://actionking.se/search?q=zenmuse+h20t",
    faq: [
      {
        question: "H20T eller H30T — vilken ska jag välja?",
        answer: "H30T erbjuder högre zoom (40×), bättre termisk upplösning (1280×1024) och längre LRF-räckvidd. H20T är ett beprövat och kostnadseffektivt alternativ som fortfarande levererar termisk inspektion av hög kvalitet.",
      },
      {
        question: "Stöder H20T radiometrisk mätning?",
        answer: "Ja, den termiska kameran stöder radiometrisk temperaturmätning för att kvantifiera hotspots och värmeläckor.",
      },
    ],
    seoTitle: "Zenmuse H20T — Termisk inspektionskamera | EU Drone Company",
    seoDesc: "Zenmuse H20T med termisk kamera, zoom och LRF för DJI Matrice. Beprövad payload för energi- och infrastrukturinspektion. Begär offert.",
  },
  {
    slug: "zenmuse-l2",
    name: "Zenmuse L2",
    tag: "LiDAR-sensor",
    category: "lidar",
    heroTitle: "Zenmuse L2 — LiDAR för högprecisionskartläggning",
    heroDesc: "Integrerad LiDAR-sensor med RGB-kamera. Generera punktmoln med upp till 5 returer och 250 m räckvidd — perfekt för GIS och infrastruktur.",
    longDesc:
      "Zenmuse L2 kombinerar en LiDAR-sensor med integrerad RGB-kamera och IMU för att skapa högdensitetspunktmoln. Med upp till 5 returer och 250 m räckvidd kan du kartlägga genom vegetation och i skuggade områden med vertikal noggrannhet ner till 5 cm.",
    features: [
      "LiDAR med upp till 5 returer",
      "250 m mäträckvidd",
      "Integrerad RGB-kamera",
      "Vertikal noggrannhet ner till 5 cm",
      "Kompatibel med DJI Terra och Pix4D",
    ],
    specs: [
      { label: "Returer", value: "Upp till 5" },
      { label: "Räckvidd", value: "250 m @ 10% reflektans" },
      { label: "Noggrannhet", value: "5 cm vertikal (med RTK)" },
      { label: "Punktfrekvens", value: "Upp till 240 000 pts/s" },
      { label: "Kompatibilitet", value: "Matrice 350/300 RTK" },
    ],
    applications: [
      "GIS-kartläggning och ortofoto",
      "Skogsinventering genom vegetation",
      "Infrastruktur- och ledningsgatsmätning",
      "Gruv- och anläggningskartläggning",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK"],
    shopUrl: "https://actionking.se/search?q=zenmuse+l2",
    youtubeId: "g1JmzqBGUKA",
    badge: "Populär",
    faq: [
      {
        question: "Behöver jag RTK för Zenmuse L2?",
        answer: "RTK rekommenderas starkt för att uppnå centimeterprecision. Med RTK-positionering uppnås 1–3 cm horisontellt och vertikal noggrannhet ner till 5 cm.",
      },
      {
        question: "Vilken mjukvara fungerar med L2-data?",
        answer: "Zenmuse L2 integreras med DJI Terra, Pix4D och andra GIS-verktyg. EU Drone Company kan hjälpa till med komplett arbetsflöde inklusive mjukvarulicenser.",
      },
    ],
    seoTitle: "Zenmuse L2 — LiDAR-sensor för drönarkartläggning | EU Drone Company",
    seoDesc: "Zenmuse L2 LiDAR med 5 returer och 250 m räckvidd. Punktmoln för GIS och infrastruktur. Komplett lösning från EU Drone Company.",
  },
  {
    slug: "zenmuse-p1",
    name: "Zenmuse P1",
    tag: "Fotogrammetri",
    category: "photogrammetry",
    heroTitle: "Zenmuse P1 — Fullformats-fotogrammetrikamera",
    heroDesc: "45 MP full-frame sensor med mekanisk slutare och tre utbytbara objektiv. Branschstandard för professionell fotogrammetrisk kartläggning.",
    longDesc:
      "Zenmuse P1 är designad för fotogrammetri med en 45 MP full-frame sensor, global slutare och tre utbytbara fastbrännviddsobjektiv (24, 35 och 50 mm). Mekanisk slutare eliminerar rullningsskärpa och ger maximal noggrannhet vid ortofoto och 3D-modellering.",
    features: [
      "45 MP full-frame sensor",
      "Mekanisk global slutare",
      "3 utbytbara objektiv (24/35/50 mm)",
      "Centimeterprecision med RTK",
      "Optimerad för DJI Terra",
    ],
    specs: [
      { label: "Sensor", value: "45 MP full-frame CMOS" },
      { label: "Slutare", value: "Mekanisk global" },
      { label: "Objektiv", value: "24, 35, 50 mm (utbytbara)" },
      { label: "Noggrannhet", value: "1–3 cm med RTK" },
      { label: "Kompatibilitet", value: "Matrice 350/300 RTK" },
    ],
    applications: [
      "Ortofoto och DSM/DTM-generering",
      "Byggnads- och anläggningsmätning",
      "Jordbrukskartläggning",
      "Arkeologisk dokumentation",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK"],
    shopUrl: "https://actionking.se/search?q=zenmuse+p1",
    youtubeId: "H_0cEpCdIjw",
    faq: [
      {
        question: "P1 eller L2 — vilken passar min kartläggning?",
        answer: "P1 är bäst för fotogrammetri med ortofoto och 3D-modeller i öppet terräng. L2 (LiDAR) är överlägsen genom vegetation och i skuggade områden. Många professionella team använder båda.",
      },
      {
        question: "Ingår objektiven?",
        answer: "Zenmuse P1 levereras med tre utbytbara objektiv (24, 35 och 50 mm). EU Drone Company kan konfigurera komplett paket med drönare, RTK och mjukvara.",
      },
    ],
    seoTitle: "Zenmuse P1 — Fotogrammetrikamera 45 MP | EU Drone Company",
    seoDesc: "Zenmuse P1 full-frame fotogrammetrikamera med mekanisk slutare. Centimeterprecision för kartläggning. Begär offert hos EU Drone Company.",
  },
  {
    slug: "zenmuse-s1",
    name: "Zenmuse S1",
    tag: "Sökljus-payload",
    category: "utility",
    heroTitle: "Zenmuse S1 — Kraftfull sökljus för nattoperationer",
    heroDesc: "Enterprise-sökljus med 4 LED-ljuskällor och IR-belysning. Belys upp stora områden under nattliga räddnings- och säkerhetsinsatser.",
    longDesc:
      "Zenmuse S1 är en dedikerad belysningspayload med fyra kraftfulla LED-ljuskällor och IR-belysning. Perfekt för sök-och-räddning, polisinsatser och säkerhetsövervakning när synlig belysning krävs för att stödja kameror eller markpersonal.",
    features: [
      "4 LED-ljuskällor med hög ljusstyrka",
      "IR-belysning för nattseende",
      "Fjärrstyrd riktning via gimbal",
      "IP54-skydd",
      "Snabb montering på Matrice",
    ],
    specs: [
      { label: "Ljuskällor", value: "4× LED + IR" },
      { label: "Styrning", value: "Gimbal-styrd, fjärrkontroll" },
      { label: "Skydd", value: "IP54" },
      { label: "Kompatibilitet", value: "Matrice 350/300/400 RTK" },
    ],
    applications: [
      "Sök-och-räddning nattetid",
      "Polis- och säkerhetsinsatser",
      "Övervakning av stora evenemang",
      "Stöd vid brandbekämpning",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK", "DJI Matrice 400"],
    shopUrl: "https://www.actionking.se/products/dji-zenmuse-s1-dronarkamera",
    imageUrl: zenmuseS1Img,
    badge: "Ny",
    faq: [
      {
        question: "Kan S1 användas tillsammans med H30T?",
        answer: "S1 monteras som enskild payload. För kombinerad belysning och kamera rekommenderar vi att planera uppdrag med växling av payload eller använda en separat belysningsenhet parallellt.",
      },
      {
        question: "Hur långt når ljuset?",
        answer: "S1 levererar kraftfull belysning som täcker stora områden under nattoperationer. Exakt räckvidd beror på väder och terräng — kontakta EU Drone Company för demonstrationsvideo.",
      },
    ],
    seoTitle: "Zenmuse S1 — Sökljus-payload för drönare | EU Drone Company",
    seoDesc: "Zenmuse S1 sökljus med LED och IR för nattliga räddningsinsatser. Enterprise-payload för DJI Matrice. Begär offert.",
  },
  {
    slug: "zenmuse-v1",
    name: "Zenmuse V1",
    tag: "Kommunikationspayload",
    category: "utility",
    heroTitle: "Zenmuse V1 — Röstförstärkare och kommunikation",
    heroDesc: "Kraftfull högtalare med 1500 m räckvidd. Sprid varningar, instruktioner och information under räddnings- och säkerhetsoperationer.",
    longDesc:
      "Zenmuse V1 är en kommunikationspayload med inbyggd högtalare som når upp till 1500 meter. Används av räddningstjänst, polis och säkerhetsbolag för att kommunicera med markpersonal, folkmassor eller personer i nödsituationer.",
    features: [
      "1500 m kommunikationsräckvidd",
      "Förinspelade meddelanden",
      "Realtidsröst via fjärrkontroll",
      "IP54-skydd",
      "Kompakt och lätt",
    ],
    specs: [
      { label: "Räckvidd", value: "Upp till 1500 m" },
      { label: "Styrning", value: "Fjärrkontroll + förinspelat" },
      { label: "Skydd", value: "IP54" },
      { label: "Kompatibilitet", value: "Matrice 350/300/400 RTK" },
    ],
    applications: [
      "Räddningstjänst och SAR-operationer",
      "Crowd management vid evenemang",
      "Polisinsatser och varningar",
      "Skogsbrand och katastrofinsatser",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK", "DJI Matrice 400"],
    shopUrl: "https://www.actionking.se/products/dji-zenmuse-v1-kamerastabilisator",
    imageUrl: zenmuseV1Img,
    badge: "Ny",
    faq: [
      {
        question: "Kan jag spela in egna meddelanden?",
        answer: "Ja, V1 stöder förinspelade meddelanden samt realtidsröst direkt från fjärrkontrollen.",
      },
      {
        question: "Fungerar V1 i bullriga miljöer?",
        answer: "V1 är designad för att nå markpersonal även i utmanande miljöer. Vid extremt buller rekommenderar vi att kombinera med visuell kommunikation via kamerapayload.",
      },
    ],
    seoTitle: "Zenmuse V1 — Högtalare-payload för drönare | EU Drone Company",
    seoDesc: "Zenmuse V1 röstförstärkare med 1500 m räckvidd. Kommunikationspayload för räddning och säkerhet. Kontakta EU Drone Company.",
  },
];

export function getCameraBySlug(slug: string): EnterpriseCameraProduct | undefined {
  return ENTERPRISE_CAMERA_PRODUCTS.find((c) => c.slug === slug);
}

export function getCamerasByCategory(category: CameraCategory): EnterpriseCameraProduct[] {
  return ENTERPRISE_CAMERA_PRODUCTS.filter((c) => c.category === category);
}

export function getCameraSlugForAccessory(name: string): string | undefined {
  const map: Record<string, string> = {
    "Zenmuse H30T": "zenmuse-h30t",
    "Zenmuse H30": "zenmuse-h30",
    "Zenmuse H20 / H20T / H20N": "zenmuse-h20t",
    "Zenmuse H20T (Termisk)": "zenmuse-h20t",
    "Zenmuse P1": "zenmuse-p1",
    "Zenmuse L2": "zenmuse-l2",
    "Zenmuse S1": "zenmuse-s1",
    "Zenmuse V1": "zenmuse-v1",
  };
  return map[name];
}

export function getRelatedCameras(slug: string, limit = 3): EnterpriseCameraProduct[] {
  const current = getCameraBySlug(slug);
  if (!current) return ENTERPRISE_CAMERA_PRODUCTS.slice(0, limit);
  return ENTERPRISE_CAMERA_PRODUCTS.filter((c) => c.slug !== slug && c.category === current.category).slice(0, limit);
}
