/**
 * Shared Swedish → English handle migration logic for EuroDroneParts.
 * Read-only analysis — no store mutations.
 */
import { writeFileSync } from "fs";

export const HANDLE_OVERRIDES = {
  // Collections — canonical English per launch spec
  jordbruksdronare: "agriculture-drones",
  inspektionsdronare: "inspection-drones",
  "termiska-dronare": "thermal-drones",
  reservdelar: "spare-parts",
  skogsbruksdronare: "forestry-drones",
  "kartlaggnings-and-matdronare": "mapping-survey-drones",
  "last-and-transportdronare": "cargo-transport-drones",
  // Pages
  "service-och-support": "service-support",
  kontakta: "contact-us",
  contact: "contact-us",
  "om-oss": "about-us",
  reparationer: "repairs",
  repair: "repairs",
  foretagskonto: "business-account",
  "enterprise-account": "business-account",
  offertforfragan: "request-a-quote",
  "quote-request": "request-a-quote",
  "vara-varumarken": "brands",
  kopvillkor: "terms-of-sale",
  kablar: "cables",
  ljud: "audio",
  "gopro-faste": "gopro-mount",
  "basta-myggskyddet": "best-mosquito-repellent",
  "rekalamtioner-aterkop": "claims-buyback",
  "samarbeta-with-oss": "partner-with-us",
  "vilken-bilkamera-ar-bast": "which-dash-cam-is-best",
  // Blogs
  nyheter: "news",
  guider: "guides",
  kunskapsbank: "knowledge-base",
};

