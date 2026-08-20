#!/usr/bin/env node
/**
 * P1 recovery — convert custom spare-parts collections to smart collections,
 * create missing component collections, and finish legacy menu cleanup.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PRODUCTION_MENU_HANDLES } from "./lib/english-handle-migration.mjs";
import { allSparePartsTargets, buildRuleSet } from "./lib/spare-parts-collection-rules.mjs";
import {
  createCollection,
  deleteCollection,
  deleteMenu,
  fetchAllMenus,
  fetchCollectionByHandle,
  loadEnv,
  pingShop,
  SHOP_DOMAIN,
  sleep,
} from "./lib/shopify-admin-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "P1_RULES_RECOVERY_REPORT.md");
const EXECUTE = process.argv.includes("--execute");
const ALLOW = process.env.ALLOW_LIVE_MIGRATION === "1";

const KEEP_MENUS = new Set([...PRODUCTION_MENU_HANDLES, "actionkameror"]);
const LEGACY_MENU_RE = /^(actionkameror|dronare|partnership)(-\d+)?$/;

function titleForTarget(target) {
  if (target.isHub) return `${target.label} Spare Parts`;
  const suffix = target.suffix
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `${target.label} — ${suffix}`;
}

async function ensureSmartCollection(target, log) {
  const live = await fetchCollectionByHandle(target.handle);
  const ruleSet = buildRuleSet(target.prefix, target.suffix, { isHub: target.isHub });
  const title = live?.title || titleForTarget(target);

  if (live?.ruleSet?.rules?.length) {
    return { handle: target.handle, action: "skipped", rules: live.ruleSet.rules.length, products: live.productsCount?.count || 0 };
  }

  if (live) {
    await deleteCollection(live.id);
    log.push(`DELETE custom \`${target.handle}\``);
    await sleep(400);
  }

  const created = await createCollection({ title, handle: target.handle, ruleSet });
  log.push(`CREATE smart \`${target.handle}\` → ${ruleSet.rules.length} rules`);
  await sleep(300);

  const verified = await fetchCollectionByHandle(target.handle);
  return {
    handle: target.handle,
    action: live ? "converted" : "created",
    rules: verified?.ruleSet?.rules?.length || ruleSet.rules.length,
    products: verified?.productsCount?.count || 0,
  };
}

async function applySmartCollections(log) {
  const results = { converted: [], created: [], skipped: [], failed: [] };

  for (const target of allSparePartsTargets()) {
    try {
      const result = await ensureSmartCollection(target, log);
      if (result.action === "skipped") results.skipped.push(result);
      else if (result.action === "converted") results.converted.push(result);
      else results.created.push(result);
      log.push(`SMART \`${result.handle}\` ${result.action} (${result.rules} rules, ${result.products} products)`);
    } catch (e) {
      results.failed.push({ handle: target.handle, error: e.message });
      log.push(`FAIL \`${target.handle}\`: ${e.message}`);
    }
  }

  return results;
}

async function menuCleanupPhase3(log) {
  const menus = await fetchAllMenus();
  const toDelete = menus.filter((m) => !KEEP_MENUS.has(m.handle) && LEGACY_MENU_RE.test(m.handle));

  const deleted = [];
  const failed = [];
  for (const m of toDelete) {
    try {
      await deleteMenu(m.id);
      deleted.push(m.handle);
      log.push(`DELETE menu \`${m.handle}\``);
      await sleep(150);
    } catch (e) {
      failed.push({ handle: m.handle, error: e.message });
    }
  }

  const remaining = await fetchAllMenus();
  return { deleted: deleted.length, failed, remaining: remaining.length, handles: remaining.map((m) => m.handle).sort() };
}

async function main() {
  if (!EXECUTE || !ALLOW) {
    console.error("Usage: ALLOW_LIVE_MIGRATION=1 node scripts/run-p1-rules-recovery.mjs --execute");
    process.exit(1);
  }

  loadEnv();
  const shop = await pingShop();
  const log = [];
  const result = { executed_at: new Date().toISOString(), shop: shop?.name, domain: SHOP_DOMAIN };

  console.log(`P1 rules recovery on ${SHOP_DOMAIN}`);

  console.log("\n1/2 Smart collection conversion + creates...");
  result.collections = await applySmartCollections(log);

  console.log("\n2/2 Menu cleanup phase 3...");
  result.menu_cleanup = await menuCleanupPhase3(log);

  writeFileSync(
    OUT,
    [
      "# P1 Rules Recovery Report",
      "",
      `**Executed:** ${result.executed_at}`,
      `**Store:** ${shop?.name}`,
      "",
      "## Summary",
      "",
      "| Phase | Result |",
      "|---|---|",
      `| Converted custom → smart | ${result.collections.converted.length} |`,
      `| Created missing smart | ${result.collections.created.length} |`,
      `| Skipped (already smart) | ${result.collections.skipped.length} |`,
      `| Failed | ${result.collections.failed.length} |`,
      `| Menus deleted | ${result.menu_cleanup.deleted} |`,
      `| Menus remaining | ${result.menu_cleanup.remaining} |`,
      "",
      "### Remaining menus",
      "",
      result.menu_cleanup.handles.map((h) => `- \`${h}\``).join("\n"),
      "",
      "## Log",
      "",
      ...log.map((l) => `- ${l}`),
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(
    `\nConverted: ${result.collections.converted.length}, created: ${result.collections.created.length}, failed: ${result.collections.failed.length}`,
  );
  console.log(`Menus: ${result.menu_cleanup.deleted} deleted, ${result.menu_cleanup.remaining} remaining`);
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
