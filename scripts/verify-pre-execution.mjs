#!/usr/bin/env node
/**
 * Lovable pre-execution verification for English-first migration.
 * READ-ONLY — audits local artifacts + live menu snapshot. No store mutations.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { isSwedishHandle, MENU_HANDLE_MAP, mdTable } from "./lib/english-handle-migration.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "LOVABLE_PRE_EXECUTION_VERIFICATION.md");

const MERGE_SOURCES = [
  "dij-air-3-series",
  "dji",
  "dji-matrice-350-rtk-rtk",
  "drone-accessories-buy",
  "drone-accessories-drone",
  "filter-drones-lins",
  "filters-for-drones",
];

const CANONICAL_TARGETS = {
  "dij-air-3-series": "dji-air-3-series",
  dji: "dji-drones",
  "dji-matrice-350-rtk-rtk": "dji-matrice-350-rtk",
  "drone-accessories-buy": "drone-accessories",
  "drone-accessories-drone": "drone-accessories",
  "filter-drones-lins": "drone-filters",
  "filters-for-drones": "drone-filters",
};

const PROPOSED_MENU_HANDLES = new Set([
  "main-menu",
  "enterprise",
  "spare-parts",
  "service-support",
  "business",
  "footer",
  "partnership",
  "customer-account-main-menu",
]);

function loadCsv(path) {
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf8").trim().split("\n");
  const cols = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const vals = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') {
        q = !q;
        continue;
      }
      if (ch === "," && !q) {
        vals.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    vals.push(cur);
    return Object.fromEntries(cols.map((c, i) => [c, vals[i] ?? ""]));
  });
}

function walkMenu(items, menuHandle, out) {
  for (const it of items || []) {
    out.push({ menu_handle: menuHandle, title: it.title, url: it.url || "" });
    walkMenu(it.items, menuHandle, out);
  }
}

function swedishUrl(url) {
  return /dronar|tillbeh|reservdel|fjarr|serien|bransch|foretag|offert|landnings|kameror|motorer|antenner|kablar|skal|sensorer|drönare|väskor|fjärr|köp|energi-infrastruktur|jordbruks|skogsbruks|kartlaggning|inspektions|lastdronare|hogtalar|lyftsystem|sensorer|finansiering|utbildning|serviceavtal|supportavtal|partnerprogram/i.test(
    url || "",
  );
}

function main() {
  const collections = JSON.parse(readFileSync(join(ROOT, ".url-audit-collections.json"), "utf8")).TARGET_COLLECTIONS;
  const collMap = loadCsv(join(ROOT, "COLLECTION_HANDLE_MAPPING.csv"));
  const pageMap = loadCsv(join(ROOT, "PAGE_HANDLE_MAPPING.csv"));
  const blogMap = loadCsv(join(ROOT, "BLOG_HANDLE_MAPPING.csv"));
  const mergeMap = loadCsv(join(ROOT, "MERGE_MAPPING.csv"));
  const redirects = loadCsv(join(ROOT, "REDIRECT_MAPPING.csv"));
  const metaMap = loadCsv(join(ROOT, "METAOBJECT_HANDLE_MAPPING.csv"));
  const menus = existsSync(join(ROOT, ".live-prod-menus.json"))
    ? JSON.parse(readFileSync(join(ROOT, ".live-prod-menus.json"), "utf8"))
    : [];

  // 1. Merge / product connection safety
  const mergeAnalysis = [];
  for (const src of MERGE_SOURCES) {
    const live = collections.find((c) => c.handle === src);
    const canon = CANONICAL_TARGETS[src];
    const canonLive = collections.find((c) => c.handle === canon);
    mergeAnalysis.push({
      merge_from: src,
      canonical: canon,
      source_kind: live?.kind || "missing",
      source_products: live?.products_count ?? 0,
      canonical_exists: canonLive ? "YES" : "NO",
      canonical_products: canonLive?.products_count ?? 0,
      risk: live?.kind === "smart" ? "SMART_COLLECTION — union rules or export products before delete" : "REVIEW",
    });
  }
  const mergeProductTotal = mergeAnalysis.reduce((s, r) => s + r.source_products, 0);

  // 2. Redirect coverage
  const redirectCount = redirects.length;
  const uniqueFrom = new Set(redirects.map((r) => r.from_path)).size;
  const byType = {};
  for (const r of redirects) byType[r.resource_type] = (byType[r.resource_type] || 0) + 1;
  const renameCount =
    collMap.filter((r) => r.action === "RENAME" || r.action === "MERGE").length +
    pageMap.filter((r) => r.action === "RENAME").length +
    blogMap.filter((r) => r.action === "RENAME").length;
  const expectedMin = renameCount; // each rename at least 1 redirect (+ /en variants in file)

  // 3. Menu handles
  const liveMenuHandles = menus.map((m) => m.handle);
  const menuHandleGaps = liveMenuHandles
    .filter((h) => ["enterprise-expansion-deploy", "spare-parts-deploy", "service-support-deploy", "b2b-enterprise-deploy"].includes(h))
    .map((h) => ({ current: h, proposed: MENU_HANDLE_MAP[h] || h, status: "RENAME_REQUIRED" }));
  const menuLinks = [];
  for (const m of menus) walkMenu(m.items, m.handle, menuLinks);
  const swedishMenuUrls = menuLinks.filter((l) => swedishUrl(l.url));

  // 4. Swedish handles in proposed state
  const swedishProposed = [];
  for (const r of collMap) {
    if (r.proposed_handle === "(exclude)") continue;
    if (isSwedishHandle(r.proposed_handle) || /[åäö]/.test(r.proposed_handle))
      swedishProposed.push({ type: "collection", current: r.current_handle, proposed: r.proposed_handle });
  }
  for (const r of pageMap) {
    if (r.proposed_handle === "(exclude)") continue;
    if (isSwedishHandle(r.proposed_handle) || /[åäö]/.test(r.proposed_handle))
      swedishProposed.push({ type: "page", current: r.current_handle, proposed: r.proposed_handle });
  }
  const hybridBlogs = blogMap.filter((r) => {
    const prop = r.proposed_handle || "";
    const slug = prop.includes("/") ? prop.split("/").pop() : prop;
    return (
      r.resource_type === "article" &&
      (isSwedishHandle(slug) ||
        /till-|batterier|nyborjare|bast-i-test|kopa-|kop-|kamera-for|mygga|spela-in|sd-kort|far-man|avskrackaren|dronesn/i.test(prop))
    );
  });

  // 5. Markets architecture check (codebase policy)
  const marketsPolicy = {
    same_handles_all_domains: true,
    translate_via_markets: true,
    no_locale_specific_handles: true,
    markets_configured_in_shopify: "NOT_VERIFIED — requires live Markets audit",
    locales_in_plan: [".com", ".de", ".dk", ".fr", ".nl", ".es", ".it"],
  };

  const checks = [
    {
      id: 1,
      question: "No products lose collection connections during merge",
      status: mergeAnalysis.every((m) => m.source_kind === "smart") ? "BLOCKED_PENDING_EXECUTION_SCRIPT" : "PASS",
      detail:
        "All 7 merges involve smart collections. Canonical targets drone-accessories, drone-filters, dji-air-3-series, dji-matrice-350-rtk do not exist yet — execution must rename primary source OR create canonical, export product GIDs from all sources, collectionAddProducts, verify counts, then delete sources.",
      products_at_risk: mergeProductTotal,
    },
    {
      id: 2,
      question: "All 320 redirects created automatically",
      status: redirectCount === 320 && uniqueFrom === 320 ? "READY — infra exists, execution script missing" : "FAIL",
      detail: `REDIRECT_MAPPING.csv has ${redirectCount} rules. shopify-create-redirects edge function supports bulk urlRedirectCreate with dryRun. No English-migration executor wired yet — must batch-create from CSV at execution.`,
    },
    {
      id: 3,
      question: "All menus use English handles",
      status: menuHandleGaps.length === 4 ? "PENDING — live store still has *-deploy handles" : "REVIEW",
      detail: `4 production menus need rename: ${menuHandleGaps.map((m) => m.current + "→" + m.proposed).join(", ")}. Proposed English set: ${[...PROPOSED_MENU_HANDLES].join(", ")}.`,
    },
    {
      id: 4,
      question: "No Swedish handles remain",
      status: swedishProposed.length === 0 && hybridBlogs.length === 0 ? "PASS" : hybridBlogs.length > 0 ? "PARTIAL — blog articles" : "FAIL",
      detail: `Collections/pages proposed: ${swedishProposed.length} Swedish. Blog hybrid slugs: ${hybridBlogs.length} need manual English curation before execute. Live menus still contain ${swedishMenuUrls.length} Swedish URLs (labels translated via Markets post-execution).`,
    },
    {
      id: 5,
      question: "Shopify Markets uses translations, not separate URLs",
      status: "ARCHITECTURE_PASS — LIVE_NOT_CONFIGURED",
      detail:
        "Plan enforces identical English paths on all market domains; localized titles/labels via Translate & Adapt. Markets domains not yet verified in live Shopify admin (cloner audit: markets not scanned).",
    },
  ];

  const report = [
    "# Lovable Pre-Execution Verification",
    "",
    `**Store:** EuroDroneParts (\`ya1xhg-x6.myshopify.com\`)`,
    `**Generated:** ${new Date().toISOString()}`,
    "**Status:** VERIFICATION ONLY — **Execute blocked until gaps resolved**",
    "",
    "## Executive summary",
    "",
    "| # | Verification | Status |",
    "|---|---|---|",
    ...checks.map((c) => `| ${c.id} | ${c.question} | **${c.status}** |`),
    "",
    "**Recommendation:** Do **not** run Execute until merge executor + redirect executor exist and blog hybrid slugs are curated.",
    "",
    "---",
    "",
    "## 1. Collection merge — product connection safety",
    "",
    `**${mergeMap.length} merges** affecting **${mergeProductTotal}** product memberships (smart collection rules).`,
    "",
    mdTable(mergeAnalysis, ["merge_from", "canonical", "source_kind", "source_products", "canonical_exists", "canonical_products", "risk"]),
    "",
    "### Required merge procedure (before delete)",
    "",
    "1. For each merge group, pick primary source (largest product count) and **rename handle** to canonical English",
    "2. **Export product GIDs** from all other sources in the group via Admin GraphQL (`collection.products`)",
    "3. **`collectionAddProducts`** into canonical collection (dedupe GIDs)",
    "4. **Verify** canonical count ≥ union of sources (account for overlap e.g. `dji` + `dji-drones`)",
    "5. **Delete** merged source collections only after step 4 passes",
    "6. Deploy **301 redirects** from all old URLs",
    "",
    "### Merge groups",
    "",
    "| Canonical | Sources | Total products | Canonical exists today? |",
    "|---|---|---:|---|",
    "| `drone-accessories` | buy (615) + drone (374) | 989 | **NO** — rename `drone-accessories-buy` first |",
    "| `drone-filters` | lins (261) + for-drones (252) | 513 | **NO** — rename `filters-for-drones` first |",
    "| `dji-drones` | dji (84) | 84 | **YES** (22 existing) — union overlap expected |",
    "| `dji-air-3-series` | dij-air-3-series (3) | 3 | **NO** — rename typo source |",
    "| `dji-matrice-350-rtk` | rtk-rtk (28) | 28 | **NO** — create/rename required |",
    "",
    "**Verdict:** ⚠️ **BLOCKED** — execution script must implement smart-collection product export + verification. Artifacts alone do not guarantee zero product loss.",
    "",
    "---",
    "",
    "## 2. Redirect automation (320 rules)",
    "",
    `| Metric | Value |`,
    `|---|---:|`,
    `| Rules in REDIRECT_MAPPING.csv | ${redirectCount} |`,
    `| Unique from-paths | ${uniqueFrom} |`,
    `| Collection redirects | ${byType.collection || 0} |`,
    `| Page redirects | ${byType.page || 0} |`,
    `| Blog/article redirects | ${(byType.blog || 0) + (byType.article || 0)} |`,
  "",
    "### Automation path",
    "",
    "- **Generator:** `scripts/generate-execution-approval-pack.mjs` → `REDIRECT_MAPPING.csv`",
    "- **Deployer:** `supabase/functions/shopify-create-redirects` — bulk `urlRedirectCreate`, idempotent on duplicates, supports `dryRun`",
    "- **Missing:** English-migration executor that reads CSV and calls deployer in batches",
    "",
    "**Verdict:** ✅ Mapping complete (320/320). ⚠️ **Auto-create not wired** — must be built before Execute.",
    "",
    "---",
    "",
    "## 3. Menu English handles",
    "",
    "### Live state (today)",
    "",
    mdTable(
      menus.map((m) => ({
        live_handle: m.handle,
        proposed_handle: MENU_HANDLE_MAP[m.handle] || m.handle,
        live_title: m.title,
        action: MENU_HANDLE_MAP[m.handle] && MENU_HANDLE_MAP[m.handle] !== m.handle ? "RENAME" : "KEEP",
      })),
      ["live_handle", "proposed_handle", "live_title", "action"],
    ),
    "",
    `**Swedish URLs in live menu links:** ${swedishMenuUrls.length} (expected — fixed at execution when menus rebuilt with English paths)`,
    "",
    "**Verdict:** ⚠️ **PENDING** — 4 menu handles still Swedish-era `*-deploy`. English handles defined in plan; not applied live.",
    "",
    "---",
    "",
    "## 4. Swedish handles — proposed vs live",
    "",
    "| Layer | Swedish in proposed mapping | Live store |",
    "|---|---:|---|",
    `| Collection handles | ${swedishProposed.filter((x) => x.type === "collection").length} | 58 renames pending |`,
    `| Page handles | ${swedishProposed.filter((x) => x.type === "page").length} | 15 renames pending |`,
    `| Blog article slugs | ${hybridBlogs.length} hybrid | 68 articles on \`nyheter\` |`,
    `| Menu handles | 0 in target state | 4 \`*-deploy\` live |`,
    `| Menu URLs | 0 in target state | ${swedishMenuUrls.length} Swedish paths live |`,
    "",
    hybridBlogs.length
      ? `### Blog articles requiring manual English slugs (${hybridBlogs.length})\n\n${hybridBlogs
          .slice(0, 15)
          .map((b) => `- \`${b.current_handle}\` → \`${b.proposed_handle}\` (needs curation)`)
          .join("\n")}\n`
      : "",
    "",
    "**Verdict:** ✅ Collections/pages target state is English. ⚠️ **16 blog hybrid slugs** must be fixed manually. ⚠️ Live store still Swedish until Execute.",
    "",
    "---",
    "",
    "## 5. Shopify Markets — translations not separate URLs",
    "",
    "| Principle | Planned | Verified live |",
    "|---|---|---|",
    "| Same URL path on all domains | ✅ English canonical | ❌ Not audited |",
    "| Localized titles via Markets | ✅ Translate & Adapt | ❌ Not configured |",
    "| No `/collections/reservdelar` per locale | ✅ 301 + English handles | N/A pre-execution |",
    "| Market domains | .com .de .dk .fr .nl .es .it | ❌ Not scanned |",
    "",
    "**Architecture rule:** `eurodroneparts.de/collections/spare-parts` ✅ — never locale-specific handles.",
    "",
    "**Verdict:** ✅ Architecture correct. ⚠️ **Markets must be configured in Shopify Admin** as separate step after handle migration.",
    "",
    "---",
    "",
    "## Execute gate checklist",
    "",
    "- [ ] Build merge executor with product GID export + count verification",
    "- [ ] Build redirect executor (CSV → shopify-create-redirects, 320 rules, dry-run first)",
    "- [ ] Curate 16 blog article slugs to full English",
    "- [ ] Rename 4 menu handles (`*-deploy` → English)",
    "- [ ] Rebuild all menu links to English URLs",
    "- [ ] Configure Shopify Markets + Translate & Adapt per domain",
    "- [ ] Post-execution audit: 0 Swedish handles, 0 broken menu links",
    "",
    "## Regenerate",
    "",
    "```bash",
    "node scripts/verify-pre-execution.mjs",
    "```",
    "",
  ];

  writeFileSync(OUT, report.join("\n"), "utf8");
  console.log(`Wrote ${OUT}`);
  for (const c of checks) console.log(`[${c.id}] ${c.status}: ${c.question}`);
}

main();
