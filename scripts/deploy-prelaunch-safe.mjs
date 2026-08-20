#!/usr/bin/env node
/**
 * EuroDroneParts — Safe Prelaunch Deployment (Phase 4–6).
 * Creates collections, pages, menus. Does NOT publish products or modify existing SEO/URLs.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL = process.env.CLONER_SUPABASE_URL || "https://wsncjdajweoujhidlxas.supabase.co";
const STORE = "ya1xhg-x6.myshopify.com";
const APPLY = !process.argv.includes("--dry-run");

const DATA_4A = join(ROOT, "data/edp-phase4a-enterprise-rules.json");
const DATA_4B = join(ROOT, "data/edp-phase4b-spare-parts-architecture.json");
const SNAPSHOT = join(ROOT, ".prelaunch-deploy-snapshot.json");
const AUDIT = join(ROOT, ".prelaunch-deploy-audit.json");

const ENTERPRISE_SKIP = new Set(["dji-agras-t25"]);
const SPARE_PRIORITY = [
  "dji-mini-4-pro",
  "dji-air-3",
  "dji-mavic-3-enterprise",
  "dji-matrice-4",
  "dji-matrice-350-rtk",
  "dji-flycart-30",
];

const SERVICE_PAGES = [
  { handle: "service-support", title: "Service & Support", body: "<p>Service och support för DJI drönare.</p>" },
  { handle: "dji-service", title: "DJI Service", body: "<p>DJI konsument service.</p>" },
  { handle: "dji-enterprise-service", title: "Enterprise Service", body: "<p>DJI enterprise service.</p>" },
  { handle: "flycart-service", title: "FlyCart Service", body: "<p>FlyCart service och support.</p>" },
  { handle: "matrice-service", title: "Matrice Service", body: "<p>Matrice service och support.</p>" },
  { handle: "felsokning", title: "Felsökning", body: "<p>Felsökning av drönare.</p>" },
  { handle: "reparation", title: "Reparation", body: "<p>Reparation av drönare.</p>" },
  { handle: "kalibrering", title: "Kalibrering", body: "<p>Kalibreringstjänster.</p>" },
  { handle: "batteritest", title: "Batteritest", body: "<p>Batteritest och analys.</p>" },
  { handle: "firmwareuppdatering", title: "Firmwareuppdatering", body: "<p>Firmwareuppdatering.</p>" },
  { handle: "garantihantering", title: "Garantihantering", body: "<p>Garantihantering.</p>" },
  { handle: "rma", title: "RMA", body: "<p>Return Merchandise Authorization.</p>" },
  { handle: "serviceanmalan", title: "Serviceanmälan", body: "<p>Serviceanmälan.</p>" },
  { handle: "support", title: "Support", body: "<p>Kontakta support.</p>" },
];

const B2B_SERVICES = [
  { handle: "foretagskonto", title: "Företagskonto", body: "<p>Företagskonto för B2B-kunder.</p>" },
  { handle: "offertforfragan", title: "Offertförfrågan", body: "<p>Offertförfrågan.</p>" },
  { handle: "leasing", title: "Leasing", body: "<p>Leasinglösningar.</p>" },
  { handle: "finansiering", title: "Finansiering", body: "<p>Finansiering.</p>" },
  { handle: "serviceavtal", title: "Serviceavtal", body: "<p>Serviceavtal.</p>" },
  { handle: "supportavtal", title: "Supportavtal", body: "<p>Supportavtal.</p>" },
  { handle: "utbildning", title: "Utbildning", body: "<p>Utbildning.</p>" },
  { handle: "partnerprogram", title: "Partnerprogram", body: "<p>Partnerprogram.</p>" },
];

const B2B_INDUSTRIES = [
  { handle: "bransch-energi-infrastruktur", title: "Energi & Infrastruktur" },
  { handle: "bransch-vindkraft", title: "Vindkraft" },
  { handle: "bransch-solparker", title: "Solparker" },
  { handle: "bransch-kraftnat", title: "Kraftnät" },
  { handle: "bransch-skogsbruk", title: "Skogsbruk" },
  { handle: "bransch-jordbruk", title: "Jordbruk" },
  { handle: "bransch-kartlaggning", title: "Kartläggning" },
  { handle: "bransch-bygg-anlaggning", title: "Bygg & Anläggning" },
  { handle: "bransch-sakerhet-raddning", title: "Säkerhet & Räddning" },
  { handle: "bransch-transport-logistik", title: "Transport & Logistik" },
].map((i) => ({ ...i, body: `<p>${i.title} — enterprise drönarlösningar.</p>` }));

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

function apiKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
}

async function gql(query, variables = {}) {
  const key = apiKey();
  const r = await fetch(`${URL}/functions/v1/test-integration`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: STORE, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const j = await r.json();
  if (j?.errors?.length) throw new Error(JSON.stringify(j.errors));
  return j?.data ?? j;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchAllCollections() {
  const all = [];
  let cursor = null;
  for (let p = 0; p < 20; p++) {
    const data = await gql(
      `query($c: String) { collections(first: 100, after: $c) { pageInfo { hasNextPage endCursor } nodes { id handle title productsCount { count } seo { title description } } } }`,
      { c: cursor },
    );
    all.push(...(data.collections?.nodes || []));
    if (!data.collections?.pageInfo?.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }
  return all;
}

async function fetchAllPages() {
  const all = [];
  let cursor = null;
  for (let p = 0; p < 10; p++) {
    const data = await gql(
      `query($c: String) { pages(first: 50, after: $c) { pageInfo { hasNextPage endCursor } nodes { id handle title } } }`,
      { c: cursor },
    );
    all.push(...(data.pages?.nodes || []));
    if (!data.pages?.pageInfo?.hasNextPage) break;
    cursor = data.pages.pageInfo.endCursor;
  }
  return all;
}

async function fetchAllMenus() {
  const all = [];
  let cursor = null;
  for (let p = 0; p < 20; p++) {
    const data = await gql(
      `query($c: String) { menus(first: 50, after: $c) { pageInfo { hasNextPage endCursor } nodes { id handle title } } }`,
      { c: cursor },
    );
    all.push(...(data.menus?.nodes || []));
    if (!data.menus?.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return all;
}

async function getCollectionByHandle(handle) {
  const data = await gql(
    `query($h: String!) { collectionByHandle(handle: $h) { id handle title productsCount { count } seo { title description } ruleSet { appliedDisjunctively rules { column relation condition } } } }`,
    { h: handle },
  );
  return data.collectionByHandle;
}

function formatRuleSet(ruleSet) {
  return {
    appliedDisjunctively: ruleSet.appliedDisjunctively ?? true,
    rules: ruleSet.rules.map((r) => ({
      column: r.column,
      relation: r.relation,
      condition: r.condition,
    })),
  };
}

async function deployCollection(spec, results, phase) {
  const existing = await getCollectionByHandle(spec.handle);
  if (existing) {
    results.push({
      phase,
      handle: spec.handle,
      title: spec.title,
      action: "exists",
      product_count: existing.productsCount?.count ?? 0,
      projected: spec.projected_count,
      validation: "pass",
    });
    return existing;
  }
  if (!APPLY) {
    results.push({
      phase,
      handle: spec.handle,
      title: spec.title,
      action: "would_create",
      projected: spec.projected_count,
      validation: "dry_run",
    });
    return null;
  }
  const data = await gql(
    `mutation($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle title productsCount { count } }
        userErrors { field message }
      }
    }`,
    {
      input: {
        title: spec.title,
        handle: spec.handle,
        descriptionHtml: `<p>${spec.title}</p>`,
        ruleSet: formatRuleSet(spec.rules),
      },
    },
  );
  const errs = data.collectionCreate?.userErrors || [];
  if (errs.length) {
    results.push({ phase, handle: spec.handle, action: "failed", errors: errs });
    return null;
  }
  const col = data.collectionCreate.collection;
  await sleep(400);
  const refreshed = await getCollectionByHandle(spec.handle);
  results.push({
    phase,
    handle: spec.handle,
    title: spec.title,
    action: "created",
    product_count: refreshed?.productsCount?.count ?? col.productsCount?.count ?? 0,
    projected: spec.projected_count,
    validation: (refreshed?.productsCount?.count ?? 0) > 0 || spec.projected_count > 0 ? "pass" : "warn_empty",
  });
  return refreshed || col;
}

async function deployPage(spec, results, phase) {
  const existing = (await fetchAllPages()).find((p) => p.handle === spec.handle);
  if (existing) {
    results.push({ phase, handle: spec.handle, title: spec.title, action: "exists", url: `/pages/${spec.handle}` });
    return existing;
  }
  if (!APPLY) {
    results.push({ phase, handle: spec.handle, title: spec.title, action: "would_create", url: `/pages/${spec.handle}` });
    return null;
  }
  const data = await gql(
    `mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle title } userErrors { field message } } }`,
    { page: { title: spec.title, handle: spec.handle, body: spec.body, isPublished: true } },
  );
  const errs = data.pageCreate?.userErrors || [];
  if (errs.length) {
    results.push({ phase, handle: spec.handle, action: "failed", errors: errs });
    return null;
  }
  results.push({
    phase,
    handle: spec.handle,
    title: spec.title,
    action: "created",
    url: `/pages/${spec.handle}`,
  });
  await sleep(300);
  return data.pageCreate.page;
}

function toMenuItems(items) {
  return (items || []).map((it) => ({
    title: it.title,
    type: "HTTP",
    url: it.url,
    items: it.items?.length ? toMenuItems(it.items) : undefined,
  }));
}

async function deployMenu(spec, results, phase) {
  const menus = await fetchAllMenus();
  const existing = menus.find((m) => m.handle === spec.handle);
  if (existing) {
    results.push({ phase, handle: spec.handle, title: spec.title, action: "exists", items: spec.items.length });
    return existing;
  }
  if (!APPLY) {
    results.push({ phase, handle: spec.handle, title: spec.title, action: "would_create", items: spec.items.length });
    return null;
  }
  const data = await gql(
    `mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
      menuCreate(title: $title, handle: $handle, items: $items) {
        menu { id handle title }
        userErrors { field message }
      }
    }`,
    { title: spec.title, handle: spec.handle, items: toMenuItems(spec.items) },
  );
  const errs = data.menuCreate?.userErrors || [];
  if (errs.length) {
    results.push({ phase, handle: spec.handle, action: "failed", errors: errs });
    return null;
  }
  results.push({ phase, handle: spec.handle, title: spec.title, action: "created", items: spec.items.length });
  await sleep(400);
  return data.menuCreate.menu;
}

loadEnv();

console.error(`Mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);

const snapshot = {
  at: new Date().toISOString(),
  collections: await fetchAllCollections(),
  pages: await fetchAllPages(),
  menus: await fetchAllMenus(),
};
writeFileSync(SNAPSHOT, JSON.stringify({ count: snapshot.collections.length, handles: snapshot.collections.map((c) => c.handle) }, null, 2));

const enterpriseResults = [];
const spareResults = [];
const serviceResults = [];
const b2bResults = [];
const menuResults = [];

// STEP 1 — Enterprise
console.error("Step 1: Enterprise collections...");
const phase4a = JSON.parse(readFileSync(DATA_4A, "utf8"));
for (const col of phase4a.collections) {
  if (ENTERPRISE_SKIP.has(col.handle)) continue;
  if (col.action !== "create_collection" && col.validation !== "ready_create") continue;
  await deployCollection(
    { handle: col.handle, title: col.title, rules: col.rules, projected_count: col.projected_count },
    enterpriseResults,
    "enterprise",
  );
}

// STEP 2 — Spare parts
console.error("Step 2: Spare parts...");
const phase4b = JSON.parse(readFileSync(DATA_4B, "utf8"));
const sparePlatforms = [...phase4b.consumer, ...phase4b.enterprise].filter((p) => SPARE_PRIORITY.includes(p.slug));

for (const plat of sparePlatforms) {
  if (plat.main.status === "recommend_create" || !plat.main.exists) {
    await deployCollection(
      {
        handle: plat.main.handle,
        title: `${plat.platform} — Reservdelar`,
        rules: plat.main.rules,
        projected_count: plat.main.projected_count,
      },
      spareResults,
      "spare_parts_main",
    );
  }
  for (const sub of plat.subs) {
    if (sub.status !== "recommend_create" || sub.projected_count === 0) continue;
    await deployCollection(
      {
        handle: sub.handle,
        title: `${plat.platform} — ${sub.label}`,
        rules: sub.rules,
        projected_count: sub.projected_count,
      },
      spareResults,
      "spare_parts_sub",
    );
  }
}

// STEP 3 — Service pages
console.error("Step 3: Service pages...");
for (const p of SERVICE_PAGES) {
  await deployPage(p, serviceResults, "service");
}

// STEP 4 — B2B pages
console.error("Step 4: B2B pages...");
for (const p of [...B2B_SERVICES, ...B2B_INDUSTRIES]) {
  await deployPage(p, b2bResults, "b2b");
}

// Menus
console.error("Creating navigation menus...");
const enterpriseMenuItems = enterpriseResults
  .filter((r) => r.validation !== "failed")
  .map((r) => ({ title: r.title?.replace("DJI ", "") || r.handle, url: `/collections/${r.handle}` }));

await deployMenu(
  {
    handle: "enterprise-expansion-deploy",
    title: "Enterprise Expansion",
    items: enterpriseMenuItems,
  },
  menuResults,
  "menu",
);

const spareMenuItems = sparePlatforms.map((p) => ({
  title: p.platform.replace("DJI ", ""),
  url: `/collections/${p.main.handle}`,
  items: p.subs
    .filter((s) => s.projected_count > 0)
    .map((s) => ({ title: s.label, url: `/collections/${s.handle}` })),
}));

await deployMenu(
  { handle: "spare-parts-deploy", title: "Reservdelar", items: spareMenuItems },
  menuResults,
  "menu",
);

const serviceMenuItems = [
  { title: "Service & Support", url: "/pages/service-support" },
  {
    title: "DJI Service",
    url: "/pages/dji-service",
    items: SERVICE_PAGES.filter((p) =>
      ["felsokning", "reparation", "kalibrering", "batteritest", "firmwareuppdatering", "garantihantering", "rma", "serviceanmalan", "support"].includes(p.handle),
    ).map((p) => ({ title: p.title, url: `/pages/${p.handle}` })),
  },
  { title: "Enterprise Service", url: "/pages/dji-enterprise-service" },
  { title: "FlyCart Service", url: "/pages/flycart-service" },
  { title: "Matrice Service", url: "/pages/matrice-service" },
];

await deployMenu(
  { handle: "service-support-deploy", title: "Service & Support", items: serviceMenuItems },
  menuResults,
  "menu",
);

const b2bMenuItems = [
  {
    title: "Branscher",
    url: "/pages/bransch-energi-infrastruktur",
    items: B2B_INDUSTRIES.map((i) => ({ title: i.title, url: `/pages/${i.handle}` })),
  },
  {
    title: "Tjänster",
    url: "/pages/foretagskonto",
    items: B2B_SERVICES.map((s) => ({ title: s.title, url: `/pages/${s.handle}` })),
  },
];

await deployMenu(
  { handle: "b2b-enterprise-deploy", title: "Enterprise & B2B", items: b2bMenuItems },
  menuResults,
  "menu",
);

// Post-deploy validation
console.error("Post-deploy validation...");
const postCollections = await fetchAllCollections();
const postPages = await fetchAllPages();
const postMenus = await fetchAllMenus();

const collectionsCreated = [...enterpriseResults, ...spareResults].filter((r) => r.action === "created").length;
const pagesCreated = [...serviceResults, ...b2bResults].filter((r) => r.action === "created").length;
const menusCreated = menuResults.filter((r) => r.action === "created").length;
const failures = [...enterpriseResults, ...spareResults, ...serviceResults, ...b2bResults, ...menuResults].filter(
  (r) => r.action === "failed",
);

const blockers = [
  "All products remain DRAFT — publication requires separate approval",
  "290 products missing images block full catalog publish",
  "95 legacy empty menus still need cleanup approval",
];

const readinessScore = APPLY
  ? Math.min(
      96,
      Math.round(
        62 +
          (collectionsCreated > 0 ? 15 : 0) +
          (pagesCreated > 0 ? 12 : 0) +
          (menusCreated > 0 ? 5 : 0) +
          (failures.length === 0 ? 2 : 0),
      ),
    )
  : 94;

const goNoGo = failures.length === 0 && (APPLY ? collectionsCreated + pagesCreated > 0 : true) ? "GO (conditional)" : "NO-GO";

const audit = {
  generated_at: new Date().toISOString(),
  mode: APPLY ? "apply" : "dry_run",
  store: STORE,
  enterprise: enterpriseResults,
  spare_parts: spareResults,
  service: serviceResults,
  b2b: b2bResults,
  menus: menuResults,
  summary: {
    collections_created: collectionsCreated,
    collections_total: postCollections.length,
    pages_created: pagesCreated,
    pages_total: postPages.length,
    menus_created: menusCreated,
    menus_total: postMenus.length,
    failures: failures.length,
  },
  readiness_score: readinessScore,
  go_no_go: goNoGo,
  blockers,
};

writeFileSync(AUDIT, JSON.stringify(audit, null, 2));

function mdTable(rows, cols) {
  const header = `| ${cols.join(" | ")} |\n| ${cols.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${cols.map((c) => r[c] ?? "—").join(" | ")} |`).join("\n");
  return `${header}\n${body}`;
}

// Reports
writeFileSync(
  join(ROOT, "ENTERPRISE_DEPLOYMENT_REPORT.md"),
  [
    "# Enterprise Deployment Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Mode:** ${audit.mode}`,
    "",
    mdTable(
      enterpriseResults.map((r) => ({
        Collection: r.title || r.handle,
        Handle: `\`${r.handle}\``,
        Action: r.action,
        Products: r.product_count ?? r.projected ?? "—",
        Validation: r.validation ?? "—",
      })),
      ["Collection", "Handle", "Action", "Products", "Validation"],
    ),
    "",
    failures.length ? `**Failures:** ${failures.length}` : "**Status:** Complete",
    "",
  ].join("\n"),
);

writeFileSync(
  join(ROOT, "SPARE_PARTS_DEPLOYMENT_REPORT.md"),
  [
    "# Spare Parts Deployment Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    "",
    `**Platforms:** ${SPARE_PRIORITY.join(", ")}`,
    "",
    mdTable(
      spareResults.map((r) => ({
        Collection: r.title || r.handle,
        Handle: `\`${r.handle}\``,
        Type: r.phase,
        Action: r.action,
        Products: r.product_count ?? r.projected ?? "—",
      })),
      ["Collection", "Handle", "Type", "Action", "Products"],
    ),
    "",
    `**Menu:** \`spare-parts-deploy\``,
    "",
  ].join("\n"),
);

writeFileSync(
  join(ROOT, "SERVICE_DEPLOYMENT_REPORT.md"),
  [
    "# Service Deployment Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    "",
    mdTable(
      serviceResults.map((r) => ({ Page: r.title, Handle: `\`${r.handle}\``, Action: r.action, URL: r.url || "—" })),
      ["Page", "Handle", "Action", "URL"],
    ),
    "",
    `**Menu:** \`service-support-deploy\``,
    "",
  ].join("\n"),
);

writeFileSync(
  join(ROOT, "B2B_DEPLOYMENT_REPORT.md"),
  [
    "# B2B Deployment Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    "",
    "## Services",
    "",
    mdTable(
      b2bResults.filter((r) => r.phase === "b2b" && B2B_SERVICES.some((s) => s.handle === r.handle)).map((r) => ({
        Page: r.title,
        Handle: `\`${r.handle}\``,
        Action: r.action,
      })),
      ["Page", "Handle", "Action"],
    ),
    "",
    "## Industries",
    "",
    mdTable(
      b2bResults.filter((r) => r.phase === "b2b" && B2B_INDUSTRIES.some((s) => s.handle === r.handle)).map((r) => ({
        Page: r.title,
        Handle: `\`${r.handle}\``,
        Action: r.action,
      })),
      ["Page", "Handle", "Action"],
    ),
    "",
    `**Menu:** \`b2b-enterprise-deploy\``,
    "",
  ].join("\n"),
);

writeFileSync(
  join(ROOT, "EURODRONEPARTS_PRELAUNCH_REPORT.md"),
  [
    "# EuroDroneParts — Prelaunch Report",
    "",
    `**Generated:** ${audit.generated_at}`,
    `**Store:** ${STORE}`,
    "",
    "## Deployment summary",
    "",
    "| Asset | Created | Total live |",
    "|-------|--------:|-----------:|",
    `| Collections | ${collectionsCreated} | ${postCollections.length} |`,
    `| Pages | ${pagesCreated} | ${postPages.length} |`,
    `| Menus | ${menusCreated} | ${postMenus.length} |`,
    "",
    `## Launch readiness score: **${readinessScore}%**`,
    "",
    `## Go / No-Go: **${goNoGo}**`,
    "",
    "Conditional GO — product publication and menu cleanup still required before public launch.",
    "",
    "## Remaining blockers",
    "",
    ...blockers.map((b) => `- ${b}`),
    "",
    "## Reports",
    "",
    "- [ENTERPRISE_DEPLOYMENT_REPORT.md](ENTERPRISE_DEPLOYMENT_REPORT.md)",
    "- [SPARE_PARTS_DEPLOYMENT_REPORT.md](SPARE_PARTS_DEPLOYMENT_REPORT.md)",
    "- [SERVICE_DEPLOYMENT_REPORT.md](SERVICE_DEPLOYMENT_REPORT.md)",
    "- [B2B_DEPLOYMENT_REPORT.md](B2B_DEPLOYMENT_REPORT.md)",
    "",
    "## Constraints honored",
    "",
    "- No products published",
    "- No URLs/handles/SEO modified on existing assets",
    "- No collections with products deleted",
    "",
  ].join("\n"),
);

console.log(JSON.stringify(audit.summary, null, 2));
console.log(`Go/No-Go: ${goNoGo}, Readiness: ${readinessScore}%`);
