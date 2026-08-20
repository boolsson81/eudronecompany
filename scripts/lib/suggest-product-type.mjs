/**
 * Heuristic product_type suggestion (mirrors supabase/functions/_shared/suggest-product-type.ts).
 */

const COLLECTION_TYPE_MAP = [
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

const VENDOR_TYPE_MAP = {
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
  Anker: "Batterier",
  Sony: "Kameror",
};

function blob(input) {
  return [input.title, input.vendor, input.tags, ...(input.collections ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function has(text, patterns) {
  return patterns.some((re) => re.test(text));
}

export function suggestProductType(input) {
  const text = blob(input);
  const collections = input.collections ?? [];

  for (const col of collections) {
    for (const { re, type } of COLLECTION_TYPE_MAP) {
      if (re.test(col)) {
        return { suggested: type, confidence: "high", reason: `collection: ${col}` };
      }
    }
  }

  const vendor = (input.vendor ?? "").trim();
  if (vendor && VENDOR_TYPE_MAP[vendor]) {
    return { suggested: VENDOR_TYPE_MAP[vendor], confidence: "medium", reason: `vendor: ${vendor}` };
  }

  if (has(text, [/enterprise|matrice\s*[34]\d{2}|m350|m300|zenmuse/i])) {
    return { suggested: "Enterprise Drönare", confidence: "high", reason: "title: enterprise drone" };
  }
  if (has(text, [/propeller|propellrar/i]) && has(text, [/drone|dji|dron|mavic|mini/i])) {
    return { suggested: "Propellrar", confidence: "high", reason: "title: drone propeller" };
  }
  if (has(text, [/reservdel|spare.?part/i]) && has(text, [/action.?cam|gopro|insta360/i])) {
    return { suggested: "Reservdel till Actionkameror", confidence: "high", reason: "title: action cam spare" };
  }
  if (has(text, [/reservdel|spare.?part|replacement/i]) && has(text, [/drone|dji|dron/i])) {
    return { suggested: "Reservdelar till drönare", confidence: "high", reason: "title: drone spare" };
  }
  if (has(text, [/gopro|insta360|osmo action|actionkamera|hero\s*\d/i])) {
    if (has(text, [/case|bag|mount|fäste|holder/i])) {
      return { suggested: "Tillbehör till actionkameror", confidence: "high", reason: "title: action cam accessory" };
    }
    return { suggested: "Tillbehör till actionkameror", confidence: "medium", reason: "title: action cam brand" };
  }
  if (has(text, [/battery|batteri|power.?bank/i])) {
    return { suggested: "Batterier", confidence: "medium", reason: "title: battery" };
  }
  if (has(text, [/charg|laddare/i])) {
    return { suggested: "Laddare", confidence: "medium", reason: "title: charger" };
  }
  if (has(text, [/backpack|väska|bag|case/i]) && has(text, [/drone|dji|mavic/i])) {
    return { suggested: "Drönarväska", confidence: "high", reason: "title: drone bag" };
  }
  if (has(text, [/backpack|väska|bag|case/i])) {
    return { suggested: "Väskor", confidence: "medium", reason: "title: bag/case" };
  }
  if (has(text, [/micro\s*sd|sdxc|minneskort/i])) {
    return { suggested: "Minneskort, Lagring", confidence: "high", reason: "title: memory card" };
  }
  if (has(text, [/cable|kabel|adapter|usb/i])) {
    return { suggested: "Kablar", confidence: "medium", reason: "title: cable" };
  }
  if (has(text, [/remote|fjärrkontroll|controller/i]) && has(text, [/drone|dji/i])) {
    return { suggested: "Fjärrkontrollstillbehör", confidence: "high", reason: "title: drone remote" };
  }
  if (has(text, [/gimbal|stabilizer/i])) {
    return { suggested: "Gimbal", confidence: "medium", reason: "title: gimbal" };
  }
  if (has(text, [/dji|mavic|mini\s*\d|drone|drönare|fpv/i])) {
    return { suggested: "Tillbehör till drönare", confidence: "medium", reason: "title: drone keyword" };
  }
  if (has(text, [/ljud|mikrofon|microphone|audio/i])) {
    return { suggested: "Ljud", confidence: "medium", reason: "title: audio" };
  }

  for (const { re, type } of COLLECTION_TYPE_MAP) {
    if (re.test(text)) {
      return { suggested: type, confidence: "medium", reason: "combined text match" };
    }
  }

  return { suggested: "Tillbehör", confidence: "low", reason: "ingen tydlig signal — fallback" };
}
