import fs from "node:fs";

function loadEnv() {
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();
const base = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function call(body) {
  const r = await fetch(`${base}/functions/v1/sunsky-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  return r.json();
}

function classify(raw) {
  const ml = Array.isArray(raw?.modelList) ? raw.modelList.length : 0;
  const ol = Array.isArray(raw?.optionList?.items) ? raw.optionList.items.length : 0;
  const gi = raw?.groupItemNo;
  const item = raw?.itemNo;
  if (ml > 1 || ol > 0) return { cat: "B", ml, ol };
  if (gi && item && gi !== item && ml === 0) return { cat: "A-caution", ml, ol };
  return { cat: "A", ml, ol };
}

function walkCategories(nodes, out = []) {
  for (const n of nodes || []) {
    out.push({ id: n.categoryId ?? n.id, name: n.name ?? n.categoryName });
    if (n.children?.length) walkCategories(n.children, out);
  }
  return out;
}

const cats = await call({ action: "get-categories" });
const flat = walkCategories(cats.categories || cats.data || []);
const droneCats = flat.filter((c) =>
  /drone|quad|fpv|rc |helicopter|uav|multicopter|aircraft model|gimbal|propeller|motor|esc\b/i.test(c.name || "")
);
console.log("Drone-related categories:", droneCats.slice(0, 20));

const results = [];
for (const cat of droneCats.slice(0, 5)) {
  const search = await call({
    action: "search-products",
    categoryId: cat.id,
    page: 1,
    pageSize: 15,
  });
  const products = search.products || [];
  console.log(`\nCategory ${cat.id} "${cat.name}" -> ${products.length} products (total ${search.total})`);
  for (const p of products.slice(0, 10)) {
    let detail = p;
    try {
      const d = await call({ action: "get-product-detail", itemNo: p.itemNo });
      if (d.product) detail = d.product;
    } catch {}
    const c = classify(detail);
    results.push({
      category_id: cat.id,
      category_name: cat.name,
      item_no: detail.itemNo,
      title: (detail.name || "").slice(0, 80),
      group_item_no: detail.groupItemNo,
      ...c,
    });
    console.log(`  ${detail.itemNo} [${c.cat}] ${(detail.name || "").slice(0, 55)}`);
    await new Promise((r) => setTimeout(r, 120));
  }
}

const summary = { A: 0, "A-caution": 0, B: 0 };
for (const r of results) summary[r.cat] = (summary[r.cat] || 0) + 1;
console.log("\nSummary:", summary, "of", results.length);
fs.writeFileSync("scripts/category-classification-output.json", JSON.stringify({ droneCats, results, summary }, null, 2));