export const SWEDISH_TOKEN_MAP = [
  ["dronarutrustning", "drone-equipment"], ["dronarelektronik", "drone-electronics"],
  ["dronarmatta", "drone-mat"], ["fjarrkontrollstillbehor", "remote-control-accessories"],
  ["fjärrkontrollstillbehör", "remote-control-accessories"], ["kameratillbehor", "camera-accessories"],
  ["tillbehor", "accessories"], ["tillbehör", "accessories"], ["reservdelar", "spare-parts"],
  ["dronare", "drones"], ["dronar", "drone"], ["drönare", "drones"], ["drönar", "drone"],
  ["propellrar", "propellers"], ["fjarrkontroller", "remote-controls"], ["fjärrkontroller", "remote-controls"],
  ["fjarrkontroll", "remote-control"], ["belysning", "lighting"], ["vaskor", "bags"], ["vaska", "bag"],
  ["väskor", "bags"], ["väska", "bag"], ["kablar", "cables"], ["kabel", "cable"],
  ["rengoringsprodukter", "cleaning-products"], ["reparation", "repair"], ["reparera", "repair"],
  ["precisionsverktyg", "precision-tools"], ["skruvmejsel", "screwdriver"], ["bandverktyg", "pliers"],
  ["bändverktyg", "pliers"], ["pincetter", "tweezers"], ["tanger", "pliers"], ["kapor", "covers"],
  ["kåpor", "covers"], ["landningsstall", "landing-gear"], ["landning", "landing"], ["skydd", "protection"],
  ["minneskort", "memory-cards"], ["lagring", "storage"], ["jordbruksdronare", "agriculture-drones"],
  ["jordbruks", "agriculture"], ["inspektionsdronare", "inspection-drones"], ["inspektions", "inspection"],
  ["termiska-dronare", "thermal-drones"], ["termiska", "thermal"],
  ["kartlaggning", "mapping"], ["kartläggning", "mapping"], ["matdronare", "survey-drones"],
  ["mätdronare", "survey-drones"], ["skogsbruksdronare", "forestry-drones"], ["skogsbruks", "forestry"],
  ["lastdronare", "cargo-drones"], ["last-och-transportdronare", "cargo-transport-drones"],
  ["transportdronare", "transport-drones"], ["alla-produkter", "all-products"], ["alla-konsumentdronare", "all-consumer-drones"],
  ["energi-infrastruktur", "energy-infrastructure"], ["transport-logistik", "transport-logistics"],
  ["hogtalarsystem", "speaker-systems"], ["högtalarsystem", "speaker-systems"], ["lyftsystem", "lifting-systems"],
  ["sensorer", "sensors"], ["foretag", "business"], ["företag", "business"], ["foretagskonto", "business-account"],
  ["företagskonto", "business-account"], ["offertforfragan", "request-a-quote"], ["offertförfrågan", "request-a-quote"],
  ["service-och-support", "service-support"], ["kontakta", "contact"], ["kontakta-oss", "contact-us"], ["guider", "guides"],
  ["nyheter", "news"], ["kunskapsbank", "knowledge-base"], ["om-oss", "about-us"],
  ["raddningstjanst", "emergency-services"], ["räddningstjänst", "emergency-services"],
  ["gis-kartlaggning", "gis-mapping"], ["mobiltillbehor", "mobile-accessories"], ["actionkameror", "action-cameras"],
  ["vandring", "hiking"], ["utrustning", "equipment"], ["ansok", "apply"], ["ansök", "apply"],
  ["dronartillbehor", "drone-accessories"], ["fasten", "mounts"], ["fästen", "mounts"], ["adaptrar", "adapters"],
  ["multiverktyg", "multi-tools"], ["ringlampa", "ring-light"], ["vattentatt", "waterproof"], ["vattentätt", "waterproof"],
  ["kameratillbehor", "camera-accessories"], ["serien", "series"], ["serie", "series"], ["konsumentdronare", "consumer-drones"],
  ["branschlosningar", "industry-solutions"], ["branschlösningar", "industry-solutions"], ["varumarken", "brands"],
  ["kopvillkor", "terms-of-sale"], ["reklamation", "claims"], ["aterkop", "buyback"], ["samarbeta", "partner"],
  ["basta", "best"], ["myggskydd", "mosquito-repellent"], ["ljud", "audio"], ["faste", "mount"],
  ["stabilisering", "stabilization"], ["armar", "arms"], ["antenner", "antennas"], ["motorer", "motors"],
  ["kameror", "cameras"], ["skal", "shell"], ["varmekamera", "thermal-camera"], ["varme", "thermal"],
  ["felsokning", "troubleshooting"], ["felsökning", "troubleshooting"], ["kalibrering", "calibration"],
  ["batteritest", "battery-test"], ["firmwareuppdatering", "firmware-update"], ["garantihantering", "warranty-management"],
  ["serviceanmalan", "service-request"], ["serviceanmälan", "service-request"], ["finansiering", "financing"],
  ["serviceavtal", "service-agreement"], ["supportavtal", "support-agreement"], ["utbildning", "training"],
  ["partnerprogram", "partner-program"], ["vindkraft", "wind-power"], ["solparker", "solar-parks"],
  ["kraftnat", "power-grid"], ["kraftnät", "power-grid"], ["bygg-anlaggning", "construction"],
  ["bygg-anläggning", "construction"], ["sakerhet-raddning", "security-rescue"], ["säkerhet-raddning", "security-rescue"],
  ["sakerhet", "security"], ["säkerhet", "security"], ["laddare", "charger"], ["laddningsbara", "rechargeable"],
  ["uppladdnings", "rechargeable"], ["tradlos", "wireless"], ["trådlös", "wireless"], ["mikrofon", "microphone"],
  ["ficklampa", "flashlight"], ["spela-in", "record-audio"], ["ministativ", "mini-tripod"],
  ["selfiepinne", "selfie-stick"], ["silikonskal", "silicone-case"], ["silikon", "silicone"],
  ["skyddande", "protective"], ["forvaring", "storage"], ["förvaring", "storage"], ["batteri", "battery"],
  ["regler", "regulations"], ["sportkamera", "action-camera"], ["linsskydd", "lens-protector"],
  ["metallbur", "metal-cage"], ["kameraskydd", "camera-protection"], ["tillbehorskablar", "accessory-cables"],
  ["elektronik", "electronics"], ["ovriga", "other"], ["övriga", "other"], ["meny", "menu"],
  ["huvudmeny", "main-menu"], ["sidfotsmeny", "footer-menu"], ["oversikt", "overview"], ["översikt", "overview"],
  ["omfattande", "comprehensive"], ["omfattande-sortiment", "full-range"], ["konsument", "consumer"],
  ["friluftsliv", "outdoor"], ["dykutrustning", "diving-equipment"], ["vandringsutrustning", "hiking-equipment"],
  ["campingutrustning", "camping-equipment"], ["overlevnadsutrustning", "survival-equipment"],
  ["bransch", "industry"], ["tjänster", "services"], ["tjanster", "services"],
  // "skydds-" compounds — must stay ahead of the bare "skydd" token so they resolve to real
  // English compounds instead of the naive "protection" + dangling Swedish suffix (e.g.
  // "skyddsfodral" -> "protectionsfodral").
  ["skyddsfodral", "protective-case"], ["skyddsfodra", "protective-case"], ["skyddsram", "protective-frame"],
  ["skyddsramar", "protective-frames"], ["skyddsbur", "protective-cage"], ["skyddsburar", "protective-cages"],
  ["skyddsskal", "protective-shell"], ["skyddspaket", "protection-kit"], ["skyddsfaste", "protective-mount"],
  ["skyddskapa", "protective-cover"], ["skyddstillbehor", "protective-accessories"],
  ["skyddstillbehör", "protective-accessories"], ["skyddsfilter", "protective-filter"],
  ["skyddsglas", "protective-glass"], ["skyddsfilm", "protective-film"], ["skyddsvaska", "protective-bag"],
  ["skyddsväska", "protective-bag"], ["skyddsringar", "protective-rings"], ["skyddsring", "protective-ring"],
  ["gimbalskydd", "gimbal-protector"], ["undervattenshus", "underwater-housing"],
  ["batterilada", "battery-box"], ["batterilåda", "battery-box"], ["laddkabel", "charging-cable"],
  ["kontrollkabel", "control-cable"], ["vinklad", "angled"], ["justerbar", "adjustable"],
  ["forlangningsstang", "extension-pole"], ["förlängningsstång", "extension-pole"], ["vikbart", "foldable"],
  ["vikbar", "foldable"], ["stotsaker", "shockproof"], ["stötsäker", "shockproof"],
  ["expansionsrem", "extension-strap"], ["bordsklamma", "desk-clamp"], ["tolk-mikrofon", "translator-microphone"],
  ["tolkmikrofon", "translator-microphone"], ["actionkamera", "action-camera"],
  ["skyddsvaskor", "protective-bags"], ["skyddsväskor", "protective-bags"],
  ["skyddskort", "protective-card"], ["skyddslock", "protective-cap"],
  ["skyddsbage", "protective-guard"], ["skyddsbåge", "protective-guard"],
  ["skarmsskydd", "screen-protector"], ["skarmskydd", "screen-protector"], ["skärmskydd", "screen-protector"],
  ["sakerhetslina", "safety-strap"], ["säkerhetslina", "safety-strap"],
  ["skydda", "protect"], ["kamerabur", "camera-cage"], ["plastram", "plastic-frame"],
  ["alubur", "aluminum-cage"], ["panoramakamera", "panorama-camera"],
  // High-frequency connector words / adjectives that show up in nearly every product title.
  ["och", "and"], ["med", "with"], ["till", "for"], ["av", "of"],
  ["mjukt", "soft"], ["mjuk", "soft"], ["optimalt", "optimal"], ["optimal", "optimal"],
  ["praktisk", "practical"], ["hallbar", "durable"], ["hållbar", "durable"],
  ["hogkvalitativ", "high-quality"], ["högkvalitativ", "high-quality"], ["robust", "robust"],
];

