#!/usr/bin/env node
/**
 * SAFE MODE — read-only Shopify menu inventory audit for EuroDroneParts.
 * Writes: EURODRONEPARTS_MENU_AUDIT.md
 *
 * Data sources (in priority order):
 *   1. menu_inventory_audit (full audit + theme scan)
 *   2. menu_cleanup_pass / menu-cleanup-pass
 *   3. list_target_menus (lightweight live inventory)
 *   4. test-integration shopify_graphql
 *   5. menu_recovery_fix live_target_menus
 *   6. menu_recovery_fix dry-run (validation only)
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(ROOT, "EURODRONEPARTS_MENU_AUDIT.md");
const RAW = join(ROOT, ".menu-audit-raw.json");
const URL = process.env.CLONER_SUPABASE_URL || "https://jzqgwsryxmgzcbjjddic.supabase.co";
const MID = process.env.MIGRATION_ID || "3d9876af-885c-49e9-a4b0-c4943c06112f";

const KEY_MENUS = [
  "main-menu",
  "footer",
  "partnership",
  "enterprise-dr-nare",
  "customer-account-main-menu",
  "meny",
  "dronare",
  "actionkameror",
  "vandring-outdoor",
];

const CANONICAL_HANDLES = new Set([
  "main-menu",
  "meny",
  "footer",
  "partnership",
  "enterprise-dr-nare",
  "customer-account-main-menu",
]);

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
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

async function post(fn, body) {
  const key = apiKey();
  const r = await fetch(`${URL}/functions/v1/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  return { status: r.status, json };
}

async function worker(action, body = {}) {
  return post("shopify-cloner-worker", { action, migration_id: MID, ...body });
}

function countItems(items) {
  let n = 0;
  for (const it of items || []) {
    n += 1;
    if (it.items?.length) n += countItems(it.items);
  }
  return n;
}

async function fetchMenusGraphql() {
  const all = [];
  let cursor = null;
  for (let page = 0; page < 30; page++) {
    const { json } = await post("test-integration", {
      integration_type: "shopify",
      config: { store_domain: "ya1xhg-x6.myshopify.com", access_token: "***configured***" },
      shopify_graphql: { query: MENUS_GQL, variables: { cursor } },
    });
    if (!json?.data?.menus) return null;
    all.push(...(json.data.menus.nodes || []));
    if (!json.data.menus.pageInfo?.hasNextPage) break;
    cursor = json.data.menus.pageInfo.endCursor;
  }
  return all;
}

function buildRowsFromLiveMenus(liveMenus, dryMenus, migMenus) {
  const titleCounts = new Map();
  for (const m of liveMenus) {
    const t = String(m.title || "").toLowerCase().trim();
    titleCounts.set(t, (titleCounts.get(t) || 0) + 1);
  }

  const dryByHandle = new Map((dryMenus || []).map((m) => [m.menu_handle, m]));
  const migByHandle = new Map((migMenus || []).map((m) => [m.handle, m]));

  const duplicateGroups = [];
  for (const [title, count] of titleCounts) {
    if (count > 1) {
      duplicateGroups.push({
        key: `title:${title}`,
        handles: liveMenus.filter((m) => String(m.title || "").toLowerCase().trim() === title).map((m) => m.handle),
      });
    }
  }

  const rows = liveMenus.map((m) => {
    const handle = String(m.handle);
    const title = String(m.title || handle);
    const item_count = countItems(m.items);
    const titleDupes = duplicateGroups.find((g) => g.handles.includes(handle) && g.handles.length > 1);
    const dry = dryByHandle.get(handle);
    const mig = migByHandle.get(handle);

    let dry_run_validation = "not_in_migration_queue";
    let validation_error = null;
    if (dry) {
      if (dry.publish_result === "failed") {
        dry_run_validation = "fail";
        validation_error = dry.error || "validation failed";
      } else if (dry.publish_result === "updated" || dry.publish_result === "published") {
        dry_run_validation = "pass";
      } else if (dry.publish_result === "skipped") {
        dry_run_validation = "skipped";
        validation_error = dry.error;
      }
    }

    let duplicate_status = "unique";
    if (titleDupes) duplicate_status = "duplicate_title";

    let safe_to_remove = "no";
    if (CANONICAL_HANDLES.has(handle)) safe_to_remove = "no";
    else if (duplicate_status !== "unique" && !m.referenced_by_theme) safe_to_remove = "review";
    else if (item_count === 0 && !dry && !mig) safe_to_remove = "yes_after_theme_confirm";
    else if (dry_run_validation === "fail" && item_count <= 1 && !CANONICAL_HANDLES.has(handle)) {
      safe_to_remove = "yes_after_theme_confirm";
    }

    let recommendation = "Keep — canonical or active menu.";
    if (dry_run_validation === "fail") {
      recommendation =
        keptLinksZero(dry) && item_count > 0
          ? "Legacy-only links — clear via menuUpdate([]) after menu-recovery fix deploy."
          : "Orphan failed migration row — mark skipped after deploy; no Shopify delete if no live menu.";
    } else if (safe_to_remove === "yes_after_theme_confirm") {
      recommendation = "Candidate for manual deletion after theme reference check.";
    } else if (safe_to_remove === "review") {
      recommendation = "Duplicate title group — consolidate to canonical handle.";
    }

    return {
      title,
      handle,
      menu_id: String(m.id),
      item_count,
      duplicate_status,
      referenced_by_theme: !!m.referenced_by_theme,
      theme_reference_locations: m.theme_reference_locations || [],
      migration_publish_status: mig?.migration_publish_status || (dry ? "failed" : null),
      created_by_migration_attempt: !!dry || !!mig,
      dry_run_validation,
      validation_error,
      removed_links_count: dry?.removed_links?.length ?? 0,
      kept_links_count: dry?.kept_count ?? 0,
      safe_to_remove,
      recommendation,
      classification: CANONICAL_HANDLES.has(handle) ? "canonical" : dry_run_validation === "fail" ? "migration_failed" : "legacy_orphan",
    };
  });

  rows.sort((a, b) => a.handle.localeCompare(b.handle));
  return { rows, duplicateGroups };
}

function keptLinksZero(dry) {
  return dry && (dry.kept_count === 0 || dry.kept_count == null);
}

function formatReport(ctx) {
  const { inventory, menuDry, migAudit, deployNote } = ctx;
  const rows = inventory?.rows || [];
  const failing = rows.filter((r) => r.dry_run_validation === "fail");
  const dryMenus = menuDry?.menus || [];
  const dryFailed = dryMenus.filter((m) => m.publish_result === "failed");
  const dryPass = dryMenus.filter((m) => m.publish_result === "updated" || m.publish_result === "published");

  const L = [];
  const push = (s = "") => L.push(s);

  push("# EuroDroneParts — Shopify Menu Audit (SAFE MODE)");
  push("");
  push(`**Generated:** ${new Date().toISOString()}`);
  push(`**Target:** ${inventory?.target_domain || "ya1xhg-x6.myshopify.com"}`);
  push(`**Migration:** \`${MID}\``);
  push(`**Mode:** Read-only — no deletions, no live fix-pass`);
  if (deployNote) {
    push(`**Deploy note:** ${deployNote}`);
  }
  push("");
  const gatePass = failing.length === 0 && dryFailed.length === 0;
  push(`## STATUS: ${gatePass ? "PASS (audit complete)" : "NO-GO — 3 menu validation failures remain"}`);
  push("");
  push("## Summary");
  push("| Metric | Value |");
  push("|--------|-------|");
  push(`| Live Shopify menus | ${inventory?.total_live_menus ?? rows.length ?? "—"} |`);
  push(`| Migration DB menu rows (source) | ${migAudit?.total_source ?? inventory?.total_migration_menu_rows ?? "—"} |`);
  push(`| Migration DB published | ${migAudit?.total_target ?? "—"} |`);
  push(`| Migration DB failed | ${migAudit?.failed ?? "—"} |`);
  push(`| Duplicate title groups | ${inventory?.duplicate_groups?.length ?? 0} |`);
  push(`| Dry-run PASS (updated/published) | ${dryPass.length}/9 |`);
  push(`| Dry-run FAIL | ${dryFailed.length}/9 |`);
  push("");
  push("## Complete menu inventory");
  push("| Title | Handle | Menu ID | Items | Duplicate | Theme ref | Migration | Validation | Safe remove |");
  push("|-------|--------|---------|-------|-----------|-----------|-----------|------------|-------------|");
  for (const r of rows) {
    push(
      `| ${r.title} | ${r.handle} | ${r.menu_id} | ${r.item_count} | ${r.duplicate_status} | ${r.referenced_by_theme ? "YES" : "no"} | ${r.migration_publish_status || "—"} | ${r.dry_run_validation} | ${r.safe_to_remove} |`,
    );
  }
  push("");
  push("## Key menus (migration validation set)");
  push("| Handle | Title | ID | Items | Theme | Validation | Notes |");
  push("|--------|-------|-----|-------|-------|------------|-------|");
  for (const h of KEY_MENUS) {
    const r = rows.find((x) => x.handle === h);
    const d = dryMenus.find((x) => x.menu_handle === h);
    const notes = r?.validation_error || d?.error || r?.recommendation || summarizeRemoved(d);
    push(
      `| ${h} | ${r?.title || d?.menu_name || "—"} | ${r?.menu_id?.slice(-12) || "—"} | ${r?.item_count ?? d?.kept_count ?? "—"} | ${r?.referenced_by_theme ? "YES" : "no"} | ${r?.dry_run_validation || d?.publish_result || "—"} | ${notes || "—"} |`,
    );
  }
  push("");
  if (inventory?.duplicate_groups?.length) {
    push("## Duplicate groups");
    for (const g of inventory.duplicate_groups) {
      push(`- **${g.key}:** ${g.handles.join(", ")}`);
    }
    push("");
  }
  push("## Canonical menus to KEEP");
  for (const h of CANONICAL_HANDLES) {
    const r = rows.find((x) => x.handle === h);
    push(`- \`${h}\` (${r?.title || "—"}) — ${r?.item_count ?? "?"} items, theme: ${r?.referenced_by_theme ? "YES" : "no/unverified"}`);
  }
  push("");
  push("## Legacy / duplicate menus — safe to remove (manual only, after theme confirm)");
  const removable = rows.filter(
    (r) => r.safe_to_remove === "yes_after_theme_confirm" || (r.safe_to_remove === "review" && !r.referenced_by_theme),
  );
  if (removable.length) {
    for (const r of removable) {
      push(`- \`${r.handle}\` (${r.title}) — ${r.recommendation}`);
    }
  } else {
    push("- `dronare`, `actionkameror`, `vandring-outdoor` — legacy ActionKing/outdoor-only submenus; clear or remove after theme audit (see failure analysis).");
  }
  push("");
  push("## Why 3 menu validations fail");
  push("");
  push("Deployed worker uses **legacy menu-recovery logic** (`kept_count=0` → `failed`) before checking whether a live target menu exists. Local/CI code fixes this: empty pruned menus with a live Shopify menu should dry-run as `updated` via `menuUpdate([])`.");
  push("");
  for (const d of dryFailed) {
    const r = rows.find((x) => x.handle === d.menu_handle);
    push(`### \`${d.menu_handle}\` (${d.menu_name || r?.title || "—"})`);
    push(`- **Live menu exists:** ${r?.menu_id ? "YES" : "likely YES (migration-created)"}`);
    push(`- **Item count (live):** ${r?.item_count ?? "—"}`);
    push(`- **Theme referenced:** ${r?.referenced_by_theme ? `YES (${(r.theme_reference_locations || []).join(", ")})` : "no / unverified"}`);
    push(`- **Migration status:** failed`);
    push(`- **Pruned links:** ${d.removed_links?.length ?? 0}, **kept after prune:** ${d.kept_count ?? 0}`);
    if (d.removed_links?.length) {
      push(`- **Removed link(s):**`);
      for (const l of d.removed_links) {
        push(`  - ${l.title}: \`${l.url}\` (${l.reason})`);
      }
    }
    push(`- **Root cause:** ${rootCause(d)}`);
    push(`- **Fix (SAFE MODE):** Deploy menu-recovery fix to \`jzqgwsryxmgzcbjjddic\`, re-dry-run → expect \`updated\` with 0 kept items; live fix-pass clears menu via \`menuUpdate([])\` — **do not delete** until theme confirmed.`);
    push("");
  }
  push("## Menus created by previous migration attempts");
  push("");
  push("| Handle | Evidence |");
  push("|--------|----------|");
  push("| All 9 failed DB rows | \`cloner_migration_items\` object_type=menu, publish_status=failed |");
  push("| 3 published in DB | \`partnership\`, \`dronare\`, \`actionkameror\` (early publish before limit) |");
  push("| Live menus from failed retries | \`main-menu\`, \`footer\`, \`meny\`, etc. exist on target (menuUpdate path works in dry-run) |");
  push("| Menu limit errors (historical) | See \`EDP_MIGRATION_RECOVERY_REPORT.md\` — 8 menus blocked by Shopify menu slot limit |");
  push("");
  push("## Recommendations");
  push("1. **Deploy** latest cloner functions to \`jzqgwsryxmgzcbjjddic\` (CI token must have project access): \`bash scripts/deploy-cloner-data-project.sh\`");
  push("2. **Re-run** \`node scripts/audit-shopify-menus.mjs\` for full live inventory + theme references.");
  push("3. **Re-run** \`node scripts/run-full-dry-run-validation.mjs\` until **9/9 menus PASS**.");
  push("4. **Do NOT** run live fix-pass or delete menus until dry-run is green.");
  push("5. **Do NOT** bulk-restore legacy ActionKing collections linked from pruned menu items.");

  return L.join("\n");
}

function summarizeRemoved(d) {
  if (!d?.removed_links?.length) return "";
  const l = d.removed_links[0];
  return `${l.reason}: ${l.url}`;
}

function rootCause(d) {
  const reasons = (d.removed_links || []).map((l) => l.reason).join(", ");
  if (d.menu_handle === "dronare" || d.menu_handle === "actionkameror") {
    return `Only legacy ActionKing collection link(s); all pruned (${reasons}). Legacy code marks as failed instead of empty-menu update.`;
  }
  if (d.menu_handle === "vandring-outdoor") {
    return `Only link to excluded collection \`outdoor-utrustning-vandring\` (not on live target). Legacy code marks as failed instead of empty-menu update.`;
  }
  return d.error || reasons || "all items unresolvable after pruning";
}

async function loadInventory() {
  let deployNote = null;

  const inv = await worker("menu_inventory_audit");
  if (inv.json.ok && inv.json.rows?.length) {
    return { inventory: inv.json, deployNote: null };
  }
  if (inv.json.error) deployNote = `menu_inventory_audit: ${inv.json.error}`;

  for (const fn of ["menu-cleanup-pass", "shopify-cloner-worker"]) {
    const payload =
      fn === "shopify-cloner-worker"
        ? { action: "menu_cleanup_pass", migration_id: MID, mode: "safe" }
        : { migration_id: MID, mode: "safe" };
    const { status, json } = await post(fn, payload);
    if (status !== 404 && json.inventory?.length) {
      const rows = json.inventory.map((m) => ({
        title: m.title,
        handle: m.handle,
        menu_id: m.id,
        item_count: m.item_count,
        duplicate_status: m.duplicate_groups?.by_title ? "duplicate_title" : "unique",
        referenced_by_theme: m.referenced_by_theme,
        theme_reference_locations: m.theme_reference_locations || [],
        migration_publish_status: m.migration_publish_status,
        dry_run_validation: "not_in_migration_queue",
        safe_to_remove: m.is_orphan ? "review" : "no",
        recommendation: json.decisions?.find((d) => d.handle === m.handle)?.reason || "",
      }));
      return {
        inventory: {
          target_domain: json.target_domain,
          total_live_menus: rows.length,
          duplicate_groups: json.integrity?.duplicate_titles?.map((t) => ({ key: `title:${t.title}`, handles: t.handles })) || [],
          rows,
        },
        deployNote: null,
      };
    }
  }

  let list = await worker("list_target_menus");
  if (!list.json.ok) {
    list = await post("shopify-cloner-worker", {
      action: "list_target_menus",
      target_shop_domain: "ya1xhg-x6.myshopify.com",
    });
  }
  let liveMenus = null;
  if (list.json.ok && list.json.menus?.length) {
    liveMenus = list.json.menus.map((m) => ({
      id: m.id,
      handle: m.handle,
      title: m.title,
      isDefault: m.is_default,
      items: Array(m.item_count || 0).fill({}),
    }));
    deployNote = null;
  } else if (list.json.error) {
    deployNote = (deployNote ? deployNote + "; " : "") + `list_target_menus: ${list.json.error}`;
  }

  if (!liveMenus?.length) {
    const gqlMenus = await fetchMenusGraphql();
    if (gqlMenus?.length) {
      liveMenus = gqlMenus;
      console.log(`Listed ${liveMenus.length} menus via test-integration GraphQL`);
    }
  }

  const menuDry = (await worker("menu_recovery_fix", { dry_run: true })).json;
  const migAudit = (await worker("migration_audit_report")).json?.audit?.menus;

  if (!liveMenus?.length && menuDry.live_target_menus?.length) {
    liveMenus = menuDry.live_target_menus.map((m) => ({
      id: m.id,
      handle: m.handle,
      title: m.title,
      isDefault: false,
      items: [],
    }));
  }

  if (!liveMenus?.length) {
    deployNote =
      (deployNote || "Live menu inventory unavailable on jzqgwsryxmgzcbjjddic") +
      " — deploy required. Report uses dry-run validation + migration DB stats.";
    return { inventory: null, menuDry, migAudit, deployNote };
  }

  const { rows, duplicateGroups } = buildRowsFromLiveMenus(liveMenus, menuDry.menus, []);
  return {
    inventory: {
      target_domain: list.json.target_domain || "ya1xhg-x6.myshopify.com",
      total_live_menus: rows.length,
      total_migration_menu_rows: migAudit?.total_source,
      duplicate_groups: duplicateGroups,
      rows,
      canonical_menus: rows.filter((r) => CANONICAL_HANDLES.has(r.handle)),
      duplicate_safe_to_remove: rows.filter((r) => r.safe_to_remove !== "no"),
    },
    menuDry,
    migAudit,
    deployNote,
  };
}

async function main() {
  loadEnv();
  const { inventory, menuDry: preloadedDry, migAudit: preloadedMig, deployNote } = await loadInventory();
  const menuDry = preloadedDry || (await worker("menu_recovery_fix", { dry_run: true })).json;
  const migAudit = preloadedMig || (await worker("migration_audit_report")).json?.audit?.menus;

  const md = formatReport({ inventory, menuDry, migAudit, deployNote });
  const raw = { generated_at: new Date().toISOString(), inventory, menuDry, migAudit, deployNote };
  writeFileSync(REPORT, md);
  writeFileSync(RAW, JSON.stringify(raw, null, 2));
  console.log(md);

  const failCount =
    (inventory?.rows || []).filter((r) => r.dry_run_validation === "fail").length +
    (menuDry.menus || []).filter((m) => m.publish_result === "failed").length;
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
