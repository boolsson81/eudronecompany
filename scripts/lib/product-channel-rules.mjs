/**
 * Product channel classification rules for ActionKing catalog.
 * Channels: EuroDroneParts | EUActionCam | Shared | Archive
 */

export const ACTIONKING_SHOP_ID = "010120e6-6def-431e-8614-905cb69f85b9";

export const DRONE_KEYWORDS = [
  "dron", "drone", "drönare", "dji", "autel", "parrot", "skydio",
  "rtk", "payload", "gimbal", "propeller", "propellrar",
  "fpv", "multirotor", "quad", "mavic", "matrice", "phantom",
  "enterprise", "agras", "flygtid", "nyttolast", "uav", "aerial",
  "tello", "avata", "inspire", "spark", "air ", "mini ",
  "walkera", "wingtra", "livox", "czi", "brdrc",
];

export const ACTION_CAM_KEYWORDS = [
  "gopro", "insta360", "osmo action", "osmo pocket", "actionkamera", "action cam",
  "action camera", "hero ", "ace pro", "dive case", "undervattenshus",
  "feiyu", "feiyutech", "dji action", "akaso", "sjcam",
];

export const ARCHIVE_PRODUCT_TYPES = new Set(["Arkiv", "arkiv"]);
export const ARCHIVE_STATUSES = new Set(["archived", "draft"]);

/** product_type → primary channel (before keyword overrides) */
export const PRODUCT_TYPE_CHANNEL = {
  // EuroDroneParts — drones & drone ecosystem
  "Drönare": "EuroDroneParts",
  "Drönare för företag": "EuroDroneParts",
  "Enterprise Drönare": "EuroDroneParts",
  "Reservdelar till drönare": "EuroDroneParts",
  "Drönar filter": "EuroDroneParts",
  "Propellrar": "EuroDroneParts",
  "Tillbehör till drönare": "EuroDroneParts",
  "Drönarväska": "EuroDroneParts",
  "Fjärrkontrollstillbehör": "EuroDroneParts",
  "Fjärrkontroller": "EuroDroneParts",

  // EUActionCam — action cameras & accessories
  "Actionkameror": "EUActionCam",
  "Tillbehör till actionkameror": "EUActionCam",
  "Reservdel till Actionkameror": "EUActionCam",
  "Actionkamera filter": "EUActionCam",
  "Kameragrepp": "EUActionCam",
  "Kamerafilter": "EUActionCam",

  // Shared — cross-channel accessories
  "DJI & GoPro Accessories": "Shared",
  "Batterier": "Shared",
  "Batteri tillbehör": "Shared",
  "Powerbanks": "Shared",
  "Väskor": "Shared",
  "Fästen": "Shared",
  "Laddare": "Shared",
  "Solceller": "Shared",
  "Kablar": "Shared",
  "kablar": "Shared",
  "Adaptrar": "Shared",
  "Minneskort, Lagring": "Shared",
  "Stativ": "Shared",
  "Gimbal": "Shared",
  "Tillbehör": "Shared",
  "Kameratillbehör": "Shared",
  "Camera Accessories": "Shared",
  "Kameror": "Shared",
  "Skydd": "Shared",
  "Mobiltelefontillbehör": "Shared",
  "Mobile Accessories": "Shared",
  "Mobile Parts": "Shared",
  "Nyckelringar": "Shared",
  "Ljud": "Shared",
  "ljud": "Shared",
  "Consumer Electronics": "Shared",
  "Belysning": "Shared",
  "Ficklampor": "Shared",
  "Pannlampor": "Shared",

  // Archive
  "Arkiv": "Archive",

  // Off-assortment → Archive (not sold on either niche channel)
  "El-Scooter": "Archive",
  "Vandring & Outdoor": "Archive",
  "Myggskydd": "Archive",
  "Överlevnadsutrustning": "Archive",
  "Kommunikationsutrustning": "Archive",
  "Home & Garden": "Archive",
  "Verktyg": "Archive",
  "Kikare": "Archive",
};

/** Vendors strongly associated with one channel */
export const VENDOR_CHANNEL = {
  DJI: "EuroDroneParts",
  Walkera: "EuroDroneParts",
  Wingtra: "EuroDroneParts",
  Autel: "EuroDroneParts",
  Parrot: "EuroDroneParts",
  CZI: "EuroDroneParts",
  BRDRC: "EuroDroneParts",
  Livox: "EuroDroneParts",
  "Master Airscrew": "EuroDroneParts",
  GoPro: "EUActionCam",
  Insta360: "EUActionCam",
  FeiyuTech: "EUActionCam",
  Telesin: "EUActionCam",
  Puluz: "EUActionCam",
};

/** Vendors that are off-catalog for both niche stores */
export const OFF_CATALOG_VENDORS = new Set([
  "EcoFlow", "Targus", "Anker", "Sony", "Twelve South", "Mova", "Dreame",
  "Navimow", "RingConn", "Xgimi", "Nitecore", "Energizer", "Panasonic",
  "Canon", "Polaroid", "Roccat", "Steel", "ZeppHealth", "Ubtech",
  "Hikmicro", "HasselBlad", "Hasselblad", "Baseus", "Lexar", "Kowa",
  "Obsbot", "Aosu", "Outin", "Rollei", "Flymile", "FOCUS OPTICS",
]);

