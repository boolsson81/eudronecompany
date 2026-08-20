/**
 * Classify Sunsky products per EuroDroneParts merchandising category.
 * Primary data path: DJI brand catalog (search works with brandId).
 * Usage: node scripts/classify-eurodrone-categories.mjs
 */
import fs from "node:fs";
import path from "node:path";

const DJI_PAGE_SIZE = 40;
const DJI_MAX_PAGES = 15; // catalog ~376 SKUs

const CATEGORIES = [
  {
    id: "dji_accessories",
    label: "DJI accessories",
    priority: 3,
    titleRe: /\bdji\b/i,
    excludeTitleRe: /matrice\s*3\d{2}|matrice\s*4\d{2}|zenmuse\s*(x9|h20|l1|p1)|m300|m350|dock\b/i,
    subExcludeRe: /battery|propeller|prop\b|charg|hub\b|case|bag|backpack/i,
  },
  {
    id: "drone_spare_parts",
    label: "Drone spare parts",
    priority: 4,
    titleRe: /(drone|quadcopter|multicopter|fpv|gimbal).*(spare|replacement|repair|arm|leg|shell|part)|spare part.*(drone|dji|gimbal)|for dji.*(arm|leg|shell|cover|module|board|cable)/i,
    excludeTitleRe: /phone|watch|tablet|earphone|amazfit|honor magic|protective case\(/i,
  },
  {
    id: "drone_batteries",
    label: "Drone batteries",
    priority: 5,
    titleRe: /(drone|dji|intelligent flight|flight).*(battery|lipo)|battery.*(drone|dji|mavic|mini|air|phantom|matrice)|\blipo\b.*(drone|4s|6s)/i,
    excludeTitleRe: /phone|watch|case for|power bank case/i,
  },
  {
    id: "drone_propellers",
    label: "Drone propellers",
    priority: 5,
    titleRe: /(drone|dji|quadcopter|fpv).*(propeller|prop\b|paddle|blade)|propeller.*(drone|dji|mavic|mini|matrice)|\b\d{4,5}f\b.*propeller/i,
    excludeTitleRe: /phone|watch|fan\b|ceiling/i,
  },
  {
    id: "enterprise_drone_accessories",
    label: "Enterprise drone accessories",
    priority: 6,
    titleRe: /matrice|m300|m350|m30\b|zenmuse\s*(x9|h20|l1|p1|xt)|enterprise|rtk\b|dock\b|d-rtk|payload/i,
    excludeTitleRe: /phone|watch|mini 2 case/i,
  },
  {
    id: "charging_accessories",
    label: "Charging accessories",
    priority: 4,
    titleRe: /(drone|dji|battery).*(charg|hub|adapter|power)|charg.*(hub|station).*(dji|drone|battery)|parallel charg/i,
    excludeTitleRe: /phone case|watch|gamepad|laptop adapter tip|car left front/i,
  },
  {
    id: "cases_and_bags",
    label: "Cases and bags",
    priority: 4,
    titleRe: /(drone|dji|mavic|mini|air|phantom|fpv|quadcopter).*(case|bag|backpack|hard shell|carrying|storage)|waterproof.*(drone|dji)/i,
    excludeTitleRe: /phone case|watch case|tablet case|earphone|band \d|protective case\(.*(honor|samsung|huawei|amazfit)/i,
  },
];

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

async function invokeSunskySync(body) {
  const base = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) throw new Error("Missing Supabase env in .env");
  const res = await fetch(`${base}/functions/v1/sunsky-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify(body),
  });
  const json = JSON.parse(await res.text());
  if (!res.ok) throw new Error(json.error || json.message || `HTTP ${res.status}`);
  return json;
}

function parseVariantGroup(raw) {
  const model_list = [];
  if (Array.isArray(raw?.modelList)) {
    for (const entry of raw.modelList) {
      if (!entry || typeof entry !== "object") continue;
      const sku = String(entry.key ?? entry.itemNo ?? entry.item_no ?? "").trim();
      const label = entry.value ?? entry.label ?? entry.name;
      if (sku) model_list.push({ itemNo: sku, label: label != null ? String(label) : undefined });
    }
  }
  const items = [];
  const opts = raw?.optionList;
  if (opts?.items && Array.isArray(opts.items)) {
    for (const row of opts.items) {
      const sku = String(row?.itemNo ?? row?.item_no ?? "").trim();
      const keywords = String(row?.keywords ?? row?.label ?? "").trim();
      if (sku) items.push({ itemNo: sku, keywords });
    }
  }
  return {
    group_item_no: raw?.groupItemNo != null ? String(raw.groupItemNo) : null,
    model_label: raw?.modelLabel != null ? String(raw.modelLabel) : null,
    model_list,
    option_list: { items },
    item_no: String(raw?.itemNo ?? ""),
  };
}

function catalogClass(vg) {
  const multiModel = vg.model_list.length > 1;
  const hasOptions = vg.option_list.items.length > 0;
  const groupDiffers = vg.group_item_no && vg.item_no && vg.group_item_no !== vg.item_no;

  if (multiModel || hasOptions) {
    let subtype = "B-modelList";
    if (multiModel && hasOptions) subtype = "B-both";
    else if (hasOptions) subtype = "B-optionList";
    return {
      variant_class: "B",
      single_sku: false,
      subtype,
      risk: hasOptions ? "high" : "medium",
      import_readiness: hasOptions ? "phase_2" : "phase_1",
      model_count: vg.model_list.length,
      option_count: vg.option_list.items.length,
    };
  }
  if (groupDiffers && vg.model_list.length === 0) {
    return {
      variant_class: "A-caution",
      single_sku: true,
      subtype: "A-shared-group",
      risk: "low-medium",
      import_readiness: "safe_today",
      model_count: 0,
      option_count: 0,
    };
  }
  return {
    variant_class: "A",
    single_sku: true,
    subtype: "A-single-sku",
    risk: "low",
    import_readiness: "safe_today",
    model_count: vg.model_list.length,
    option_count: 0,
  };
}

function assignCategory(title) {
  const matches = CATEGORIES.filter((c) => {
    if (c.excludeTitleRe?.test(title)) return false;
    return c.titleRe.test(title);
  });
  if (!matches.length) return null;
  matches.sort((a, b) => b.priority - a.priority);
  return matches[0];
}

async function fetchAllDjiProducts() {
  const seen = new Set();
  const products = [];
  let catalogTotal = 0;

  for (let page = 1; page <= DJI_MAX_PAGES; page++) {
    const data = await invokeSunskySync({
      action: "search-products",
      brandId: "DJI",
      page,
      pageSize: DJI_PAGE_SIZE,
    });
    catalogTotal = data.total || catalogTotal;
    const batch = data.products ?? [];
    if (!batch.length) break;

    for (const row of batch) {
      const itemNo = row.itemNo || row.sn;
      if (!itemNo || seen.has(itemNo)) continue;
      seen.add(itemNo);
      let detail = row;
      try {
        const d = await invokeSunskySync({ action: "get-product-detail", itemNo });
        if (d.product) detail = d.product;
      } catch {}
      products.push(detail);
      await new Promise((r) => setTimeout(r, 60));
    }
    if (page * DJI_PAGE_SIZE >= catalogTotal) break;
  }

  return { products, catalogTotal };
}

function summarizeCategory(cat, rows) {
  const n = rows.length;
  const counts = { A: 0, "A-caution": 0, B: 0 };
  const readiness = { safe_today: 0, phase_1: 0, phase_2: 0 };
  const subtypes = { "B-modelList": 0, "B-optionList": 0, "B-both": 0 };
  for (const r of rows) {
    counts[r.variant_class] = (counts[r.variant_class] ?? 0) + 1;
    readiness[r.import_readiness] = (readiness[r.import_readiness] ?? 0) + 1;
    if (r.subtype?.startsWith("B-")) subtypes[r.subtype] = (subtypes[r.subtype] ?? 0) + 1;
  }
  const singleSku = counts.A + counts["A-caution"];
  const variantFamily = counts.B;
  const pct = (x) => (n ? Math.round((x / n) * 1000) / 10 : null);

  let risk = "unverified";
  if (n > 0) {
    const p2 = pct(readiness.phase_2) ?? 0;
    if (p2 >= 70) risk = "high";
    else if (p2 >= 40) risk = "medium-high";
    else if (p2 >= 15) risk = "medium";
    else risk = "low-medium";
  }

  let importReadinessLabel = "Not ready";
  const safePct = pct(readiness.safe_today) ?? 0;
  if (safePct >= 40) importReadinessLabel = "Ready (majority safe today)";
  else if (safePct >= 15) importReadinessLabel = "Partial — pilot SKUs only";
  else if ((pct(readiness.phase_1) ?? 0) >= 50) importReadinessLabel = "Phase 1 required (family dedup)";
  else if ((pct(readiness.phase_2) ?? 0) >= 50) importReadinessLabel = "Phase 2 required (multi-variant)";

  return {
    category_id: cat.id,
    label: cat.label,
    product_count: n,
    single_sku_products: singleSku,
    variant_family_products: variantFamily,
    breakdown: counts,
    B_subtypes: subtypes,
    import_readiness_counts: readiness,
    safe_today_pct: pct(readiness.safe_today),
    phase_1_pct: pct(readiness.phase_1),
    phase_2_pct: pct(readiness.phase_2),
    risk_level: risk,
    import_readiness: importReadinessLabel,
    examples: {
      single_sku: rows.filter((r) => r.single_sku).slice(0, 4),
      variant_family: rows.filter((r) => !r.single_sku).slice(0, 4),
    },
  };
}

async function main() {
  loadEnvFile();
  console.log("Fetching DJI brand catalog...");
  const { products: djiProducts, catalogTotal } = await fetchAllDjiProducts();
  console.log(`DJI catalog: ${catalogTotal} total, ${djiProducts.length} fetched with detail`);

  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c.id, []]));
  const unassigned = [];

  for (const detail of djiProducts) {
    const title = String(detail.name ?? "");
    const cat = assignCategory(title);
    const vg = parseVariantGroup(detail);
    const cls = catalogClass(vg);
    const row = {
      item_no: vg.item_no,
      title: title.slice(0, 120),
      group_item_no: vg.group_item_no,
      model_label: vg.model_label,
      brand: "DJI",
      ...cls,
    };
    if (cat) {
      row.category_id = cat.id;
      row.category_label = cat.label;
      byCategory[cat.id].push(row);
    } else {
      unassigned.push(row);
    }
  }

  const categories = CATEGORIES.map((cat) => summarizeCategory(cat, byCategory[cat.id]));
  const allAssigned = categories.flatMap((_, i) => byCategory[CATEGORIES[i].id]);
  const total = allAssigned.length;

  const agg = { safe_today: 0, phase_1: 0, phase_2: 0, A: 0, "A-caution": 0, B: 0 };
  for (const r of allAssigned) {
    agg[r.import_readiness]++;
    agg[r.variant_class]++;
  }

  const report = {
    generated_at: new Date().toISOString(),
    methodology: {
      primary_source: "Sunsky brandId=DJI full catalog crawl",
      dji_catalog_total: catalogTotal,
      dji_products_fetched: djiProducts.length,
      dji_products_assigned: total,
      dji_unassigned: unassigned.length,
      classification: {
        single_sku: "A or A-caution",
        variant_family: "B (modelList>1 and/or optionList)",
        safe_today: "PR1 — import + single-variant publish now",
        phase_1: "PR-V1 — family dedup; import anchor SKU; publish one leaf",
        phase_2: "PR-V2 — multi-variant Shopify publish (optionList / color matrix)",
      },
      limitations: [
        "Non-DJI FPV/generic parts require keyword search (currently unreliable without brandId).",
        "Category assignment is title-regex based on fetched product names.",
        "DJI catalog is a subset of full EuroDroneParts assortment.",
      ],
    },
    categories,
    aggregate: {
      eurodrone_categories_total: total,
      single_sku: agg.A + agg["A-caution"],
      variant_family: agg.B,
      safe_today_pct: total ? Math.round((agg.safe_today / total) * 1000) / 10 : 0,
      phase_1_pct: total ? Math.round((agg.phase_1 / total) * 1000) / 10 : 0,
      phase_2_pct: total ? Math.round((agg.phase_2 / total) * 1000) / 10 : 0,
      breakdown: { A: agg.A, "A-caution": agg["A-caution"], B: agg.B },
    },
    unassigned_sample: unassigned.slice(0, 15),
    products: allAssigned,
  };

  const out = path.join(process.cwd(), "scripts", "eurodrone-category-output.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    dji_catalog_total: catalogTotal,
    assigned: total,
    aggregate: report.aggregate,
    per_category: categories.map((c) => ({
      label: c.label,
      count: c.product_count,
      safe: c.safe_today_pct,
      p1: c.phase_1_pct,
      p2: c.phase_2_pct,
    })),
    output: out,
  }, null, 2));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