export const ENGLISH_SEGMENTS = new Set([
  "accessories", "spare", "parts", "drones", "drone", "series", "batteries", "battery", "propellers",
  "propeller", "filters", "filter", "lighting", "remote", "controls", "control", "protection", "storage",
  "memory", "cards", "enterprise", "professional", "inspection", "agricultural", "agriculture", "forestry",
  "mapping", "survey", "cargo", "transport", "logistics", "energy", "infrastructure", "sensors", "speaker",
  "speakers", "lifting", "systems", "system", "mounts", "adapters", "adapter", "cameras", "camera", "cables",
  "cable", "cleaning", "products", "repair", "repairs", "precision", "tools", "quiet", "other", "with", "for",
  "and", "the", "all", "air", "mini", "mavic", "matrice", "agras", "flycart", "phantom", "inspire", "flip",
  "neo", "avata", "fpv", "rtk", "gimbal", "arms", "antennas", "motors", "shell", "bags", "cases", "bag",
  "case", "covers", "cover", "landings", "landing", "gear", "electronics", "components", "flight", "thermal",
  "waterproof", "industry", "solutions", "guides", "news", "contact", "support", "service", "request", "quote",
  "business", "account", "training", "partner", "program", "warranty", "calibration", "troubleshooting",
  "firmware", "update", "leasing", "financing", "agreement", "dji", "gopro", "insta360", "polarpro", "pgytech",
  "sunnylife", "master", "airscrew", "brdrc", "amagisn", "airdrop", "hoverair", "nitecore", "usb", "faq",
  "feedback", "cookies", "privacy", "terms", "sale", "returns", "claims", "about", "student", "tripod",
  "flashlight", "audio", "brands", "mount", "stabilization", "legacy", "comprehensive", "range", "advanced",
  "technology", "full", "dock", "expansion", "deploy", "pro", "max", "hero", "action", "gps", "gis", "wifi",
  "lte", "4k", "360", "cine", "classic", "b2b", "rma", "construction", "security", "rescue", "wind", "power",
  "solar", "parks", "grid", "knowledge", "base", "us",
]);