function blob(...parts) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function hasKeyword(text, keywords) {
  const b = blob(text);
  return keywords.some((k) => b.includes(k));
}

/**
 * Classify a single product.
 * @returns {{ channel: string, reasons: string[], confidence: 'high'|'medium'|'low' }}
 */
export function classifyProduct(product) {
  const reasons = [];
  const title = product.title || "";
  const vendor = product.vendor || "";
  const productType = product.product_type || "";
  const tags = product.tags || "";
  const status = (product.status || "").toLowerCase();
  const text = blob(title, vendor, productType, tags);

  // Archive gates
  if (ARCHIVE_PRODUCT_TYPES.has(productType)) {
    return { channel: "Archive", reasons: ["product_type=Arkiv"], confidence: "high" };
  }
  if (status === "archived") {
    return { channel: "Archive", reasons: ["status=archived"], confidence: "high" };
  }
  if (OFF_CATALOG_VENDORS.has(vendor)) {
    return { channel: "Archive", reasons: [`vendor=${vendor} (off-catalog)`], confidence: "medium" };
  }
  if (productType === "El-Scooter" || hasKeyword(title, ["el-scooter", "elsparkcykel", "e-scooter"])) {
    return { channel: "Archive", reasons: ["off-assortment: el-scooter"], confidence: "high" };
  }

  const typeChannel = PRODUCT_TYPE_CHANNEL[productType];
  const vendorChannel = VENDOR_CHANNEL[vendor];
  const droneHit = hasKeyword(text, DRONE_KEYWORDS);
  const camHit = hasKeyword(text, ACTION_CAM_KEYWORDS);

  if (typeChannel === "Archive") {
    return { channel: "Archive", reasons: [`product_type=${productType}`], confidence: "high" };
  }

  // Explicit product_type mapping
  if (typeChannel) {
    reasons.push(`product_type=${productType}`);
    // Cross-signal check for misplaced
    if (typeChannel === "EuroDroneParts" && camHit && !droneHit) {
      return { channel: "EUActionCam", reasons: [...reasons, "title/tags action-cam signal"], confidence: "medium" };
    }
    if (typeChannel === "EUActionCam" && droneHit && !camHit) {
      return { channel: "EuroDroneParts", reasons: [...reasons, "title/tags drone signal"], confidence: "medium" };
    }
    if (typeChannel === "Shared") {
      if (droneHit && !camHit) return { channel: "EuroDroneParts", reasons: [...reasons, "shared→drone keyword"], confidence: "medium" };
      if (camHit && !droneHit) return { channel: "EUActionCam", reasons: [...reasons, "shared→action-cam keyword"], confidence: "medium" };
      return { channel: "Shared", reasons, confidence: "high" };
    }
    return { channel: typeChannel, reasons, confidence: "high" };
  }

  // Vendor fallback
  if (vendorChannel) {
    reasons.push(`vendor=${vendor}`);
    return { channel: vendorChannel, reasons, confidence: "medium" };
  }

  // Keyword fallback
  if (droneHit && camHit) {
    return { channel: "Shared", reasons: ["drone+action-cam keywords"], confidence: "low" };
  }
  if (droneHit) {
    return { channel: "EuroDroneParts", reasons: ["drone keyword fallback"], confidence: "low" };
  }
  if (camHit) {
    return { channel: "EUActionCam", reasons: ["action-cam keyword fallback"], confidence: "low" };
  }

  // Null/unknown product_type
  if (!productType || productType.trim() === "") {
    return { channel: "Shared", reasons: ["null product_type"], confidence: "low" };
  }

  return { channel: "Shared", reasons: [`unmapped product_type=${productType}`], confidence: "low" };
}

/** Detect if product looks misplaced relative to its assigned channel */
export function detectMisplaced(product, assignedChannel) {
  const { channel: suggested, confidence } = classifyProduct(product);
  if (suggested === assignedChannel) return null;
  if (confidence === "low" && assignedChannel === "Shared") return null;

  const typeChannel = PRODUCT_TYPE_CHANNEL[product.product_type || ""];
  const conflict =
    (assignedChannel === "EuroDroneParts" && suggested === "EUActionCam") ||
    (assignedChannel === "EUActionCam" && suggested === "EuroDroneParts") ||
    (assignedChannel !== "Archive" && suggested === "Archive" && typeChannel !== "Shared") ||
    (assignedChannel === "Archive" && (suggested === "EuroDroneParts" || suggested === "EUActionCam") && confidence !== "low");

  if (!conflict) return null;

  return {
    assigned: assignedChannel,
    suggested,
    confidence,
    reason: classifyProduct(product).reasons.join("; "),
  };
}

export const CHANNELS = ["EuroDroneParts", "EUActionCam", "Shared", "Archive"];
