/**
 * DJI Enterprise accessories, payloads, and configurations.
 * Maps each drone model to its compatible accessories with categories.
 * shopUrl links to the ActionKing.se Shopify store.
 */

import zenmuseH30TImg from "@/assets/dji-zenmuse-h30t.png";
import zenmuseH30Img from "@/assets/dji-zenmuse-h30.png";
import zenmuseS1Img from "@/assets/dji-zenmuse-s1.png";
import zenmuseV1Img from "@/assets/dji-zenmuse-v1.png";

export interface DroneAccessory {
  name: string;
  category: "payload" | "battery" | "dock" | "rtk" | "case" | "charger" | "other";
  desc: string;
  shopUrl?: string;
  /** Highlight tag, e.g. "Populär" */
  badge?: string;
  /** Product image URL */
  imageUrl?: string;
}

export const ACCESSORY_CATEGORIES: Record<DroneAccessory["category"], { label: string; emoji: string }> = {
  payload: { label: "Payloads & Kameror", emoji: "📷" },
  battery: { label: "Batterier", emoji: "🔋" },
  charger: { label: "Laddare & Stationer", emoji: "⚡" },
  dock: { label: "Dockningsstationer", emoji: "🏠" },
  rtk: { label: "RTK & Positionering", emoji: "📡" },
  case: { label: "Väskor & Transport", emoji: "💼" },
  other: { label: "Övrigt", emoji: "🔧" },
};

/**
 * Accessories keyed by drone name (must match DRONE_MEDIA keys exactly).
 */
