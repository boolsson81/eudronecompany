#!/usr/bin/env node
/**
 * Produces EURODRONEPARTS_COLLECTION_ARCHITECTURE.md — recommended future collection structure.
 * Read-only. No deletions.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IN = join(ROOT, ".collection-inventory-audit.json");
const OUT = join(ROOT, "EURODRONEPARTS_COLLECTION_ARCHITECTURE.md");

const DELETE_HANDLES = new Set(
  JSON.parse(readFileSync(IN, "utf8")).groups?.DELETE?.map((c) => c.handle) || [],
);

const GROUPS = [
  "Consumer DJI",
  "Enterprise DJI",
  "FlyCart",
  "Sensors & Payloads",
  "Industry Solutions",
  "Spare Parts",
  "Accessories",
  "Legacy DJI models",
  "Delete candidates",
];

function intendedGroup(handle, title) {
  const h = handle.toLowerCase();
  const t = `${handle} ${title}`.toLowerCase();
  if (/flycart/.test(h)) return "FlyCart";
  if (
    /^(inspektionsdronare|jordbruksdronare|skogsbruksdronare|kartlaggnings-och-matdronare|energi-infrastruktur|transport-logistik)$/.test(
      h,
    )
  )
    return "Industry Solutions";
  if (/^(enterprise-sensorer)$/.test(h) || (/sensor|payload|varmekamera|multispektral|lidar/.test(t) && !/filter/.test(t)))
    return "Sensors & Payloads";
  if (/mavic-3m|mavic-3-enterprise|mavic-3e/.test(t)) return "Enterprise DJI";
  if (/^enterprise-/.test(h) || /^dji-matrice/.test(h) || /enterprise|matrice/.test(t)) return "Enterprise DJI";
  if (/phantom|inspire|air-2|mini-2|osmo|gopro|actionking|tripod/.test(t)) return "Legacy DJI models";
  if (/reservdel|spare|reparation/.test(t)) return "Spare Parts";
  if (/minneskort|ringlampa|filter|tillbehor|accessory|propeller/.test(t)) return "Accessories";
  if (/mavic|mini|air|avata|neo|flip/.test(t)) return "Consumer DJI";
  return "Accessories";
}

function classify(handle, title, products, auditGroup) {
  if (auditGroup === "DELETE" || DELETE_HANDLES.has(handle)) return "Delete candidates";

  const h = handle.toLowerCase();
  const t = `${handle} ${title}`.toLowerCase();

  if (/flycart/.test(h)) return "FlyCart";

  if (
    /^(inspektionsdronare|jordbruksdronare|skogsbruksdronare|kartlaggnings-och-matdronare|energi-infrastruktur|transport-logistik|last-och-transportdronare)$/.test(
      h,
    )
  )
    return "Industry Solutions";

  if (
    /^(enterprise-sensorer|dronare-med-varmekamera|airdrop-system)$/.test(h) ||
    /sensor|payload|varmekamera|multispektral|lidar/.test(t)
  )
    return "Sensors & Payloads";

  if (
    /^enterprise-/.test(h) ||
    /^dji-matrice/.test(h) ||
    /^dji-agras/.test(h) ||
    /enterprise|matrice|agras|marvic-enterprise|mavic-3-enterprise|mavic-3m|mavic-serien-enterprise/.test(h)
  )
    return "Enterprise DJI";

  if (
    /^dji-(phantom|inspire|air-2|mavic-2|mini-2)/.test(h) ||
    /phantom|inspire serien|air-2-tillbehor|tillbehor-dji-inspire|tillbehor-dji-mavic-2|tillbehor-dji-mini-2/.test(t) ||
    /actionking|actionkamer|gopro|osmo-action|kamerastativ-tripod|fasten-adaptrar-actionkameror/.test(t) ||
    /^dronare-actionking$/.test(h)
  )
    return "Legacy DJI models";

  if (
    /reservdelar|reparation-|reparera-|flight-components|gimbal-dronare-motorer|dji-dronar-reservdelar/.test(h) ||
    (/reservdel|spare|reparation/.test(t) && !/verktyg|tool/.test(t))
  )
    return "Spare Parts";

  if (/mavic-3m|mavic-3-enterprise|mavic-3e|mavic-serien-enterprise/.test(t)) return "Enterprise DJI";

  if (/^tillbehor-dji-mavic-dronare$/.test(h) && /3e|enterprise/.test(t)) return "Enterprise DJI";

  if (
    /^dji-(mavic|mini|air|avata|flip|neo|fpv|dronare|rc)-/.test(h) ||
    /^dji$/.test(h) ||
    /^dij-air-3-serien$/.test(h) ||
    /^dronare-med-kamera$/.test(h) ||
    /^tillbehor-dji-(mavic|mini|air|avata|neo|flip)/.test(h) ||
    (/^dji-/.test(h) && /(serien|dronare|pro|classic|cine|s$)/.test(h) && !/enterprise|matrice|phantom|inspire|air-2|mavic-2|mini-2|3m|3e/.test(h))
  )
    return "Consumer DJI";

  if (
    /^dji-(air|mavic|mini|avata|neo|flip|fpv|rc)-.*tillbehor/.test(h) ||
    /^tillbehor-(dji-|till-dji-)/.test(h) ||
    /^dji-rc-/.test(h)
  )
    return "Consumer DJI";

  if (
    /propeller|filter|vaska|ryggsack|kablar|skydd|landning|batteri|belysning|kapor|matte|fjarrkontroll|kameror|tillbehor-kop|tillbehor-dronar|verktyg|rengorings|pincett|tanger|multiverktyg|bandverktyg|skruvmejsel|polarpro|pgytech|sunnylife|vendors|minneskort|usb-kablar|vattentatt|brdrc|master-airscrew|amagisn|alla-produkter/.test(
      h,
    ) ||
    /^dronar|^dronare-/.test(h)
  )
    return "Accessories";

  if (auditGroup === "MERGE") return "Consumer DJI";
  if (/enterprise|matrice|agras/.test(t)) return "Enterprise DJI";
  if (/mavic|mini|air|avata|neo|flip/.test(t)) return "Consumer DJI";

  return "Accessories";
}

const data = JSON.parse(readFileSync(IN, "utf8"));
const all = data.all || [];

const byGroup = Object.fromEntries(GROUPS.map((g) => [g, []]));
for (const c of all) {
  const group = classify(c.handle, c.title, c.products_count, c.group);
  byGroup[group].push(c);
}
for (const g of GROUPS) {
  byGroup[g].sort((a, b) => a.handle.localeCompare(b.handle, undefined, { numeric: true }));
}

function esc(s) {
  return String(s ?? "").replace(/\|/g, "\\|");
}

const lines = [
  "# EuroDroneParts — Recommended Collection Architecture",
  "",
  `**Generated:** ${new Date().toISOString()}`,
  "**Status:** Planning document — no deletions performed",
  `**Source inventory:** ${all.length} live collections`,
  "",
  "## Target taxonomy (9 groups)",
  "",
  "| # | Group | Current collections | Recommended future role |",
  "|---|-------|--------------------:|-------------------------|",
  "| 1 | Consumer DJI | " + byGroup["Consumer DJI"].length + " | Model-family tree: drones → accessories per Mavic/Mini/Air/Avata/Neo/Flip |",
  "| 2 | Enterprise DJI | " + byGroup["Enterprise DJI"].length + " | Matrice, Mavic Enterprise, Agras, enterprise controllers & enterprise accessories |",
  "| 3 | FlyCart | " + byGroup["FlyCart"].length + " active (+2 empty shells in Delete) | FlyCart 100 platform — recreate one hub after cleanup |",
  "| 4 | Sensors & Payloads | " + byGroup["Sensors & Payloads"].length + " | Thermal cameras, airdrop, enterprise sensors |",
  "| 5 | Industry Solutions | " + byGroup["Industry Solutions"].length + " active (+6 empty shells in Delete) | Vertical SEO landing collections |",
  "| 6 | Spare Parts | " + byGroup["Spare Parts"].length + " | Model-specific repair & replacement components |",
  "| 7 | Accessories | " + byGroup["Accessories"].length + " | Cross-model consumables: props, filters, bags, batteries, tools, third-party |",
  "| 8 | Legacy DJI models | " + byGroup["Legacy DJI models"].length + " | Phantom, Inspire, Air 2, Mini 2, ActionKing-era — deprecate over time |",
  "| 9 | Delete candidates | " + byGroup["Delete candidates"].length + " | Empty orphans — remove after final review |",
  "",
  "## Recommended final architecture",
  "",
  "```",
  "EuroDroneParts Collections",
  "├── Consumer DJI/",
  "│   ├── By model family (Mavic, Mini, Air, Avata, Neo, Flip, FPV)",
  "│   │   ├── Drones (smart collections per model)",
  "│   │   └── Accessories (per-model tillbehör)",
  "│   └── Controllers & RC (RC, RC Pro, consumer FPV)",
  "├── Enterprise DJI/",
  "│   ├── Platform lines (Matrice 4/350/400, Mavic 3E/3M, Agras, Marvic)",
  "│   ├── Enterprise accessories",
  "│   └── Enterprise controllers",
  "├── FlyCart/",
  "│   └── FlyCart 100 + series",
  "├── Sensors & Payloads/",
  "│   ├── Thermal / multispectral",
  "│   └── Airdrop & specialty payloads",
  "├── Industry Solutions/",
  "│   ├── Inspection, Agriculture, Forestry, Surveying",
  "│   └── Energy, Transport & Logistics",
  "├── Spare Parts/",
  "│   └── Per-model reservdelar & repair",
  "├── Accessories/",
  "│   ├── Universal (props, filters, cases, batteries)",
  "│   └── Third-party brands (PolarPro, PGYTech, etc.)",
  "├── Legacy DJI models/  [sunset]",
  "└── Delete candidates/  [remove]",
  "```",
  "",
  "## Consolidation recommendations",
  "",
  "1. **Merge** `dji-mavic-3-classic-1` → `dji-mavic-3-classic` (duplicate title).",
  "2. **Collapse** empty series shells (Matrice 3/4/400 serien, Phantom serien) — already in Delete candidates.",
  "3. **Consumer hub:** Keep `dji` as brand landing; route `alla-produkter` to catalog or retire in favor of family hubs.",
  "4. **Enterprise hub:** `enterprise-dronare` remains top-level enterprise landing.",
  "5. **Industry Solutions:** Promote 7 vertical collections as SEO landing pages; link from Enterprise hub.",
  "6. **Legacy sunset:** Move ActionKing/GoPro/Osmo collections to Legacy group; no new products.",
  "7. **Post-delete target:** ~114 active collections after removing 43 empty orphans + 1 merge.",
  "",
];

for (const group of GROUPS) {
  const items = byGroup[group];
  lines.push(`## ${GROUPS.indexOf(group) + 1}. ${group} (${items.length})`);
  lines.push("");
  if (!items.length) {
    if (group === "FlyCart") {
      lines.push("_No active collections. Future hub: `dji-flycart-serien` or `dji-flycart-100-lastdronare` (currently empty → Delete candidates)._");
    } else {
      lines.push("_No collections in this group._");
    }
    lines.push("");
    continue;
  }
  const headers =
    group === "Delete candidates"
      ? "| Handle | Title | Products | Intended future group |"
      : "| Handle | Title | Products | Current audit |";
  lines.push(headers);
  lines.push(group === "Delete candidates" ? "|---|---|---|---|" : "|---|---|---:|---|");
  for (const c of items) {
    if (group === "Delete candidates") {
      lines.push(
        `| \`${esc(c.handle)}\` | ${esc(c.title)} | ${c.products_count} | ${intendedGroup(c.handle, c.title)} |`,
      );
    } else {
      lines.push(`| \`${esc(c.handle)}\` | ${esc(c.title)} | ${c.products_count} | ${c.group} |`);
    }
  }
  lines.push("");
}

const activeTotal = GROUPS.slice(0, 8).reduce((n, g) => n + byGroup[g].length, 0);
const deleteByIntended = {};
for (const c of byGroup["Delete candidates"]) {
  const ig = intendedGroup(c.handle, c.title);
  deleteByIntended[ig] = (deleteByIntended[ig] || 0) + 1;
}

lines.push("## Future state after cleanup (projected)");
lines.push("");
lines.push(`| Metric | Count |`);
lines.push(`|--------|------:|`);
lines.push(`| Active collections today | ${activeTotal} |`);
lines.push(`| Delete candidates (empty orphans) | ${byGroup["Delete candidates"].length} |`);
lines.push(`| Merge operations | 1 (\`dji-mavic-3-classic-1\` → \`dji-mavic-3-classic\`) |`);
lines.push(`| **Projected active after cleanup** | **~${activeTotal - 1}** |`);
lines.push("");
lines.push("### Empty shells to recreate (currently in Delete candidates)");
lines.push("");
lines.push("| Intended group | Empty shells | Action |");
lines.push("|---|---:|---|");
for (const [g, n] of Object.entries(deleteByIntended).sort((a, b) => b[1] - a[1])) {
  const action =
    g === "FlyCart"
      ? "Recreate one FlyCart hub with products"
      : g === "Industry Solutions"
        ? "Populate vertical landing pages with curated products"
        : g === "Enterprise DJI"
          ? "Merge into `enterprise-dronare` hub or populate Matrice/Mavic Enterprise series"
          : g === "Sensors & Payloads"
            ? "Populate `enterprise-sensorer` hub"
            : g === "Legacy DJI models"
              ? "Leave deleted — legacy sunset"
              : g === "Consumer DJI"
                ? "Merge into active family hubs (duplicate shells)"
                : "Review individually";
  lines.push(`| ${g} | ${n} | ${action} |`);
}
lines.push("");
lines.push("## Navigation mapping (future menus)");
lines.push("");
lines.push("| Main menu item | Target collection group |");
lines.push("|---|---|");
lines.push("| Drönare (consumer) | Consumer DJI → family hubs |");
lines.push("| Enterprise Drönare | Enterprise DJI + Industry Solutions |");
lines.push("| Reservdelar | Spare Parts |");
lines.push("| Tillbehör | Accessories + model-specific Consumer tillbehör |");
lines.push("| FlyCart | FlyCart |");
lines.push("");

writeFileSync(OUT, lines.join("\n"));
console.log(`Wrote ${OUT}`);
for (const g of GROUPS) console.log(`${g}: ${byGroup[g].length}`);
