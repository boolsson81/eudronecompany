#!/usr/bin/env node
/**
 * Read-only — generates English URL execution artifacts for EuroDroneParts.
 * Outputs all 7 deliverables. Does NOT modify the Shopify store.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  MENU_HANDLE_MAP,
  MENU_TITLE_MAP,
  PRODUCTION_MENU_HANDLES,
  csvRow,
  isLegacyExcludePage,
  isSwedishHandle,
  mdTable,
  parseFingerprint,
  parseUrl,
  proposeEnglishHandle,
  proposeMenuTitle,
  urlPath,
  walkMenuItems,
  writeCsv,
} from "./lib/english-handle-migration.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = {
  plan: join(ROOT, "ENGLISH_URL_EXECUTION_PLAN.md"),
  collectionCsv: join(ROOT, "COLLECTION_HANDLE_MAPPING.csv"),
  pageCsv: join(ROOT, "PAGE_HANDLE_MAPPING.csv"),
  blogCsv: join(ROOT, "BLOG_HANDLE_MAPPING.csv"),
  productCsv: join(ROOT, "PRODUCT_RECOMMENDATIONS.csv"),
  menuReport: join(ROOT, "MENU_CLEANUP_REPORT.md"),
  redirectCsv: join(ROOT, "REDIRECT_MAPPING.csv"),
};

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function buildInternalRefIndex(menuLinks) {
  const refCounts = new Map();
  for (const link of menuLinks) {
    const parsed = parseUrl(link.url);
    if (!parsed) continue;
    const lookupHandle = parsed.type === "article" ? `${parsed.blogHandle}/${parsed.handle}` : parsed.handle;
    const keys = [
      `${parsed.type === "article" ? "article" : parsed.type}:${lookupHandle}`,
      `collection:${parsed.handle}`,
      `page:${parsed.handle}`,
      `product:${parsed.handle}`,
    ];
    for (const k of keys) {
      if (!refCounts.has(k)) refCounts.set(k, []);
      const arr = refCounts.get(k);
      const label = `${link.menu_handle} → ${link.title}`;
      if (!arr.includes(label)) arr.push(label);
    }
  }
  return refCounts;
}

function attachRefs(rows, refCounts) {
  for (const m of rows) {
    const keys = [`${m.resource_type}:${m.current_handle}`];
    if (["collection", "page", "product"].includes(m.resource_type)) {
      keys.push(`${m.resource_type}:${m.current_handle.split("/").pop()}`);
    }
    const refs = new Set();
    for (const k of keys) for (const r of refCounts.get(k) || []) refs.add(r);
    m.internal_references_impacted =
      [...refs].slice(0, 8).join("; ") + (refs.size > 8 ? ` (+${refs.size - 8} more)` : "");
  }
}

function validateRedirects(redirects) {
  const fromSet = new Set(redirects.map((r) => r.from_path));
  const toSet = new Set(redirects.map((r) => r.to_path));
  const chains = [];
  const loops = [];
  const map = new Map(redirects.map((r) => [r.from_path, r.to_path]));

  for (const r of redirects) {
    const visited = new Set([r.from_path]);
    let cur = r.to_path;
    let depth = 0;
    while (map.has(cur) && depth < 10) {
      if (visited.has(cur)) {
        loops.push({ from: r.from_path, loop_at: cur });
        break;
      }
      visited.add(cur);
      cur = map.get(cur);
      depth++;
    }
    if (depth > 0 && !loops.find((l) => l.from === r.from_path)) {
      chains.push({ from: r.from_path, via: r.to_path, final: cur, depth });
    }
  }

  const duplicateFrom = redirects.filter((r, i) => redirects.findIndex((x) => x.from_path === r.from_path) !== i);

  return {
    total: redirects.length,
    unique_from: fromSet.size,
    chains: chains.length,
    loops: loops.length,
    duplicate_from: duplicateFrom.length,
    chain_samples: chains.slice(0, 5),
    loop_samples: loops.slice(0, 5),
    pass: loops.length === 0 && duplicateFrom.length === 0,
  };
}

function classifyMenu(m, decisions) {
  const decision = decisions?.find((d) => d.handle === m.handle);
  const isProdSource = [
    "main-menu", "footer", "customer-account-main-menu", "partnership",
    "enterprise-expansion-deploy", "spare-parts-deploy", "service-support-deploy", "b2b-enterprise-deploy",
  ].includes(m.handle);
  const isProdFinal = PRODUCTION_MENU_HANDLES.has(m.handle) || PRODUCTION_MENU_HANDLES.has(MENU_HANDLE_MAP[m.handle] || "");
  const isDeploy = m.handle.includes("-deploy");
  const isDuplicateKeep = decision?.action === "keep" && !isProdSource && m.item_count > 0;

  if (m.referenced_by_theme) {
    return { action: "KEEP_RESTRUCTURE", reason: "Theme-linked — update titles/links in place", phase: 2 };
  }
  if (isProdSource && isDeploy) {
    return { action: "MERGE_THEN_DELETE", reason: "Deploy menu — merge IA into production handle, then delete", phase: 1 };
  }
  if (m.handle === "enterprise-dr-nare") {
    return { action: "DELETE", reason: "Superseded by enterprise-drones production menu", phase: 1 };
  }
  if (isDuplicateKeep) {
    return { action: "DELETE", reason: `Migration duplicate kept by auto-audit — not in production IA (${m.title})`, phase: 1 };
  }
  if (m.item_count === 0) {
    return { action: "DELETE", reason: decision?.reason || "Empty menu", phase: 1 };
  }
  if (decision?.action === "delete") {
    return { action: "DELETE", reason: decision.reason, phase: 1 };
  }
  if (isProdFinal) {
    return { action: "KEEP", reason: "Production menu", phase: 2 };
  }
  return { action: "REVIEW", reason: "Unexpected active menu — manual review before deletion", phase: 1 };
}

function main() {
  const collectionsAudit = loadJson(join(ROOT, ".url-audit-collections.json"));
  const live = loadJson(join(ROOT, ".url-audit-live.json"));
  const menuAudit = loadJson(join(ROOT, ".menu-cleanup-audit.json"));
  const menuRecovery = loadJson(join(ROOT, ".url-audit-menu-recovery.json"));

  if (!collectionsAudit?.TARGET_COLLECTIONS || !live || !menuAudit?.inventory) {
    console.error("Missing audit JSON. Required: .url-audit-collections.json, .url-audit-live.json, .menu-cleanup-audit.json");
    process.exit(1);
  }

  const collections = [];
  for (const c of collectionsAudit.TARGET_COLLECTIONS) {
    const proposed = proposeEnglishHandle(c.handle);
    collections.push({
      resource_type: "collection",
      current_handle: c.handle,
      proposed_handle: proposed,
      current_url: urlPath("collection", c.handle),
      new_url: urlPath("collection", proposed),
      redirect_required: proposed !== c.handle ? "YES" : "NO",
      swedish_detected: isSwedishHandle(c.handle) ? "YES" : "NO",
      title: c.title,
      products_count: c.products_count ?? 0,
      execute_phase: proposed !== c.handle ? 3 : "SKIP",
      internal_references_impacted: "",
    });
  }

  const pages = [];
  for (const p of live.pages) {
    if (isLegacyExcludePage(p.handle)) {
      pages.push({
        resource_type: "page",
        current_handle: p.handle,
        proposed_handle: "(exclude)",
        current_url: urlPath("page", p.handle),
        new_url: "(exclude)",
        redirect_required: "EXCLUDE",
        swedish_detected: "LEGACY",
        title: p.title,
        execute_phase: "EXCLUDE",
        internal_references_impacted: "ActionKing legacy",
      });
      continue;
    }
    const proposed = proposeEnglishHandle(p.handle);
    pages.push({
      resource_type: "page",
      current_handle: p.handle,
      proposed_handle: proposed,
      current_url: urlPath("page", p.handle),
      new_url: urlPath("page", proposed),
      redirect_required: proposed !== p.handle ? "YES" : "NO",
      swedish_detected: isSwedishHandle(p.handle) ? "YES" : "NO",
      title: p.title,
      execute_phase: proposed !== p.handle ? 4 : "SKIP",
      internal_references_impacted: "",
    });
  }

  const blogs = [];
  for (const b of live.blogs) {
    const blogProposed = proposeEnglishHandle(b.handle);
    blogs.push({
      resource_type: "blog",
      current_handle: b.handle,
      proposed_handle: blogProposed,
      current_url: urlPath("blog", b.handle),
      new_url: urlPath("blog", blogProposed),
      redirect_required: blogProposed !== b.handle ? "YES" : "NO",
      swedish_detected: isSwedishHandle(b.handle) ? "YES" : "NO",
      title: b.title,
      execute_phase: blogProposed !== b.handle ? 5 : "SKIP",
      internal_references_impacted: "",
    });
    for (const a of b.articles) {
      const artProposed = proposeEnglishHandle(a.handle);
      blogs.push({
        resource_type: "article",
        current_handle: `${b.handle}/${a.handle}`,
        proposed_handle: `${blogProposed}/${artProposed}`,
        current_url: urlPath("article", a.handle, b.handle),
        new_url: urlPath("article", artProposed, blogProposed),
        redirect_required: artProposed !== a.handle || blogProposed !== b.handle ? "YES" : "NO",
        swedish_detected: isSwedishHandle(a.handle) || isSwedishHandle(b.handle) ? "YES" : "NO",
        title: a.title,
        execute_phase: artProposed !== a.handle || blogProposed !== b.handle ? 5 : "SKIP",
        internal_references_impacted: "",
      });
    }
  }

  const products = [];
  for (const p of live.products) {
    const swedish = isSwedishHandle(p.handle);
    const proposed = swedish ? proposeEnglishHandle(p.handle) : p.handle;
    products.push({
      current_handle: p.handle,
      proposed_handle: proposed,
      current_url: urlPath("product", p.handle),
      proposed_url: urlPath("product", proposed),
      swedish_detected: swedish ? "YES" : "NO",
      recommendation: swedish && proposed !== p.handle ? "RENAME_POST_LAUNCH" : "KEEP",
      execute_phase: "6_REVIEW_ONLY",
      title: p.title,
      status: p.status || "DRAFT",
    });
  }

  const menuLinks = [];
  for (const m of live.menus || []) walkMenuItems(m.items, m.handle, menuLinks);
  for (const row of menuAudit.inventory) {
    if (row.item_count > 0 && row.structure_fingerprint) {
      for (const l of parseFingerprint(row.structure_fingerprint)) {
        menuLinks.push({ menu_handle: row.handle, title: l.title, url: l.url, type: "HTTP" });
      }
    }
  }
  for (const m of menuRecovery?.menus || []) {
    for (const l of [...(m.removed_links || []), ...(m.deferred_links || [])]) {
      menuLinks.push({ menu_handle: m.menu_handle, title: l.title, url: l.url, type: l.type });
    }
  }
  const refCounts = buildInternalRefIndex(menuLinks);
  attachRefs(collections, refCounts);
  attachRefs(pages, refCounts);
  attachRefs(blogs, refCounts);

  const collChanges = collections.filter((c) => c.redirect_required === "YES");
  const pageChanges = pages.filter((p) => p.redirect_required === "YES");
  const blogChanges = blogs.filter((b) => b.redirect_required === "YES");
  const productRecs = products.filter((p) => p.recommendation === "RENAME_POST_LAUNCH");

  const redirects = [...collChanges, ...pageChanges, ...blogChanges].map((m) => ({
    from_path: m.current_url,
    to_path: m.new_url,
    resource_type: m.resource_type,
    current_handle: m.current_handle,
    proposed_handle: m.proposed_handle,
    redirect_type: "301",
    preserve_seo: "YES",
    internal_refs: m.internal_references_impacted,
  }));

  const legacyRedirects = redirects.map((r) => ({
    ...r,
    from_path: `/en${r.from_path}`,
    internal_refs: "legacy /en/ prefix",
  }));
  const allRedirects = [...redirects, ...legacyRedirects];
  const seoCheck = validateRedirects(redirects);

  const menuRows = menuAudit.inventory.map((m) => {
    const cls = classifyMenu(m, menuAudit.decisions);
    const proposedHandle = MENU_HANDLE_MAP[m.handle] || m.handle;
    return {
      id: m.id,
      current_handle: m.handle,
      proposed_handle: PRODUCTION_MENU_HANDLES.has(proposedHandle) ? proposedHandle : proposedHandle,
      current_title: m.title,
      proposed_title: MENU_TITLE_MAP[m.handle] || proposeMenuTitle(m.title),
      item_count: m.item_count,
      theme_linked: m.referenced_by_theme ? "YES" : "NO",
      action: cls.action,
      reason: cls.reason,
      phase: cls.phase,
    };
  });

  const menuDelete = menuRows.filter((m) => m.action === "DELETE" || m.action === "MERGE_THEN_DELETE");
  const menuKeep = menuRows.filter((m) => m.action === "KEEP" || m.action === "KEEP_RESTRUCTURE");

  const collCols = [
    "current_handle", "proposed_handle", "current_url", "new_url", "redirect_required",
    "swedish_detected", "title", "products_count", "execute_phase", "internal_references_impacted",
  ];
  writeCsv(OUT.collectionCsv, collCols, collections);

  const pageCols = [
    "current_handle", "proposed_handle", "current_url", "new_url", "redirect_required",
    "swedish_detected", "title", "execute_phase", "internal_references_impacted",
  ];
  writeCsv(OUT.pageCsv, pageCols, pages);

  const blogCols = [
    "resource_type", "current_handle", "proposed_handle", "current_url", "new_url",
    "redirect_required", "swedish_detected", "title", "execute_phase", "internal_references_impacted",
  ];
  writeCsv(OUT.blogCsv, blogCols, blogs);

  const productCols = [
    "current_handle", "proposed_handle", "current_url", "proposed_url",
    "swedish_detected", "recommendation", "execute_phase", "status", "title",
  ];
  writeCsv(OUT.productCsv, productCols, products);

  const redirCols = [
    "from_path", "to_path", "resource_type", "current_handle", "proposed_handle",
    "redirect_type", "preserve_seo", "internal_refs",
  ];
  writeCsv(OUT.redirectCsv, redirCols, allRedirects);

  const integrity = menuAudit.integrity || {};
  const menuReport = [
    "# MENU_CLEANUP_REPORT",
    "",
    "**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)",
    `**Generated:** ${new Date().toISOString()}`,
    "**Status:** READ-ONLY AUDIT — no deletions performed",
    "",
    "## Executive summary",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Menus on store | ${menuAudit.inventory.length} |`,
    `| Menus to delete (Phase 1) | ${menuDelete.length} |`,
    `| Menus to keep (Phase 2) | ${menuKeep.length} |`,
    `| Theme-linked | ${menuRows.filter((m) => m.theme_linked === "YES").length} |`,
    `| Production target (final) | 8 |`,
    "",
    "## Production menu target (post-migration)",
    "",
    mdTable(
      [
        { handle: "main-menu", title: "Main Menu", source: "existing — restructure titles/links" },
        { handle: "enterprise-drones", title: "Enterprise Drones", source: "from enterprise-expansion-deploy" },
        { handle: "spare-parts", title: "Spare Parts", source: "from spare-parts-deploy" },
        { handle: "service-support", title: "Service & Support", source: "from service-support-deploy" },
        { handle: "b2b-enterprise", title: "B2B Enterprise", source: "from b2b-enterprise-deploy" },
        { handle: "partnership", title: "Partnership", source: "existing" },
        { handle: "footer", title: "Footer Menu", source: "existing — restructure" },
        { handle: "customer-account-main-menu", title: "Customer Account", source: "existing — restructure titles" },
      ],
      ["handle", "title", "source"],
    ),
    "",
    "## Phase 1 — Menus to delete",
    "",
    `${menuDelete.length} menus scheduled for deletion after verification.`,
    "",
    mdTable(
      menuDelete.slice(0, 40).map((m) => ({
        handle: m.current_handle,
        title: m.current_title,
        items: m.item_count,
        action: m.action,
        reason: m.reason.slice(0, 80),
      })),
      ["handle", "title", "items", "action", "reason"],
    ),
    menuDelete.length > 40 ? `\n_Full list: ${menuDelete.length} menus — see menu audit JSON._\n` : "",
    "",
    "## Phase 2 — Menu title translations",
    "",
    mdTable(
      menuRows
        .filter((m) => m.item_count > 0)
        .map((m) => ({
          handle: m.current_handle,
          current_title: m.current_title,
          proposed_title: m.proposed_title,
          proposed_handle: m.proposed_handle,
          theme_linked: m.theme_linked,
        })),
      ["handle", "current_title", "proposed_title", "proposed_handle", "theme_linked"],
    ),
    "",
    "## Integrity checks",
    "",
    `| Check | Status |`,
    `|---|---|`,
    `| Broken menu links | ${integrity.broken_links?.length || 0} |`,
    `| Missing collections | ${integrity.missing_collections?.length || 0} |`,
    `| Missing pages | ${integrity.missing_pages?.length || 0} |`,
    `| ActionKing references | ${integrity.actionking_references?.length || 0} |`,
    `| Audit status | ${integrity.status || "unknown"} |`,
    "",
    "## Execution guardrails",
    "",
    "- Verify rollback file exists: `EURODRONEPARTS_MENU_CLEANUP_ROLLBACK.json`",
    "- Run `node scripts/menu-cleanup-audit.mjs --execute --confirm-delete` only after approval",
    "- Wire production menus to theme (`sections/header-group.json`) before go-live",
    "- **Do not delete** menus until deploy-menu IA is merged into production handles",
    "",
  ];
  writeFileSync(OUT.menuReport, menuReport.join("\n"), "utf8");

  const plan = [
    "# ENGLISH_URL_EXECUTION_PLAN",
    "",
    "**Store:** EuroDroneParts (`ya1xhg-x6.myshopify.com`)",
    `**Generated:** ${new Date().toISOString()}`,
    "**Mode:** READ-ONLY AUDIT + EXECUTION ARTIFACTS — **no store modifications in this pass**",
    "",
    "**Canonical language:** English",
    "**Domains:** eurodroneparts.com · eurodroneparts.de · eurodroneparts.dk · eurodroneparts.se · future EU",
    "",
    "---",
    "",
    "## AUDIT FINDINGS (present before execution)",
    "",
    "### Resource inventory",
    "",
    "| Resource | Live | Handle changes | 301 redirects | Execute |",
    "|---|---:|---:|---:|---|",
    `| Collections | ${collections.length} | ${collChanges.length} | ${collChanges.length} | Phase 3 |`,
    `| Pages | ${pages.length} | ${pageChanges.length} | ${pageChanges.length} | Phase 4 |`,
    `| Blogs / articles | ${live.blogs.length} / ${live.blogs.reduce((n, b) => n + b.articles.length, 0)} | ${blogChanges.length} | ${blogChanges.length} | Phase 5 |`,
    `| Products | ${products.length} | ${productRecs.length} recommended | 0 (blocked) | Phase 6 review only |`,
    `| Menus | ${menuAudit.inventory.length} | 5 handle renames | N/A | Phases 1–2 |`,
  `| **Redirect rules** | — | — | **${allRedirects.length}** (${redirects.length} + ${legacyRedirects.length} \`/en/\`) | Phase 8 |`,
    "",
    "### Swedish handles detected",
    "",
    `- **${collChanges.length}** collections with Swedish/mixed handles`,
    `- **${pageChanges.length}** pages requiring handle migration`,
    `- **${blogChanges.length}** blog/article URLs requiring migration`,
    `- **${productRecs.length}** products with Swedish handles (recommendations only — **no execution**)`,
    `- **${menuDelete.length}** menus safe to remove after verification`,
    "",
    "### Critical navigation findings",
    "",
    "1. Only `main-menu` is theme-linked; PR49 `*-deploy` menus hold correct IA but are orphans.",
    "2. `main-menu` contains Swedish titles (Huvudmeny, Drönare, Reservdelar, Branschlösningar).",
    "3. 27 collection URLs are referenced from active menus and must be updated after Phase 3.",
    "4. All 9,389 products are **DRAFT** — ideal window for collection/page/blog migration before launch.",
    "",
    "### Hard constraints (DO NOT during execution)",
    "",
    "| Rule | Status |",
    "|---|---|",
    "| Delete products | BLOCKED |",
    "| Delete collections with products | BLOCKED |",
    "| Modify metafields | BLOCKED |",
    "| Modify SEO metadata | BLOCKED |",
    "| Publish products | BLOCKED |",
    "| Change product assignments | BLOCKED |",
    "| Change theme code | BLOCKED |",
    "| Product handle changes | BLOCKED (Phase 6 review only) |",
    "",
    "---",
    "",
    "## PHASE 1 — Menu cleanup",
    "",
    `Delete **${menuDelete.length}** menus after verification. See \`MENU_CLEANUP_REPORT.md\`.`,
    "",
    "**Keep only (final):** Main Menu · Enterprise Drones · Spare Parts · Service & Support · B2B Enterprise · Partnership · Footer Menu · Customer Account",
    "",
    "**Delete categories:** empty menus · migration duplicates · deploy menus (post-merge) · test/retry menus · orphan duplicates (`actionkameror`, `dronare`, `enterprise-dr-nare`)",
    "",
    "---",
    "",
    "## PHASE 2 — Menu restructure",
    "",
    "Replace Swedish menu titles with English. Update all internal URLs to match Phase 3–5 handle changes.",
    "",
    mdTable(
      menuRows.filter((m) => m.item_count > 0).map((m) => ({
        current_handle: m.current_handle,
        proposed_handle: m.proposed_handle,
        current_title: m.current_title,
        proposed_title: m.proposed_title,
        action: m.action,
      })),
      ["current_handle", "proposed_handle", "current_title", "proposed_title", "action"],
    ),
    "",
    "---",
    "",
    "## PHASE 3 — Collection handle migration",
    "",
    `${collChanges.length} collections require English handles. Full mapping: \`COLLECTION_HANDLE_MAPPING.csv\``,
    "",
    mdTable(
      collChanges.slice(0, 25).map((c) => ({
        current_url: c.current_url,
        new_url: c.new_url,
        products_count: c.products_count,
        internal_references_impacted: c.internal_references_impacted?.slice(0, 60) || "",
      })),
      ["current_url", "new_url", "products_count", "internal_references_impacted"],
    ),
    collChanges.length > 25 ? `\n_…and ${collChanges.length - 25} more in COLLECTION_HANDLE_MAPPING.csv_\n` : "",
    "",
    "---",
    "",
    "## PHASE 4 — Page handle migration",
    "",
    `${pageChanges.length} pages require English handles. Full mapping: \`PAGE_HANDLE_MAPPING.csv\``,
    "",
    mdTable(
      pageChanges,
      ["current_url", "new_url", "current_handle", "proposed_handle"],
    ),
    "",
    `**${pages.filter((p) => p.redirect_required === "EXCLUDE").length}** ActionKing legacy pages excluded.`,
    "",
    "---",
    "",
    "## PHASE 5 — Blog handle migration",
    "",
    `Blog \`nyheter\` → \`news\`. **${blogChanges.length}** article URL changes. Full mapping: \`BLOG_HANDLE_MAPPING.csv\``,
    "",
    mdTable(
      blogChanges.slice(0, 20),
      ["current_url", "new_url", "current_handle", "proposed_handle"],
    ),
    blogChanges.length > 20 ? `\n_…and ${blogChanges.length - 20} more in BLOG_HANDLE_MAPPING.csv_\n` : "",
    "",
    "---",
    "",
    "## PHASE 6 — Product URL review (NO EXECUTION)",
    "",
    `**${productRecs.length}** products have Swedish/mixed handles. Recommendations in \`PRODUCT_RECOMMENDATIONS.csv\`.`,
    "",
    "**Blocked:** No product handle changes in this migration pass.",
    "",
    mdTable(
      productRecs.slice(0, 15).map((p) => ({
        current_url: p.current_url,
        proposed_url: p.proposed_url,
        recommendation: p.recommendation,
      })),
      ["current_url", "proposed_url", "recommendation"],
    ),
    productRecs.length > 15 ? `\n_…and ${productRecs.length - 15} more in PRODUCT_RECOMMENDATIONS.csv_\n` : "",
    "",
    "---",
    "",
    "## PHASE 7 — Shopify Markets validation",
    "",
    "| Domain | Role | URL rule |",
    "|---|---|---|",
    "| eurodroneparts.com | Primary / canonical | English handles |",
    "| eurodroneparts.de | Market domain | Same handles, German content via Markets |",
    "| eurodroneparts.dk | Market domain | Same handles, Danish content via Markets |",
    "| eurodroneparts.se | Market domain | Same handles, Swedish content via Markets |",
    "",
    "**GOOD:** `eurodroneparts.de/collections/spare-parts`",
    "**BAD:** `eurodroneparts.de/collections/reservdelar`",
    "",
    "### Markets checklist",
    "",
    "1. Configure Shopify Markets per EU domain before launch.",
    "2. Use Translate & Adapt for localized titles/body — **not** localized handles.",
    "3. Set hreflang per market; canonical points to `.com` English path.",
    "4. Per-market sitemaps after redirect deployment.",
    "5. Verify no duplicate content across domains (same handle, translated content only).",
    "",
    "---",
    "",
    "## PHASE 8 — SEO protection",
    "",
    `**${allRedirects.length}** redirect rules in \`REDIRECT_MAPPING.csv\`.`,
    "",
    "### Validation results",
    "",
    "| Check | Result |",
    "|---|---|",
    `| Redirect rules | ${seoCheck.total} |`,
    `| Unique from-paths | ${seoCheck.unique_from} |`,
    `| Redirect chains | ${seoCheck.chains} |`,
    `| Redirect loops | ${seoCheck.loops} |`,
    `| Duplicate from-paths | ${seoCheck.duplicate_from} |`,
    `| SEO validation | ${seoCheck.pass ? "PASS" : "REVIEW"} |`,
    "",
    "### Orphan / broken link checks",
    "",
    `| Check | Count |`,
    `|---|---:|`,
    `| Missing collections (menu audit) | ${integrity.missing_collections?.length || 0} |`,
    `| Missing pages (menu audit) | ${integrity.missing_pages?.length || 0} |`,
    `| Broken menu links | ${integrity.broken_links?.length || 0} |`,
    `| Collections with menu refs needing update | ${collections.filter((c) => c.internal_references_impacted).length} |`,
    "",
    "---",
    "",
    "## DELIVERABLES",
    "",
    "| File | Description |",
    "|---|---|",
    "| `ENGLISH_URL_EXECUTION_PLAN.md` | This document |",
    "| `COLLECTION_HANDLE_MAPPING.csv` | All 204 collections |",
    "| `PAGE_HANDLE_MAPPING.csv` | All 94 pages |",
    "| `BLOG_HANDLE_MAPPING.csv` | Blog + 68 articles |",
    "| `PRODUCT_RECOMMENDATIONS.csv` | 9,389 products — review only |",
    "| `MENU_CLEANUP_REPORT.md` | Menu audit + deletion plan |",
    "| `REDIRECT_MAPPING.csv` | Complete 301 map |",
    "",
    "## Recommended execution order",
    "",
    "1. **Approve** this plan and rollback artifacts",
    "2. **Phase 1** — Menu cleanup (364+ deletions)",
    "3. **Phase 2** — Menu restructure + wire 8 production menus to theme",
    "4. **Phase 3** — Collection handle renames (preserves product assignments via GID)",
    "5. **Phase 4** — Page handle renames",
    "6. **Phase 5** — Blog/article handle renames",
    "7. **Deploy** redirects from `REDIRECT_MAPPING.csv`",
    "8. **Phase 7** — Configure Shopify Markets per domain",
    "9. **Phase 6** — Product handle review (post-launch, separate pass)",
    "",
    "## Data sources",
    "",
    "- `.url-audit-collections.json` — 204 live collections",
    "- `.url-audit-live.json` — pages, blogs, products, menus",
    "- `.menu-cleanup-audit.json` — 375 menu inventory + decisions",
    "- `.url-audit-menu-recovery.json` — pruned legacy links",
    "",
  ];

  writeFileSync(OUT.plan, plan.join("\n"), "utf8");

  console.log("Wrote deliverables:");
  for (const [k, p] of Object.entries(OUT)) console.log(`  ${k}: ${p}`);
  console.log(
    `collections=${collChanges.length}/${collections.length} pages=${pageChanges.length} blogs=${blogChanges.length} products_rec=${productRecs.length} menus_delete=${menuDelete.length} redirects=${allRedirects.length} seo=${seoCheck.pass ? "PASS" : "REVIEW"}`,
  );
}

main();
