/**
 * Extract optionList keywords from DJI catalog for compatibility analysis.
 */
import fs from "node:fs";
import path from "node:path";

const TARGET_MODELS = [
  "Neo", "Neo 2", "Flip", "Mini 4 Pro", "Mini 3 Pro", "Mini 3", "Mini 2",
  "Air 3", "Air 3S", "Mavic 4 Pro", "Mavic 3", "Matrice", "Avata", "Avata 2",
];

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    if (!process.env[key]) process.env[key] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function invoke(body) {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`${base}/functions/v1/sunsky-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  return res.json();
}

function parseOptionList(raw) {
  const opts = raw?.optionList;
  if (!opts?.items || !Array.isArray(opts.items)) return { display: null, items: [] };
  return {
    display: opts.display ?? null,
    items: opts.items.map((row) => ({
      itemNo: String(row?.itemNo ?? "").trim(),
      keywords: String(row?.keywords ?? "").trim(),
    })),
  };
}

function detectModels(text) {
  const t = text.toLowerCase();
  const hits = [];
  const patterns = [
    [/neo\s*2/, "DJI Neo 2"],
    [/\bneo\b/, "DJI Neo"],
    [/\bflip\b/, "DJI Flip"],
    [/mini\s*5\s*pro/, "DJI Mini 5 Pro"],
    [/mini\s*4\s*pro/, "DJI Mini 4 Pro"],
    [/mini\s*3\s*pro/, "DJI Mini 3 Pro"],
    [/mini\s*3\b/, "DJI Mini 3"],
    [/mini\s*2\b/, "DJI Mini 2"],
    [/air\s*3s/, "DJI Air 3S"],
    [/air\s*3\b/, "DJI Air 3"],
    [/mavic\s*4\s*pro/, "DJI Mavic 4 Pro"],
    [/mavic\s*3/, "DJI Mavic 3"],
    [/matrice\s*4\d{2}/, "DJI Matrice 4xx"],
    [/matrice\s*3\d{2}/, "DJI Matrice 3xx"],
    [/matrice/, "DJI Matrice"],
    [/avata\s*2/, "DJI Avata 2"],
    [/avata/, "DJI Avata"],
    [/inspire\s*3/, "DJI Inspire 3"],
    [/phantom/, "DJI Phantom"],
  ];
  for (const [re, label] of patterns) {
    if (re.test(t)) hits.push(label);
  }
  return [...new Set(hits)];
}

loadEnv();

const catalog = JSON.parse(fs.readFileSync("scripts/eurodrone-category-output.json", "utf8"));
const candidates = catalog.products.filter(
  (p) => p.subtype === "B-optionList" || p.subtype === "B-both" || p.option_count > 0,
);

// If option_count not on all rows, take all B from catalog products
const bProducts = catalog.products.filter((p) => p.variant_class === "B");
const toFetch = [...new Set(bProducts.map((p) => p.item_no))].slice(0, 120);

console.log(`Fetching optionList for ${toFetch.length} B-family SKUs...`);

const results = [];
const keywordFreq = {};
const modelProductCount = {};
const modelKeywordCount = {};

for (const itemNo of toFetch) {
  try {
    const d = await invoke({ action: "get-product-detail", itemNo });
    const raw = d.product || d.data;
    if (!raw) continue;
    const ol = parseOptionList(raw);
    if (!ol.items.length) continue;

    const title = String(raw.name ?? "");
    const titleModels = detectModels(title);
    const branchModels = new Set();
    for (const item of ol.items) {
      const kw = item.keywords;
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
      for (const m of detectModels(kw)) branchModels.add(m);
      for (const m of detectModels(kw + " " + title)) modelKeywordCount[m] = (modelKeywordCount[m] || 0) + 1;
    }
    for (const m of [...branchModels, ...titleModels]) {
      modelProductCount[m] = (modelProductCount[m] || 0) + 1;
    }

    results.push({
      item_no: itemNo,
      title: title.slice(0, 100),
      category: catalog.products.find((p) => p.item_no === itemNo)?.category_label,
      option_display: ol.display,
      option_count: ol.items.length,
      option_keywords: ol.items.map((i) => i.keywords),
      option_item_nos: ol.items.map((i) => i.itemNo),
      title_models: titleModels,
      branch_models: [...branchModels],
    });
    await new Promise((r) => setTimeout(r, 70));
  } catch (e) {
    console.warn(itemNo, e.message);
  }
}

const topKeywords = Object.entries(keywordFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40);

const report = {
  generated_at: new Date().toISOString(),
  skus_analyzed: results.length,
  target_models: TARGET_MODELS,
  model_product_count: Object.fromEntries(
    Object.entries(modelProductCount).sort((a, b) => b[1] - a[1]),
  ),
  top_option_keywords: topKeywords,
  products: results,
};

fs.writeFileSync("scripts/dji-optionlist-analysis.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  analyzed: results.length,
  model_product_count: report.model_product_count,
  top_keywords: topKeywords.slice(0, 15),
}, null, 2));
