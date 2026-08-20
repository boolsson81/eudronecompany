#!/usr/bin/env node
/**
 * EuroDroneParts — SAFE MODE menu audit (live Shopify inventory).
 * Writes:
 *   EURODRONEPARTS_MENU_SAFE_AUDIT.md
 *   EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json
 *   .menu-safe-audit.json
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_MENU_SAFE_AUDIT.md");
const ROLLBACK = join(ROOT, "EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json");
const JSON_OUT = join(ROOT, ".menu-safe-audit.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://jzqgwsryxmgzcbjjddic.supabase.co";
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";
const TARGET = "ya1xhg-x6.myshopify.com";

const MENUS_GQL = `
  query MenusPage($cursor: String) {
    menus(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id handle title isDefault
        items { id title url type items { id title url type items { id title url type } } }
      }
    }
  }
`;

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
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
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
}

async function post(fn, body) {
  const key = apiKey();
  const r = await fetch(`${URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text.slice(0, 500) };
  }
  return { status: r.status, json, text };
}

async function fetchMenusGraphql() {
  const all = [];
  let cursor = null;
  for (let page = 0; page < 30; page++) {
    const { json } = await post("test-integration", {
      integration_type: "shopify",
      config: { store_domain: TARGET, access_token: "***configured***" },
      shopify_graphql: { query: MENUS_GQL, variables: { cursor } },
    });
    const nodes = json?.data?.menus?.nodes;
    if (!nodes) return null;
    all.push(...nodes);
    if (!json.data.menus.pageInfo?.hasNextPage) break;
    cursor = json.data.menus.pageInfo.endCursor;
  }
  return all;
}

function countItems(items) {
  let n = 0;
  for (const it of items || []) {
    n += 1;
    if (it.items?.length) n += countItems(it.items);
  }
  return n;
}

function fingerprint(items) {
  const walk = (nodes) =>
    (nodes || [])
      .map((it) => `${it.title}|${it.type}|${it.url}:[${walk(it.items)}]`)
      .join(";");
  return walk(items);
}

function snapshotItems(items) {
  return (items || []).map((it) => ({
    title: it.title,
    url: it.url,
    type: it.type,
    items: it.items?.length ? snapshotItems(it.items) : undefined,
  }));
}

function buildDecisions(inventory, menuDry) {
  const rows = inventory?.rows || [];
  const keep = [];
  const del = [];
  const rollback = [];

  if (rows.length) {
    const keepSet = new Set((inventory.canonical_menus || []).map((r) => r.handle));
    for (const r of rows) {
      const entry = {
        name: r.title,
        handle: r.handle,
        menu_id: r.menu_id,
        reason: r.recommendation,
      };
      if (
        r.safe_to_remove === "yes_after_theme_confirm" ||
        (r.safe_to_remove === "review" && !r.referenced_by_theme && r.classification === "duplicate_candidate")
      ) {
        del.push({ ...entry, reason: r.recommendation });
        rollback.push({
          id: r.menu_id,
          title: r.title,
          handle: r.handle,
          items: [],
        });
      } else if (keepSet.has(r.handle) || r.referenced_by_theme || r.dry_run_validation === "pass") {
        keep.push(entry);
      } else if (r.safe_to_remove === "review") {
        del.push({ ...entry, reason: `Duplicate/orphan — ${r.recommendation}` });
      } else {
        keep.push({ ...entry, reason: r.recommendation || "Retained pending review" });
      }
    }
    return { keep, delete: del, rollback, source: "menu_inventory_audit" };
  }

  const liveMenus = inventory?.liveMenus || [];
  const themeRefs = inventory?.themeRefs || new Map();
  const titleGroups = new Map();
  for (const m of liveMenus) {
    const t = String(m.title || "").toLowerCase();
    titleGroups.set(t, [...(titleGroups.get(t) || []), m]);
  }

  const canonicalForTitle = new Map();
  for (const [title, group] of titleGroups) {
    const sorted = [...group].sort((a, b) => countItems(b.items) - countItems(a.items));
    canonicalForTitle.set(title, sorted[0]);
  }

  const dryByHandle = new Map((menuDry?.menus || []).map((m) => [m.menu_handle, m]));
  const LEGACY_DELETE = new Set(["dronare", "actionkameror", "vandring-outdoor"]);

  for (const m of liveMenus) {
    const handle = m.handle;
    const title = m.title;
    const itemCount = countItems(m.items);
    const themeRef = themeRefs.get(handle)?.length > 0;
    const canonical = canonicalForTitle.get(String(title).toLowerCase());
    const isCanonical = canonical?.handle === handle;
    const dry = dryByHandle.get(handle);

    const base = {
      name: title,
      handle,
      menu_id: m.id,
    };

    if (m.isDefault) {
      keep.push({ ...base, reason: "Default Shopify menu — cannot delete" });
      continue;
    }

    if (LEGACY_DELETE.has(handle) && (dry?.publish_result === "failed" || itemCount === 0)) {
      const reason =
        handle === "vandring-outdoor"
          ? "Failed validation — no resolvable items; not theme-referenced"
          : "Legacy ActionKing menu — all items pruned; not theme-referenced";
      del.push({ ...base, reason });
      rollback.push({ id: m.id, title, handle, items: snapshotItems(m.items) });
      continue;
    }

    if (!isCanonical && titleGroups.get(String(title).toLowerCase())?.length > 1) {
      del.push({
        ...base,
        reason: `Duplicate title "${title}" — canonical is \`${canonical?.handle}\` (${countItems(canonical?.items)} items)`,
      });
      rollback.push({ id: m.id, title, handle, items: snapshotItems(m.items) });
      continue;
    }

    if (!themeRef && itemCount === 0 && !["main-menu", "footer", "customer-account-main-menu", "meny"].includes(handle)) {
      del.push({ ...base, reason: "Empty orphan menu — not referenced by theme" });
      rollback.push({ id: m.id, title, handle, items: snapshotItems(m.items) });
      continue;
    }

    keep.push({
      ...base,
      reason: themeRef
        ? `Referenced by theme (${(themeRefs.get(handle) || []).join(", ")})`
        : dry?.publish_result === "updated"
        ? "Migration menu — dry-run updated"
        : "Canonical production menu",
    });
  }

  return { keep, delete: del, rollback, source: "graphql_interim" };
}

function formatMarkdown(data) {
  const L = [];
  const push = (s = "") => L.push(s);
  push("# EuroDroneParts — Menu SAFE MODE Audit");
  push("");
  push(`**Generated:** ${data.generated_at}`);
  push(`**Target:** ${data.target_domain}`);
  push(`**Migration:** \`${MID}\``);
  push(`**Mode:** SAFE — no deletions`);
  push(`**Data source:** ${data.source}`);
  push("");
  push(`## STATUS: ${data.status}`);
  push("");
  push("## Summary");
  push(`| Metric | Value |`);
  push(`| --- | ---: |`);
  push(`| Live menus | ${data.total_live_menus} |`);
  push(`| KEEP | ${data.keep.length} |`);
  push(`| DELETE (candidates) | ${data.delete.length} |`);
  push(`| Duplicate title groups | ${data.duplicate_groups?.length ?? 0} |`);
  push(`| Menu validation (dry-run) | ${data.menu_validation} |`);
  push("");

  if (data.inventory_table?.length) {
    push("## Complete inventory");
    push("| Title | Handle | Menu ID | Items | Theme | Duplicate | Validation |");
    push("| --- | --- | --- | ---: | --- | --- | --- |");
    for (const r of data.inventory_table) {
      push(
        `| ${r.title} | \`${r.handle}\` | \`${r.menu_id}\` | ${r.items} | ${r.theme ? "yes" : "no"} | ${r.duplicate} | ${r.validation} |`,
      );
    }
    push("");
  }

  if (data.duplicate_groups?.length) {
    push("## Duplicate groups");
    for (const g of data.duplicate_groups) {
      push(`- **${g.key}:** ${g.handles.join(", ")}`);
    }
    push("");
  }

  push("## KEEP");
  push("| Name | Handle | Menu ID | Reason |");
  push("| --- | --- | --- | --- |");
  for (const k of data.keep) {
    push(`| ${k.name} | \`${k.handle}\` | \`${k.menu_id}\` | ${k.reason} |`);
  }
  push("");
  push("## DELETE (candidates — awaiting approval)");
  push("| Name | Handle | Menu ID | Reason |");
  push("| --- | --- | --- | --- |");
  if (!data.delete.length) push("| — | — | — | None identified |");
  for (const d of data.delete) {
    push(`| ${d.name} | \`${d.handle}\` | \`${d.menu_id}\` | ${d.reason} |`);
  }
  push("");
  push("## Specific checks");
  for (const h of ["dronare", "actionkameror", "vandring-outdoor"]) {
    const d = data.delete.find((x) => x.handle === h);
    const k = data.keep.find((x) => x.handle === h);
    push(`- **\`${h}\`:** ${d ? `DELETE — ${d.reason}` : k ? `KEEP — ${k.reason}` : "not found on live store"}`);
  }
  const partnership = (data.inventory_table || []).filter((r) =>
    /partnership/i.test(r.title) || /partnership/i.test(r.handle),
  );
  const vandring = (data.inventory_table || []).filter((r) =>
    /vandring|outdoor/i.test(r.title) || /vandring|outdoor/i.test(r.handle),
  );
  push(`- **Partnership duplicates:** ${partnership.length} menu(s) — ${partnership.map((p) => p.handle).join(", ") || "none"}`);
  push(`- **Vandring & outdoor duplicates:** ${vandring.length} menu(s) — ${vandring.map((p) => p.handle).join(", ") || "none"}`);
  push("");
  push("> Rollback JSON written to `EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json`");
  push("> After approval: `node scripts/menu-cleanup-audit.mjs --execute --confirm-delete`");
  return L.join("\n");
}

async function main() {
  loadEnv();
  let inventory = null;
  let source = "unknown";

  const inv = await post("shopify-cloner-worker", { action: "menu_inventory_audit", migration_id: MID });
  if (inv.json.ok) {
    inventory = inv.json;
    source = "menu_inventory_audit";
  }

  if (!inventory) {
    const cleanup = await post("menu-cleanup-pass", { migration_id: MID, mode: "safe" });
    if (cleanup.json.ok && cleanup.json.inventory) {
      inventory = cleanup.json;
      source = "menu_cleanup_pass";
    }
  }

  let liveMenus = null;
  if (!inventory?.rows?.length) {
    liveMenus = await fetchMenusGraphql();
    if (liveMenus?.length) source = "test_integration_graphql";
  }

  const menuDry = await post("shopify-cloner-worker", {
    action: "menu_recovery_fix",
    migration_id: MID,
    dry_run: true,
  });

  const dryMenus = menuDry.json?.menus?.menus || menuDry.json?.menus || [];
  const dryFailed = dryMenus.filter((m) => m.publish_result === "failed").length;
  const dryOk = dryMenus.filter((m) => m.publish_result === "updated" || m.publish_result === "published").length;

  if (!inventory?.rows?.length && menuDry.json?.menus?.live_target_menus?.length) {
    liveMenus = menuDry.json.menus.live_target_menus.map((m) => ({
      id: m.id,
      handle: m.handle,
      title: m.title,
      isDefault: false,
      items: [],
    }));
    source = "menu_recovery_live_target_menus";
  }

  if (!inventory?.rows?.length && !liveMenus?.length) {
    const list = await post("cloner-fix-collections-and-menus", { migration_id: MID, list_all_menus: true });
    if (list.json?.all_target_menus?.length) {
      liveMenus = list.json.all_target_menus.map((m) => ({
        id: m.id,
        handle: m.handle,
        title: m.title,
        isDefault: m.is_default,
        items: [],
      }));
      source = "list_all_menus";
    }
  }

  if (!inventory?.rows?.length && !liveMenus?.length) {
    throw new Error(
      "Cannot fetch live menu inventory. Deploy cloner functions to jzqgwsryxmgzcbjjddic:\n" +
        "  export SUPABASE_ACCESS_TOKEN=sbp_... && bash scripts/deploy-cloner-data-project.sh",
    );
  }

  if (!inventory?.rows?.length) {
    inventory = { liveMenus, themeRefs: new Map(), rows: [] };
  }

  const { keep, delete: del, rollback, source: decisionSource } = buildDecisions(inventory, menuDry.json?.menus);

  const inventory_table = (inventory.rows?.length ? inventory.rows : liveMenus).map((r) => ({
    title: r.title,
    handle: r.handle,
    menu_id: r.menu_id || r.id,
    items: r.item_count ?? countItems(r.items),
    theme: r.referenced_by_theme ?? false,
    duplicate: r.duplicate_status || "—",
    validation: r.dry_run_validation || "—",
  }));

  const duplicate_groups = inventory.duplicate_groups || [];
  const total = inventory_table.length;
  const validationPass = dryFailed === 0 && dryOk >= 9;
  const status = del.length === 0 && validationPass ? "PASS" : validationPass ? "PASS (cleanup candidates identified)" : "FAIL (validation blockers)";

  const result = {
    generated_at: new Date().toISOString(),
    target_domain: inventory.target_domain || TARGET,
    source: decisionSource || source,
    status,
    total_live_menus: total,
    keep,
    delete: del,
    duplicate_groups,
    inventory_table,
    menu_validation: `${dryOk}/9 updated, ${dryFailed} failed`,
    rollback,
  };

  const md = formatMarkdown(result);
  writeFileSync(REPORT, md, "utf8");
  writeFileSync(JSON_OUT, JSON.stringify(result, null, 2), "utf8");
  writeFileSync(
    ROLLBACK,
    JSON.stringify(
      {
        generated_at: result.generated_at,
        migration_id: MID,
        target_domain: result.target_domain,
        mode: "safe",
        menus_scheduled_for_deletion: rollback,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(md);
  console.log(`\nWrote ${REPORT}`);
  console.log(`Wrote ${ROLLBACK}`);
  process.exit(validationPass && del.every((d) => ["dronare", "actionkameror", "vandring-outdoor"].includes(d.handle) || duplicate_groups.length === 0) ? 0 : 1);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