export const DRONE_ACCESSORIES: Record<string, DroneAccessory[]> = {
  "DJI Matrice 400": [
    { name: "Zenmuse H30T", category: "payload", desc: "Bred vidvinkel, 40× optisk zoom, LRF, termisk kamera. DJI:s mest avancerade payload med termisk sensor.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30t-dronarkamera", imageUrl: zenmuseH30TImg },
    { name: "Zenmuse H30", category: "payload", desc: "Bred vidvinkel, 40× optisk zoom, LRF. DJI:s mest avancerade payload utan termisk sensor.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30-dronarkamera", imageUrl: zenmuseH30Img },
    { name: "Zenmuse S1", category: "payload", desc: "Kraftfull sökljus-payload med 4 LED-ljuskällor och IR-belysning. Perfekt för nattliga insatser och räddningsoperationer.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-s1-dronarkamera", imageUrl: zenmuseS1Img },
    { name: "Zenmuse V1", category: "payload", desc: "Kraftfull röstförstärkare och kommunikationspayload med 1500m räckvidd. Idealisk för räddning, säkerhet och crowd management.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-v1-kamerastabilisator", imageUrl: zenmuseV1Img },
  ],

  "DJI Matrice 300 RTK": [
    { name: "Zenmuse H30T", category: "payload", desc: "Bred vidvinkel, 40× optisk zoom, LRF, termisk kamera. DJI:s mest avancerade payload med termisk sensor.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30t-dronarkamera", imageUrl: zenmuseH30TImg },
    { name: "Zenmuse H30", category: "payload", desc: "Bred vidvinkel, 40× optisk zoom, LRF. DJI:s mest avancerade payload utan termisk sensor.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30-dronarkamera", imageUrl: zenmuseH30Img },
    { name: "Zenmuse S1", category: "payload", desc: "Kraftfull sökljus-payload med 4 LED-ljuskällor och IR-belysning. Perfekt för nattliga insatser och räddningsoperationer.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-s1-dronarkamera", imageUrl: zenmuseS1Img },
    { name: "Zenmuse V1", category: "payload", desc: "Kraftfull röstförstärkare och kommunikationspayload med 1500m räckvidd. Idealisk för räddning, säkerhet och crowd management.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-v1-kamerastabilisator", imageUrl: zenmuseV1Img },
  ],

  "DJI Matrice 350 RTK": [
    { name: "Zenmuse H30T", category: "payload", desc: "Bred vidvinkel, 40× optisk zoom, LRF, termisk kamera. DJI:s mest avancerade payload med termisk sensor.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30t-dronarkamera", imageUrl: zenmuseH30TImg },
    { name: "Zenmuse H30", category: "payload", desc: "Bred vidvinkel, 40× optisk zoom, LRF. DJI:s mest avancerade payload utan termisk sensor.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-h30-dronarkamera", imageUrl: zenmuseH30Img },
    { name: "Zenmuse S1", category: "payload", desc: "Kraftfull sökljus-payload med 4 LED-ljuskällor och IR-belysning. Perfekt för nattliga insatser och räddningsoperationer.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-s1-dronarkamera", imageUrl: zenmuseS1Img },
    { name: "Zenmuse V1", category: "payload", desc: "Kraftfull röstförstärkare och kommunikationspayload med 1500m räckvidd. Idealisk för räddning, säkerhet och crowd management.", badge: "Ny", shopUrl: "https://www.actionking.se/products/dji-zenmuse-v1-kamerastabilisator", imageUrl: zenmuseV1Img },
    { name: "Zenmuse H20 / H20T / H20N", category: "payload", desc: "Quad-sensor: 20MP zoom (23×), vidvinkel, LRF och termisk kamera.", shopUrl: "https://actionking.se/search?q=zenmuse+h20" },
    { name: "Zenmuse P1", category: "payload", desc: "45MP full-frame fotogrammetrikamera. 3 utbytbara objektiv. Perfekt för kartläggning.", shopUrl: "https://actionking.se/search?q=zenmuse+p1" },
    { name: "Zenmuse L2", category: "payload", desc: "LiDAR-sensor med 5 returer, 250m räckvidd, integrerad RGB-kamera.", badge: "Populär", shopUrl: "https://actionking.se/search?q=zenmuse+l2" },
    { name: "Zenmuse H20T (Termisk)", category: "payload", desc: "Termisk 640×512, radiometrisk mätning, 20MP visuell + 12MP zoom.", shopUrl: "https://actionking.se/search?q=zenmuse+h20t" },
    { name: "TB65 Intelligent Battery", category: "battery", desc: "Kraftfullt batteri med 5880 mAh. Stöder 400 laddcykler.", badge: "Rekommenderat", shopUrl: "https://actionking.se/search?q=tb65" },
    { name: "BS65 Intelligent Battery Station", category: "charger", desc: "Laddstation för 8× TB65-batterier. Automatisk laddning och uppvärmning.", shopUrl: "https://actionking.se/search?q=bs65" },
    { name: "DJI Dock 2", category: "dock", desc: "Helautomatisk dockningsstation. Weatherproof, automatisk laddning och start. 24/7 autonom drift.", badge: "Ny", shopUrl: "https://actionking.se/search?q=dji+dock+2" },
    { name: "DJI D-RTK 2 Mobile Station", category: "rtk", desc: "Hög-precision GNSS-mottagare för centimeterpositionering utan nätverks-RTK.", shopUrl: "https://actionking.se/search?q=d-rtk+2" },
    { name: "4G Dongle Kit", category: "rtk", desc: "4G-modem för förbättrad videotransmission via mobilnätverk.", shopUrl: "https://actionking.se/search?q=4g+dongle" },
    { name: "M350 RTK Transportväska", category: "case", desc: "IP67 hårdväska med skräddarsydd inredning för drönare, RC Plus och batterier.", shopUrl: "https://actionking.se/search?q=matrice+350+vaska" },
    { name: "DJI RC Plus Fjärrkontroll", category: "other", desc: "7\" HD-skärm, dubbel kontroll-stöd, inbyggd 4G. IP54-klassad.", shopUrl: "https://actionking.se/search?q=rc+plus" },
    { name: "DJI FlightHub 2", category: "other", desc: "Molnbaserad flyghanteringslösning för flottövervakning och planering.", shopUrl: "https://actionking.se/search?q=flighthub" },
    { name: "CSM Radar", category: "other", desc: "Millimetervågsradar för förbättrad hinderundvikning i alla riktningar.", shopUrl: "https://actionking.se/search?q=csm+radar" },
  ],

  "DJI Mavic 3 Enterprise": [
    { name: "RTK-modul (Mavic 3E)", category: "rtk", desc: "Centimeter-precision med nätverks-RTK. Snabb montering.", badge: "Populär", shopUrl: "https://actionking.se/search?q=mavic+3+enterprise+rtk" },
    { name: "DJI Mavic 3E Speaker", category: "other", desc: "Hög-volyms högtalare för varningar, kommunikation och räddningsinsatser.", shopUrl: "https://actionking.se/search?q=mavic+3+enterprise+speaker" },
    { name: "DJI Mavic 3E Spotlight", category: "other", desc: "Kraftfull spotlight för nattliga insatser och sök-och-räddning.", shopUrl: "https://actionking.se/search?q=mavic+3+enterprise+spotlight" },
    { name: "Mavic 3 Enterprise Battery", category: "battery", desc: "Intelligent batteri med 77 Wh kapacitet. Upp till 45 min flygtid.", shopUrl: "https://actionking.se/search?q=mavic+3+enterprise+batteri" },
    { name: "Mavic 3 Battery Hub (100W)", category: "charger", desc: "Laddare för sekventiell laddning av flera batterier.", shopUrl: "https://actionking.se/search?q=mavic+3+battery+hub" },
    { name: "Mavic 3E Transportväska", category: "case", desc: "Kompakt väska anpassad för Mavic 3 Enterprise med alla tillbehör.", shopUrl: "https://actionking.se/search?q=mavic+3+enterprise+vaska" },
    { name: "DJI RC Pro Enterprise", category: "other", desc: "Fjärrkontroll med ljusstark skärm och DJI O3 Enterprise-transmission.", shopUrl: "https://actionking.se/search?q=rc+pro+enterprise" },
    { name: "DJI FlightHub 2", category: "other", desc: "Molnbaserad flyghanteringslösning för flottövervakning och planering.", shopUrl: "https://actionking.se/search?q=flighthub" },
    { name: "DJI Dock 2 (Mavic 3E)", category: "dock", desc: "Dockningsstation anpassad för Mavic 3 Enterprise. Autonom drift 24/7.", badge: "Ny", shopUrl: "https://actionking.se/search?q=dji+dock+2" },
  ],

  "DJI Agras T50": [
    { name: "Spridartank 40L", category: "other", desc: "40-liters spruttank med terrängföljningssystem.", shopUrl: "https://actionking.se/search?q=agras+t50+tank" },
    { name: "Spridartank 50 kg (Granulat)", category: "other", desc: "50 kg kapacitet för granulat, utsäde och gödsel.", shopUrl: "https://actionking.se/search?q=agras+t50+spridare" },
    { name: "DJI Agras T50 Battery (30000 mAh)", category: "battery", desc: "Kraftfullt batteri för lång drifttid vid sprutning.", shopUrl: "https://actionking.se/search?q=agras+t50+batteri" },
    { name: "Agras T50 Laddstation", category: "charger", desc: "Snabbladdare för Agras-batterier. Ladda 2 batterier samtidigt.", shopUrl: "https://actionking.se/search?q=agras+t50+laddare" },
    { name: "DJI Agras D-RTK 2 Marksstation", category: "rtk", desc: "RTK-basstation för centimeterprecision vid sprut- och spridningsflygningar.", shopUrl: "https://actionking.se/search?q=agras+d-rtk" },
  ],

  "DJI Mavic 3 Multispectral": [
    { name: "RTK-modul (Mavic 3M)", category: "rtk", desc: "Centimeterprecision för exakt kartläggning och NDVI-analys.", badge: "Rekommenderat", shopUrl: "https://actionking.se/search?q=mavic+3+multispectral+rtk" },
    { name: "Mavic 3M Battery", category: "battery", desc: "Intelligent batteri med upp till 43 min flygtid.", shopUrl: "https://actionking.se/search?q=mavic+3+multispectral+batteri" },
    { name: "Mavic 3M Battery Hub", category: "charger", desc: "Sekventiell laddning av flera batterier.", shopUrl: "https://actionking.se/search?q=mavic+3+multispectral+laddare" },
    { name: "Mavic 3M Transportväska", category: "case", desc: "Skyddande väska för drönare och tillbehör.", shopUrl: "https://actionking.se/search?q=mavic+3+multispectral+vaska" },
  ],

  "DJI Inspire 3": [
    { name: "Zenmuse X9-8K Air Gimbal Camera", category: "payload", desc: "Full-frame 8K CinemaDNG RAW, 14+ stopps dynamiskt omfång.", badge: "Professionell", shopUrl: "https://actionking.se/search?q=zenmuse+x9+8k" },
    { name: "DL Objektiv 24mm f/2.8", category: "payload", desc: "DL-fattning, vidvinkel för landskaps- och arkitekturfilm.", shopUrl: "https://actionking.se/search?q=dl+24mm" },
    { name: "DL Objektiv 35mm f/2.8", category: "payload", desc: "Mångsidigt objektiv, perfekt för dokumentär och reklam.", shopUrl: "https://actionking.se/search?q=dl+35mm" },
    { name: "DL Objektiv 50mm f/2.8", category: "payload", desc: "Normalbrännvidd för porträtt- och produktionsarbete.", shopUrl: "https://actionking.se/search?q=dl+50mm" },
    { name: "TB51 Intelligent Battery", category: "battery", desc: "Snabbladdningsbatteri, 4280 mAh. Upp till 28 min flygtid.", shopUrl: "https://actionking.se/search?q=tb51+batteri" },
    { name: "Inspire 3 Charging Hub", category: "charger", desc: "Ladda flera TB51-batterier sekventiellt.", shopUrl: "https://actionking.se/search?q=inspire+3+laddare" },
    { name: "Inspire 3 Transportväska", category: "case", desc: "Professionell flygväska för Inspire 3, kameror och tillbehör.", shopUrl: "https://actionking.se/search?q=inspire+3+vaska" },
    { name: "DJI RC Plus Fjärrkontroll", category: "other", desc: "Dual operator-stöd med 7\" skärm och O3+ transmission.", shopUrl: "https://actionking.se/search?q=rc+plus" },
    { name: "FPV Gimbal (Inspire 3)", category: "other", desc: "FPV-styrning för dynamisk filmflyg med separat operatör.", shopUrl: "https://actionking.se/search?q=inspire+3+fpv" },
  ],

  "DJI Mavic 3 Pro": [
    { name: "Mavic 3 Pro Intelligent Battery", category: "battery", desc: "5000 mAh, upp till 43 min flygtid.", shopUrl: "https://actionking.se/search?q=mavic+3+pro+batteri" },
    { name: "Mavic 3 Pro Battery Hub (65W)", category: "charger", desc: "Ladda upp till 3 batterier sekventiellt.", shopUrl: "https://actionking.se/search?q=mavic+3+pro+laddare" },
    { name: "Mavic 3 Pro ND-filterkit", category: "other", desc: "ND8/16/32/64 filter för professionell video i starkt ljus.", badge: "Populär", shopUrl: "https://actionking.se/search?q=mavic+3+pro+nd+filter" },
    { name: "DJI RC Pro Controller", category: "other", desc: "Professionell fjärrkontroll med 5.5\" ljusstark skärm.", shopUrl: "https://actionking.se/search?q=rc+pro" },
    { name: "Mavic 3 Pro Transportväska", category: "case", desc: "Kompakt väska med plats för drönare och alla tillbehör.", shopUrl: "https://actionking.se/search?q=mavic+3+pro+vaska" },
  ],
};

/**
 * Get accessories for a specific drone, grouped by category.
 */
export function getAccessoriesByDrone(droneName: string): Map<DroneAccessory["category"], DroneAccessory[]> {
  const accessories = DRONE_ACCESSORIES[droneName] || [];
  const grouped = new Map<DroneAccessory["category"], DroneAccessory[]>();
  for (const acc of accessories) {
    const existing = grouped.get(acc.category) || [];
    existing.push(acc);
    grouped.set(acc.category, existing);
  }
  return grouped;
}

/**
 * Get all accessories for a list of drones (e.g. recommended drones for an industry).
 * Deduplicates by name.
 */
export function getAccessoriesForDrones(droneNames: string[]): DroneAccessory[] {
  const seen = new Set<string>();
  const result: DroneAccessory[] = [];
  for (const name of droneNames) {
    const accessories = DRONE_ACCESSORIES[name] || [];
    for (const acc of accessories) {
      if (!seen.has(acc.name)) {
        seen.add(acc.name);
        result.push(acc);
      }
    }
  }
  return result;
}