export const ENGLISH_OK =
  /^(dji|gopro|insta360|polarpro|pgytech|sunnylife|master-airscrew|brdrc|amagisn|airdrop-system|enterprise|partnership|polarpro|usb|cn|eu|fpv|rtk|osmo|neo|avata|mavic|matrice|agras|flycart|phantom|inspire|flip|mini|air|rc|pro|max|hero|action|gps|gis|fpv|wifi|lte|4k|360|3d|2d|v1|v2|pro|dock)$/i;

export const MENU_HANDLE_MAP = {
  "enterprise-expansion-deploy": "enterprise-drones",
  "spare-parts-deploy": "spare-parts",
  "service-support-deploy": "service-support",
  "b2b-enterprise-deploy": "b2b-enterprise",
  "enterprise-dr-nare": "enterprise-drones",
  "enterprise-expansion-deploy": "enterprise",
  "spare-parts-deploy": "spare-parts",
  "service-support-deploy": "service-support",
  "b2b-enterprise-deploy": "business",
  "b2b-enterprise": "business",
  "enterprise-dr-nare": "enterprise",
  "enterprise-drones": "enterprise",
  meny: "main-menu",
};

export const MENU_TITLE_MAP = {
  "main-menu": "Main Menu",
  footer: "Footer Menu",
  "customer-account-main-menu": "Customer Account",
  "enterprise-expansion-deploy": "Enterprise Drones",
  "enterprise-dr-nare": "Enterprise Drones",
  "enterprise-drones": "Enterprise Drones",
  "spare-parts-deploy": "Spare Parts",
  "spare-parts": "Spare Parts",
  "service-support-deploy": "Service & Support",
  "service-support": "Service & Support",
  "b2b-enterprise-deploy": "B2B Enterprise",
  "b2b-enterprise": "B2B Enterprise",
  "enterprise-expansion-deploy": "Enterprise",
  "enterprise-dr-nare": "Enterprise",
  "enterprise-drones": "Enterprise",
  enterprise: "Enterprise",
  "spare-parts-deploy": "Spare Parts",
  "spare-parts": "Spare Parts",
  "service-support-deploy": "Support",
  "service-support": "Support",
  "b2b-enterprise-deploy": "Business",
  "b2b-enterprise": "Business",
  business: "Business",
  partnership: "Partnership",
};

export const MENU_TITLE_TRANSLATIONS = [
  ["Huvudmeny", "Main Menu"],
  ["Sidfotsmeny", "Footer Menu"],
  ["Huvudmeny för kundkonto", "Customer Account"],
  ["Enterprise Drönare", "Enterprise Drones"],
  ["Enterprise Expansion", "Enterprise Drones"],
  ["Reservdelar", "Spare Parts"],
  ["Företag", "B2B Enterprise"],
  ["Enterprise & B2B", "B2B Enterprise"],
  ["Nyheter", "News"],
  ["Kunskapsbank", "Knowledge Base"],
  ["Om Oss", "About Us"],
  ["Kontakta Oss", "Contact Us"],
  ["Tillbehör", "Accessories"],
  ["Branschlösningar", "Industry Solutions"],
  ["Drönare", "Drones"],
  ["Legacy DJI", "Legacy DJI"],
];

export const PRODUCTION_MENU_HANDLES = new Set([
  "main-menu",
  "enterprise-drones",
  "spare-parts",
  "service-support",
  "b2b-enterprise",
  "enterprise",
  "spare-parts",
  "service-support",
  "business",
  "partnership",
  "footer",
  "customer-account-main-menu",
]);

const SWEDISH_TOKENS = SWEDISH_TOKEN_MAP.map(([sv]) => sv);

export function segments(handle) {
  return String(handle || "").toLowerCase().split("-").filter(Boolean);
}

function segmentIsSwedish(seg) {
  if (!seg || ENGLISH_SEGMENTS.has(seg)) return false;
  if (ENGLISH_OK.test(seg)) return false;
  for (const [sv] of SWEDISH_TOKEN_MAP) if (seg === sv) return true;
  return SWEDISH_TOKENS.some((t) => seg === t || (t.length > 4 && seg.includes(t)));
}

export function isSwedishHandle(handle) {
  if (!handle) return false;
  if (HANDLE_OVERRIDES[handle]) return true;
  const segs = segments(handle);
  if (segs.some((s) => /[åäö]/.test(s))) return true;
  return segs.some(segmentIsSwedish);
}

