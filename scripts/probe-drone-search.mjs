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
  if (ml > 1 || ol > 0) return "B";
  if (gi && item && gi !== item && ml === 0) return "A-caution";
  return "A";
}

const queries = ["SPS", "2207 motor", "5040 propeller", "Mamba ESC", "Betaflight F4", "iFlight", "GEPRC", "T-Motor", "HGLRC"];
for (const q of queries) {
  const d = await call({ action: "search-products", keywords: q, page: 1, pageSize: 8 });
  const rows = (d.products || []).slice(0, 5).map((p) => ({
    itemNo: p.itemNo,
    name: (p.name || "").slice(0, 65),
    modelList: (p.modelList || []).length,
    optionList: (p.optionList?.items || []).length,
    groupItemNo: p.groupItemNo,
    cat: classify(p),
  }));
  console.log(`\n=== ${q} (${d.total ?? "?"} total) ===`);
  console.log(JSON.stringify(rows, null, 2));
  await new Promise((r) => setTimeout(r, 250));
}
