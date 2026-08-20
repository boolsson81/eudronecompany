#!/usr/bin/env node
/**
 * Live English-first migration executor for EuroDroneParts.
 * Requires: ALLOW_LIVE_MIGRATION=1 and explicit --execute
 *
 * Phases: creates → merges → collection-renames → page-renames → menus → redirects
 * Skips: blogs (deferred), product handles (deferred)
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { loadCsv } from "./lib/migration-csv.mjs";
import { plannedCreates, ENTERPRISE_SOFTWARE } from "./lib/approved-taxonomy.mjs";
import { MENU_HANDLE_MAP, MENU_TITLE_MAP } from "./lib/english-handle-migration.mjs";
import { buildMenuTrees, toShopifyMenuItems } from "./lib/english-menu-trees.mjs";
import {
  addProductsToCollection,
  createCollection,
  createMenu,
  createPage,
  createRedirect,
  deleteCollection,
  fetchAllCollectionProductIds,
  fetchAllMenus,
  fetchCollectionByHandle,
  fetchPageByHandle,
  loadEnv,
  pingShop,
  SHOP_DOMAIN,
  sleep,
  updateCollection,
  updateMenu,
  updatePage,
} from "./lib/shopify-admin-client.mjs";
import { runCollectionMergeExecutor } from "./executors/collection-merge-executor.mjs";
import { runRedirectExecutor } from "./executors/redirect-executor.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "ENGLISH_MIGRATION_EXECUTION_REPORT.md");
const RESULT_JSON = join(ROOT, ".english-migration-execute-result.json");

const EXECUTE = process.argv.includes("--execute");
const ALLOW = process.env.ALLOW_LIVE_MIGRATION === "1";
const PHASES = new Set(
  process.argv.includes("--phase")
    ? process.argv[process.argv.indexOf("--phase") + 1]?.split(",") || []
    : ["creates", "merges", "collections", "pages", "menus", "redirects"],
);

function titleFromHandle(handle) {
  return handle
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function executePlannedCreates(log) {
  const rows = plannedCreates();
  const created = [];
  const skipped = [];
  const failed = [];

  for (const row of rows) {
    if (row.action === "MERGE") continue;
    try {
      if (row.resource_type === "collection") {
        const live = await fetchCollectionByHandle(row.proposed_handle);
        if (live) {
          skipped.push({ ...row, reason: "exists" });
          continue;
        }
        const col = await createCollection({
          title: titleFromHandle(row.proposed_handle.replace(/-spare-parts$/, "").replace(/-/g, " ")),
          handle: row.proposed_handle,
        });
        created.push({ ...row, id: col.id });
        log.push(`CREATE collection \`${row.proposed_handle}\``);
      } else if (row.resource_type === "page") {
        const live = await fetchPageByHandle(row.proposed_handle);
        if (live) {
          skipped.push({ ...row, reason: "exists" });
          continue;
        }
        const page = await createPage({
          title: ENTERPRISE_SOFTWARE.label,
          handle: row.proposed_handle,
          body: `<h1>${ENTERPRISE_SOFTWARE.label}</h1><p>DJI enterprise software solutions for fleet management, flight planning, and data processing.</p>`,
          isPublished: true,
        });
        created.push({ ...row, id: page.id });
        log.push(`CREATE page \`${row.proposed_handle}\``);
      }
      await sleep(300);
    } catch (e) {
      failed.push({ ...row, error: e.message });
      log.push(`FAIL ${row.proposed_handle}: ${e.message}`);
    }
  }
  return { created, skipped, failed };
}

async function executeMerges(log) {
  const mergeRows = loadCsv(join(ROOT, "MERGE_MAPPING.csv"));
  const groups = new Map();
  for (const r of mergeRows) {
    if (!groups.has(r.canonical_handle)) groups.set(r.canonical_handle, []);
    groups.get(r.canonical_handle).push(r);
  }

  const results = [];
  for (const [canonical, sources] of groups) {
    try {
      let canonicalLive = await fetchCollectionByHandle(canonical);
      const sourceLives = [];
      const allProductIds = new Set();

      for (const s of sources) {
        const live = await fetchCollectionByHandle(s.merge_from_handle);
        if (!live) {
          log.push(`MERGE skip missing source \`${s.merge_from_handle}\``);
          continue;
        }
        const pids = await fetchAllCollectionProductIds(live.id);
        for (const id of pids) allProductIds.add(id);
        sourceLives.push({ ...s, live, productIds: pids });
      }

      if (!sourceLives.length) continue;

      const primary = sourceLives.sort((a, b) => b.productIds.size - a.productIds.size)[0];
      let targetId = canonicalLive?.id;

      if (!targetId) {
        if (primary.live.handle !== canonical) {
          const renamed = await updateCollection({ id: primary.live.id, handle: canonical });
          targetId = renamed.id;
          log.push(`MERGE rename \`${primary.live.handle}\` → \`${canonical}\``);
        } else {
          targetId = primary.live.id;
        }
        canonicalLive = await fetchCollectionByHandle(canonical);
      }

      const existing = canonicalLive ? await fetchAllCollectionProductIds(targetId) : new Set();
      const isSmart = Boolean(canonicalLive?.ruleSet?.rules?.length || primary.live.ruleSet?.rules?.length);
      const toAdd = [...allProductIds].filter((id) => !existing.has(id));
      if (toAdd.length && !isSmart) {
        await addProductsToCollection(targetId, toAdd);
        log.push(`MERGE add ${toAdd.length} products → \`${canonical}\``);
      } else if (toAdd.length && isSmart) {
        log.push(`MERGE smart collection \`${canonical}\` — skip manual add (${toAdd.length} products via rules)`);
      }

      for (const s of sourceLives) {
        if (s.live.id === targetId) continue;
        await deleteCollection(s.live.id);
        log.push(`MERGE delete source \`${s.merge_from_handle}\``);
        await sleep(300);
      }

      // Smart collection duplicate canonical: keep larger source handle
      if (isSmart && canonicalLive && primary.live.id !== targetId) {
        const keep = (primary.live.productsCount?.count || 0) >= (canonicalLive.productsCount?.count || 0) ? primary.live : canonicalLive;
        const drop = keep.id === primary.live.id ? canonicalLive : primary.live;
        if (drop.id !== keep.id) {
          await deleteCollection(drop.id);
          if (keep.handle !== canonical) {
            await updateCollection({ id: keep.id, handle: canonical });
            log.push(`MERGE smart rename \`${keep.handle}\` → \`${canonical}\``);
          }
        }
      }

      results.push({ canonical, products: allProductIds.size, added: toAdd.length, status: "OK" });
    } catch (e) {
      results.push({ canonical, status: "FAIL", error: e.message });
      log.push(`MERGE FAIL \`${canonical}\`: ${e.message}`);
    }
  }
  return results;
}

async function executeCollectionRenames(log) {
  const rows = loadCsv(join(ROOT, "COLLECTION_HANDLE_MAPPING.csv")).filter(
    (r) => r.action === "RENAME" && r.proposed_handle !== r.current_handle,
  );
  const renamed = [];
  const skipped = [];
  const failed = [];

  for (const r of rows) {
    try {
      const live = await fetchCollectionByHandle(r.current_handle);
      if (!live) {
        skipped.push({ ...r, reason: "source_missing" });
        continue;
      }
      const targetTaken = await fetchCollectionByHandle(r.proposed_handle);
      if (targetTaken && targetTaken.id !== live.id) {
        skipped.push({ ...r, reason: "target_exists" });
        continue;
      }
      if (live.handle === r.proposed_handle) {
        skipped.push({ ...r, reason: "already_renamed" });
        continue;
      }
      await updateCollection({ id: live.id, handle: r.proposed_handle });
      renamed.push(r);
      log.push(`RENAME collection \`${r.current_handle}\` → \`${r.proposed_handle}\``);
      await sleep(250);
    } catch (e) {
      failed.push({ ...r, error: e.message });
      log.push(`RENAME FAIL \`${r.current_handle}\`: ${e.message}`);
    }
  }
  return { renamed, skipped, failed };
}

async function executePageRenames(log) {
  const rows = loadCsv(join(ROOT, "PAGE_HANDLE_MAPPING.csv")).filter(
    (r) => r.action === "RENAME" && r.proposed_handle !== r.current_handle,
  );
  const renamed = [];
  const skipped = [];
  const failed = [];

  for (const r of rows) {
    try {
      const live = await fetchPageByHandle(r.current_handle);
      if (!live) {
        skipped.push({ ...r, reason: "source_missing" });
        continue;
      }
      const targetTaken = await fetchPageByHandle(r.proposed_handle);
      if (targetTaken && targetTaken.id !== live.id) {
        skipped.push({ ...r, reason: "target_exists" });
        continue;
      }
      if (live.handle === r.proposed_handle) {
        skipped.push({ ...r, reason: "already_renamed" });
        continue;
      }
      await updatePage(live.id, { handle: r.proposed_handle });
      renamed.push(r);
      log.push(`RENAME page \`${r.current_handle}\` → \`${r.proposed_handle}\``);
      await sleep(250);
    } catch (e) {
      failed.push({ ...r, error: e.message });
      log.push(`RENAME FAIL page \`${r.current_handle}\`: ${e.message}`);
    }
  }
  return { renamed, skipped, failed };
}

async function executeMenus(log) {
  const menus = await fetchAllMenus();
  const byHandle = new Map(menus.map((m) => [m.handle, m]));
  const trees = buildMenuTrees();
  const updated = [];
  const created = [];
  const failed = [];

  for (const tree of trees) {
    const items = toShopifyMenuItems(tree.children);
    const handlesToTry = [tree.menu, ...(tree.legacyHandles || [])];

    let targetMenu = byHandle.get(tree.menu);
    if (!targetMenu) {
      for (const legacy of tree.legacyHandles || []) {
        if (byHandle.get(legacy)) {
          try {
            targetMenu = await createMenu(tree.title, tree.menu, items);
            created.push({ handle: tree.menu, id: targetMenu.id });
            byHandle.set(tree.menu, targetMenu);
            log.push(`MENU create \`${tree.menu}\``);
          } catch (e) {
            if (/has already been taken/i.test(e.message)) {
              targetMenu = byHandle.get(tree.menu);
            } else {
              failed.push({ handle: tree.menu, error: e.message });
              log.push(`MENU create FAIL \`${tree.menu}\`: ${e.message}`);
            }
          }
          break;
        }
      }
    }

    for (const h of handlesToTry) {
      const menu = byHandle.get(h);
      if (!menu) continue;
      try {
        const title = MENU_TITLE_MAP[h] || MENU_TITLE_MAP[tree.menu] || tree.title;
        await updateMenu(menu.id, title, items);
        updated.push({ handle: h, id: menu.id, title });
        log.push(`MENU update \`${h}\` (${items.length} top-level items)`);
        await sleep(400);
      } catch (e) {
        failed.push({ handle: h, error: e.message });
        log.push(`MENU FAIL \`${h}\`: ${e.message}`);
      }
    }
  }

  // Footer + partnership if present
  for (const extra of ["footer", "partnership"]) {
    const menu = byHandle.get(extra);
    if (!menu) continue;
    try {
      const title = MENU_TITLE_MAP[extra] || titleFromHandle(extra);
      await updateMenu(menu.id, title, []);
      updated.push({ handle: extra, id: menu.id, title, note: "title_only" });
      log.push(`MENU title update \`${extra}\``);
    } catch (e) {
      failed.push({ handle: extra, error: e.message });
    }
  }

  return { updated, created, failed };
}

async function main() {
  if (!EXECUTE) {
    console.error("Dry-run blocked. Use --execute with ALLOW_LIVE_MIGRATION=1");
    process.exit(1);
  }
  if (!ALLOW) {
    console.error("Set ALLOW_LIVE_MIGRATION=1 to run live migration");
    process.exit(1);
  }

  loadEnv();
  const shop = await pingShop();
  const log = [];
  const result = {
    executed_at: new Date().toISOString(),
    shop: shop?.name,
    domain: SHOP_DOMAIN,
    phases: {},
    log,
  };

  console.log(`=== English Migration EXECUTE on ${SHOP_DOMAIN} ===`);
  console.log(`Phases: ${[...PHASES].join(", ")}`);

  if (PHASES.has("creates")) {
    console.log("\nPhase 1: Planned creates...");
    result.phases.creates = await executePlannedCreates(log);
    console.log(`  created=${result.phases.creates.created.length} skipped=${result.phases.creates.skipped.length} failed=${result.phases.creates.failed.length}`);
  }

  if (PHASES.has("merges")) {
    console.log("\nPhase 2: Collection merges...");
    result.phases.merges = await executeMerges(log);
    console.log(`  groups=${result.phases.merges.length}`);
  }

  if (PHASES.has("collections")) {
    console.log("\nPhase 3: Collection renames...");
    result.phases.collection_renames = await executeCollectionRenames(log);
    console.log(`  renamed=${result.phases.collection_renames.renamed.length} failed=${result.phases.collection_renames.failed.length}`);
  }

  if (PHASES.has("pages")) {
    console.log("\nPhase 4: Page renames...");
    result.phases.page_renames = await executePageRenames(log);
    console.log(`  renamed=${result.phases.page_renames.renamed.length} failed=${result.phases.page_renames.failed.length}`);
  }

  if (PHASES.has("menus")) {
    console.log("\nPhase 5: Menu migration...");
    result.phases.menus = await executeMenus(log);
    console.log(`  updated=${result.phases.menus.updated.length} created=${result.phases.menus.created.length} failed=${result.phases.menus.failed.length}`);
  }

  if (PHASES.has("redirects")) {
    console.log("\nPhase 6: Redirects...");
    result.phases.redirects = await runRedirectExecutor({ execute: true, liveCheck: false });
    console.log(`  created=${result.phases.redirects.execute_results?.created ?? 0} failed=${result.phases.redirects.execute_results?.failed ?? 0}`);
  }

  writeFileSync(RESULT_JSON, JSON.stringify(result, null, 2), "utf8");

  const report = [
    "# English Migration — Execution Report",
    "",
    `**Store:** ${shop?.name} (\`${SHOP_DOMAIN}\`)`,
    `**Executed:** ${result.executed_at}`,
    "**Status:** LIVE EXECUTION COMPLETE",
    "",
    "## Summary",
    "",
    "| Phase | Result |",
    "|---|---|",
    result.phases.creates
      ? `| Planned creates | ${result.phases.creates.created.length} created · ${result.phases.creates.failed.length} failed |`
      : "",
    result.phases.merges ? `| Collection merges | ${result.phases.merges.filter((m) => m.status === "OK").length}/${result.phases.merges.length} OK |` : "",
    result.phases.collection_renames
      ? `| Collection renames | ${result.phases.collection_renames.renamed.length} renamed · ${result.phases.collection_renames.failed.length} failed |`
      : "",
    result.phases.page_renames
      ? `| Page renames | ${result.phases.page_renames.renamed.length} renamed · ${result.phases.page_renames.failed.length} failed |`
      : "",
    result.phases.menus
      ? `| Menus | ${result.phases.menus.updated.length} updated · ${result.phases.menus.created.length} created · ${result.phases.menus.failed.length} failed |`
      : "",
    result.phases.redirects
      ? `| Redirects | ${result.phases.redirects.execute_results?.created ?? 0} created · ${result.phases.redirects.execute_results?.failed ?? 0} failed |`
      : "",
    "",
    "## Deferred (per approval)",
    "",
    "- Blog hybrid slugs (18) — post-launch phase",
    "- Product handle migration — separate project",
    "",
    "## Execution log",
    "",
    ...log.map((l) => `- ${l}`),
    "",
  ].filter(Boolean);

  writeFileSync(OUT, report.join("\n"), "utf8");
  console.log(`\nWrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
