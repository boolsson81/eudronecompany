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
    heroDesc: "DJI:s mest avancerade enterprise-payload med bred vidvinkel, 34× optisk zoom, laser-avståndsmätare och radiometrisk termisk kamera.",
    longDesc:
      "Zenmuse H30T samlar fem moduler i ett integrerat gimbal-system: 48 MP vidvinkel, 40 MP zoomkamera med 34× optisk zoom, laser-avståndsmätare, termisk kamera på 1280×1024 och NIR-hjälpljus. Perfekt för inspektion, säkerhet och räddningsinsatser där du behöver se både detaljer och värmesignaturer — dag som natt.",
    features: [
      "34× optisk zoom, upp till 400× digital",
      "40 MP zoomkamera på 1/1,8\" CMOS",
      "Termisk kamera 1280×1024, radiometrisk",
      "Laser-avståndsmätare (LRF) upp till 3000 m",
      "NIR-hjälpljus för nattseende",
      "IP54-skydd mot damm och fukt",
    ],
    specs: [
      { label: "Zoom", value: "34× optisk, upp till 400× digital" },
      { label: "Zoomkamera", value: "40 MP, 1/1,8\" CMOS" },
      { label: "Termisk", value: "1280×1024, radiometrisk" },
      { label: "Vidvinkel", value: "48 MP" },
      { label: "LRF", value: "3–3000 m" },
      { label: "Skydd", value: "IP54" },
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
    seoDesc: "Zenmuse H30T med 34× optisk zoom, termisk kamera och laser-avståndsmätare. Enterprise-payload för inspektion och räddning. Begär offert.",
  },
  {
    slug: "zenmuse-h30",
    name: "Zenmuse H30",
    tag: "Hybrid utan termisk",
    category: "hybrid",
    heroTitle: "Zenmuse H30 — Avancerad hybridkamera utan termisk sensor",
    heroDesc: "Samma kraftfulla optiska system som H30T — 34× optisk zoom, bred vidvinkel och LRF — i ett mer kostnadseffektivt format.",
    longDesc:
      "Zenmuse H30 är H30-seriens quad-sensor: 48 MP vidvinkel, 40 MP zoomkamera med 34× optisk zoom, laser-avståndsmätare och NIR-hjälpljus. Idealisk för inspektioner och kartläggning där termisk avbildning inte krävs, men där zoom och precision är avgörande.",
    features: [
      "34× optisk zoom, upp till 400× digital",
      "40 MP zoomkamera på 1/1,8\" CMOS",
      "48 MP bred vidvinkel",
      "Laser-avståndsmätare (LRF) upp till 3000 m",
      "NIR-hjälpljus",
      "IP54-skydd",
    ],
    specs: [
      { label: "Zoom", value: "34× optisk, upp till 400× digital" },
      { label: "Zoomkamera", value: "40 MP, 1/1,8\" CMOS" },
      { label: "Vidvinkel", value: "48 MP" },
      { label: "LRF", value: "3–3000 m" },
      { label: "Skydd", value: "IP54" },
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
        answer: "Ja, båda har samma optik: 40 MP zoomkamera med 34× optisk zoom och 48 MP vidvinkel. Skillnaden är att H30T dessutom har termisk kamera.",
      },
    ],
    seoTitle: "Zenmuse H30 — Hybridkamera 34× zoom | EU Drone Company",
    seoDesc: "Zenmuse H30 med 34× optisk zoom och laser-avståndsmätare för DJI Matrice. Kostnadseffektiv enterprise-kamera. Kontakta EU Drone Company.",
  },
  {
    slug: "zenmuse-h20t",
    name: "Zenmuse H20T",
    tag: "Quad-sensor",
    category: "thermal",
    heroTitle: "Zenmuse H20T — Termisk quad-sensor för professionell inspektion",
    heroDesc: "Fyra sensorer i ett: 20 MP zoom, vidvinkel, laser-avståndsmätare och radiometrisk termisk kamera — beprövad lösning för enterprise-inspektion.",
    longDesc:
      "Zenmuse H20T är en etablerad enterprise-payload med 20 MP zoomkamera (23× hybrid optisk zoom), 12 MP vidvinkel, laser-avståndsmätare och termisk kamera på 640×512. Används brett inom energi, säkerhet och infrastrukturinspektion. Ett kostnadseffektivt alternativ till H30-serien med beprövad driftsäkerhet.",
    features: [
      "23× hybrid optisk zoom (200× max)",
      "Termisk kamera 640×512, radiometrisk",
      "Laser-avståndsmätare 3–1200 m",
      "20 MP zoomkamera och 12 MP vidvinkel",
      "Beprövad Matrice-kompatibilitet",
    ],
    specs: [
      { label: "Zoom", value: "23× hybrid optisk, 200× max" },
      { label: "Termisk", value: "640×512, radiometrisk" },
      { label: "Zoomkamera", value: "20 MP" },
      { label: "Vidvinkel", value: "12 MP" },
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
        answer: "H30T erbjuder högre zoom (34× optisk mot 23×), bättre termisk upplösning (1280×1024 mot 640×512) och längre LRF-räckvidd (3000 m mot 1200 m). H20T är ett beprövat och kostnadseffektivt alternativ som fortfarande levererar termisk inspektion av hög kvalitet.",
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
    slug: "zenmuse-h20n",
    name: "Zenmuse H20N",
    tag: "Nattseende quad-sensor",
    category: "thermal",
    heroTitle: "Zenmuse H20N — Quad-sensor för nattoperationer",
    heroDesc: "Starlight-sensorer i både vidvinkel och zoom, två radiometriska termiska kameror och laser-avståndsmätare — byggd för uppdrag efter mörkrets inbrott.",
    longDesc:
      "Zenmuse H20N är H20-seriens nattvariant. Där H20T använder vanliga sensorer har H20N starlight-sensorer i både vidvinkel- och zoomkameran, vilket ger användbar bild i ljusförhållanden där de andra payloadsen bara ger brus. Till det kommer två radiometriska termiska kameror med var sin fasta optik — 2× för överblick och 8× för detalj — som tillsammans ger upp till 32× termisk zoom, plus laser-avståndsmätare. Payloaden täcker därmed både detektering och identifiering i mörker.",
    features: [
      "Starlight-sensorer i vidvinkel (2 MP) och zoom (4 MP)",
      "20× hybrid optisk zoom, upp till 128× digital",
      "Dubbla termiska kameror 640×512 (2× och 8×), radiometriska",
      "Laser-avståndsmätare 3–1200 m",
      "Samma gimbal-fäste som övriga H20-payloads",
    ],
    specs: [
      { label: "Zoom", value: "20× hybrid optisk, upp till 128× digital" },
      { label: "Termisk", value: "Dubbla 640×512 (2× och 8×), radiometriska" },
      { label: "Starlight", value: "2 MP vidvinkel + 4 MP zoom" },
      { label: "LRF", value: "3–1200 m" },
      { label: "Skydd", value: "IP44" },
      { label: "Kompatibilitet", value: "Matrice 350/300 RTK" },
    ],
    applications: [
      "Sök-och-räddning i mörker",
      "Perimeter- och områdesbevakning nattetid",
      "Polisinsatser och spaning efter mörkrets inbrott",
      "Nattlig inspektion av anläggningar och infrastruktur",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK"],
    shopUrl: "https://actionking.se/search?q=zenmuse+h20n",
    faq: [
      {
        question: "H20N eller H20T — vad skiljer dem åt?",
        answer: "Båda har laser-avståndsmätare och termisk upplösning 640×512, men H20N har två termiska kameror med olika optik (2× och 8×) medan H20T har en. Den större skillnaden ligger i de visuella sensorerna: H20N har starlight-sensorer som ser i nästan mörker, men bara 2 MP vidvinkel och 4 MP zoom, medan H20T har 20 MP zoom och 12 MP vidvinkel för skarpare bilder i dagsljus. Väljer du efter uppdrag: H20N för nattarbete, H20T för dygnet-runt-inspektion.",
      },
      {
        question: "Behöver jag extra belysning tillsammans med H20N?",
        answer: "Nej, poängen med starlight-sensorerna är att slippa belysa scenen. Ska markpersonal eller nödställda kunna se, eller vill du undvika att röja drönarens position, kompletterar du i stället med Zenmuse S1 som separat uppdrag.",
      },
      {
        question: "Vilken zoom klarar H20N?",
        answer: "20× hybrid optisk zoom och upp till 128× digital. Det är lägre än H20T:s 23× och H30-seriens 34×, en följd av att sensorerna är optimerade för ljuskänslighet snarare än upplösning.",
      },
    ],
    seoTitle: "Zenmuse H20N — Nattseende-payload för drönare | EU Drone Company",
    seoDesc: "Zenmuse H20N med starlight-sensorer, termisk kamera 640×512 och LRF för DJI Matrice. Payload för nattoperationer och räddning. Begär offert.",
  },
  {
    slug: "zenmuse-h20",
    name: "Zenmuse H20",
    tag: "Triple-sensor",
    category: "hybrid",
    heroTitle: "Zenmuse H20 — Triple-sensor för visuell inspektion",
    heroDesc: "23× optisk zoom, vidvinkelkamera och laser-avståndsmätare i ett gimbal-system — H20-seriens instegspayload för uppdrag utan termiskt behov.",
    longDesc:
      "Zenmuse H20 är grundmodellen i H20-serien: 20 MP zoomkamera med 23× optisk zoom, 12 MP vidvinkel och laser-avståndsmätare upp till 1200 m. Den saknar termisk sensor, vilket gör den lättare och billigare än H20T. Ett rakt val när uppdragen handlar om visuell inspektion, dokumentation och avståndsmätning snarare än värmesignaturer.",
    features: [
      "23× optisk zoom (upp till 200× hybrid)",
      "20 MP zoomkamera",
      "12 MP vidvinkelkamera",
      "Laser-avståndsmätare 3–1200 m",
      "Lättare än H20T — mer flygtid kvar till uppdraget",
    ],
    specs: [
      { label: "Zoom", value: "23× optisk, 200× hybrid" },
      { label: "Zoomkamera", value: "20 MP, 1/1,7\" CMOS" },
      { label: "Vidvinkel", value: "12 MP, 1/2,3\" CMOS" },
      { label: "LRF", value: "3–1200 m" },
      { label: "Kompatibilitet", value: "Matrice 350/300 RTK" },
    ],
    applications: [
      "Visuell inspektion av mast, bro och byggnad",
      "Dokumentation och skadebedömning",
      "Avståndsmätning mot svåråtkomliga punkter",
      "Kartläggning och översiktsflygningar",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK"],
    shopUrl: "https://actionking.se/search?q=zenmuse+h20",
    faq: [
      {
        question: "Vad skiljer H20 från H20T?",
        answer: "H20T har samma zoom, vidvinkel och laser-avståndsmätare men lägger till en radiometrisk termisk kamera på 640×512. Behöver du aldrig mäta temperatur eller hitta värmesignaturer är H20 samma optik till lägre vikt och pris.",
      },
      {
        question: "Kan jag uppgradera från H20 till termisk senare?",
        answer: "Payloadsen är utbytbara på Matrice-plattformarna, så du byter till H20T eller H30T när behovet uppstår — drönaren och fjärrkontrollen behöver inte bytas ut.",
      },
      {
        question: "Räcker 23× zoom för kraftledningsinspektion?",
        answer: "För de flesta besiktningar av linor och isolatorer räcker det gott. Behöver du gå in på detaljnivå från längre säkerhetsavstånd ger Zenmuse H30 34× optisk zoom och avståndsmätare upp till 3000 m.",
      },
    ],
    seoTitle: "Zenmuse H20 — Zoom och LRF för drönarinspektion | EU Drone Company",
    seoDesc: "Zenmuse H20 med 23× optisk zoom, 20 MP zoomkamera och laser-avståndsmätare för DJI Matrice. Payload för visuell inspektion. Begär offert.",
  },
  {
    slug: "zenmuse-l2",
    name: "Zenmuse L2",
    tag: "LiDAR-sensor",
    category: "lidar",
    heroTitle: "Zenmuse L2 — LiDAR för högprecisionskartläggning",
    heroDesc: "Integrerad LiDAR-sensor med RGB-kamera. Generera punktmoln med upp till 5 returer och 250 m räckvidd — perfekt för GIS och infrastruktur.",
    longDesc:
      "Zenmuse L2 kombinerar en LiDAR-sensor med integrerad RGB-kamera och IMU för att skapa högdensitetspunktmoln. Med upp till 5 returer och 250 m räckvidd vid 10 % reflektans kan du kartlägga genom vegetation och i skuggade områden med 4 cm vertikal och 5 cm horisontell noggrannhet vid 150 m flyghöjd.",
    features: [
      "LiDAR med upp till 5 returer",
      "250 m mäträckvidd vid 10 % reflektans",
      "Integrerad RGB-kamera",
      "4 cm vertikal och 5 cm horisontell noggrannhet @ 150 m",
      "Kompatibel med DJI Terra och Pix4D",
    ],
    specs: [
      { label: "Returer", value: "Upp till 5" },
      { label: "Räckvidd", value: "450 m @ 50 % reflektans, 250 m @ 10 %" },
      { label: "Noggrannhet", value: "4 cm vertikalt, 5 cm horisontellt @ 150 m" },
      { label: "Punktfrekvens", value: "240 000 pts/s (en retur), 1 200 000 pts/s (flera)" },
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
        answer: "RTK rekommenderas starkt för att uppnå centimeterprecision. Med RTK-positionering anger DJI 4 cm vertikal och 5 cm horisontell noggrannhet vid 150 m flyghöjd.",
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
      "3 cm horisontell och 5 cm vertikal noggrannhet utan markstöd",
      "Optimerad för DJI Terra",
    ],
    specs: [
      { label: "Sensor", value: "45 MP full-frame CMOS" },
      { label: "Slutare", value: "Mekanisk global" },
      { label: "Objektiv", value: "24, 35, 50 mm (utbytbara)" },
      { label: "Noggrannhet", value: "3 cm horisontellt, 5 cm vertikalt (utan markstöd)" },
      { label: "Kompatibilitet", value: "Matrice 400, 350/300 RTK" },
    ],
    applications: [
      "Ortofoto och DSM/DTM-generering",
      "Byggnads- och anläggningsmätning",
      "Jordbrukskartläggning",
      "Arkeologisk dokumentation",
    ],
    compatibleDrones: ["DJI Matrice 400", "DJI Matrice 350 RTK", "DJI Matrice 300 RTK"],
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
    slug: "zenmuse-l1",
    name: "Zenmuse L1",
    tag: "LiDAR, första generationen",
    category: "lidar",
    heroTitle: "Zenmuse L1 — Integrerad LiDAR med RGB-kamera",
    heroDesc: "DJI:s första integrerade LiDAR-payload: punktmoln, 20 MP RGB-kamera och IMU i ett system, med DJI Terra som färdigt arbetsflöde.",
    longDesc:
      "Zenmuse L1 kombinerar en LiDAR-modul, en 1-tums 20 MP RGB-kamera och en high-precision IMU i samma gimbal. Den var DJI:s första integrerade LiDAR-payload och används fortfarande brett för terrängmodeller, ledningsgator och volymberäkning. L2 har tagit över som förstahandsval på nya installationer, men L1 är ett kostnadseffektivt alternativ när kraven på punkttäthet och noggrannhet är måttliga.",
    features: [
      "LiDAR med upp till 3 returer",
      "20 MP RGB-kamera på 1\" CMOS för färgsättning av punktmoln",
      "Inbyggd IMU för positionering",
      "240 000 punkter/s med en retur, 480 000 med flera",
      "Arbetsflöde via DJI Terra",
    ],
    specs: [
      { label: "Returer", value: "Upp till 3" },
      { label: "Räckvidd", value: "450 m @ 80 % reflektans, 190 m @ 10 %" },
      { label: "Punktfrekvens", value: "240 000 pts/s (en retur), 480 000 pts/s (flera)" },
      { label: "RGB-kamera", value: "20 MP, 1\" CMOS" },
      { label: "Kompatibilitet", value: "Matrice 350/300 RTK" },
    ],
    applications: [
      "Terrängmodeller och höjddata",
      "Ledningsgator och kraftledningskorridorer",
      "Volymberäkning i täkt och anläggning",
      "Kartläggning där vegetation skymmer marken",
    ],
    compatibleDrones: ["DJI Matrice 350 RTK", "DJI Matrice 300 RTK"],
    shopUrl: "https://actionking.se/search?q=zenmuse+l1",
    faq: [
      {
        question: "L1 eller L2 — vilken ska jag välja?",
        answer: "L2 ger fler returer (5 mot 3), tätare punktmoln och bättre noggrannhet, och är förstahandsvalet på nya installationer. L1 är fortfarande gångbar när du redan har den i flottan eller när kraven på detaljnivå är måttliga.",
      },
      {
        question: "Behöver jag RTK för Zenmuse L1?",
        answer: "Ja, i praktiken. Utan RTK-positionering får du inte den absoluta noggrannhet som mätuppdrag kräver. Matrice 300 RTK och 350 RTK har det inbyggt.",
      },
      {
        question: "Vilken mjukvara bearbetar L1-data?",
        answer: "DJI Terra hanterar hela kedjan från flygning till färgsatt punktmoln. Data kan sedan exporteras till vanliga GIS- och CAD-format för vidare bearbetning.",
      },
    ],
    seoTitle: "Zenmuse L1 — LiDAR-payload för DJI Matrice | EU Drone Company",
    seoDesc: "Zenmuse L1 med LiDAR, 20 MP RGB-kamera och IMU för DJI Matrice 300/350 RTK. Punktmoln för terräng och ledningsgator. Begär offert.",
  },
  {
    slug: "zenmuse-l3",
    name: "Zenmuse L3",
    tag: "Nästa generations LiDAR",
    category: "lidar",
    heroTitle: "Zenmuse L3 — LiDAR för storskalig kartläggning",
    heroDesc: "L-seriens största steg hittills: kraftigt utökad räckvidd, upp till 16 returer och dubbla 100 MP-kameror för storskalig kartläggning från hög höjd.",
    longDesc:
      "Zenmuse L3 är L-seriens nya toppmodell och flyger på Matrice 400 RTK. Med upp till 16 returer och 950 m mäträckvidd vid 10 % reflektans kan du kartlägga från betydligt högre höjd än med L2, vilket ger färre flyglinjer och kortare tid i luften per kvadratkilometer. Pulsfrekvensen är justerbar mellan 100 kHz och 2 MHz, så du kan växla mellan lång räckvidd och hög punkttäthet. De dubbla 100 MP-kamerorna färgsätter punktmolnet och ger samtidigt ortofoto av hög upplösning.",
    features: [
      "Upp till 16 returer",
      "950 m mäträckvidd vid 10 % reflektans och 100 kHz",
      "Dubbla 100 MP-kameror på 4/3\" CMOS",
      "Vertikal noggrannhet under 3 cm vid 120 m flyghöjd",
      "Byggd för Matrice 400 RTK",
    ],
    specs: [
      { label: "Returer", value: "Upp till 16" },
      { label: "Räckvidd", value: "950 m @ 10 % reflektans (100 kHz)" },
      { label: "Pulsfrekvens", value: "100 kHz–2 MHz, justerbar" },
      { label: "Noggrannhet", value: "<3 cm @ 120 m, <5 cm @ 300 m, <10 cm @ 500 m" },
      { label: "RGB-kameror", value: "2× 100 MP, 4/3\" CMOS" },
      { label: "Vikt", value: "ca 1,6 kg" },
      { label: "Kompatibilitet", value: "Matrice 400 RTK" },
    ],
    applications: [
      "Storskalig korridorkartläggning",
      "Kartläggning från hög höjd över svår terräng",
      "Skogsinventering med genomträngning av krontak",
      "Infrastrukturprojekt med krav på hög punkttäthet",
    ],
    compatibleDrones: ["DJI Matrice 400"],
    shopUrl: "https://actionking.se/search?q=zenmuse+l3",
    badge: "Ny",
    faq: [
      {
        question: "Kan jag flyga L3 på min Matrice 350 RTK?",
        answer: "Nej. Zenmuse L3 är byggd för Matrice 400 RTK. Har du en Matrice 300 eller 350 RTK är Zenmuse L2 rätt LiDAR-payload för den plattformen.",
      },
      {
        question: "Vad vinner jag på 950 m räckvidd?",
        answer: "Du kan flyga högre och bredare, vilket ger färre flyglinjer per kvadratkilometer och kortare tid i luften. Räckvidden gäller vid 10 % reflektans och 100 kHz pulsfrekvens — höjer du punkttätheten kortas den. På stora korridor- och områdesuppdrag är det där skillnaden mot L2 syns i kalkylen.",
      },
      {
        question: "När kan jag få L3 levererad?",
        answer: "L3 är en ny produkt och leveranstiden varierar. Kontakta EU Drone Company så ger vi besked om aktuell tillgång och hjälper till med bedömningen L2 eller L3 för ditt uppdrag.",
      },
    ],
    seoTitle: "Zenmuse L3 — LiDAR för Matrice 400 RTK | EU Drone Company",
    seoDesc: "Zenmuse L3 med 16 returer, 950 m räckvidd och dubbla 100 MP-kameror för DJI Matrice 400 RTK. Storskalig LiDAR-kartläggning. Begär offert.",
  },
  {
    slug: "zenmuse-s1",
    name: "Zenmuse S1",
    tag: "Sökljus-payload",
    category: "utility",
    heroTitle: "Zenmuse S1 — Kraftfull sökljus för nattoperationer",
    heroDesc: "Enterprise-sökljus med 10 000 lumen och belysning upp till 500 m. Lys upp stora områden under nattliga räddnings- och säkerhetsinsatser.",
    longDesc:
      "Zenmuse S1 är en dedikerad belysningspayload med 10 000 lumen maximal ljusstyrka och en räckvidd på upp till 500 meter. Vid 100 meters avstånd ger den 40 lux centralt. Perfekt för sök-och-räddning, polisinsatser och säkerhetsövervakning när synlig belysning krävs för att stödja kameror eller markpersonal.",
    features: [
      "10 000 lumen maximal ljusstyrka",
      "Belysning upp till 500 m",
      "40 lux central belysningsstyrka vid 100 m",
      "Fjärrstyrd riktning via gimbal",
      "IP54-skydd",
      "Väger ca 0,76 kg",
    ],
    specs: [
      { label: "Ljusstyrka", value: "10 000 lumen (max)" },
      { label: "Räckvidd", value: "Upp till 500 m" },
      { label: "Belysningsstyrka", value: "40 lux centralt @ 100 m" },
      { label: "Styrning", value: "Gimbal-styrd, fjärrkontroll" },
      { label: "Vikt", value: "ca 0,76 kg" },
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
        answer: "DJI anger upp till 500 meter, med 40 lux central belysningsstyrka på 100 meters avstånd. Hur långt det räcker i praktiken beror på dis, nederbörd och hur ljus omgivningen är.",
      },
    ],
    seoTitle: "Zenmuse S1 — Sökljus-payload för drönare | EU Drone Company",
    seoDesc: "Zenmuse S1 sökljus med 10 000 lumen och 500 m räckvidd för nattliga räddningsinsatser. Enterprise-payload för DJI Matrice. Begär offert.",
  },
  {
    slug: "zenmuse-v1",
    name: "Zenmuse V1",
    tag: "Kommunikationspayload",
    category: "utility",
    heroTitle: "Zenmuse V1 — Röstförstärkare och kommunikation",
    heroDesc: "Kraftfull högtalare med 129 dB och 700 m effektiv räckvidd. Sprid varningar, instruktioner och information under räddnings- och säkerhetsoperationer.",
    longDesc:
      "Zenmuse V1 är en kommunikationspayload med inbyggd högtalare på upp till 129 decibel och en effektiv räckvidd på 700 meter. Används av räddningstjänst, polis och säkerhetsbolag för att kommunicera med markpersonal, folkmassor eller personer i nödsituationer.",
    features: [
      "700 m effektiv räckvidd",
      "129 dB maximal ljudnivå",
      "Förinspelade meddelanden",
      "Realtidsröst via fjärrkontroll",
      "IP54-skydd",
      "Väger ca 0,69 kg",
    ],
    specs: [
      { label: "Räckvidd", value: "700 m (effektiv)" },
      { label: "Ljudnivå", value: "Upp till 129 dB" },
      { label: "Styrning", value: "Fjärrkontroll + förinspelat" },
      { label: "Vikt", value: "ca 0,69 kg" },
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
        answer: "129 dB räcker långt, men den effektiva räckvidden på 700 meter förutsätter rimliga förhållanden. Vid extremt buller, motvind eller stora avstånd rekommenderar vi att komplettera med visuell kommunikation via kamerapayload.",
      },
    ],
    seoTitle: "Zenmuse V1 — Högtalare-payload för drönare | EU Drone Company",
    seoDesc: "Zenmuse V1 röstförstärkare med 129 dB och 700 m räckvidd. Kommunikationspayload för räddning och säkerhet. Kontakta EU Drone Company.",
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
    "Zenmuse H20T": "zenmuse-h20t",
    "Zenmuse H20N": "zenmuse-h20n",
    "Zenmuse H20": "zenmuse-h20",
    "Zenmuse P1": "zenmuse-p1",
    "Zenmuse L1": "zenmuse-l1",
    "Zenmuse L2": "zenmuse-l2",
    "Zenmuse L3": "zenmuse-l3",
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
