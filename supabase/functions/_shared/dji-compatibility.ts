/**
 * DJI compatibility engine — Sunsky title + optionList → canonical model metadata.
 */
import type { SunskyVariantGroup } from "./sunsky-product-map.ts";

export type DjiOptionKeywordClass = "model" | "kit" | "spec";

export type DjiOptionListRole = "compatibility" | "kit_picker" | "mixed" | "none";

export type DjiCompatibilityBranch = {
  item_no: string;
  keywords: string;
  keyword_class: DjiOptionKeywordClass;
  model_ids: string[];
};

export type DjiCompatibilityRecord = {
  sunsky_item_no: string;
  compatible_model_ids: string[];
  compatible_models_display: string[];
  series: string[];
  accessory_type: string | null;
  option_list_role: DjiOptionListRole;
  option_branches: DjiCompatibilityBranch[];
  extraction_sources: ("title" | "optionList" | "fitFor")[];
  confidence: "high" | "medium" | "low";
  search_tags: string[];
  seo_compatibility_text: string | null;
};

export type DjiModelPattern = {
  id: string;
  display: string;
  series: string;
  re: RegExp;
  priority: number;
};

/** Longer / more specific patterns first via priority. */
export const DJI_MODEL_PATTERNS: DjiModelPattern[] = [
  { id: "dji_mini_5_pro", display: "DJI Mini 5 Pro", series: "dji_consumer_mini", re: /mini\s*5\s*pro/i, priority: 120 },
  { id: "dji_mini_4_pro", display: "DJI Mini 4 Pro", series: "dji_consumer_mini", re: /mini\s*4\s*pro/i, priority: 119 },
  { id: "dji_mini_3_pro", display: "DJI Mini 3 Pro", series: "dji_consumer_mini", re: /mini\s*3\s*pro/i, priority: 118 },
  { id: "dji_mini_3", display: "DJI Mini 3", series: "dji_consumer_mini", re: /mini\s*3\b/i, priority: 117 },
  { id: "dji_mini_2", display: "DJI Mini 2", series: "dji_consumer_mini", re: /mini\s*2\b|mini\s*se\b/i, priority: 116 },
  { id: "dji_mavic_4_pro", display: "DJI Mavic 4 Pro", series: "dji_consumer_mavic", re: /mavic\s*4\s*pro/i, priority: 115 },
  { id: "dji_mavic_3", display: "DJI Mavic 3", series: "dji_consumer_mavic", re: /mavic\s*3/i, priority: 114 },
  { id: "dji_air_3s", display: "DJI Air 3S", series: "dji_consumer_air", re: /air\s*3s/i, priority: 113 },
  { id: "dji_air_3", display: "DJI Air 3", series: "dji_consumer_air", re: /air\s*3\b/i, priority: 112 },
  { id: "dji_neo_2", display: "DJI Neo 2", series: "dji_consumer_mini", re: /neo\s*2/i, priority: 111 },
  { id: "dji_neo", display: "DJI Neo", series: "dji_consumer_mini", re: /\bneo\b/i, priority: 110 },
  { id: "dji_avata_2", display: "DJI Avata 2", series: "dji_fpv", re: /avata\s*2/i, priority: 109 },
  { id: "dji_avata", display: "DJI Avata", series: "dji_fpv", re: /\bavata\b/i, priority: 108 },
  { id: "dji_flip", display: "DJI Flip", series: "dji_consumer_mini", re: /\bflip\b/i, priority: 107 },
  { id: "dji_matrice_4d", display: "DJI Matrice 4D", series: "dji_enterprise", re: /matrice\s*4d/i, priority: 106 },
  { id: "dji_matrice_400", display: "DJI Matrice 400", series: "dji_enterprise", re: /matrice\s*400/i, priority: 105 },
  { id: "dji_matrice_4", display: "DJI Matrice 4", series: "dji_enterprise", re: /matrice\s*4\b/i, priority: 104 },
  { id: "dji_matrice", display: "DJI Matrice", series: "dji_enterprise", re: /matrice|m350|m300|m30t?\b/i, priority: 103 },
  { id: "dji_inspire_3", display: "DJI Inspire 3", series: "dji_enterprise", re: /inspire\s*3/i, priority: 102 },
  { id: "dji_phantom", display: "DJI Phantom", series: "dji_legacy", re: /phantom/i, priority: 101 },
];

