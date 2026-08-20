/**
 * Heuristic product_type suggestion from title, vendor, tags, collections.
 * Returns canonical ActionKing product_type strings.
 */

const DRONE_TYPES = [
  "Enterprise Drönare", "Drönare", "Drönare för företag",
  "Reservdelar till drönare", "Drönar filter", "Propellrar",
  "Tillbehör till drönare", "Drönarväska", "Fjärrkontrollstillbehör", "Fjärrkontroller",
];

const ACTION_CAM_TYPES = [
  "Actionkameror", "Tillbehör till actionkameror", "Reservdel till Actionkameror",
  "Actionkamera filter", "Kameragrepp", "Kamerafilter",
];

const SHARED_TYPES = [
  "DJI & GoPro Accessories", "Batterier", "Batteri tillbehör", "Powerbanks",
  "Väskor", "Fästen", "Laddare", "Solceller", "Kablar", "Adaptrar",
  "Minneskort, Lagring", "Stativ", "Gimbal", "Tillbehör", "Kameratillbehör",
  "Skydd", "Mobiltelefontillbehör", "Mobile Accessories", "Ljud", "Belysning",
];

interface SuggestInput {
  title?: string | null;
  vendor?: string | null;
  tags?: string | null;
  collections?: string[];
}

function blob(input: SuggestInput): string {
  return [
    input.title,
    input.vendor,
    input.tags,
    ...(input.collections ?? []),
  ].filter(Boolean).join(" ").toLowerCase();
}

function has(text: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => re.test(text));
}

/** Collection title → product_type hints */
const COLLECTION_TYPE_MAP: Array<{ re: RegExp; type: string }> = [
  { re: /actionkamera|action.?cam|gopro|insta360|osmo action/i, type: "Actionkameror" },
  { re: /drönare|drone|dji|mavic|matrice|enterprise/i, type: "Enterprise Drönare" },
  { re: /reservdel.*drön|spare.*drone|drone.*part/i, type: "Reservdelar till drönare" },
  { re: /propeller|propellrar/i, type: "Propellrar" },
  { re: /batteri|battery/i, type: "Batterier" },
  { re: /väska|bag|backpack|case/i, type: "Väskor" },
  { re: /filter/i, type: "Drönar filter" },
  { re: /kabel|adapter|kablar/i, type: "Kablar" },
  { re: /minneskort|sd.?card|micro.?sd|storage/i, type: "Minneskort, Lagring" },
  { re: /fäste|mount|holder|bracket/i, type: "Fästen" },
  { re: /laddare|charger|charging/i, type: "Laddare" },
  { re: /fjärrkontroll|remote|controller/i, type: "Fjärrkontrollstillbehör" },
  { re: /gimbal|stabilizer|stativ/i, type: "Gimbal" },
  { re: /skydd|skal|fodral|screen.?protect/i, type: "Skydd" },
  { re: /ljud|mikrofon|microphone|audio/i, type: "Ljud" },
  { re: /mobil|phone|smartphone/i, type: "Mobiltelefontillbehör" },
  { re: /el.?scooter|sparkcykel/i, type: "El-Scooter" },
  { re: /kikare|binocular/i, type: "Kikare" },
];

const VENDOR_TYPE_MAP: Record<string, string> = {
  DJI: "Tillbehör till drönare",
  Walkera: "Tillbehör till drönare",
  Wingtra: "Enterprise Drönare",
  Autel: "Drönare",
  Parrot: "Drönare",
  GoPro: "Actionkameror",
  Insta360: "Actionkameror",
  FeiyuTech: "Tillbehör till actionkameror",
  Telesin: "Tillbehör till actionkameror",
  Puluz: "Tillbehör till actionkameror",
  PolarPro: "Actionkamera filter",
  PgyTech: "Tillbehör till drönare",
  EcoFlow: "Arkiv",
  Targus: "Arkiv",
  Anker: "Batterier",
  Sony: "Kameror",
};

