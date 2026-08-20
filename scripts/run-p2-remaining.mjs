#!/usr/bin/env node
/**
 * P2/P3 remaining — blog renames, menu cleanup, Neo hub refine, markets audit.
 * Product handles (~2378) intentionally skipped — separate approved project required.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { loadCsv } from "./lib/migration-csv.mjs";
import { BLOG_HANDLE_MAP, resolveArticleSlug } from "./lib/curated-blog-slugs.mjs";
import { MENU_TITLE_MAP, PRODUCTION_MENU_HANDLES } from "./lib/english-handle-migration.mjs";
import { buildRuleSet } from "./lib/spare-parts-collection-rules.mjs";
import {
  createRedirect,
  deleteMenu,
  fetchAllBlogs,
  fetchAllMenus,
  fetchCollectionByHandle,
  fetchMenuById,
  loadEnv,
  lookupRedirect,
  pingShop,
  SHOP_DOMAIN,
  sleep,
  updateArticle,
  updateBlog,
  updateCollectionRules,
  updateMenu,
  fetchMarkets,
} from "./lib/shopify-admin-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "P2_REMAINING_REPORT.md");
const EXECUTE = process.argv.includes("--execute");
const ALLOW = process.env.ALLOW_LIVE_MIGRATION === "1";

const KEEP_MENUS = new Set([...PRODUCTION_MENU_HANDLES, "actionkameror"]);
const LEGACY_MENU_RE = /^(actionkameror|dronare|partnership)(-\d+)?$/;

function menuItemsWithParentUrls(items) {
  return (items || []).map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url || (item.items?.length ? "#" : ""),
    type: item.type,
    items: item.items?.length ? menuItemsWithParentUrls(item.items) : [],
  }));
}

async function migrateBlogs(log) {
  const blogMap = loadCsv(join(ROOT, "BLOG_HANDLE_MAPPING.csv"));
  const blogs = await fetchAllBlogs();
  const renamed = [];
  const skipped = [];
  const failed = [];
  const redirects = [];

  for (const blog of blogs) {
    const sourceBlogHandle = Object.entries(BLOG_HANDLE_MAP).find(([, v]) => v === blog.handle)?.[0] || blog.handle;
    const newBlogHandle = BLOG_HANDLE_MAP[sourceBlogHandle] || blog.handle;

    try {
      if (newBlogHandle !== blog.handle) {
        await updateBlog(blog.id, { handle: newBlogHandle, title: "News" });
        log.push(`BLOG \`${blog.handle}\` → \`${newBlogHandle}\``);
        await sleep(300);
      }

      const articleRows = blogMap.filter(
        (r) => r.resource_type === "article" && r.current_handle.startsWith(`${sourceBlogHandle}/`),
      );
      const targetByCurrent = new Map();
      for (const row of articleRows) {
        const currentSlug = row.current_handle.split("/").pop();
        const proposed = row.proposed_handle.split("/").pop();
        targetByCurrent.set(currentSlug, resolveArticleSlug(currentSlug, proposed));
      }

      const liveArticles = blog.articles?.nodes || [];
      const curatedTargets = new Set(targetByCurrent.values());

      for (const article of liveArticles) {
        let sourceSlug = article.handle;
        let targetSlug = targetByCurrent.get(sourceSlug);

        if (!targetSlug && curatedTargets.has(article.handle)) {
          skipped.push({ article: article.handle, reason: "already_migrated" });
          continue;
        }
        if (!targetSlug) targetSlug = article.handle;

        const oldPath = `/blogs/${sourceBlogHandle}/${sourceSlug}`;
        const newPath = `/blogs/${newBlogHandle}/${targetSlug}`;

        if (targetSlug === article.handle && newBlogHandle === blog.handle) {
          skipped.push({ article: article.handle, reason: "unchanged" });
          continue;
        }

        await updateArticle(article.id, { handle: targetSlug });
        renamed.push({ from: `${sourceBlogHandle}/${sourceSlug}`, to: `${newBlogHandle}/${targetSlug}` });
        log.push(`ARTICLE \`${sourceSlug}\` → \`${targetSlug}\``);

        const existing = await lookupRedirect(oldPath);
        if (!existing.some((r) => r.target === newPath)) {
          await createRedirect(oldPath, newPath);
          redirects.push({ from: oldPath, to: newPath });
          log.push(`REDIRECT \`${oldPath}\` → \`${newPath}\``);
        }

        const row = articleRows.find((r) => r.current_handle === `${sourceBlogHandle}/${sourceSlug}`);
        if (row?.proposed_url && row.proposed_url !== newPath) {
          const hybridPath = row.proposed_url;
          if (hybridPath !== newPath) {
            const hybridRedirect = await lookupRedirect(hybridPath);
            if (!hybridRedirect.some((r) => r.target === newPath)) {
              await createRedirect(hybridPath, newPath);
              redirects.push({ from: hybridPath, to: newPath });
              log.push(`REDIRECT hybrid \`${hybridPath}\` → \`${newPath}\``);
            }
          }
        }

        await sleep(200);
      }
    } catch (e) {
      failed.push({ blog: blog.handle, error: e.message });
      log.push(`BLOG FAIL \`${blog.handle}\`: ${e.message}`);
    }
  }

  return { renamed: renamed.length, skipped: skipped.length, failed, redirects: redirects.length };
}

async function menuCleanupAndTitles(log) {
  const menus = await fetchAllMenus();
  const deleted = [];
  const failed = [];
  const titlesUpdated = [];

  for (const m of menus) {
    if (!KEEP_MENUS.has(m.handle) && LEGACY_MENU_RE.test(m.handle)) {
      try {
        await deleteMenu(m.id);
        deleted.push(m.handle);
        log.push(`DELETE menu \`${m.handle}\``);
        await sleep(150);
      } catch (e) {
        failed.push({ handle: m.handle, error: e.message });
      }
    }
  }

  const remaining = await fetchAllMenus();
  for (const m of remaining) {
    const targetTitle = MENU_TITLE_MAP[m.handle];
    if (!targetTitle || m.title === targetTitle) continue;
    try {
      const full = await fetchMenuById(m.id);
      const items = menuItemsWithParentUrls(full?.items || []);
      await updateMenu(m.id, targetTitle, items);
      titlesUpdated.push({ handle: m.handle, from: m.title, to: targetTitle });
      log.push(`MENU title \`${m.handle}\`: "${m.title}" → "${targetTitle}"`);
      await sleep(200);
    } catch (e) {
      failed.push({ handle: m.handle, error: e.message, phase: "title" });
    }
  }

  return {
    deleted: deleted.length,
    titlesUpdated: titlesUpdated.length,
    failed,
    remaining: (await fetchAllMenus()).map((m) => ({ handle: m.handle, title: m.title })),
  };
}

async function refineNeoHub(log) {
  const hub = await fetchCollectionByHandle("dji-neo-spare-parts");
  if (!hub) {
    log.push("WARN: dji-neo-spare-parts missing");
    return null;
  }
  const before = hub.productsCount?.count || 0;
  const ruleSet = buildRuleSet("dji-neo", null, { isHub: true });
  const updated = await updateCollectionRules(hub.id, ruleSet);
  const after = updated.productsCount?.count || 0;
  log.push(`NEO HUB rules updated: ${before} → ${after} products (${updated.ruleSet?.rules?.length} rules)`);
  return { before, after, rules: updated.ruleSet?.rules?.length || 0 };
}

async function auditMarkets(log) {
  const markets = await fetchMarkets();
  for (const m of markets) {
    log.push(`MARKET \`${m.handle}\` enabled=${m.enabled} primary=${m.primary}`);
  }
  return markets;
}

async function auditProductHandles(log) {
  const data = await import("./lib/shopify-admin-client.mjs").then((m) =>
    m.shopifyGraphQL(
      `query { productsCount { count } }`,
    ),
  );
  log.push(`PRODUCTS total: ${data?.productsCount?.count || "unknown"} — handle migration deferred (no approved mapping)`);
  return { total: data?.productsCount?.count, status: "DEFERRED" };
}

async function main() {
  if (!EXECUTE || !ALLOW) {
    console.error("Usage: ALLOW_LIVE_MIGRATION=1 node scripts/run-p2-remaining.mjs --execute");
    process.exit(1);
  }

  loadEnv();
  const shop = await pingShop();
  const log = [];
  const result = { executed_at: new Date().toISOString(), shop: shop?.name, domain: SHOP_DOMAIN };

  console.log(`P2 remaining on ${SHOP_DOMAIN}`);

  console.log("\n1/4 Blog migration...");
  result.blogs = await migrateBlogs(log);

  console.log("\n2/4 Menu cleanup + English titles...");
  result.menus = await menuCleanupAndTitles(log);

  console.log("\n3/4 Neo hub refine...");
  result.neo_hub = await refineNeoHub(log);

  console.log("\n4/4 Markets + product audit...");
  result.markets = await auditMarkets(log);
  result.products = await auditProductHandles(log);

  writeFileSync(
    OUT,
    [
      "# P2 Remaining Report",
      "",
      `**Executed:** ${result.executed_at}`,
      `**Store:** ${shop?.name}`,
      "",
      "## Summary",
      "",
      "| Phase | Result |",
      "|---|---|",
      `| Blog articles renamed | ${result.blogs.renamed} |`,
      `| Blog redirects created/verified | ${result.blogs.redirects} |`,
      `| Blog failures | ${result.blogs.failed.length} |`,
      `| Menus deleted | ${result.menus.deleted} |`,
      `| Menu titles updated | ${result.menus.titlesUpdated} |`,
      `| Neo hub products | ${result.neo_hub?.before ?? "—"} → ${result.neo_hub?.after ?? "—"} |`,
      `| Markets | ${result.markets.length} configured |`,
      `| Product handles | ${result.products.status} (${result.products.total ?? "?"} products) |`,
      "",
      "### Remaining menus",
      "",
      ...result.menus.remaining.map((m) => `- \`${m.handle}\` — ${m.title}`),
      "",
      "## Log",
      "",
      ...log.map((l) => `- ${l}`),
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`\nBlogs renamed: ${result.blogs.renamed}, failed: ${result.blogs.failed.length}`);
  console.log(`Menus: ${result.menus.deleted} deleted, ${result.menus.titlesUpdated} titles updated`);
  console.log(`Neo hub: ${result.neo_hub?.before} → ${result.neo_hub?.after}`);
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