export const DJI_COLLECTION_RULES = [
  { collection_title: "Parts for DJI Neo", handle: "parts-dji-neo", model_ids: ["dji_neo", "dji_neo_2"] },
  { collection_title: "Parts for DJI Flip", handle: "parts-dji-flip", model_ids: ["dji_flip"] },
  { collection_title: "Parts for DJI Mini 4 Pro", handle: "parts-dji-mini-4-pro", model_ids: ["dji_mini_4_pro"] },
  { collection_title: "Parts for DJI Air 3", handle: "parts-dji-air-3", model_ids: ["dji_air_3"] },
  { collection_title: "Parts for DJI Air 3S", handle: "parts-dji-air-3s", model_ids: ["dji_air_3s"] },
  { collection_title: "Parts for DJI Mavic 4 Pro", handle: "parts-dji-mavic-4-pro", model_ids: ["dji_mavic_4_pro"] },
  { collection_title: "Parts for DJI Avata", handle: "parts-dji-avata", model_ids: ["dji_avata", "dji_avata_2"] },
  { collection_title: "Parts for DJI Matrice", handle: "parts-dji-matrice", model_ids: ["dji_matrice", "dji_matrice_4", "dji_matrice_400", "dji_matrice_4d"] },
] as const;

const MODEL_SIGNAL =
  /mini|mavic|air\s*3|avata|neo|flip|matrice|inspire|phantom|zenmuse|fpv|o3\b|o4\b|ronin\s*2\b/i;
const KIT_SIGNAL =
  /transmitter|receiver|charging case|mount clip|cold shoe|grip kit|hood|damper|strap|adapter kit|lens cover|gamepad|thumb rocker|expansion kit|protective cover|monitor hood|waist support/i;
const FLIP_FALSE_POSITIVE = /flip axis|flip\s+axis\s+locking/i;

const ACCESSORY_PATTERNS: Array<{ type: string; re: RegExp }> = [
  { type: "propeller", re: /propeller|prop\b|paddle|blade/i },
  { type: "battery", re: /battery|lipo|intelligent flight battery|mah\b/i },
  { type: "charger_hub", re: /charg|charging hub|charging manager|power adapter|desktop charger|portable charger/i },
  { type: "nd_filter", re: /nd filter|nd8|nd16|lens filter/i },
  { type: "gimbal", re: /gimbal|zenmuse/i },
  { type: "remote_controller", re: /remote controller|rc motion|rc-n|rc 2|fpv remote/i },
  { type: "goggles", re: /goggles/i },
  { type: "case", re: /carrying case|hard case|backpack|storage case/i },
  { type: "spare_part", re: /spare part|replacement|repair part|shell|frame upper|antenna/i },
  { type: "camera_lens", re: /wide-?angle lens|lens for dji/i },
  { type: "propeller_guard", re: /propeller guard|prop guard/i },
];

export function classifyOptionKeyword(keyword: string): DjiOptionKeywordClass {
  const k = keyword.trim();
  if (!k) return "kit";
  if (MODEL_SIGNAL.test(k)) return "model";
  if (KIT_SIGNAL.test(k)) return "kit";
  if (/plug|black|white|eu\b|us\b|cn\b|silver|gold|grey|gray/i.test(k)) return "spec";
  return "kit";
}

export function detectDjiModels(text: string, excludeFlipAxis = true): string[] {
  if (!text?.trim()) return [];
  if (excludeFlipAxis && FLIP_FALSE_POSITIVE.test(text)) {
    return detectDjiModels(text.replace(FLIP_FALSE_POSITIVE, " "), false);
  }

  const t = text.toLowerCase();
  const hits: Array<{ id: string; priority: number; index: number }> = [];

  for (const pat of DJI_MODEL_PATTERNS) {
    if (pat.id === "dji_flip" && FLIP_FALSE_POSITIVE.test(text)) continue;
    const m = t.match(pat.re);
    if (m && m.index !== undefined) {
      hits.push({ id: pat.id, priority: pat.priority, index: m.index });
    }
  }

  hits.sort((a, b) => b.priority - a.priority || a.index - b.index);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of hits) {
    if (seen.has(h.id)) continue;
    // Neo vs Neo 2: if both match, keep both only when text has both signals
    if (h.id === "dji_neo" && seen.has("dji_neo_2")) continue;
    seen.add(h.id);
    out.push(h.id);
  }
  return out;
}

export function modelIdToDisplay(modelId: string): string {
  return DJI_MODEL_PATTERNS.find((p) => p.id === modelId)?.display ?? modelId;
}

export function modelIdsToSeries(modelIds: string[]): string[] {
  const series = new Set<string>();
  for (const id of modelIds) {
    const pat = DJI_MODEL_PATTERNS.find((p) => p.id === id);
    if (pat) series.add(pat.series);
  }
  return [...series];
}

export function detectAccessoryType(title: string): string | null {
  for (const { type, re } of ACCESSORY_PATTERNS) {
    if (re.test(title)) return type;
  }
  return null;
}

