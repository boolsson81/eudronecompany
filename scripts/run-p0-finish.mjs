#!/usr/bin/env node
/**
 * P0 finish — Neo hub, theme canonical menus, menu cleanup.
 * Requires ALLOW_LIVE_MIGRATION=1 and --execute
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  addProductsToCollection,
  createCollection,
  deleteMenu,
  fetchAllCollectionProductIds,
  fetchAllMenus,
  fetchCollectionByHandle,
  loadEnv,
  pingShop,
  SHOP_DOMAIN,
  sleep,
} from "./lib/shopify-admin-client.mjs";
import { PRODUCTION_MENU_HANDLES } from "./lib/english-handle-migration.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "P0_FINISH_REPORT.md");
const EXECUTE = process.argv.includes("--execute");
const ALLOW = process.env.ALLOW_LIVE_MIGRATION === "1";

const LEGACY_MENU_DELETE = new Set([
  "enterprise-expansion-deploy",
  "spare-parts-deploy",
  "service-support-deploy",
  "b2b-enterprise-deploy",
  "enterprise-dr-nare",
  "meny",
]);

async function fixNeoHub(log) {
  let hub = await fetchCollectionByHandle("dji-neo-spare-parts");
  if (!hub) {
    hub = await createCollection({ title: "DJI Neo Spare Parts", handle: "dji-neo-spare-parts" });
    log.push("CREATE hub `dji-neo-spare-parts`");
  } else {
    log.push("Hub `dji-neo-spare-parts` already exists");
  }

  const accessories = await fetchCollectionByHandle("dji-neo-accessories");
  if (!accessories) {
    log.push("WARN: `dji-neo-accessories` not found — hub left empty");
    return hub;
  }

  const productIds = [...(await fetchAllCollectionProductIds(accessories.id))];
  const existing = new Set(await fetchAllCollectionProductIds(hub.id));
  const toAdd = productIds.filter((id) => !existing.has(id));
  if (toAdd.length) {
    await addProductsToCollection(hub.id, toAdd);
    log.push(`ADD ${toAdd.length} products to \`dji-neo-spare-parts\` from dji-neo-accessories`);
  } else {
    log.push("Neo hub already has products");
  }
  return hub;
}

async function cleanupMenus(log) {
  const menus = await fetchAllMenus();
  const byHandle = new Map(menus.map((m) => [m.handle, m]));
  const toDelete = new Map();

  const auditPath = join(ROOT, ".menu-cleanup-audit.json");
  if (existsSync(auditPath)) {
    const audit = JSON.parse(readFileSync(auditPath, "utf8"));
    for (const d of audit.decisions || []) {
      if (d.action === "delete" && d.handle) toDelete.set(d.handle, d.reason || "audit delete");
    }
  }

  for (const h of LEGACY_MENU_DELETE) {
    if (byHandle.has(h)) toDelete.set(h, "legacy deploy menu superseded by canonical handle");
  }

  for (const h of toDelete.keys()) {
    if (PRODUCTION_MENU_HANDLES.has(h)) toDelete.delete(h);
    if (h === "main-menu" || h === "footer" || h === "customer-account-main-menu") toDelete.delete(h);
  }

  const deleted = [];
  const skipped = [];
  const failed = [];

  const defaultHandles = new Set(
    (existsSync(auditPath) ? JSON.parse(readFileSync(auditPath, "utf8")).inventory || [] : [])
      .filter((m) => m.is_default)
      .map((m) => m.handle),
  );

  for (const [handle, reason] of toDelete) {
    const menu = byHandle.get(handle);
    if (!menu) {
      skipped.push({ handle, reason: "not_found" });
      continue;
    }
    if (defaultHandles.has(handle)) {
      skipped.push({ handle, reason: "default_menu" });
      continue;
    }
    try {
      await deleteMenu(menu.id);
      deleted.push({ handle, reason });
      log.push(`DELETE menu \`${handle}\``);
      await sleep(200);
    } catch (e) {
      failed.push({ handle, error: e.message });
      log.push(`DELETE FAIL \`${handle}\`: ${e.message}`);
    }
  }

  return { deleted: deleted.length, skipped: skipped.length, failed: failed.length, failed_items: failed };
}

async function main() {
  if (!EXECUTE || !ALLOW) {
    console.error("Usage: ALLOW_LIVE_MIGRATION=1 node scripts/run-p0-finish.mjs --execute");
    process.exit(1);
  }

  loadEnv();
  const shop = await pingShop();
  const log = [];
  const result = { executed_at: new Date().toISOString(), shop: shop?.name, domain: SHOP_DOMAIN, log };

  console.log(`P0 finish on ${SHOP_DOMAIN}`);

  console.log("\n1/3 Neo spare parts hub...");
  result.neo = await fixNeoHub(log);

  console.log("\n2/3 Theme + canonical menu wiring...");
  const { execSync } = await import("child_process");
  execSync("node scripts/navigation-architecture-fix.mjs --execute", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, ALLOW_LIVE_MIGRATION: "1" },
  });
  log.push("Theme deployed with canonical menu handles (enterprise, spare-parts, service-support, business)");

  console.log("\n3/3 Menu cleanup...");
  result.menu_cleanup = await cleanupMenus(log);

  const hub = await fetchCollectionByHandle("dji-neo-spare-parts");
  result.neo_final_count = hub?.productsCount?.count ?? 0;

  const report = [
    "# P0 Finish Report",
    "",
    `**Store:** ${shop?.name} (\`${SHOP_DOMAIN}\`)`,
    `**Executed:** ${result.executed_at}`,
    "",
    "## Results",
    "",
    `| Task | Status |`,
    `|---|---|`,
    `| Neo hub \`dji-neo-spare-parts\` | **${hub ? "OK" : "FAIL"}** (${result.neo_final_count} products) |`,
    `| Theme → canonical menus | **DONE** |`,
    `| Menu cleanup | **${result.menu_cleanup.deleted} deleted**, ${result.menu_cleanup.failed} failed |`,
    "",
    "## Log",
    "",
    ...log.map((l) => `- ${l}`),
    "",
  ];

  writeFileSync(OUT, report.join("\n"), "utf8");
  console.log(`\nWrote ${OUT}`);
  console.log(`Neo hub products: ${result.neo_final_count}`);
  console.log(`Menus deleted: ${result.menu_cleanup.deleted}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
