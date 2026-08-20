#!/usr/bin/env node
/**
 * Recovery pass after English migration — smart collection merges + failed menus.
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import {
  deleteCollection,
  fetchCollectionByHandle,
  loadEnv,
  pingShop,
  SHOP_DOMAIN,
  sleep,
  updateCollection,
} from "./lib/shopify-admin-client.mjs";
import { buildMenuTrees, toShopifyMenuItems } from "./lib/english-menu-trees.mjs";
import { MENU_TITLE_MAP } from "./lib/english-handle-migration.mjs";
import { createMenu, fetchAllMenus, updateMenu } from "./lib/shopify-admin-client.mjs";

const log = [];

async function recoverSmartMerges() {
  // dji-drones: keep larger source `dji`, remove smaller duplicate canonical
  const dji = await fetchCollectionByHandle("dji");
  const djiDrones = await fetchCollectionByHandle("dji-drones");
  if (dji && djiDrones && dji.id !== djiDrones.id) {
    if ((dji.productsCount?.count || 0) >= (djiDrones.productsCount?.count || 0)) {
      await deleteCollection(djiDrones.id);
      log.push("DELETE duplicate canonical `dji-drones` (22 products)");
      await sleep(400);
      await updateCollection({ id: dji.id, handle: "dji-drones" });
      log.push("RENAME `dji` → `dji-drones`");
    }
  }

  // drone-accessories: primary already renamed; drop secondary smart source
  const secondary = await fetchCollectionByHandle("drone-accessories-drone");
  if (secondary) {
    await deleteCollection(secondary.id);
    log.push("DELETE merged source `drone-accessories-drone`");
  }
}

async function recoverMenus() {
  const menus = await fetchAllMenus();
  const byHandle = new Map(menus.map((m) => [m.handle, m]));
  const trees = buildMenuTrees();

  for (const tree of trees) {
    const items = toShopifyMenuItems(tree.children);
    const handlesToTry = [tree.menu, ...(tree.legacyHandles || [])];

    if (!byHandle.get(tree.menu)) {
      const legacy = (tree.legacyHandles || []).find((h) => byHandle.get(h));
      if (legacy) {
        try {
          const created = await createMenu(tree.title, tree.menu, items);
          byHandle.set(tree.menu, created);
          log.push(`MENU create \`${tree.menu}\``);
        } catch (e) {
          log.push(`MENU create FAIL \`${tree.menu}\`: ${e.message}`);
        }
      }
    }

    for (const h of handlesToTry) {
      const menu = byHandle.get(h);
      if (!menu) continue;
      try {
        const title = MENU_TITLE_MAP[h] || MENU_TITLE_MAP[tree.menu] || tree.title;
        await updateMenu(menu.id, title, items);
        log.push(`MENU update \`${h}\``);
        await sleep(400);
      } catch (e) {
        log.push(`MENU FAIL \`${h}\`: ${e.message}`);
      }
    }
  }
}

async function main() {
  if (process.env.ALLOW_LIVE_MIGRATION !== "1") {
    console.error("Set ALLOW_LIVE_MIGRATION=1");
    process.exit(1);
  }
  loadEnv();
  const shop = await pingShop();
  console.log(`Recovery on ${shop?.name} (${SHOP_DOMAIN})`);

  await recoverSmartMerges();
  await recoverMenus();

  const out = join(dirname(fileURLToPath(import.meta.url)), "..", "ENGLISH_MIGRATION_RECOVERY_REPORT.md");
  writeFileSync(
    out,
    ["# English Migration Recovery", "", `**Executed:** ${new Date().toISOString()}`, "", ...log.map((l) => `- ${l}`)].join("\n"),
    "utf8",
  );
  console.log(log.join("\n"));
  console.log(`Wrote ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
