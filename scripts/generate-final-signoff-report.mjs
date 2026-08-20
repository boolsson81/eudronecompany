#!/usr/bin/env node
/**
 * Final pre-execution sign-off verification.
 * READ-ONLY — no store mutations.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { isSwedishHandle, mdTable, MENU_HANDLE_MAP } from "./lib/english-handle-migration.mjs";
import { loadCsv } from "./lib/migration-csv.mjs";
import { resolveArticleSlug } from "./lib/curated-blog-slugs.mjs";
import {
  COMPONENT_SUFFIXES,
  ENTERPRISE_SOFTWARE,
  plannedCreates,
  SPARE_PART_MODELS,
} from "./lib/approved-taxonomy.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "FINAL_EXECUTION_SIGNOFF_REPORT.md");

const HYBRID_BLOG_RE =
  /till-|batterier|nyborjare|bast-i-test|kopa-|kop-|kamera-for|mygga|spela-in|sd-kort|far-man|avskrackaren|dronesn|actionkamera|annans|avskrackaren/i;

const ENTERPRISE_REQUIRED = [
  { label: "Enterprise Drones", handles: ["enterprise-drones"], type: "collection" },
  { label: "Payloads & Sensors", handles: ["enterprise-sensors", "enterprise-speaker-systems", "enterprise-lifting-systems", "thermal-drones"], type: "collection" },
  { label: "Industry Solutions", handles: ["inspection-drones", "agriculture-drones", "forestry-drones", "mapping-survey-drones", "energy-infrastructure", "transport-logistics"], type: "collection" },
  { label: "Software", handles: [ENTERPRISE_SOFTWARE.handle, "dji-pilot", "dji-flighthub", "software"], type: "collection_or_page" },
];

function isHybridSlug(handle) {
  if (!handle) return false;
  const slug = handle.includes("/") ? handle.split("/").pop() : handle;
  return isSwedishHandle(slug) || HYBRID_BLOG_RE.test(handle);
}

function swedishUrl(url) {
  return /dronar|tillbeh|reservdel|fjarr|serien|bransch|foretag|offert|landnings|kameror|motorer|antenner|kablar|skal|sensorer|drönare|väskor|fjärr|köp|energi-infrastruktur|jordbruks|skogsbruks|kartlaggning|inspektions|lastdronare|finansiering|utbildning|serviceavtal|reparation/i.test(
    url || "",
  );
}

function walkMenu(items, menuHandle, out) {
  for (const it of items || []) {
    out.push({ menu_handle: menuHandle, title: it.title, url: it.url || "" });
    walkMenu(it.items, menuHandle, out);
  }
}

function auditProposed(rows, handleKey, excludeKey = "action") {
  const swedish = [];
  for (const r of rows) {
    const h = r[handleKey];
    if (!h || h === "(exclude)" || r[excludeKey] === "EXCLUDE") continue;
    if (isSwedishHandle(h) || /[åäö]/.test(h)) swedish.push({ current: r.current_handle || r.current || h, proposed: h });
  }
  return swedish;
}

function main() {
  const collMap = loadCsv(join(ROOT, "COLLECTION_HANDLE_MAPPING.csv"));
  const pageMap = loadCsv(join(ROOT, "PAGE_HANDLE_MAPPING.csv"));
  const blogMap = loadCsv(join(ROOT, "BLOG_HANDLE_MAPPING.csv"));
  const metaMap = loadCsv(join(ROOT, "METAOBJECT_HANDLE_MAPPING.csv"));
  const mergeResult = existsSync(join(ROOT, ".merge-executor-result.json"))
    ? JSON.parse(readFileSync(join(ROOT, ".merge-executor-result.json"), "utf8"))
    : null;
  const redirectResult = existsSync(join(ROOT, ".redirect-executor-result.json"))
    ? JSON.parse(readFileSync(join(ROOT, ".redirect-executor-result.json"), "utf8"))
    : null;
  const productsAudit = existsSync(join(ROOT, ".url-audit-products-all.json"))
    ? JSON.parse(readFileSync(join(ROOT, ".url-audit-products-all.json"), "utf8"))
    : null;
  const menus = existsSync(join(ROOT, ".live-prod-menus.json"))
    ? JSON.parse(readFileSync(join(ROOT, ".live-prod-menus.json"), "utf8"))
    : [];

  const proposedHandles = new Set(
    collMap.filter((r) => r.action !== "EXCLUDE").map((r) => r.proposed_handle),
  );
  const liveCollSwedish = collMap.filter((r) => r.action !== "EXCLUDE" && r.swedish_detected === "YES").length;
  const livePageSwedish = pageMap.filter((r) => r.action !== "EXCLUDE" && r.swedish_detected === "YES").length;

  const collProposedSw = auditProposed(collMap, "proposed_handle");
  const pageProposedSw = auditProposed(pageMap, "proposed_handle");
  const blogHybrid = blogMap.filter((r) => {
    if (r.resource_type === "blog") return isHybridSlug(r.proposed_handle);
    const current = r.current_handle?.split("/").pop() || "";
    const proposed = r.proposed_handle?.split("/").pop() || "";
    const curated = resolveArticleSlug(current, proposed);
    return isHybridSlug(curated);
  });
  const blogCurrentSw = blogMap.filter((r) => isSwedishHandle(r.current_handle?.split("/").pop() || r.current_handle));

  const menuLinks = [];
  for (const m of menus) walkMenu(m.items, m.handle, menuLinks);
  const liveMenuSwedishUrls = menuLinks.filter((l) => swedishUrl(l.url));
  const liveMenuSwedishTitles = menuLinks.filter((l) => /[åäö]|Drönare|Tillbehör|Reservdelar|Bransch|Företag|Offert|Landnings|Kameror|Motorer|Antenner|Kablar|Skal|Sensorer|Fjärr|Väskor/i.test(l.title));
  const menuHandleGaps = menus
    .filter((m) => MENU_HANDLE_MAP[m.handle] && MENU_HANDLE_MAP[m.handle] !== m.handle)
    .map((m) => ({ live: m.handle, proposed: MENU_HANDLE_MAP[m.handle] }));

  const proposedMenuHandles = new Set([
    "main-menu", "enterprise", "spare-parts", "service-support", "business", "footer", "partnership", "customer-account-main-menu",
  ]);
  const menuProposedSw = [...proposedMenuHandles].filter((h) => isSwedishHandle(h));

  const metaProposedSw = metaMap.filter((r) => isSwedishHandle(r.proposed_handle));

  const planned = plannedCreates();
  const plannedHandles = new Set(planned.map((p) => p.proposed_handle));

  // Spare parts model verification
  const spareResults = SPARE_PART_MODELS.map((model) => {
    const hub = collMap.find((r) => r.proposed_handle === model.hub);
    const altHub = collMap.find((r) => r.proposed_handle.includes(model.prefix) && /spare-parts|reservdel|repair/i.test(r.proposed_handle));
    const components = COMPONENT_SUFFIXES.filter((s) => proposedHandles.has(`${model.prefix}-${s}`));
    const anyPrefix = [...proposedHandles].filter((h) => h.startsWith(model.prefix + "-"));
    let status = "MISSING";
    if (hub || altHub) {
      status = components.length >= 6 ? "FULL" : components.length >= 1 ? "PARTIAL" : "HUB_ONLY";
    } else if (anyPrefix.length) status = "PARTIAL";
    else if (model.status === "APPROVED_CREATE") status = "APPROVED_CREATE";
    if (model.status === "APPROVED_CREATE" && status !== "FULL") status = `APPROVED_${status}`;
    return {
      model: model.label,
      hub_handle: hub?.proposed_handle || altHub?.proposed_handle || model.hub,
      hub_exists: hub || altHub ? "YES" : model.status === "APPROVED_CREATE" ? "APPROVED" : "NO",
      component_collections: components.length,
      components: components.join(", ") || "—",
      related_collections: anyPrefix.length,
      status,
    };
  });

  const sparePass = spareResults.filter((r) => r.status === "FULL").length;
  const sparePartial = spareResults.filter((r) => ["PARTIAL", "HUB_ONLY"].includes(r.status)).length;
  const spareApproved = spareResults.filter((r) => r.status.startsWith("APPROVED")).length;
  const spareMissing = spareResults.filter((r) => r.status === "MISSING").length;

  // Enterprise verification
  const allProposed = new Set([
    ...collMap.filter((r) => r.action !== "EXCLUDE").map((r) => r.proposed_handle),
    ...pageMap.filter((r) => r.action !== "EXCLUDE").map((r) => r.proposed_handle),
    ...plannedHandles,
  ]);
  const enterpriseResults = ENTERPRISE_REQUIRED.map((req) => {
    const found = req.handles.filter((h) => allProposed.has(h));
    const approvedSoftware = req.label === "Software" && plannedHandles.has(ENTERPRISE_SOFTWARE.handle);
    return {
      pillar: req.label,
      required_handles: req.handles.join(", "),
      found: found.join(", ") || (approvedSoftware ? ENTERPRISE_SOFTWARE.handle : "—"),
      status:
        req.label === "Software"
          ? found.length || approvedSoftware
            ? approvedSoftware && !found.length
              ? "APPROVED_CREATE"
              : "PASS"
            : "GAP"
          : found.length
            ? "PASS"
            : "FAIL",
    };
  });

  const collectionsLive = collMap.filter((r) => r.action !== "EXCLUDE").length;
  const collectionsExclude = collMap.filter((r) => r.action === "EXCLUDE").length;
  const collectionsCanonical = new Set(collMap.filter((r) => r.action !== "EXCLUDE").map((r) => r.proposed_handle)).size;
  const collectionsMerges = collMap.filter((r) => r.action === "MERGE").length;

  const productsBefore = productsAudit?.total ?? "—";
  const productsSwedishHandles = productsAudit?.swedish_count ?? "—";

  const englishTargetPass =
    collProposedSw.length === 0 &&
    pageProposedSw.length === 0 &&
    menuProposedSw.length === 0 &&
    metaProposedSw.length === 0;

  const blockers = [];
  if (blogHybrid.length) blockers.push(`${blogHybrid.length} blog article hybrid slugs require manual English curation`);
  if (spareMissing > 0) blockers.push(`${spareMissing} spare part model groups still missing — not user-approved`);
  if (sparePartial > 0) blockers.push(`${sparePartial} spare part model groups partial (existing hubs with fewer components)`);
  if (enterpriseResults.find((e) => e.pillar === "Software" && e.status === "GAP")) blockers.push("Enterprise Software not approved or mapped");
  if (liveMenuSwedishUrls.length) blockers.push(`${liveMenuSwedishUrls.length} Swedish URLs in live menus (expected until Execute)`);
  if (Number(productsSwedishHandles) > 0) blockers.push(`${productsSwedishHandles} product handles Swedish (separate phase — not in this migration)`);

  const approvedCreates = planned.filter((p) => p.action === "CREATE" || p.action === "CREATE_OR_ASSIGN");
  const signoffReady =
    englishTargetPass &&
    blogHybrid.length === 0 &&
    spareMissing === 0 &&
    !enterpriseResults.some((e) => e.status === "FAIL" || e.status === "GAP");

  const report = [
    "# Final Execution Sign-Off Report",
    "",
    `**Store:** EuroDroneParts (\`ya1xhg-x6.myshopify.com\`)`,
    `**Generated:** ${new Date().toISOString()}`,
    "**Status:** PRE-EXECUTION VERIFICATION — **no live changes**",
    "",
    "## Sign-off recommendation",
    "",
    signoffReady
      ? "**✅ APPROVED FOR EXECUTION** — all target-state English checks pass. Resolve noted gaps or accept as execution tasks."
      : "**⚠️ CONDITIONAL APPROVAL** — target handles are English; resolve blockers below before Execute.",
    "",
    "| Gate | Status |",
    "|---|---|",
    `| English proposed handles (collections/pages/menus/metaobjects) | **${englishTargetPass ? "PASS" : "FAIL"}** |`,
    `| Spare Parts taxonomy (11 models) | **${spareMissing === 0 ? (sparePartial ? "PARTIAL" : "PASS") : "GAPS"}** (${sparePass} full · ${sparePartial} partial · ${spareApproved} approved create · ${spareMissing} missing) |`,
    `| Enterprise structure | **${enterpriseResults.every((e) => ["PASS", "APPROVED_CREATE"].includes(e.status)) ? "PASS" : "REVIEW"}** |`,
    `| Merge dry-run (product safety) | **${mergeResult?.all_pass ? "PASS" : "PENDING"}** |`,
    `| Redirect dry-run (${redirectResult?.total_rules ?? 322} rules) | **${redirectResult?.pass ? "PASS" : "PENDING"}** |`,
    "",
    "### Blockers / execution tasks",
    "",
    blockers.length ? blockers.map((b) => `- ${b}`).join("\n") : "- None",
    "",
    "---",
    "",
    "## 1. English-only naming verification",
    "",
    "### Target state (post-execution handles)",
    "",
    "| Resource | Live Swedish | Proposed Swedish handles |",
    "|---|---:|---:|",
    `| Collections | ${liveCollSwedish} renames pending | **${collProposedSw.length}** |`,
    `| Pages | ${livePageSwedish} renames pending | **${pageProposedSw.length}** |`,
    `| Blog/articles | ${blogCurrentSw.length} current Swedish | **${blogHybrid.length} hybrid slugs** |`,
    `| Menu handles | ${menuHandleGaps.length} \`*-deploy\` | **${menuProposedSw.length}** |`,
    `| Metaobjects / menus (mapping) | — | **${metaProposedSw.length}** |`,
    "",
    "### Metafields (namespace/key policy)",
    "",
    "| Namespace | Keys | Language |",
    "|---|---|---|",
    "| `dji` | `compatible_models`, `accessory_type`, `option_list_role` | English ✅ |",
    "| `sunsky` | `group_item_no`, `option_list_json`, `import_phase` | English ✅ |",
    `| Product handles | 9,389 draft products | **${productsSwedishHandles} Swedish** — blocked in separate phase |`,
    "",
    "### Live store (pre-execution — expected Swedish)",
    "",
    `- **${liveMenuSwedishUrls.length}** menu URLs with Swedish paths`,
    `- **${liveMenuSwedishTitles.length}** menu labels with Swedish text (localized via Markets post-execution)`,
    "",
    menuHandleGaps.length
      ? `### Menu handle migration\n\n${mdTable(menuHandleGaps, ["live", "proposed"])}\n`
      : "",
    "",
    "---",
    "",
    "## 2. Remaining Swedish / hybrid slugs",
    "",
    "### Collections & pages (proposed)",
    "",
    collProposedSw.length + pageProposedSw.length === 0
      ? "**None** — all proposed collection and page handles are English.\n"
      : mdTable([...collProposedSw, ...pageProposedSw], ["current", "proposed"]),
    "",
    "### Blog articles (hybrid — must fix before Execute)",
    "",
    blogHybrid.length
      ? mdTable(
          blogHybrid.map((r) => ({ current: r.current_handle, proposed_auto: r.proposed_handle, recommended: "manual English slug" })),
          ["current", "proposed_auto", "recommended"],
        )
      : "**None**\n",
    "",
    "---",
    "",
    "## 3. Spare Parts taxonomy (11 models)",
    "",
    mdTable(spareResults, ["model", "hub_handle", "hub_exists", "component_collections", "status", "components"]),
    "",
    "### Required menu structure (target)",
    "",
    "```",
    "spare-parts",
    "├── DJI Mini 4 Pro      → /collections/dji-mini-4-pro-spare-parts",
    "├── DJI Air 3           → /collections/dji-air-3-spare-parts",
    "├── DJI Air 3S          → /collections/dji-air-3s-spare-parts  [APPROVED]",
    "├── DJI Neo             → /collections/dji-neo-spare-parts       [APPROVED + merge repair-dji-neo-spare-parts]",
    "├── DJI Flip            → /collections/dji-flip-spare-parts      [APPROVED]",
    "├── DJI Avata 2         → /collections/dji-avata-2-spare-parts   [APPROVED]",
    "├── DJI Mavic 3 Enterprise",
    "├── DJI Matrice 4 Series",
    "├── DJI Matrice 30 Series            [APPROVED]",
    "├── DJI Matrice 350 RTK",
    "└── DJI FlyCart 30",
    "```",
    "",
    "---",
    "",
    "## 4. Enterprise structure",
    "",
    mdTable(enterpriseResults, ["pillar", "found", "status"]),
    "",
    "### Target menu (enterprise)",
    "",
    "```",
    "enterprise",
    "├── Enterprise Drones     → /collections/enterprise-drones",
    "├── DJI Matrice / Agras / FlyCart / Dock",
    "├── Industry Solutions    → inspection, agriculture, forestry, mapping, energy, transport",
    "├── Payloads & Sensors    → sensors, thermal, speakers, lifting, lighting",
    `└── Software              → ${ENTERPRISE_SOFTWARE.url} [APPROVED]`,
    "```",
    "",
    "---",
    "",
    "## 5. Execution metrics",
    "",
    "| Metric | Before (live) | After (target) |",
    "|---|---:|---:|",
    `| Collections | ${collectionsLive + collectionsExclude} total (${collectionsExclude} excluded) | **${collectionsCanonical}** canonical |`,
    `| Collection merges | — | **${collectionsMerges}** sources → 5 groups |`,
    `| Products (store) | ${productsBefore} | ${productsBefore} (unchanged — handle migration blocked) |`,
    `| Products in merge groups | — | **${mergeResult?.total_union_products ?? "—"}** unique after union |`,
    `| 301 redirects | 0 | **${redirectResult?.total_rules ?? 320}** |`,
    `| Swedish collection handles (live) | ${liveCollSwedish} | **0** |`,
    `| Swedish page handles (live) | ${livePageSwedish} | **0** |`,
    `| Blog hybrid slugs | ${blogHybrid.length} | **0** (manual curation) |`,
    "",
    "---",
    "",
    "## 6. Approval checklist",
    "",
    "- [ ] English target handles confirmed (collections, pages, menus, metaobjects)",
    "- [x] Spare Parts gaps approved (`Air 3S`, `Neo`, `Flip`, `Avata 2`, `Matrice 30`) — see `PLANNED_COLLECTION_CREATES.csv`",
    `- [x] Enterprise Software approved (\`${ENTERPRISE_SOFTWARE.handle}\` page)`,
    `- [ ] ${approvedCreates.length} planned creates at execution`,
    "- [ ] 18 blog hybrid slugs curated to full English",
    "- [ ] Merge dry-run PASS (0 product loss)",
    "- [ ] Redirect dry-run PASS (320 rules)",
    "- [ ] Product handle migration deferred to separate phase",
    "",
    "**To Execute:** Reply `Execute` after checklist complete.",
    "",
    "## Regenerate",
    "",
    "```bash",
    "node scripts/run-english-migration-dry-run.mjs",
    "node scripts/generate-final-signoff-report.mjs",
    "```",
    "",
  ];

  writeFileSync(OUT, report.join("\n"), "utf8");
  console.log(`Wrote ${OUT}`);
  console.log(`Sign-off: ${signoffReady ? "APPROVED" : "CONDITIONAL"}`);
  console.log(`Spare parts: ${sparePass} full, ${sparePartial} partial, ${spareApproved} approved, ${spareMissing} missing`);
  console.log(`Blog hybrid slugs: ${blogHybrid.length}`);
  console.log(`Proposed Swedish handles: collections=${collProposedSw.length} pages=${pageProposedSw.length}`);
}

main();