function isDjiProduct(title: string, brand?: string | null): boolean {
  if (brand && /dji/i.test(brand)) return true;
  return /\bdji\b/i.test(title) || detectDjiModels(title).length > 0;
}

export function buildDjiSearchTags(modelIds: string[]): string[] {
  return modelIds.map((id) => `dji:${id.replace(/^dji_/, "").replace(/_/g, "-")}`);
}

export function formatDjiCompatibilitySeo(modelIds: string[]): string | null {
  if (!modelIds.length) return null;
  const labels = modelIds.map(modelIdToDisplay);
  return `Passar till: ${labels.join(", ")}.`;
}

export type ExtractDjiCompatibilityInput = {
  title: string;
  item_no: string;
  brand?: string | null;
  variant_group?: SunskyVariantGroup | null;
  fit_for?: string[];
};

export function extractDjiCompatibility(input: ExtractDjiCompatibilityInput): DjiCompatibilityRecord | null {
  const title = String(input.title ?? "").trim();
  const itemNo = String(input.item_no ?? "").trim();
  if (!title || !itemNo) return null;
  if (!isDjiProduct(title, input.brand)) return null;

  const vg = input.variant_group;
  const optionItems = vg?.option_list?.items ?? [];
  const branches: DjiCompatibilityBranch[] = optionItems.map((row) => {
    const keywords = String(row.keywords ?? "").trim();
    const keywordClass = classifyOptionKeyword(keywords);
    const modelIds = keywordClass === "model" ? detectDjiModels(keywords) : [];
    return {
      item_no: String(row.itemNo ?? "").trim(),
      keywords,
      keyword_class: keywordClass,
      model_ids: modelIds,
    };
  });

  const modelBranches = branches.filter((b) => b.keyword_class === "model");
  const kitBranches = branches.filter((b) => b.keyword_class === "kit");
  let optionListRole: DjiOptionListRole = "none";
  if (branches.length === 0) {
    optionListRole = "none";
  } else if (modelBranches.length > 0 && kitBranches.length > 0) {
    optionListRole = "mixed";
  } else if (modelBranches.length > 0) {
    optionListRole = "compatibility";
  } else {
    optionListRole = "kit_picker";
  }

  const sources: ("title" | "optionList" | "fitFor")[] = [];
  const modelSet = new Set<string>();

  for (const id of detectDjiModels(title)) {
    modelSet.add(id);
    sources.push("title");
  }

  const currentBranch = branches.find((b) => b.item_no === itemNo);
  if (currentBranch?.model_ids.length) {
    for (const id of currentBranch.model_ids) {
      modelSet.add(id);
      if (!sources.includes("optionList")) sources.push("optionList");
    }
  } else if (optionListRole === "compatibility" && modelBranches.length === 1) {
    for (const id of modelBranches[0].model_ids) {
      modelSet.add(id);
      sources.push("optionList");
    }
  }

  if (input.fit_for?.length) {
    for (const ff of input.fit_for) {
      for (const id of detectDjiModels(ff)) {
        modelSet.add(id);
        if (!sources.includes("fitFor")) sources.push("fitFor");
      }
    }
  }

  const compatible_model_ids = [...modelSet];
  const compatible_models_display = compatible_model_ids.map(modelIdToDisplay);
  const series = modelIdsToSeries(compatible_model_ids);
  const accessory_type = detectAccessoryType(title);

  let confidence: "high" | "medium" | "low" = "low";
  if (compatible_model_ids.length > 0 && sources.includes("title")) {
    confidence = optionListRole === "kit_picker" ? "medium" : "high";
  } else if (compatible_model_ids.length > 0) {
    confidence = "medium";
  }

  return {
    sunsky_item_no: itemNo,
    compatible_model_ids,
    compatible_models_display,
    series,
    accessory_type,
    option_list_role: optionListRole,
    option_branches: branches,
    extraction_sources: [...new Set(sources)],
    confidence,
    search_tags: buildDjiSearchTags(compatible_model_ids),
    seo_compatibility_text: formatDjiCompatibilitySeo(compatible_model_ids),
  };
}

/** Append compatibility block for SEO / GEO (Swedish). */
export function appendDjiCompatibilityHtml(
  descriptionHtml: string | null | undefined,
  compat: DjiCompatibilityRecord | null,
): string | null {
  if (!compat?.compatible_models_display.length) return descriptionHtml ?? null;
  const base = descriptionHtml?.trim() ?? "";
  const block =
    `<section class="ai-compatibility" data-block="compatibility">` +
    `<h2>Kompatibilitet</h2><p>${compat.seo_compatibility_text}</p></section>`;
  if (base.includes('data-block="compatibility"')) return base;
  return base ? `${base}\n${block}` : block;
}
