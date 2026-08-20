/**
 * Smart collection rule templates for EuroDroneParts spare-parts taxonomy.
 * Mirrors live patterns from dji-air-3-* and dji-mini-4-pro-* collections.
 */
import { COMPONENT_SUFFIXES, SPARE_PART_MODELS } from "./approved-taxonomy.mjs";

/** Title keywords per model prefix (English + Swedish variants) */
export const MODEL_TITLE_TERMS = {
  "dji-mini-4-pro": ["Mini 4 Pro", "Mini 4"],
  "dji-air-3": ["Air 3", "AIR 3"],
  "dji-air-3s": ["Air 3S", "Air 3s", "AIR 3S"],
  "dji-neo": ["DJI Neo", " Neo ", "Neo "],
  "dji-flip": ["DJI Flip", " Flip "],
  "dji-avata-2": ["Avata 2", "Avata2", "O4 Air Unit"],
  "dji-mavic-3-enterprise": ["Mavic 3E", "Mavic 3 Enterprise", "Mavic 3E/"],
  "dji-matrice-4": ["Matrice 4", "Matrice4", "M4E", "M4T"],
  "dji-matrice-30": ["Matrice 30", "M30", "M30T"],
  "dji-matrice-350-rtk": ["Matrice 350", "M350", "350 RTK"],
  "dji-flycart-30": ["FlyCart 30", "FlyCart30", "FC30"],
};

const COMPONENT_TITLE_TERMS = {
  propellers: ["propeller", "propell", "propellrar", "Propellers"],
  batteries: ["batteri", "battery", "batteries", "Batteries"],
  motors: ["motor", "motors", "motorer", "Motors"],
  arms: ["arm", "arms", "armar", "Arms", "frame arm"],
  cameras: ["camera", "kamera", "kam", "Cameras", "lens module"],
  gimbal: ["gimbal", "Gimbal", "stabilizer", "stabilisation"],
  shell: ["shell", "skal", "Shell", "cover", "body shell", "top shell"],
  "landing-gear": ["landing gear", "landnings", "landing-gear", "Landing Gear", "landing leg"],
  cables: ["cable", "kabel", "kablar", "Cables", "wire harness"],
  antennas: ["antenna", "antenn", "antenner", "Antennas", "transmission"],
  sensors: ["sensor", "sensorer", "Sensors", "vision", "obstacle"],
  accessories: ["accessory", "accessories", "tillbehör", "tillbehor", "Accessories", "kit"],
};

const HUB_EXTRA_TERMS = ["spare part", "spare parts", "reservdel", "reservdelar", "replacement"];

/** Tag-based rules for hubs (mirrors live dji-mini-4-pro-spare-parts) */
export const MODEL_TAG_TERMS = {
  "dji-mini-4-pro": ["Mini 4 Pro"],
  "dji-neo": ["DJI Neo", "Neo"],
};

export function buildRuleSet(prefix, suffix, { isHub = false } = {}) {
  const modelTerms = MODEL_TITLE_TERMS[prefix] || [prefix.replace(/^dji-/, "").replace(/-/g, " ")];
  const terms = [...modelTerms];
  const tagTerms = isHub ? MODEL_TAG_TERMS[prefix] || [] : [];
  if (isHub) {
    terms.push(...HUB_EXTRA_TERMS);
    // Avoid bare short model tokens that over-match (e.g. "Neo" in unrelated titles)
    if (prefix === "dji-neo") {
      return {
        appliedDisjunctively: true,
        rules: [
          { column: "TITLE", relation: "CONTAINS", condition: "DJI Neo" },
          ...HUB_EXTRA_TERMS.map((condition) => ({ column: "TITLE", relation: "CONTAINS", condition })),
          ...tagTerms.map((condition) => ({ column: "TAG", relation: "EQUALS", condition })),
        ],
      };
    }
  } else {
    terms.push(...(COMPONENT_TITLE_TERMS[suffix] || [suffix.replace(/-/g, " ")]));
  }
  const unique = [...new Set(terms.map((t) => t.trim()).filter(Boolean))];
  const rules = unique.map((condition) => ({
    column: "TITLE",
    relation: "CONTAINS",
    condition,
  }));
  for (const tag of tagTerms) {
    rules.push({ column: "TAG", relation: "EQUALS", condition: tag });
  }
  return { appliedDisjunctively: true, rules };
}

export function allSparePartsTargets() {
  const targets = [];
  for (const model of SPARE_PART_MODELS) {
    targets.push({ handle: model.hub, prefix: model.prefix, suffix: null, isHub: true, label: model.label });
    for (const suffix of COMPONENT_SUFFIXES) {
      targets.push({
        handle: `${model.prefix}-${suffix}`,
        prefix: model.prefix,
        suffix,
        isHub: false,
        label: `${model.label} ${suffix}`,
      });
    }
  }
  return targets;
}