export function suggestProductType(input: SuggestInput): {
  suggested: string;
  confidence: "high" | "medium" | "low";
  reason: string;
} {
  const text = blob(input);
  const collections = input.collections ?? [];

  // Collection-based (high confidence)
  for (const col of collections) {
    for (const { re, type } of COLLECTION_TYPE_MAP) {
      if (re.test(col)) {
        return { suggested: type, confidence: "high", reason: `collection: ${col}` };
      }
    }
  }

  // Vendor-based
  const vendor = (input.vendor ?? "").trim();
  if (vendor && VENDOR_TYPE_MAP[vendor]) {
    return { suggested: VENDOR_TYPE_MAP[vendor], confidence: "medium", reason: `vendor: ${vendor}` };
  }

  // Title/tag patterns (ordered most specific first)
  if (has(text, [/enterprise|matrice\s*[34]\d{2}|m350|m300|zenmuse/i])) {
    return { suggested: "Enterprise Drönare", confidence: "high", reason: "title: enterprise drone" };
  }
  if (has(text, [/propeller|propellrar|paddle|blade/i]) && has(text, [/drone|dji|dron|mavic|mini/i])) {
    return { suggested: "Propellrar", confidence: "high", reason: "title: drone propeller" };
  }
  if (has(text, [/reservdel|spare.?part|replacement/i]) && has(text, [/action.?cam|gopro|insta360/i])) {
    return { suggested: "Reservdel till Actionkameror", confidence: "high", reason: "title: action cam spare" };
  }
  if (has(text, [/reservdel|spare.?part|replacement|arm\b|leg\b|shell/i]) && has(text, [/drone|dji|dron/i])) {
    return { suggested: "Reservdelar till drönare", confidence: "high", reason: "title: drone spare part" };
  }
  if (has(text, [/nd\s*filter|polarizer|filter/i]) && has(text, [/action.?cam|gopro|insta360|osmo/i])) {
    return { suggested: "Actionkamera filter", confidence: "high", reason: "title: action cam filter" };
  }
  if (has(text, [/nd\s*filter|polarizer|filter/i]) && has(text, [/drone|dji|mavic|mini/i])) {
    return { suggested: "Drönar filter", confidence: "high", reason: "title: drone filter" };
  }
  if (has(text, [/gopro|insta360|osmo action|actionkamera|action.?cam|hero\s*\d/i])) {
    if (has(text, [/case|bag|mount|fäste|holder|strap/i])) {
      return { suggested: "Tillbehör till actionkameror", confidence: "high", reason: "title: action cam accessory" };
    }
    if (has(text, [/camera|kamera/i]) && !has(text, [/tillbehör|accessory|mount|case/i])) {
      return { suggested: "Actionkameror", confidence: "medium", reason: "title: action camera" };
    }
    return { suggested: "Tillbehör till actionkameror", confidence: "medium", reason: "title: action cam brand" };
  }
  if (has(text, [/intelligent flight battery|flight battery|lipo/i]) && has(text, [/drone|dji|mavic|mini/i])) {
    return { suggested: "Batterier", confidence: "high", reason: "title: drone battery" };
  }
  if (has(text, [/battery|batteri|power.?bank/i])) {
    return { suggested: "Batterier", confidence: "medium", reason: "title: battery" };
  }
  if (has(text, [/charg|laddare|charging hub/i])) {
    return { suggested: "Laddare", confidence: "medium", reason: "title: charger" };
  }
  if (has(text, [/backpack|väska|carrying case|hard case|waterproof case/i]) && has(text, [/drone|dji|mavic|mini/i])) {
    return { suggested: "Drönarväska", confidence: "high", reason: "title: drone bag" };
  }
  if (has(text, [/backpack|väska|bag|case/i])) {
    return { suggested: "Väskor", confidence: "medium", reason: "title: bag/case" };
  }
  if (has(text, [/micro\s*sd|sdxc|sd card|minneskort|lexar|sandisk/i])) {
    return { suggested: "Minneskort, Lagring", confidence: "high", reason: "title: memory card" };
  }
  if (has(text, [/cable|kabel|adapter|usb/i])) {
    return { suggested: "Kablar", confidence: "medium", reason: "title: cable/adapter" };
  }
  if (has(text, [/remote|fjärrkontroll|controller/i]) && has(text, [/drone|dji/i])) {
    return { suggested: "Fjärrkontrollstillbehör", confidence: "high", reason: "title: drone remote" };
  }
  if (has(text, [/gimbal|stabilizer/i])) {
    return { suggested: "Gimbal", confidence: "medium", reason: "title: gimbal" };
  }
  if (has(text, [/tripod|stativ/i])) {
    return { suggested: "Stativ", confidence: "medium", reason: "title: tripod" };
  }
  if (has(text, [/screen.?protect|tempered glass|skärmskydd/i])) {
    return { suggested: "Skydd", confidence: "medium", reason: "title: screen protection" };
  }
  if (has(text, [/phone|iphone|samsung|mobil/i]) && has(text, [/case|skal|fodral|mount/i])) {
    return { suggested: "Mobiltelefontillbehör", confidence: "medium", reason: "title: phone accessory" };
  }
  if (has(text, [/microphone|mikrofon|mic\b|audio|ljud/i])) {
    return { suggested: "Ljud", confidence: "medium", reason: "title: audio" };
  }
  if (has(text, [/dji|mavic|mini\s*\d|phantom|matrice|drone|drönare|fpv/i])) {
    return { suggested: "Tillbehör till drönare", confidence: "medium", reason: "title: drone keyword" };
  }
  if (has(text, [/el.?scooter|e.?scooter|sparkcykel/i])) {
    return { suggested: "El-Scooter", confidence: "high", reason: "title: e-scooter" };
  }

  // Collection text in combined blob (medium)
  for (const { re, type } of COLLECTION_TYPE_MAP) {
    if (re.test(text)) {
      return { suggested: type, confidence: "medium", reason: "combined text match" };
    }
  }

  return { suggested: "Tillbehör", confidence: "low", reason: "ingen tydlig signal — fallback" };
}

export { DRONE_TYPES, ACTION_CAM_TYPES, SHARED_TYPES };