function slugify(parts) {
  return parts
    .filter(Boolean)
    .join("-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function proposeEnglishHandle(handle) {
  const original = String(handle || "").trim();
  if (!original) return original;
  if (HANDLE_OVERRIDES[original]) return HANDLE_OVERRIDES[original];
  if (MENU_HANDLE_MAP[original]) return MENU_HANDLE_MAP[original];
  if (!isSwedishHandle(original)) return original;

  const parts = segments(original);
  const translated = parts.map((p) => {
    if (HANDLE_OVERRIDES[p]) return HANDLE_OVERRIDES[p];
    if (ENGLISH_SEGMENTS.has(p) || ENGLISH_OK.test(p)) return p;
    for (const [sv, en] of SWEDISH_TOKEN_MAP) if (p === sv) return en;
    // Partial/compound match: wrap each substitution in hyphens so a translated fragment
    // glued to another word (Swedish or English) reads as separate words instead of one
    // run-on token (e.g. "gimbalfaste" -> "gimbal-mount", not "gimbalmount").
    let out = p;
    for (const [sv, en] of [...SWEDISH_TOKEN_MAP].filter(([s]) => s.length >= 4).sort((a, b) => b[0].length - a[0].length)) {
      if (out.includes(sv)) out = out.split(sv).join(`-${en}-`);
    }
    out = out.replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
    return out.replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o");
  });

  const deduped = slugify(translated)
    .split("-")
    .filter((seg, i, arr) => seg !== arr[i - 1]);

  return deduped.join("-") || original;
}

export function isLegacyActionKingPage(handle) {
  return /actionking|action-king/i.test(handle || "");
}

export function isLegacyExcludePage(handle) {
  return (
    isLegacyActionKingPage(handle) ||
    /^(all-products-actionking|cookies-actionking|om-actionking|samarbeta-with-actionking|we-buy-drones-actionking|_test-)/i.test(
      handle || "",
    )
  );
}

export function csvEscape(v) {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

export function csvRow(obj, cols) {
  return cols.map((c) => csvEscape(obj[c])).join(",");
}

export function writeCsv(path, cols, rows) {
  writeFileSync(
    path,
    [csvRow(Object.fromEntries(cols.map((c) => [c, c])), cols), ...rows.map((r) => csvRow(r, cols))].join("\n") + "\n",
  );
}

export function urlPath(type, handle, blogHandle) {
  if (type === "collection") return `/collections/${handle}`;
  if (type === "page") return `/pages/${handle}`;
  if (type === "product") return `/products/${handle}`;
  if (type === "blog") return `/blogs/${handle}`;
  if (type === "article") return `/blogs/${blogHandle}/${handle}`;
  return `/${handle}`;
}

export function parseUrl(url) {
  if (!url) return null;
  const s = String(url);
  for (const kind of ["collections", "pages", "products", "blogs"]) {
    const m = s.match(new RegExp(`/${kind}/([^/?#]+)`));
    if (m) {
      const h = decodeURIComponent(m[1]);
      if (kind === "blogs" && s.match(/\/blogs\/[^/]+\/[^/?#]+/)) {
        const am = s.match(/\/blogs\/([^/]+)\/([^/?#]+)/);
        return {
          type: "article",
          handle: decodeURIComponent(am[2]),
          blogHandle: decodeURIComponent(am[1]),
        };
      }
      return {
        type: kind.slice(0, -1),
        handle: h,
        blogHandle: kind === "blogs" ? h : undefined,
      };
    }
  }
  return null;
}

export function walkMenuItems(items, menuHandle, out) {
  for (const it of items || []) {
    out.push({ menu_handle: menuHandle, title: it.title, url: it.url, type: it.type });
    walkMenuItems(it.items, menuHandle, out);
  }
}

export function parseFingerprint(fp) {
  const links = [];
  const re = /([^|]+)\|HTTP\|([^:\[]+)/g;
  let m;
  while ((m = re.exec(fp || ""))) links.push({ title: m[1].trim(), url: m[2].trim() });
  return links;
}

export function mdTable(rows, cols) {
  if (!rows.length) return "_None._\n";
  const header = `| ${cols.join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map(
    (r) => `| ${cols.map((c) => String(r[c] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`,
  );
  return [header, sep, ...body].join("\n") + "\n";
}

export function proposeMenuTitle(title) {
  let out = String(title || "");
  for (const [sv, en] of MENU_TITLE_TRANSLATIONS) {
    if (out === sv) return en;
    out = out.split(sv).join(en);
  }
  return out;
}
