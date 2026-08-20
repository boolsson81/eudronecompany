#!/usr/bin/env node
/**
 * P1 build — spare-parts smart rules, enterprise software page, menu cleanup phase 2.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { ENTERPRISE_SOFTWARE } from "./lib/approved-taxonomy.mjs";
import { PRODUCTION_MENU_HANDLES } from "./lib/english-handle-migration.mjs";
import { allSparePartsTargets, buildRuleSet } from "./lib/spare-parts-collection-rules.mjs";
import {
  deleteMenu,
  fetchAllMenus,
  fetchCollectionByHandle,
  fetchPageByHandle,
  loadEnv,
  pingShop,
  SHOP_DOMAIN,
  sleep,
  updateCollectionRules,
  updatePage,
} from "./lib/shopify-admin-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "P1_BUILD_REPORT.md");
const EXECUTE = process.argv.includes("--execute");
const ALLOW = process.env.ALLOW_LIVE_MIGRATION === "1";

const KEEP_MENUS = new Set([...PRODUCTION_MENU_HANDLES, "actionkameror"]);

const DUPLICATE_MENU_RE = /^(actionkameror|dronare|partnership)-\d+$/;

const ENTERPRISE_SOFTWARE_HTML = `
<div class="rte">
  <h1>Enterprise Software</h1>
  <p>DJI enterprise software for fleet management, mission planning, data processing, and regulatory compliance. EuroDroneParts supports businesses across the EU with licensing guidance, deployment, and integration.</p>
  <h2>DJI Pilot 2</h2>
  <p>Mission control app for Matrice and Mavic Enterprise aircraft. Flight planning, live mapping, and payload control.</p>
  <h2>DJI FlightHub 2</h2>
  <p>Cloud-based fleet management, remote operations, and multi-drone coordination for enterprise teams.</p>
  <h2>DJI Terra</h2>
  <p>Photogrammetry and mapping software for 2D/3D reconstruction, measurement, and inspection deliverables.</p>
  <h2>DJI Modify</h2>
  <p>AI-powered point-cloud classification and quality inspection for surveying and infrastructure workflows.</p>
  <h2>Get started</h2>
  <p><a href="/pages/request-a-quote">Request a quote</a> for enterprise software licensing, or <a href="/pages/contact-us">contact us</a> for deployment support.</p>
</div>
`.trim();

async function applySparePartsRules(log, { minProducts = 0, maxRules = 0 } = {}) {
  const applied = [];
  const skipped = [];
  const failed = [];

  for (const target of allSparePartsTargets()) {
    try {
      const live = await fetchCollectionByHandle(target.handle);
      if (!live) {
        skipped.push({ handle: target.handle, reason: "missing" });
        continue;
      }
      const ruleCount = live.ruleSet?.rules?.length || 0;
      const count = live.productsCount?.count || 0;
      if (ruleCount > maxRules && count > minProducts) {
        skipped.push({ handle: target.handle, reason: `has_rules(${ruleCount}) products(${count})` });
        continue;
      }
      const ruleSet = buildRuleSet(target.prefix, target.suffix, { isHub: target.isHub });
      const updated = await updateCollectionRules(live.id, ruleSet);
      applied.push({
        handle: target.handle,
        rules: updated.ruleSet?.rules?.length || 0,
        products: updated.productsCount?.count || 0,
      });
      log.push(`RULES \`${target.handle}\` → ${updated.ruleSet?.rules?.length} rules, ${updated.productsCount?.count} products`);
      await sleep(300);
    } catch (e) {
      failed.push({ handle: target.handle, error: e.message });
      log.push(`RULES FAIL \`${target.handle}\`: ${e.message}`);
    }
  }
  return { applied, skipped, failed };
}

async function updateEnterpriseSoftwarePage(log) {
  const page = await fetchPageByHandle(ENTERPRISE_SOFTWARE.handle);
  if (!page) {
    log.push("WARN: enterprise-software page missing");
    return null;
  }
  const updated = await updatePage(page.id, {
    title: ENTERPRISE_SOFTWARE.label,
    body: ENTERPRISE_SOFTWARE_HTML,
  });
  log.push(`PAGE updated \`${ENTERPRISE_SOFTWARE.handle}\``);
  return updated;
}

async function menuCleanupPhase2(log) {
  const menus = await fetchAllMenus();
  const auditPath = join(ROOT, ".menu-cleanup-audit.json");
  const defaultHandles = new Set(
    existsSync(auditPath)
      ? JSON.parse(readFileSync(auditPath, "utf8")).inventory?.filter((m) => m.is_default).map((m) => m.handle) || []
      : ["main-menu", "footer", "customer-account-main-menu"],
  );

  const toDelete = [];
  for (const m of menus) {
    if (KEEP_MENUS.has(m.handle)) continue;
    if (defaultHandles.has(m.handle)) continue;
    if (DUPLICATE_MENU_RE.test(m.handle)) toDelete.push(m);
    else if (m.handle === "dronare" || m.handle === "meny") toDelete.push(m);
    else if (/^_test-menu/.test(m.handle)) toDelete.push(m);
  }

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
  return { deleted: deleted.length, failed, remaining: menus.length - deleted.length };
}

async function main() {
  if (!EXECUTE || !ALLOW) {
    console.error("Usage: ALLOW_LIVE_MIGRATION=1 node scripts/run-p1-build.mjs --execute");
    process.exit(1);
  }

  loadEnv();
  const shop = await pingShop();
  const log = [];
  const result = { executed_at: new Date().toISOString(), shop: shop?.name, domain: SHOP_DOMAIN };

  console.log(`P1 build on ${SHOP_DOMAIN}`);

  console.log("\n1/3 Spare parts smart collection rules...");
  result.rules = await applySparePartsRules(log, { minProducts: 0, maxRules: 0 });

  console.log("\n2/3 Enterprise Software page...");
  result.enterprise_page = await updateEnterpriseSoftwarePage(log);

  console.log("\n3/3 Menu cleanup phase 2...");
  result.menu_cleanup = await menuCleanupPhase2(log);

  writeFileSync(
    OUT,
    [
      "# P1 Build Report",
      "",
      `**Executed:** ${result.executed_at}`,
      `**Store:** ${shop?.name}`,
      "",
      "## Summary",
      "",
      `| Phase | Result |`,
      `|---|---|`,
      `| Smart collection rules | ${result.rules.applied.length} applied, ${result.rules.failed.length} failed |`,
      `| Enterprise Software page | ${result.enterprise_page ? "UPDATED" : "SKIPPED"} |`,
      `| Menu cleanup phase 2 | ${result.menu_cleanup.deleted} deleted |`,
      "",
      "## Log",
      "",
      ...log.map((l) => `- ${l}`),
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`\nRules: ${result.rules.applied.length} applied, ${result.rules.failed.length} failed`);
  console.log(`Menus deleted: ${result.menu_cleanup.deleted}`);
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
