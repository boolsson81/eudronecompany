#!/usr/bin/env node
/**
 * Pre-execution approval pack for English-first EuroDroneParts architecture.
 * READ-ONLY — no Shopify store mutations.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  isLegacyExcludePage,
  isSwedishHandle,
  MENU_HANDLE_MAP,
  proposeEnglishHandle,
  writeCsv,
} from "./lib/english-handle-migration.mjs";
import {
  APPROVED_MERGE_ADDITIONS,
  COMPONENT_SUFFIXES,
  ENTERPRISE_SOFTWARE,
  plannedCreates,
  SPARE_PART_MODELS,
  buildSparePartsMenuChildren,
} from "./lib/approved-taxonomy.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const PILLARS = [
  "Drones",
  "Enterprise",
  "Spare Parts",
  "Accessories",
  "Payloads & Sensors",
  "Brands",
  "Support",
  "Business",
];

const MERGE_INTO = {
  "drone-accessories-drone": "drone-accessories",
  "drone-accessories-buy": "drone-accessories",
  "filters-for-drones": "drone-filters",
  "filter-drones-lins": "drone-filters",
  dji: "dji-drones",
  "dij-air-3-series": "dji-air-3-series",
  "dji-matrice-350-rtk-rtk": "dji-matrice-350-rtk",
  "enterprise-dr-nare": "enterprise-drones",
  "alla-produkter": "all-products",
  ...APPROVED_MERGE_ADDITIONS,
};

const CANONICAL_OVERRIDES = {
  "dji-dronare": "dji-drones",
  "dji-mini-4-serien": "dji-mini-4-series",
  "dji-air-serien": "dji-air-series",
  "dji-mavic-serien": "dji-mavic-series",
  "dji-avata-serien": "dji-avata-series",
  "dji-flip-dronare": "dji-flip-drones",
  "enterprise-dronare": "enterprise-drones",
  "dronartillbehor-kop": "drone-accessories",
  "dji-dronar-reservdelar": "dji-drone-spare-parts",
  "inspektionsdronare": "inspection-drones",
  "jordbruksdronare": "agriculture-drones",
  "skogsbruksdronare": "forestry-drones",
  "kartlaggnings-and-matdronare": "mapping-survey-drones",
  "last-and-transportdronare": "cargo-transport-drones",
  "energi-infrastruktur": "energy-infrastructure",
  "transport-logistik": "transport-logistics",
  "enterprise-sensorer": "enterprise-sensors",
  "enterprise-belysning": "enterprise-lighting",
  "enterprise-hogtalarsystem": "enterprise-speaker-systems",
  "enterprise-lyftsystem": "enterprise-lifting-systems",
  "bandverktyg": "precision-tools",
  "belysning-for-drones": "drone-lighting",
  "fjarrkontroll-dronare": "drone-remote-controls",
  "dronare-propeller-tillbehor": "drone-propeller-accessories",
  "dronarryggsack-vaskor": "drone-backpack-bags",
  "filter-till-dronare": "drone-filters",
  "tillbehorskablar-drones": "accessory-cables-drones",
  "dronarelektronik-flight-components": "drone-electronics-flight-components",
  "reparera-precisionsverktyg-elektronik": "repair-precision-tools",
  "kapor-for-drones": "drone-covers",
  "protection-drones": "drone-protection",
  "waterproof-kameraskydd": "waterproof-camera-protection",
  "multiverktyg-friluftsliv": "outdoor-multi-tools",
  "skruvmejsel-set": "screwdriver-sets",
  "vendors-q-sunnylife": "sunnylife",
  "gopro-accessories-vendors": "gopro-accessories",
  "cleaning-products-actionking": "drone-cleaning-products",
  "dji-matrice-serien": "dji-matrice-series",
  "dji-flycart-serien": "dji-flycart-series",
  "dji-agras-dronare": "dji-agras-drones",
  "dji-mavic-serien-enterprise": "dji-mavic-series-enterprise",
  "dji-mini-4-pro-reservdelar": "dji-mini-4-pro-spare-parts",
  "dji-air-3-reservdelar": "dji-air-3-spare-parts",
  "dji-mini-4-pro-propellrar": "dji-mini-4-pro-propellers",
  "dji-mini-4-pro-batterier": "dji-mini-4-pro-batteries",
  "dji-mini-4-pro-motorer": "dji-mini-4-pro-motors",
  "dji-mini-4-pro-armar": "dji-mini-4-pro-arms",
  "dji-mini-4-pro-kameror": "dji-mini-4-pro-cameras",
  "dji-mini-4-pro-skal": "dji-mini-4-pro-shell",
  "dji-mini-4-pro-landningsstall": "dji-mini-4-pro-landing-gear",
  "dji-mini-4-pro-kablar": "dji-mini-4-pro-cables",
  "dji-mini-4-pro-antenner": "dji-mini-4-pro-antennas",
  "dji-mini-4-pro-sensorer": "dji-mini-4-pro-sensors",
  "dji-mini-4-pro-tillbehor": "dji-mini-4-pro-accessories",
  "dji-air-3-propellrar": "dji-air-3-propellers",
  "dji-air-3-batterier": "dji-air-3-batteries",
  "dji-air-3-motorer": "dji-air-3-motors",
  "dji-air-3-armar": "dji-air-3-arms",
  "dji-air-3-kameror": "dji-air-3-cameras",
  "dji-air-3-skal": "dji-air-3-shell",
  "dji-air-3-landningsstall": "dji-air-3-landing-gear",
  "dji-air-3-kablar": "dji-air-3-cables",
  "dji-air-3-antenner": "dji-air-3-antennas",
  "dji-air-3-sensorer": "dji-air-3-sensors",
  "dji-air-3-tillbehor": "dji-air-3-accessories",
  "bransch-energi-infrastruktur": "industry-energy-infrastructure",
  "bransch-vindkraft": "industry-wind-power",
  "bransch-solparker": "industry-solar-parks",
  "bransch-kraftnat": "industry-power-grid",
  "bransch-skogsbruk": "industry-forestry",
  "bransch-jordbruk": "industry-agriculture",
  "bransch-kartlaggning": "industry-mapping",
  "bransch-bygg-anlaggning": "industry-construction",
  "bransch-sakerhet-raddning": "industry-security-rescue",
  "bransch-transport-logistik": "industry-transport-logistics",
  foretagskonto: "business-account",
  offertforfragan: "request-a-quote",
  finansiering: "financing",
  serviceavtal: "service-agreement",
  supportavtal: "support-agreement",
  utbildning: "training",
  partnerprogram: "partner-program",
};

const PLANNED_METAOBJECT_TYPES = [
  { current_type: "dji_drone_model", proposed_type: "dji-drone-model", action: "KEEP", note: "Planned — English canonical (architecture spec)" },
];

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function proposeCollectionHandle(handle) {
  if (CANONICAL_OVERRIDES[handle]) return CANONICAL_OVERRIDES[handle];
  if (MERGE_INTO[handle]) return proposeCollectionHandle(MERGE_INTO[handle]);
  return proposeEnglishHandle(handle);
}

function classifyByHandle(h) {
  if (/^industry-/.test(h)) return "Business";
  if (/^gopro|^insta360|polarpro|pgytech|sunnylife|nitecore|brdrc|amagisn|vendors-|master-airscrew/i.test(h))
    return "Brands";
  if (
    /enterprise-sensor|enterprise-lighting|enterprise-speaker|enterprise-lifting|zenmuse|thermal|payload|hogtalar|lyftsystem|varmekamera/i.test(h)
  )
    return "Payloads & Sensors";
  if (
    /-(propellers|motors|antennas|arms|shell|cables|cameras|batteries|landing-gear|sensors|gimbal|kablar|kameror|motorer|antenner|armar|skal|landnings)/i.test(h) ||
    /repair|precision-tools|reparera|bandverktyg|skruvmejsel|spare-parts/i.test(h)
  )
    return "Spare Parts";
  if (
    /accessories|filter|bag|case|backpack|remote|propeller|battery|tripod|mount|protection|cover|lighting|belysning|tillbeh|charger|cables|memory-card|storage|cleaning/i.test(h) &&
    !/enterprise-dock|matrice-4-rtk|agras/i.test(h)
  )
    return "Accessories";
  if (
    /enterprise|matrice|agras|flycart|dock|mavic-3-enterprise|mavic-series-enterprise|inspection|agriculture|forestry|mapping|cargo|transport-logistics|energy-infrastructure|industry-|inspire|phantom|legacy/i.test(h)
  )
    return "Enterprise";
  if (/dji-|hoverair|consumer|drones|drone-|avata|mavic|mini|air-|neo|flip|fpv/i.test(h)) return "Drones";
  if (/all-products|shop-all/i.test(h)) return "Drones";
  return "Accessories";
}

function classifyPage(handle) {
  if (/^industry-/.test(handle)) return "Business";
  if (/business-account|request-a-quote|leasing|financing|service-agreement|support-agreement|training|partner-program|partner-with-us/i.test(handle))
    return "Business";
  if (/^dji-.*series|dji-drones|dji-flip|dji-neo|hoverair|drones-/.test(handle)) return "Drones";
  if (/accessories|filter|propeller|tripod|gimbal|battery|memory|protection|kablar|ljud|gopro|osmo/i.test(handle))
    return "Accessories";
  if (/service|support|repair|calibration|financing|training|warranty|rma|quote|contact|feedback|faq|troubleshoot|firmware/i.test(handle))
    return "Support";
  if (/vara-varumarken|nitecore|brands/i.test(handle)) return "Brands";
  return "Support";
}

function buildMenuTrees() {
  const url = (h, type = "collection") => `/${type === "page" ? "pages" : "collections"}/${h}`;

  return [
    {
      pillar: "Drones",
      menu: "main-menu",
      label: "Drones",
      children: [
        { label: "DJI Mini Series", url: url("dji-mini-4-series"), handle: "dji-mini-4-series" },
        { label: "DJI Air Series", url: url("dji-air-series"), handle: "dji-air-series" },
        { label: "DJI Mavic Series", url: url("dji-mavic-series"), handle: "dji-mavic-series" },
        { label: "DJI Avata / FPV", url: url("dji-avata-series"), handle: "dji-avata-series" },
        { label: "DJI Neo", url: url("dji-neo"), handle: "dji-neo" },
        { label: "DJI Flip", url: url("dji-flip-drones"), handle: "dji-flip-drones" },
        { label: "HoverAir", url: url("hoverair-drones"), handle: "hoverair-drones" },
        { label: "All Consumer Drones", url: url("dji-drones"), handle: "dji-drones" },
        {
          label: "Legacy DJI",
          children: [
            { label: "Phantom", url: url("dji-phantom-3-se"), handle: "dji-phantom-3-se" },
            { label: "Air 2 / Air 2S", url: url("dji-air-2-series"), handle: "dji-air-2-series" },
            { label: "Mini 2", url: url("accessories-dji-mini-2-2-se"), handle: "accessories-dji-mini-2-2-se" },
            { label: "Mavic 2", url: url("dji-mavic-2-series"), handle: "dji-mavic-2-series" },
          ],
        },
      ],
    },
    {
      pillar: "Enterprise",
      menu: "enterprise",
      label: "Enterprise",
      children: [
        { label: "Enterprise Overview", url: url("enterprise-drones"), handle: "enterprise-drones" },
        { label: "DJI Matrice", url: url("dji-matrice-series"), handle: "dji-matrice-series" },
        { label: "Mavic Enterprise", url: url("dji-mavic-series-enterprise"), handle: "dji-mavic-series-enterprise" },
        { label: "DJI Agras", url: url("dji-agras-drones"), handle: "dji-agras-drones" },
        { label: "FlyCart", url: url("dji-flycart-series"), handle: "dji-flycart-series" },
        { label: "DJI Dock", url: url("dji-dock-series"), handle: "dji-dock-series" },
        {
          label: "Industry Solutions",
          children: [
            { label: "Inspection", url: url("inspection-drones"), handle: "inspection-drones" },
            { label: "Agriculture", url: url("agriculture-drones"), handle: "agriculture-drones" },
            { label: "Forestry", url: url("forestry-drones"), handle: "forestry-drones" },
            { label: "Mapping & Survey", url: url("mapping-survey-drones"), handle: "mapping-survey-drones" },
            { label: "Energy & Infrastructure", url: url("energy-infrastructure"), handle: "energy-infrastructure" },
            { label: "Transport & Logistics", url: url("transport-logistics"), handle: "transport-logistics" },
          ],
        },
        {
          pillar: "Payloads & Sensors",
          label: "Payloads & Sensors",
          children: [
            { label: "Enterprise Sensors", url: url("enterprise-sensors"), handle: "enterprise-sensors" },
            { label: "Thermal Cameras", url: url("thermal-drones"), handle: "thermal-drones" },
            { label: "Speaker Systems", url: url("enterprise-speaker-systems"), handle: "enterprise-speaker-systems" },
            { label: "Lifting Systems", url: url("enterprise-lifting-systems"), handle: "enterprise-lifting-systems" },
            { label: "Enterprise Lighting", url: url("enterprise-lighting"), handle: "enterprise-lighting" },
          ],
        },
        {
          label: ENTERPRISE_SOFTWARE.label,
          url: ENTERPRISE_SOFTWARE.url,
          handle: ENTERPRISE_SOFTWARE.handle,
        },
      ],
    },
    {
      pillar: "Spare Parts",
      menu: "spare-parts",
      label: "Spare Parts",
      children: [
        ...buildSparePartsMenuChildren(url),
        { label: "Repair & Precision Tools", url: url("repair-precision-tools"), handle: "repair-precision-tools" },
        { label: "DJI Drone Spare Parts (hub)", url: url("dji-drone-spare-parts"), handle: "dji-drone-spare-parts" },
      ],
    },
    {
      pillar: "Accessories",
      menu: "main-menu",
      label: "Accessories",
      children: [
        { label: "Drone Filters", url: url("drone-filters"), handle: "drone-filters" },
        { label: "Propellers", url: url("drones-propellers-accessories"), handle: "drones-propellers-accessories" },
        { label: "Batteries", url: url("batteries"), handle: "batteries" },
        { label: "Bags & Cases", url: url("drone-backpack-bags"), handle: "drone-backpack-bags" },
        { label: "Remote Controls", url: url("drone-remote-controls"), handle: "drone-remote-controls" },
        { label: "Mounts & Tripods", url: url("camera-tripod-stand"), handle: "camera-tripod-stand" },
        { label: "Memory Cards & Storage", url: url("memory-card-storage"), handle: "memory-card-storage" },
        { label: "Drone Lighting", url: url("drone-lighting"), handle: "drone-lighting" },
      ],
    },
    {
      pillar: "Brands",
      menu: "main-menu",
      label: "Brands",
      children: [
        { label: "DJI", url: url("dji-drones"), handle: "dji-drones" },
        { label: "PolarPro", url: url("polarpro"), handle: "polarpro" },
        { label: "PGYTech", url: url("pgytech"), handle: "pgytech" },
        { label: "Sunnylife", url: url("sunnylife"), handle: "sunnylife" },
        { label: "GoPro", url: url("gopro-accessories"), handle: "gopro-accessories" },
        { label: "BRDRC", url: url("brdrc-accessories"), handle: "brdrc-accessories" },
      ],
    },
    {
      pillar: "Support",
      menu: "service-support",
      label: "Support",
      children: [
        { label: "Service & Support", url: url("service-support", "page"), handle: "service-support" },
        { label: "DJI Service", url: url("dji-service", "page"), handle: "dji-service" },
        { label: "Enterprise Service", url: url("dji-enterprise-service", "page"), handle: "dji-enterprise-service" },
        { label: "FlyCart Service", url: url("flycart-service", "page"), handle: "flycart-service" },
        { label: "Matrice Service", url: url("matrice-service", "page"), handle: "matrice-service" },
        { label: "RMA", url: url("rma", "page"), handle: "rma" },
        { label: "Repairs", url: url("repairs", "page"), handle: "repairs" },
        { label: "Troubleshooting", url: url("troubleshooting", "page"), handle: "troubleshooting" },
        { label: "Calibration", url: url("calibration", "page"), handle: "calibration" },
        { label: "Contact Us", url: url("contact-us", "page"), handle: "contact-us" },
        { label: "Terms of Sale", url: url("terms-of-sale", "page"), handle: "terms-of-sale" },
      ],
    },
    {
      pillar: "Business",
      menu: "business",
      label: "Business",
      children: [
        {
          label: "Industries",
          children: [
            { label: "Energy & Infrastructure", url: url("industry-energy-infrastructure", "page"), handle: "industry-energy-infrastructure" },
            { label: "Wind Power", url: url("industry-wind-power", "page"), handle: "industry-wind-power" },
            { label: "Solar Parks", url: url("industry-solar-parks", "page"), handle: "industry-solar-parks" },
            { label: "Power Grid", url: url("industry-power-grid", "page"), handle: "industry-power-grid" },
            { label: "Forestry", url: url("industry-forestry", "page"), handle: "industry-forestry" },
            { label: "Agriculture", url: url("industry-agriculture", "page"), handle: "industry-agriculture" },
            { label: "Mapping", url: url("industry-mapping", "page"), handle: "industry-mapping" },
            { label: "Construction", url: url("industry-construction", "page"), handle: "industry-construction" },
            { label: "Security & Rescue", url: url("industry-security-rescue", "page"), handle: "industry-security-rescue" },
            { label: "Transport & Logistics", url: url("industry-transport-logistics", "page"), handle: "industry-transport-logistics" },
          ],
        },
        {
          label: "Services",
          children: [
            { label: "Business Account", url: url("business-account", "page"), handle: "business-account" },
            { label: "Request a Quote", url: url("request-a-quote", "page"), handle: "request-a-quote" },
            { label: "Leasing", url: url("leasing", "page"), handle: "leasing" },
            { label: "Financing", url: url("financing", "page"), handle: "financing" },
            { label: "Service Agreement", url: url("service-agreement", "page"), handle: "service-agreement" },
            { label: "Support Agreement", url: url("support-agreement", "page"), handle: "support-agreement" },
            { label: "Training", url: url("training", "page"), handle: "training" },
            { label: "Partner Program", url: url("partner-program", "page"), handle: "partner-program" },
          ],
        },
      ],
    },
  ];
}

function walkTree(nodes, depth, lines, renderUrl = true) {
  for (const n of nodes) {
    const indent = "  ".repeat(depth);
    const urlPart = renderUrl && n.url ? ` → \`${n.url}\`` : "";
    lines.push(`${indent}- ${n.label}${urlPart}`);
    if (n.children) walkTree(n.children, depth + 1, lines, renderUrl);
  }
}

function buildCollectionHierarchy(finalCollections) {
  const byPillar = Object.fromEntries(PILLARS.map((p) => [p, []]));
  for (const c of finalCollections) {
    const p = c.taxonomy_pillar;
    if (byPillar[p]) byPillar[p].push(c);
    else byPillar.Accessories.push(c);
  }
  for (const p of PILLARS) byPillar[p].sort((a, b) => b.products_count - a.products_count);

  const lines = ["# Final Collection Hierarchy", "", `**Generated:** ${new Date().toISOString()}`, "**Status:** PRE-EXECUTION APPROVAL — no live changes", ""];
  for (const pillar of PILLARS) {
    const items = byPillar[pillar];
    lines.push(`## ${pillar} (${items.length})`, "");
    if (pillar === "Spare Parts") {
      const assigned = new Set();
      for (const g of SPARE_PART_MODELS) {
        const approved = g.status === "APPROVED_CREATE" ? " _(approved create)_" : "";
        lines.push(`### ${g.label}${approved}`, "");
        lines.push(`- **Hub:** \`/collections/${g.hub}\``, "");
        for (const s of COMPONENT_SUFFIXES) {
          const h = `${g.prefix}-${s}`;
          const row = items.find((i) => i.proposed_handle === h);
          if (row) {
            lines.push(`  - ${h} (${row.products_count} products)`);
            assigned.add(h);
          }
        }
        if (items.find((i) => i.proposed_handle === g.hub)) {
          lines.push(`  - ${g.hub} (hub collection)`);
          assigned.add(g.hub);
        }
        lines.push("");
      }
      const rest = items.filter((i) => !assigned.has(i.proposed_handle));
      if (rest.length) {
        lines.push("### Other Spare Parts", "");
        for (const r of rest) lines.push(`- ${r.proposed_handle} (${r.products_count} products)`);
        lines.push("");
      }
    } else {
      for (const r of items) {
        const merge = r.merged_from_count > 0 ? ` _[merged from ${r.merged_from_count}]_` : "";
        lines.push(`- ${r.proposed_handle} (${r.products_count} products)${merge}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

function buildMenuHierarchy(menuTrees) {
  const lines = [
    "# Final Menu Hierarchy",
    "",
    `**Generated:** ${new Date().toISOString()}`,
    "**Status:** PRE-EXECUTION APPROVAL — no live changes",
    "",
    "English labels in admin; localized via **Shopify Markets → Translate & Adapt**.",
    "",
    "## Production menu handles (English canonical)",
    "",
    "| Current handle | Proposed handle | English title | Pillar |",
    "|---|---|---|---|",
    "| `main-menu` | `main-menu` | Main Menu | Drones · Accessories · Brands |",
    "| `enterprise-expansion-deploy` | `enterprise` | Enterprise | Enterprise · Payloads & Sensors |",
    "| `spare-parts-deploy` | `spare-parts` | Spare Parts | Spare Parts |",
    "| `service-support-deploy` | `service-support` | Support | Support |",
    "| `b2b-enterprise-deploy` | `business` | Business | Business |",
    "| `footer` | `footer` | Footer Menu | Support · legal |",
    "| `partnership` | `partnership` | Partnership | Business |",
    "",
    "## Navigation trees",
    "",
  ];
  for (const tree of menuTrees) {
    lines.push(`### ${tree.label} (\`${tree.menu}\`)`, "");
    walkTree(tree.children, 0, lines);
    lines.push("");
  }
  return lines.join("\n");
}

function validateRedirects(redirects) {
  const map = new Map(redirects.map((r) => [r.from_path, r.to_path]));
  const loops = [];
  for (const r of redirects) {
    const visited = new Set([r.from_path]);
    let cur = r.to_path;
    for (let i = 0; i < 10 && map.has(cur); i++) {
      if (visited.has(cur)) {
        loops.push({ from: r.from_path, loop_at: cur });
        break;
      }
      visited.add(cur);
      cur = map.get(cur);
    }
  }
  const duplicateFrom = redirects.filter((r, i) => redirects.findIndex((x) => x.from_path === r.from_path) !== i);
  return { total: redirects.length, loops: loops.length, duplicate_from: duplicateFrom.length, pass: loops.length === 0 && duplicateFrom.length === 0 };
}

function main() {
  const collectionsAudit = loadJson(join(ROOT, ".url-audit-collections.json"));
  const live = loadJson(join(ROOT, ".url-audit-live.json"));
  if (!collectionsAudit?.TARGET_COLLECTIONS || !live) {
    console.error("Missing audit JSON");
    process.exit(1);
  }

  const collectionRows = [];
  const canonicalSet = new Map();

  for (const c of collectionsAudit.TARGET_COLLECTIONS) {
    const h = c.handle;
    if (/^_|test-delete|actionking/i.test(h)) {
      collectionRows.push({
        current_handle: h, proposed_handle: "(exclude)", taxonomy_pillar: "Support", action: "EXCLUDE",
        merge_into: "", products_count: c.products_count ?? 0, swedish_detected: "NO",
        current_url: `/collections/${h}`, proposed_url: "(exclude)", title: (c.title || "").slice(0, 80),
      });
      continue;
    }
    const mergeInto = MERGE_INTO[h] || "";
    const proposed = mergeInto ? proposeCollectionHandle(mergeInto) : proposeCollectionHandle(h);
    const pillar = classifyByHandle(proposed);
    const action = mergeInto ? "MERGE" : proposed !== h || isSwedishHandle(h) ? "RENAME" : "KEEP";
    collectionRows.push({
      current_handle: h, proposed_handle: proposed, taxonomy_pillar: pillar, action,
      merge_into: mergeInto, products_count: c.products_count ?? 0,
      swedish_detected: isSwedishHandle(h) ? "YES" : "NO",
      current_url: `/collections/${h}`, proposed_url: `/collections/${proposed}`,
      title: (c.title || "").slice(0, 80),
    });
    if (!mergeInto) {
      if (!canonicalSet.has(proposed)) canonicalSet.set(proposed, { proposed_handle: proposed, taxonomy_pillar: pillar, products_count: c.products_count || 0, merged_from: [] });
    } else {
      const canon = proposed;
      if (!canonicalSet.has(canon)) canonicalSet.set(canon, { proposed_handle: canon, taxonomy_pillar: pillar, products_count: 0, merged_from: [h] });
      else canonicalSet.get(canon).merged_from.push(h);
      canonicalSet.get(canon).products_count += c.products_count || 0;
    }
  }
  for (const r of collectionRows.filter((r) => r.action === "KEEP" || r.action === "RENAME")) {
    if (!canonicalSet.has(r.proposed_handle)) {
      canonicalSet.set(r.proposed_handle, { proposed_handle: r.proposed_handle, taxonomy_pillar: r.taxonomy_pillar, products_count: r.products_count, merged_from: [] });
    }
  }

  const finalCollections = [...canonicalSet.values()]
    .map((c) => ({
      proposed_handle: c.proposed_handle,
      taxonomy_pillar: c.taxonomy_pillar,
      products_count: c.products_count,
      merged_from_count: (c.merged_from || []).length,
      merged_from: (c.merged_from || []).join("; "),
      proposed_url: `/collections/${c.proposed_handle}`,
    }))
    .sort((a, b) => a.taxonomy_pillar.localeCompare(b.taxonomy_pillar) || b.products_count - a.products_count);

  const pageRows = [];
  for (const p of live.pages) {
    if (isLegacyExcludePage(p.handle)) {
      pageRows.push({ current_handle: p.handle, proposed_handle: "(exclude)", taxonomy_pillar: "Support", action: "EXCLUDE", current_url: `/pages/${p.handle}`, proposed_url: "(exclude)", swedish_detected: "LEGACY", title: p.title });
      continue;
    }
    const proposed = CANONICAL_OVERRIDES[p.handle] || proposeEnglishHandle(p.handle);
    const pillar = classifyPage(proposed);
    pageRows.push({
      current_handle: p.handle, proposed_handle: proposed, taxonomy_pillar: pillar,
      action: proposed !== p.handle || isSwedishHandle(p.handle) ? "RENAME" : "KEEP",
      current_url: `/pages/${p.handle}`, proposed_url: `/pages/${proposed}`,
      swedish_detected: isSwedishHandle(p.handle) ? "YES" : "NO", title: p.title,
    });
  }

  const blogRows = [];
  for (const b of live.blogs) {
    const blogProposed = proposeEnglishHandle(b.handle);
    blogRows.push({ resource_type: "blog", current_handle: b.handle, proposed_handle: blogProposed, action: blogProposed !== b.handle ? "RENAME" : "KEEP", current_url: `/blogs/${b.handle}`, proposed_url: `/blogs/${blogProposed}`, title: b.title });
    for (const a of b.articles) {
      const artProposed = proposeEnglishHandle(a.handle);
      blogRows.push({
        resource_type: "article", current_handle: `${b.handle}/${a.handle}`, proposed_handle: `${blogProposed}/${artProposed}`,
        action: artProposed !== a.handle || blogProposed !== b.handle ? "RENAME" : "KEEP",
        current_url: `/blogs/${b.handle}/${a.handle}`, proposed_url: `/blogs/${blogProposed}/${artProposed}`, title: a.title,
      });
    }
  }

  const mergeRows = collectionRows
    .filter((r) => r.action === "MERGE")
    .map((r) => ({
      merge_from_handle: r.current_handle,
      merge_into_handle: r.merge_into,
      canonical_handle: r.proposed_handle,
      canonical_url: r.proposed_url,
      products_count: r.products_count,
      action: "MERGE_THEN_REDIRECT",
    }));

  const redirects = [];
  const addRedirect = (from, to, type, reason) => {
    if (!from || !to || from === to || from === "(exclude)" || to === "(exclude)") return;
    redirects.push({ from_path: from, to_path: to, resource_type: type, redirect_type: "301", reason });
    redirects.push({ from_path: `/en${from}`, to_path: to, resource_type: type, redirect_type: "301", reason: `${reason} (legacy /en prefix)` });
  };

  for (const r of collectionRows) {
    if (r.action === "RENAME" || r.action === "MERGE") addRedirect(r.current_url, r.proposed_url, "collection", r.action === "MERGE" ? "collection_merge" : "collection_rename");
  }
  for (const r of pageRows) {
    if (r.action === "RENAME") addRedirect(r.current_url, r.proposed_url, "page", "page_rename");
  }
  for (const r of blogRows) {
    if (r.action === "RENAME") addRedirect(r.current_url, r.proposed_url, r.resource_type, "blog_rename");
  }
  for (const [from, to] of Object.entries(CANONICAL_OVERRIDES)) {
    if (from.startsWith("bransch-")) addRedirect(`/pages/${from}`, `/pages/${to}`, "page", "business_page_rename");
  }

  const menuTrees = buildMenuTrees();
  const seoCheck = validateRedirects(redirects);
  const plannedRows = plannedCreates();
  const approvedCreates = plannedRows.filter((r) => r.action === "CREATE" || r.action === "CREATE_OR_ASSIGN");

  const OUT = {
    approval: join(ROOT, "ENGLISH_EXECUTION_APPROVAL.md"),
    collectionHierarchy: join(ROOT, "FINAL_COLLECTION_HIERARCHY.md"),
    menuHierarchy: join(ROOT, "FINAL_MENU_HIERARCHY.md"),
    mergeMapping: join(ROOT, "MERGE_MAPPING.csv"),
    redirectMapping: join(ROOT, "REDIRECT_MAPPING.csv"),
    metaobjectMapping: join(ROOT, "METAOBJECT_HANDLE_MAPPING.csv"),
    plannedCreates: join(ROOT, "PLANNED_COLLECTION_CREATES.csv"),
  };

  writeFileSync(OUT.collectionHierarchy, buildCollectionHierarchy(finalCollections), "utf8");
  writeFileSync(OUT.menuHierarchy, buildMenuHierarchy(menuTrees), "utf8");
  writeCsv(OUT.mergeMapping, ["merge_from_handle", "merge_into_handle", "canonical_handle", "canonical_url", "products_count", "action"], mergeRows);
  writeCsv(OUT.redirectMapping, ["from_path", "to_path", "resource_type", "redirect_type", "reason"], redirects);

  const menuHandleRows = [
    { current_handle: "main-menu", proposed_handle: "main-menu", english_title: "Main Menu", action: "KEEP" },
    ...Object.entries(MENU_HANDLE_MAP).filter(([k]) => k.endsWith("-deploy")).map(([k, v]) => ({
      current_handle: k, proposed_handle: v, english_title: v === "business" ? "Business" : v.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), action: "RENAME",
    })),
    { current_handle: "footer", proposed_handle: "footer", english_title: "Footer Menu", action: "KEEP" },
    { current_handle: "partnership", proposed_handle: "partnership", english_title: "Partnership", action: "KEEP" },
  ];
  writeCsv(OUT.metaobjectMapping, ["resource_kind", "current_handle", "proposed_handle", "action", "note"], [
    ...menuHandleRows.map((m) => ({ resource_kind: "menu", current_handle: m.current_handle, proposed_handle: m.proposed_handle, action: m.action, note: "English canonical menu handle" })),
    ...PLANNED_METAOBJECT_TYPES.map((m) => ({ resource_kind: "metaobject_definition", current_handle: m.current_type, proposed_handle: m.proposed_type, action: m.action, note: m.note })),
  ]);
  writeCsv(OUT.plannedCreates, ["resource_type", "proposed_handle", "taxonomy_pillar", "action", "menu_path", "proposed_url", "note"], plannedRows);

  const approval = [
    "# English Execution Approval Pack",
    "",
    `**Store:** EuroDroneParts (\`ya1xhg-x6.myshopify.com\`)`,
    `**Generated:** ${new Date().toISOString()}`,
    "**Status:** APPROVED ARCHITECTURE — **PRE-EXECUTION REVIEW** (no live changes yet)",
    "",
    "## Architecture decision (approved)",
    "",
    "- **English** is canonical for all handles: collections, pages, blogs, menus, metaobjects",
    "- **No Swedish handles** preserved",
    "- **Shopify Markets translations** for menu labels, collection titles, page titles, product content",
    "- **Markets:** `.com` (default), `.de`, `.dk`, `.fr`, `.nl`, `.es`, `.it`",
    "",
    "### Taxonomy pillars (8)",
    "",
    PILLARS.map((p) => `- ${p}`).join("\n"),
    "",
    "### Execution scope",
    "",
    "| Resource | Changes | 301 redirects |",
    "|---|---:|---:|",
    `| Collections | ${collectionRows.filter((r) => r.action === "RENAME" || r.action === "MERGE").length} | ${redirects.filter((r) => r.resource_type === "collection").length} |`,
    `| Pages | ${pageRows.filter((r) => r.action === "RENAME").length} | ${redirects.filter((r) => r.resource_type === "page").length} |`,
    `| Blog/articles | ${blogRows.filter((r) => r.action === "RENAME").length} | ${redirects.filter((r) => r.resource_type === "blog" || r.resource_type === "article").length} |`,
    `| Menu handles | ${menuHandleRows.filter((m) => m.action === "RENAME").length} | — |`,
    `| **Total redirect rules** | — | **${redirects.length}** |`,
    "",
    `Redirect validation: **${seoCheck.pass ? "PASS" : "REVIEW"}** (loops=${seoCheck.loops}, duplicate_from=${seoCheck.duplicate_from})`,
    "",
    "---",
    "",
    "## 1. Final collection hierarchy",
    "",
    `**${finalCollections.length}** canonical collections. Full tree: \`FINAL_COLLECTION_HIERARCHY.md\``,
    "",
    ...PILLARS.map((pillar) => {
      const n = finalCollections.filter((c) => c.taxonomy_pillar === pillar).length;
      return `- **${pillar}:** ${n} collections`;
    }),
    "",
    "---",
    "",
    "## 2. Final menu hierarchy",
    "",
    "Full tree: `FINAL_MENU_HIERARCHY.md`",
    "",
    "| Menu | Handle | Pillars |",
    "|---|---|---|",
    "| Main Menu | `main-menu` | Drones · Accessories · Brands |",
    "| Enterprise | `enterprise` | Enterprise · Payloads & Sensors |",
    "| Spare Parts | `spare-parts` | Spare Parts |",
    "| Support | `service-support` | Support |",
    "| Business | `business` | Business |",
    "",
    "---",
    "",
    "## 3. Merge mapping",
    "",
    `**${mergeRows.length}** collection merges. Full map: \`MERGE_MAPPING.csv\``,
    "",
    "| Merge from | Into | Canonical URL | Products |",
    "|---|---|---|---:|",
    ...mergeRows.map((r) => `| \`${r.merge_from_handle}\` | \`${r.canonical_handle}\` | ${r.canonical_url} | ${r.products_count} |`),
    "",
    "---",
    "",
    "## 4. Redirect mapping",
    "",
    `**${redirects.length}** rules (includes legacy \`/en\` prefix variants). Full map: \`REDIRECT_MAPPING.csv\``,
    "",
    "### Sample redirects",
    "",
    "| From | To | Type |",
    "|---|---|---|",
    ...redirects.filter((r) => !r.from_path.startsWith("/en")).slice(0, 20).map((r) => `| \`${r.from_path}\` | \`${r.to_path}\` | ${r.resource_type} |`),
    "",
    redirects.length > 40 ? `\n_…and ${redirects.length - 20} more in REDIRECT_MAPPING.csv_\n` : "",
    "",
    "---",
    "",
    "## 5. Metaobject & menu handles",
    "",
    "Full map: `METAOBJECT_HANDLE_MAPPING.csv`",
    "",
    "- Menu handles: `*-deploy` → English canonical (`enterprise`, `spare-parts`, `service-support`, `business`)",
    "- Metaobject definitions: `dji_drone_model` → `dji-drone-model` (planned; live audit at execution)",
    "",
    "---",
    "",
    "## 6. Shopify Markets translation scope",
    "",
    "| Content type | Handle language | Display language |",
    "|---|---|---|",
    "| Collection handles | English (all markets) | Translated per market |",
    "| Page handles | English (all markets) | Translated per market |",
    "| Blog handles | English (all markets) | Translated per market |",
    "| Menu labels | English in admin | Translated per market |",
    "| Product content | English canonical | Translated per market |",
    "",
    "---",
    "",
    "## 7. User-approved taxonomy additions",
    "",
    "### Spare Parts (5 model groups)",
    "",
    SPARE_PART_MODELS.filter((m) => m.status === "APPROVED_CREATE")
      .map((m) => `- **${m.label}** → \`${m.hub}\` (+ ${COMPONENT_SUFFIXES.length} component collections)`)
      .join("\n"),
    "",
    `**Planned creates:** ${approvedCreates.length} collections/pages in \`PLANNED_COLLECTION_CREATES.csv\``,
    "",
    "### Enterprise Software (approved)",
    "",
    `- Page: \`${ENTERPRISE_SOFTWARE.handle}\` → ${ENTERPRISE_SOFTWARE.url}`,
    "",
    "### Neo merge",
    "",
    "- `repair-dji-neo-spare-parts` → `dji-neo-spare-parts` (merge + redirect)",
    "",
    "---",
    "",
    "## 8. Pre-execution sign-off",
    "",
    "Confirm before live execution:",
    "",
    "- [ ] Collection hierarchy (`FINAL_COLLECTION_HIERARCHY.md`)",
    "- [ ] Menu hierarchy (`FINAL_MENU_HIERARCHY.md`)",
    "- [ ] Merge mapping (`MERGE_MAPPING.csv`)",
    "- [ ] Redirect mapping (`REDIRECT_MAPPING.csv`)",
    "- [ ] Metaobject/menu handles (`METAOBJECT_HANDLE_MAPPING.csv`)",
    "",
    "**No live changes until this checklist is signed off.**",
    "",
  ];

  writeFileSync(OUT.approval, approval.join("\n"), "utf8");

  console.log("Generated execution approval pack:");
  for (const p of Object.values(OUT)) console.log(`  ${p}`);
  console.log(`collections=${finalCollections.length} merges=${mergeRows.length} redirects=${redirects.length} seo=${seoCheck.pass ? "PASS" : "REVIEW"}`);
}

main();
