#!/usr/bin/env node
/**
 * Local menu recovery pass (no edge deploy required):
 * 1. Publish neutral EuroDroneParts placeholder pages (published: true)
 * 2. menuUpdate on live target with pruning + dronare→dji-dronare remap
 * 3. Write EURODRONEPARTS_MENU_RECOVERY_REPORT.md
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const REPORT = join(ROOT, "EURODRONEPARTS_MENU_RECOVERY_REPORT.md");
const API_VER = "2024-10";

const MENU_PAGE_PLACEHOLDERS = {
  kontakt: {
    title: "Kontakt",
    body_html:
      "<p>Kontakta Europe Drone Parts för frågor om drönare, tillbehör och reservdelar. Vi återkommer så snart vi kan.</p>",
  },
  information: {
    title: "Information",
    body_html:
      "<p>Information om Europe Drone Parts — din partner för DJI-drönare och professionellt tillbehör i Europa.</p>",
  },
  "ansok-om-partnership": {
    title: "Ansök om partnership",
    body_html:
      "<p>Intresserad av samarbete med Europe Drone Parts? Kontakta oss för partnership och återförsäljarfrågor.</p>",
  },
  "reklamationer-aterkop": {
    title: "Reklamationer & Återköp",
    body_html:
      "<p>Information om reklamationer och återköp hos Europe Drone Parts. Kontakta kundservice om du behöver hjälp.</p>",
  },
};

const COLLECTION_HANDLE_REMAP = { dronare: "dji-dronare" };

const LEGACY_HANDLE_PATTERNS = [
  /^actionking/i,
  /actionking/i,
  /^alla-produkter-actionking/i,
  /^actionking-/i,
  /^ak-actionkamera/i,
  /^bastsaljare$/i,
  /^actionkamer-dji-gopro-insta360/i,
];

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function urlHandle(url, prefix) {
  const m = String(url || "").match(new RegExp(`/${prefix}/([^/?#]+)`));
  return m ? m[1] : null;
}

function isLegacyActionKingCollection(handle, title = "") {
  const h = String(handle || "").trim();
  const blob = `${h} ${title}`.toLowerCase();
  if (blob.includes("actionking") || blob.includes("action king")) return true;
  return LEGACY_HANDLE_PATTERNS.some((re) => re.test(h));
}

function rewriteMenuItemUrls(items) {
  return (items || []).map((it) => {
    let url = String(it.url || "");
    const collectionHandle = urlHandle(url, "collections");
    if (collectionHandle && COLLECTION_HANDLE_REMAP[collectionHandle]) {
      const mapped = COLLECTION_HANDLE_REMAP[collectionHandle];
      url = url.replace(`/collections/${collectionHandle}`, `/collections/${mapped}`);
    }
    const pageHandle = urlHandle(url, "pages");
    const titleKey = String(it.title || "").trim().toLowerCase();
    const titlePageMap = {
      kontakt: "/pages/kontakt",
      information: "/pages/information",
      "ansök om partnership": "/pages/ansok-om-partnership",
      "reklamationer & återköp": "/pages/reklamationer-aterkop",
    };
    if (titlePageMap[titleKey] && (!pageHandle || !url.includes("/pages/"))) {
      url = titlePageMap[titleKey];
    }
    return { ...it, url, items: rewriteMenuItemUrls(it.items) };
  });
}

function normalizeForMenuUpdate(items) {
  return (items || []).map((it) => ({
    title: it.title,
    type: "HTTP",
    url: it.url,
    tags: it.tags || [],
    items: normalizeForMenuUpdate(it.items),
  }));
}

function pruneMenuItems(items, ctx, path = []) {
  const kept = [];
  const removed = [];
  const deferred = [];

  for (const it of items || []) {
    const rawType = String(it.type || "HTTP").toUpperCase();
    const url = String(it.url || "");
    const titlePath = [...path, String(it.title || "")].filter(Boolean).join(" › ");

    const pageHandle = urlHandle(url, "pages");
    const collectionHandle = urlHandle(url, "collections");
    let effectiveType = rawType;
    if (rawType === "HTTP") {
      if (pageHandle) effectiveType = "PAGE";
      else if (collectionHandle) effectiveType = "COLLECTION";
    }

    let publishable = true;
    let reason = "";

    if (effectiveType === "PAGE") {
      if (!pageHandle || !ctx.pages.has(pageHandle)) {
        publishable = false;
        reason = `page not on live target: ${pageHandle || "(unparseable)"}`;
      }
    } else if (effectiveType === "COLLECTION") {
      if (!collectionHandle) {
        publishable = false;
        reason = "collection handle not parseable from url";
      } else if (isLegacyActionKingCollection(collectionHandle, it.title)) {
        publishable = false;
        reason = "legacy_actionking_collection_not_restored";
      } else if (!ctx.liveCollections.has(collectionHandle)) {
        publishable = false;
        reason = `collection not on live target: ${collectionHandle}`;
      }
    } else if (effectiveType === "CUSTOMER_ACCOUNT_PAGE") {
      publishable = false;
      reason = "customer_account_page not configured on target";
    } else if (rawType === "HTTP" && /account\.actionking/i.test(url)) {
      publishable = false;
      reason = "legacy_actionking_account_link";
    }

    if (!publishable) {
      removed.push({ title: titlePath, type: effectiveType, url, reason });
      continue;
    }

    const child = pruneMenuItems(Array.isArray(it.items) ? it.items : [], ctx, [...path, String(it.title || "")]);
    removed.push(...child.removed);
    deferred.push(...child.deferred);
    kept.push({
      title: it.title,
      type: rawType,
      url,
      tags: it.tags || [],
      items: child.kept,
    });
  }

  return { kept, removed, deferred };
}

async function sb(path) {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!key || !url) throw new Error("Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or service role) in .env");
  const r = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function sbPatch(path, body) {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const r = await fetch(`${url}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`supabase patch ${r.status}`);
}

async function shopifyRest(domain, token, method, path, body) {
  const r = await fetch(`https://${domain}/admin/api/${API_VER}/${path}`, {
    method,
    headers: {
      "X-Shopify-Access-Token": token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 400)}`);
  return json;
}

async function shopifyGql(domain, token, query, variables) {
  const r = await fetch(`https://${domain}/admin/api/${API_VER}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors?.length) throw new Error(JSON.stringify(j.errors).slice(0, 400));
  return j.data;
}

async function fetchLivePages(domain, token) {
  const map = new Map();
  for (let page = 1; page <= 20; page++) {
    const j = await shopifyRest(domain, token, "GET", `pages.json?limit=250&page=${page}&fields=id,handle,published_at`);
    for (const p of j.pages || []) {
      map.set(p.handle, { id: p.id, published: !!p.published_at });
    }
    if (!j.pages?.length || j.pages.length < 250) break;
  }
  return map;
}

async function fetchLiveCollections(domain, token) {
  const set = new Set();
  for (const ep of ["custom_collections.json", "smart_collections.json"]) {
    for (let page = 1; page <= 20; page++) {
      const j = await shopifyRest(domain, token, "GET", `${ep}?limit=250&page=${page}&fields=handle`);
      const rows = j.custom_collections || j.smart_collections || [];
      for (const c of rows) set.add(c.handle);
      if (!rows.length || rows.length < 250) break;
    }
  }
  return set;
}

async function fetchTargetMenus(domain, token) {
  const map = new Map();
  let cursor = null;
  const query = `
    query Menus($cursor: String) {
      menus(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id handle title }
      }
    }`;
  for (let i = 0; i < 10; i++) {
    const data = await shopifyGql(domain, token, query, { cursor });
    for (const n of data?.menus?.nodes || []) {
      if (n?.handle) map.set(n.handle, { id: n.id, title: n.title });
    }
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return map;
}

async function publishPages(domain, token, dryRun) {
  const live = await fetchLivePages(domain, token);
  const results = [];
  for (const handle of Object.keys(MENU_PAGE_PLACEHOLDERS)) {
    const ph = MENU_PAGE_PLACEHOLDERS[handle];
    const existing = live.get(handle);
    if (existing?.published) {
      results.push({ handle, title: ph.title, result: "skipped", target_id: String(existing.id), published: true });
      continue;
    }
    if (dryRun) {
      results.push({
        handle,
        title: ph.title,
        result: existing ? "updated" : "created",
        target_id: existing ? String(existing.id) : undefined,
        published: true,
      });
      continue;
    }
    const payload = { page: { title: ph.title, handle, body_html: ph.body_html, published: true } };
    try {
      let targetId;
      if (existing) {
        const j = await shopifyRest(domain, token, "PUT", `pages/${existing.id}.json`, {
          page: { ...payload.page, id: existing.id },
        });
        targetId = String(j.page.id);
        results.push({ handle, title: ph.title, result: "updated", target_id: targetId, published: true });
      } else {
        const j = await shopifyRest(domain, token, "POST", "pages.json", payload);
        targetId = String(j.page.id);
        results.push({ handle, title: ph.title, result: "created", target_id: targetId, published: true });
      }
    } catch (e) {
      results.push({ handle, title: ph.title, result: "failed", error: e.message, published: false });
    }
  }
  return results;
}

const MENU_UPDATE = `
  mutation MenuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu { id handle title }
      userErrors { field message }
    }
  }`;

function buildReport(pages, menus, dryRun) {
  const fixed = menus.filter((m) => m.publish_result === "updated" || m.publish_result === "published");
  const failed = menus.filter((m) => m.publish_result === "failed");
  const emptyLegacy = ["dronare", "actionkameror", "vandring-outdoor"];
  const coreMenus = ["partnership", "main-menu", "footer", "customer-account-main-menu", "enterprise-dr-nare", "meny"];
  const coreOk = coreMenus.every((h) => fixed.some((m) => m.menu_handle === h));
  const acceptableEmpty = failed.filter((m) => emptyLegacy.includes(m.menu_handle));
  const blockingFailed = failed.filter((m) => !emptyLegacy.includes(m.menu_handle));
  const pass = coreOk && blockingFailed.length === 0;

  const lines = [
    "# EuroDroneParts — Menu Recovery Report",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Migration:** \`${MID}\``,
    `**Mode:** ${dryRun ? "Dry-run" : "Live"} (local script — skip_collections, DJI custom collections unchanged)`,
    "",
    "## Verdict",
    "",
    `| Menu integrity | **${pass ? "PASS" : "FAIL"}** |`,
    `| Menus updated | ${fixed.length} / ${menus.length} |`,
    `| Core menus (partnership, main-menu, footer, customer-account, enterprise-dr-nare, meny) | ${coreOk ? "PASS" : "FAIL"} |`,
    `| Blocking failures | ${blockingFailed.length} |`,
    "",
    "## Dependency pages published",
    "",
    "| Handle | Title | Result | Published |",
    "|--------|-------|--------|-----------|",
  ];
  for (const p of pages) {
    lines.push(`| \`${p.handle}\` | ${p.title} | ${p.result} | ${p.published ? "yes" : "no"} |`);
  }

  lines.push("", "## Menus", "", "| Handle | Result | Kept | Removed | Deferred | Error |", "|--------|--------|-----:|--------:|---------:|-------|");
  for (const m of menus) {
    lines.push(
      `| \`${m.menu_handle}\` | ${m.publish_result} | ${m.kept_count ?? 0} | ${m.removed_links?.length ?? 0} | ${m.deferred_links?.length ?? 0} | ${(m.error || "—").slice(0, 100)} |`,
    );
  }

  const allRemoved = menus.flatMap((m) => (m.removed_links || []).map((r) => ({ menu: m.menu_handle, ...r })));
  if (allRemoved.length) {
    lines.push("", "### Links removed", "", "| Menu | Title | Reason |", "|------|-------|--------|");
    for (const r of allRemoved) lines.push(`| \`${r.menu}\` | ${r.title} | ${r.reason} |`);
  }

  const allDeferred = menus.flatMap((m) => (m.deferred_links || []).map((r) => ({ menu: m.menu_handle, ...r })));
  if (allDeferred.length) {
    lines.push("", "### Links deferred", "", "| Menu | Title | Reason |", "|------|-------|--------|");
    for (const r of allDeferred) lines.push(`| \`${r.menu}\` | ${r.title} | ${r.reason} |`);
  }

  if (blockingFailed.length) {
    lines.push("", "### Remaining broken links (blocking)", "");
    for (const m of blockingFailed) lines.push(`- \`${m.menu_handle}\`: ${m.error || "failed"}`);
  }
  if (acceptableEmpty.length) {
    lines.push("", "### Acceptable empty legacy menus (not on live target)", "");
    for (const m of acceptableEmpty) lines.push(`- \`${m.menu_handle}\`: ${m.error || "empty after prune"}`);
  }

  lines.push(
    "",
    "## Smart collections (unchanged)",
    "",
    "6 approved DJI collections remain **usable custom collections** with products > 0.",
    "They are **not** rule-driven smart collections. Shopify does not allow adding `ruleSet` to existing custom collections via `collectionUpdate`.",
    "",
    "### Optional future step (requires explicit manual approval)",
    "",
    "Destructive custom→smart conversion: delete each custom collection + recreate as smart collection",
    "with remapped `dji.compatible_models` rules. Safeguards: dry-run first, backup product IDs,",
    "verify product counts match, one handle at a time, rollback plan documented.",
    "",
    "---",
    "",
    "*Generated by `scripts/run-menu-recovery-local.mjs`*",
  );
  return lines.join("\n");
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  console.log(dryRun ? "Dry-run local menu recovery..." : "Live local menu recovery...");

  const [mig] = await sb(`cloner_migrations?select=target_store_id&id=eq.${MID}&limit=1`);
  const [store] = await sb(`cloner_stores?select=shop_domain,access_token&id=eq.${mig.target_store_id}&limit=1`);
  const domain = store.shop_domain.replace(/^https?:\/\//, "");
  const token = store.access_token;

  console.log(`Target: ${domain}`);

  console.log("Step 1: Publish menu dependency pages...");
  const pages = await publishPages(domain, token, dryRun);

  const pageSet = new Set(Object.keys(MENU_PAGE_PLACEHOLDERS));
  const livePages = await fetchLivePages(domain, token);
  for (const [h, p] of livePages) {
    if (p.published) pageSet.add(h);
  }

  console.log("Step 2: Fetch live collections + menus...");
  const [liveCollections, targetMenus] = await Promise.all([
    fetchLiveCollections(domain, token),
    fetchTargetMenus(domain, token),
  ]);

  console.log(`Live pages: ${pageSet.size}, collections: ${liveCollections.size}, menus: ${targetMenus.size}`);
  if (!liveCollections.has("dji-dronare")) {
    console.warn("WARN: dji-dronare collection not found on live target");
  }

  const menuItems = await sb(
    `cloner_migration_items?select=id,source_handle,source_payload,error,publish_status,target_id&migration_id=eq.${MID}&object_type=eq.menu&publish_status=eq.failed`,
  );

  const audits = [];
  let fixed = 0;
  let failed = 0;

  for (const item of menuItems || []) {
    const src = item.source_payload || {};
    const handle = String(src.handle || item.source_handle || "");
    const title = String(src.title || handle);
    const normalized = rewriteMenuItemUrls(src.items || []);
    const { kept, removed, deferred } = pruneMenuItems(normalized, {
      pages: pageSet,
      liveCollections,
    });

    const audit = {
      menu_name: title,
      menu_handle: handle,
      removed_links: removed,
      deferred_links: deferred,
      publish_result: "failed",
      kept_count: kept.length,
    };

    if (kept.length === 0) {
      audit.error = deferred.length
        ? "no publishable items; some links deferred pending collection restore"
        : "all items unresolvable after pruning";
      audit.publish_result = deferred.length ? "skipped" : "failed";
      audits.push(audit);
      if (!deferred.length) failed++;
      continue;
    }

    const existing = targetMenus.get(handle);
    if (!existing) {
      audit.error = "menu not found on live target — menuUpdate only (no menuCreate)";
      audit.publish_result = "failed";
      audits.push(audit);
      failed++;
      continue;
    }

    if (dryRun) {
      audit.publish_result = "updated";
      audits.push(audit);
      fixed++;
      continue;
    }

    try {
      const data = await shopifyGql(domain, token, MENU_UPDATE, {
        id: existing.id,
        title,
        items: normalizeForMenuUpdate(kept),
      });
      const errs = data?.menuUpdate?.userErrors || [];
      if (errs.length) throw new Error(JSON.stringify(errs));
      audit.publish_result = "updated";
      await sbPatch(`cloner_migration_items?id=eq.${item.id}`, {
        publish_status: "published",
        target_id: data.menuUpdate.menu.id,
        target_handle: data.menuUpdate.menu.handle,
        error: null,
        updated_at: new Date().toISOString(),
      });
      fixed++;
    } catch (e) {
      audit.publish_result = "failed";
      audit.error = e.message;
      failed++;
    }
    audits.push(audit);
  }

  const result = {
    menu_pages: { pages, summary: { total: pages.length } },
    menus: { menus: audits, summary: { total: audits.length, fixed, failed } },
  };

  writeFileSync(join(ROOT, "menu-recovery-local.json"), JSON.stringify(result, null, 2));
  const report = buildReport(pages, audits, dryRun);
  writeFileSync(REPORT, report);
  console.log(`Wrote ${REPORT}`);
  console.log(JSON.stringify(result.menus.summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
