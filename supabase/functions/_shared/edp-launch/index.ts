import type { ShopAccess } from "../cloner-shopify-access.ts";
import { previewHandleMappings, renameHandles } from "./rename-handles.ts";
import { wireMenus, listMenus } from "./wire-menus.ts";
import { validateMarkets, assertMarketsReady, getTranslationStructure } from "./markets.ts";
import { runPreflight } from "./preflight.ts";
import { wireThemeNavigation } from "./theme-navigation.ts";
import { validateNavigation } from "./validate-navigation.ts";
import { generateFinalLaunchReport, formatFinalLaunchReportMarkdown } from "./final-report.ts";
import {
  approveTaxonomy,
  fetchAllCollections,
  formatTaxonomyMarkdown,
  getTaxonomyApproval,
  mergeCollections,
  proposeTaxonomy,
  type TaxonomyApprovalState,
} from "./taxonomy.ts";
import {
  CANONICAL_MENU_HANDLES,
  EDP_DOMAINS,
  LEGACY_MENU_HANDLES,
  MARKET_DEFINITIONS,
  MENU_DEFINITIONS,
} from "./config.ts";

export type LaunchPrepAction =
  | "preflight"
  | "audit_collections"
  | "propose_taxonomy"
  | "merge_collections"
  | "approve_taxonomy"
  | "preview"
  | "validate_markets"
  | "rename_handles"
  | "wire_menus"
  | "wire_theme"
  | "validate"
  | "final_report"
  | "full_prep";

export type LaunchPrepResult = {
  ok: boolean;
  action: LaunchPrepAction;
  dry_run: boolean;
  no_redirects: boolean;
  redirect_creation_allowed: boolean;
  seo_migration_skipped: true;
  execution_order: string[];
  preflight?: Awaited<ReturnType<typeof runPreflight>>;
  handle_preview?: Awaited<ReturnType<typeof previewHandleMappings>>;
  handle_rename?: Awaited<ReturnType<typeof renameHandles>>;
  menus?: Awaited<ReturnType<typeof wireMenus>>;
  theme?: Awaited<ReturnType<typeof wireThemeNavigation>>;
  navigation?: Awaited<ReturnType<typeof validateNavigation>>;
  markets?: Awaited<ReturnType<typeof validateMarkets>>;
  final_report?: Awaited<ReturnType<typeof generateFinalLaunchReport>>;
  translation_structure?: ReturnType<typeof getTranslationStructure>;
  config_summary?: {
    domains: typeof EDP_DOMAINS;
    markets: typeof MARKET_DEFINITIONS;
    canonical_menus: typeof CANONICAL_MENU_HANDLES;
    legacy_menus: typeof LEGACY_MENU_HANDLES;
    menu_item_count: number;
  };
  gates?: {
    preflight_passed: boolean;
    markets_ready: boolean;
    taxonomy_approved: boolean;
    blocked_steps: string[];
  };
  taxonomy?: {
    approval: TaxonomyApprovalState;
    collections?: Awaited<ReturnType<typeof fetchAllCollections>>;
    proposal?: Awaited<ReturnType<typeof proposeTaxonomy>>;
    merges?: Awaited<ReturnType<typeof mergeCollections>>;
  };
  errors?: string[];
};

const EXECUTION_ORDER = [
  "0. audit_collections — inventory all live collections",
  "0. merge_collections — absorb duplicates into canonical collections",
  "0. propose_taxonomy — final category + menu hierarchy for review",
  "0. approve_taxonomy — operator sign-off (unlocks phases 1–7)",
  "1. preflight — verify brand-new store, no indexed URLs",
  "2. validate_markets — all four domains, English canonical on .com, no /en/",
  "3. rename_handles — collection, page, blog handles to English",
  "4. wire_menus — Shopify Admin menus to English URLs",
  "5. wire_theme — theme navigation (desktop, mobile, mega) to English handles",
  "6. validate — menu links, collection links, internal links",
  "7. final_report — active menus, domains, markets, handles, unresolved refs",
];

/**
 * Phased launch prep pipeline.
 * Gates block destructive steps until preflight + markets pass.
 * NO redirects created. SEO migration skipped entirely.
 */
export async function runLaunchPrep(
  access: ShopAccess,
  opts: {
    action?: LaunchPrepAction;
    dry_run?: boolean;
    confirm_delete?: boolean;
    rename_kinds?: Array<"collection" | "page" | "blog">;
    handles?: string[];
    skip_gates?: boolean;
    /** Required for approve_taxonomy */
    approved_by?: string;
    confirm?: boolean;
    migration_id?: string;
    admin?: import("npm:@supabase/supabase-js@2").SupabaseClient;
  } = {},
): Promise<LaunchPrepResult> {
  const action = opts.action || "preview";
  const dryRun = opts.dry_run !== false;
  const errors: string[] = [];
  const blocked_steps: string[] = [];
  const postTaxonomySteps = ["rename_handles", "wire_menus", "wire_theme"];

  const base: LaunchPrepResult = {
    ok: true,
    action,
    dry_run: dryRun,
    no_redirects: true,
    redirect_creation_allowed: false,
    seo_migration_skipped: true,
    execution_order: EXECUTION_ORDER,
    config_summary: {
      domains: EDP_DOMAINS,
      markets: MARKET_DEFINITIONS,
      canonical_menus: CANONICAL_MENU_HANDLES,
      legacy_menus: LEGACY_MENU_HANDLES,
      menu_item_count: MENU_DEFINITIONS.reduce((n, m) => n + countItems(m.items), 0),
    },
    translation_structure: getTranslationStructure(),
  };

  // ── Phase 0: Taxonomy approval state (gate for rename/wire) ─────────────
  let taxonomyApproval: TaxonomyApprovalState = { approved: false, taxonomy_version: "" };
  if (opts.admin) {
    taxonomyApproval = await getTaxonomyApproval(opts.admin, opts.migration_id);
  }
  base.taxonomy = { approval: taxonomyApproval };

  if (!taxonomyApproval.approved) {
    blocked_steps.push(...postTaxonomySteps);
  }

  // ── Phase 0 actions ─────────────────────────────────────────────────────
  if (action === "audit_collections" || action === "propose_taxonomy" || action === "full_prep" || action === "preview") {
    const collections = await fetchAllCollections(access);
    base.taxonomy.collections = collections;
    if (action === "propose_taxonomy" || action === "full_prep" || action === "preview") {
      base.taxonomy.proposal = await proposeTaxonomy(access);
    }
  }

  if (action === "merge_collections") {
    const proposal = base.taxonomy.proposal || await proposeTaxonomy(access);
    const plannedMerges = proposal.merge_plan.filter((m) => m.planned);
    base.taxonomy.merges = await mergeCollections(access, plannedMerges, {
      dryRun,
      handles: opts.handles,
    });
    if (!dryRun) {
      const failed = base.taxonomy.merges.results.filter((r) => r.action === "failed").length;
      if (failed) errors.push(`${failed} collection merge(s) failed`);
    }
  }

  if (action === "approve_taxonomy") {
    if (!opts.admin) {
      errors.push("approve_taxonomy requires database access");
    } else if (!opts.confirm) {
      errors.push("approve_taxonomy requires confirm: true");
    } else {
      const proposal = base.taxonomy.proposal || await proposeTaxonomy(access);
      const approval = await approveTaxonomy(opts.admin, {
        migrationId: opts.migration_id,
        approvedBy: opts.approved_by || "operator",
        notes: `merge_groups=${proposal.collection_audit_summary.duplicate_groups}`,
      });
      base.taxonomy.approval = approval;
      taxonomyApproval = approval;
      blocked_steps.length = 0;
      if (!taxonomyApproval.approved) blocked_steps.push(...postTaxonomySteps);
    }
  }

  // ── Step 1: Preflight (always) ──────────────────────────────────────────
  base.preflight = await runPreflight(access);
  base.redirect_creation_allowed = base.preflight.redirect_creation_allowed;

  if (!base.preflight.passed) {
    errors.push(...base.preflight.blockers);
    blocked_steps.push(...postTaxonomySteps);
  }

  if (!base.preflight.is_brand_new_store && !dryRun && !opts.skip_gates) {
    errors.push("Preflight failed: store is not verified as brand-new with no indexed URLs");
    blocked_steps.push(...postTaxonomySteps);
  }

  // ── Step 2: Markets (gate for all mutating steps) ───────────────────────
  const needsMarkets = ["validate_markets", "rename_handles", "wire_menus", "wire_theme",
    "validate", "final_report", "full_prep", "preview"].includes(action);

  if (needsMarkets) {
    base.markets = await validateMarkets(access);
    const { ready, blockers } = assertMarketsReady(base.markets);
    if (!ready) {
      errors.push(...blockers);
      if (!dryRun && !opts.skip_gates) {
        blocked_steps.push(...postTaxonomySteps);
        errors.push("BLOCKED: Configure Shopify Markets and all four domains before handle rename");
      }
    }
  }

  base.gates = {
    preflight_passed: base.preflight.passed,
    markets_ready: base.markets?.markets_ready ?? false,
    taxonomy_approved: taxonomyApproval.approved,
    blocked_steps: [...new Set(blocked_steps)],
  };

  const taxonomyGateOk = taxonomyApproval.approved || opts.skip_gates;
  const canMutate = (dryRun || opts.skip_gates ||
    (base.preflight.passed && (base.markets?.markets_ready ?? false))) && taxonomyGateOk;

  // ── Preview handle mappings (read-only) ─────────────────────────────────
  if (["preview", "final_report", "full_prep"].includes(action)) {
    base.handle_preview = await previewHandleMappings(access);
    if (base.handle_preview.collisions.length) {
      errors.push(`${base.handle_preview.collisions.length} handle collision(s) — resolve before live rename`);
    }
  }

  // ── Step 3: Rename handles ────────────────────────────────────────────────
  if (action === "rename_handles" || action === "full_prep") {
    if (!taxonomyApproval.approved && !dryRun && !opts.skip_gates) {
      errors.push("BLOCKED: Approve taxonomy (Phase 0) before handle rename");
    } else if (!canMutate && !dryRun) {
      errors.push("Handle rename blocked — complete preflight, Markets, and taxonomy approval");
    } else if (dryRun) {
      base.handle_preview = base.handle_preview || await previewHandleMappings(access);
    } else {
      base.handle_rename = await renameHandles(access, {
        dryRun: false,
        kinds: opts.rename_kinds,
        handles: opts.handles,
      });
      if (base.handle_rename.summary.failed) {
        errors.push(`${base.handle_rename.summary.failed} handle rename(s) failed`);
      }
    }
  }

  // ── Step 4: Wire menus ──────────────────────────────────────────────────
  if (action === "wire_menus" || action === "full_prep") {
    if (!taxonomyApproval.approved && !dryRun && !opts.skip_gates) {
      errors.push("BLOCKED: Approve taxonomy (Phase 0) before menu wiring");
    } else if (!canMutate && !dryRun) {
      errors.push("Menu wiring blocked — complete preflight, Markets, and taxonomy approval");
    } else {
      base.menus = await wireMenus(access, {
        dryRun,
        confirmDelete: opts.confirm_delete,
      });
      const failed = base.menus.results.filter((r) => r.action === "failed").length;
      if (failed) errors.push(`${failed} menu operation(s) failed`);
    }
  }

  // ── Step 5: Wire theme navigation ───────────────────────────────────────
  if (action === "wire_theme" || action === "full_prep") {
    if (!taxonomyApproval.approved && !dryRun && !opts.skip_gates) {
      errors.push("BLOCKED: Approve taxonomy (Phase 0) before theme wiring");
    } else if (!canMutate && !dryRun) {
      errors.push("Theme navigation wiring blocked — complete preflight, Markets, and taxonomy approval");
    } else {
      base.theme = await wireThemeNavigation(access, { dryRun });
      if (base.theme.errors.length) {
        errors.push(`${base.theme.errors.length} theme scan error(s)`);
      }
    }
  }

  // ── Step 6: Validate navigation ───────────────────────────────────────
  if (action === "validate" || action === "full_prep" || action === "final_report") {
    base.navigation = await validateNavigation(access);
    if (!base.navigation.passed) {
      errors.push(`Navigation validation: ${base.navigation.summary.errors} error(s), ${base.navigation.summary.warnings} warning(s)`);
    }
  }

  // ── Step 7: Final launch report ─────────────────────────────────────────
  if (action === "final_report" || action === "full_prep") {
    base.final_report = await generateFinalLaunchReport(access, base);
    if (!base.final_report.launch_ready) {
      errors.push("Final launch report: not ready for launch");
    }
  }

  base.ok = errors.length === 0;
  if (errors.length) base.errors = [...new Set(errors)];
  return base;
}

function countItems(items: { items?: unknown[] }[]): number {
  return items.reduce((n, it) => n + 1 + (it.items ? countItems(it.items as { items?: unknown[] }[]) : 0), 0);
}

export function formatLaunchPrepMarkdown(result: LaunchPrepResult): string {
  const lines: string[] = [
    "# EuroDroneParts Launch Prep Report",
    "",
    `**Action:** ${result.action}`,
    `**Dry run:** ${result.dry_run}`,
    `**No redirects:** ${result.no_redirects}`,
    `**Redirect creation allowed:** ${result.redirect_creation_allowed}`,
    `**SEO migration:** skipped`,
    `**Status:** ${result.ok ? "OK" : "ISSUES"}`,
    "",
  ];

  lines.push("## Execution order", "");
  for (const step of result.execution_order) lines.push(`- ${step}`);
  lines.push("");

  if (result.gates) {
    lines.push("## Gates", "");
    lines.push(`| Gate | Status |`);
    lines.push(`| --- | --- |`);
    lines.push(`| Preflight passed | ${result.gates.preflight_passed ? "YES" : "NO"} |`);
    lines.push(`| Markets ready | ${result.gates.markets_ready ? "YES" : "NO"} |`);
    lines.push(`| Taxonomy approved | ${result.gates.taxonomy_approved ? "YES" : "NO"} |`);
    if (result.gates.blocked_steps.length) {
      lines.push(`| Blocked steps | ${result.gates.blocked_steps.join(", ")} |`);
    }
    lines.push("");
  }

  if (result.errors?.length) {
    lines.push("## Errors", "");
    for (const e of result.errors) lines.push(`- ${e}`);
    lines.push("");
  }

  if (result.taxonomy?.proposal) {
    lines.push(formatTaxonomyMarkdown(
      result.taxonomy.collections || [],
      result.taxonomy.proposal,
      result.taxonomy.approval,
    ));
  } else if (result.taxonomy?.collections?.length) {
    lines.push("## Phase 0 — Collection audit", "");
    lines.push(`Total collections: **${result.taxonomy.collections.length}**`);
    lines.push("");
  }

  if (result.taxonomy?.merges) {
    lines.push("## Collection merge results", "");
    lines.push(`| Canonical | Absorb | Action | Products moved | Error |`);
    lines.push(`| --- | --- | --- | ---: | --- |`);
    for (const r of result.taxonomy.merges.results) {
      lines.push(`| ${r.canonical_handle} | ${r.absorb_handle} | ${r.action} | ${r.products_moved} | ${r.error || "—"} |`);
    }
    lines.push("");
  }

  if (result.preflight) {
    lines.push("## Preflight", "");
    lines.push(`Brand-new store: **${result.preflight.is_brand_new_store ? "YES" : "NO"}**`);
    lines.push(`Indexed URLs detected: **${result.preflight.indexed_url_detected ? "YES" : "NO"}**`);
    lines.push("");
    lines.push("| Check | Status | Detail |");
    lines.push("| --- | --- | --- |");
    for (const c of result.preflight.checks) {
      lines.push(`| ${c.label} | ${c.status} | ${c.detail} |`);
    }
    lines.push("");
  }

  if (result.config_summary) {
    lines.push("## Domain architecture", "");
    lines.push(`| Domain | Role |`);
    lines.push(`| --- | --- |`);
    lines.push(`| ${EDP_DOMAINS.primary} | Primary (en, no /en/ subfolder) |`);
    lines.push(`| ${EDP_DOMAINS.de} | Germany (de + en) |`);
    lines.push(`| ${EDP_DOMAINS.dk} | Denmark (da + en) |`);
    lines.push(`| ${EDP_DOMAINS.se} | Sweden (sv + en) |`);
    lines.push("");
  }

  if (result.markets) {
    lines.push("## Markets validation", "");
    lines.push(`Markets ready: **${result.markets.markets_ready ? "YES" : "NO"}**`);
    if (result.markets.en_subfolder_check) {
      lines.push(`No /en/ on .com: **${result.markets.en_subfolder_check.ok ? "YES" : "NO"}** — ${result.markets.en_subfolder_check.detail}`);
    }
    lines.push("");
    lines.push("| Market | Domain | Status | Notes |");
    lines.push("| --- | --- | --- | --- |");
    for (const r of result.markets.rows) {
      lines.push(`| ${r.expected} | ${r.domain} | ${r.status} | ${r.notes || "—"} |`);
    }
    lines.push("");
    lines.push("### Markets admin checklist (complete BEFORE handle rename)", "");
    for (const item of result.markets.adminChecklist) lines.push(`- [ ] ${item}`);
    lines.push("");
  }

  if (result.handle_preview) {
    const hp = result.handle_preview;
    lines.push("## Handle mappings", "");
    lines.push(`| Metric | Count |`);
    lines.push(`| --- | ---: |`);
    lines.push(`| Collections | ${hp.counts.collections} |`);
    lines.push(`| Pages | ${hp.counts.pages} |`);
    lines.push(`| Blogs | ${hp.counts.blogs} |`);
    lines.push(`| To rename | ${hp.counts.toRename} |`);
    lines.push(`| Unchanged | ${hp.counts.unchanged} |`);
    lines.push("");
    if (hp.collisions.length) {
      lines.push("### Collisions", "");
      for (const c of hp.collisions) lines.push(`- \`${c.from}\` → \`${c.to}\`: ${c.reason}`);
      lines.push("");
    }
  }

  if (result.handle_rename) {
    lines.push("## Handle rename results", "");
    lines.push(`Renamed: ${result.handle_rename.summary.renamed}, Failed: ${result.handle_rename.summary.failed}`);
    lines.push("");
  }

  if (result.menus) {
    lines.push("## Menu wiring", "");
    lines.push(`| Handle | Action | Items | Error |`);
    lines.push(`| --- | --- | ---: | --- |`);
    for (const r of result.menus.results) {
      lines.push(`| ${r.handle} | ${r.action} | ${r.itemCount ?? "—"} | ${r.error || "—"} |`);
    }
    lines.push("");
  }

  if (result.theme) {
    lines.push("## Theme navigation", "");
    lines.push(`Theme: ${result.theme.theme?.name || "—"} (${result.theme.scanned_assets} assets scanned)`);
    lines.push(`Menu refs to update: ${result.theme.menu_refs.length}`);
    lines.push(`URL fixes needed: ${result.theme.url_fixes.length}`);
    lines.push(`Mega menu sections: ${result.theme.mega_menu_sections.join(", ") || "—"}`);
    lines.push(`Desktop menu refs: ${result.theme.desktop_menu_refs.length}`);
    lines.push(`Mobile menu refs: ${result.theme.mobile_menu_refs.length}`);
    if (result.theme.menu_refs.length) {
      lines.push("");
      lines.push("| Asset | Setting | Old → New |");
      lines.push("| --- | --- | --- |");
      for (const r of result.theme.menu_refs.slice(0, 30)) {
        lines.push(`| ${r.asset} | ${r.setting_key} | ${r.old_handle} → ${r.new_handle} |`);
      }
    }
    lines.push("");
  }

  if (result.navigation) {
    const nav = result.navigation;
    lines.push("## Navigation validation", "");
    lines.push(`Passed: **${nav.passed ? "YES" : "NO"}** (${nav.summary.errors} errors, ${nav.summary.warnings} warnings)`);
    lines.push("");
    lines.push("### Desktop menu", `handle: ${nav.desktop_menu.handle}, ${nav.desktop_menu.items} items`);
    lines.push("### Mobile menu", `handle: ${nav.mobile_menu.handle}, ${nav.mobile_menu.items} items`);
    if (nav.mega_menus.length) {
      lines.push("### Mega menus", nav.mega_menus.map((m) => `${m.handle} (${m.items} items)`).join(", "));
    }
    if (nav.collection_link_issues.length) {
      lines.push("");
      lines.push("### Collection link issues", "");
      for (const i of nav.collection_link_issues.slice(0, 20)) {
        lines.push(`- [${i.menu_handle}] ${i.item_title}: ${i.url} — ${i.issue}`);
      }
    }
    lines.push("");
  }

  if (result.final_report) {
    lines.push(formatFinalLaunchReportMarkdown(result.final_report));
  }

  if (result.translation_structure) {
    lines.push("## Translation structure", "");
    lines.push(`Canonical language: **${result.translation_structure.canonicalLanguage}**`);
    lines.push("");
    lines.push(`| Locale | Label | Markets |`);
    lines.push(`| --- | --- | --- |`);
    for (const loc of result.translation_structure.locales) {
      lines.push(`| ${loc.locale} | ${loc.label} | ${loc.markets.join(", ")} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export {
  listMenus,
  previewHandleMappings,
  renameHandles,
  wireMenus,
  validateMarkets,
  runPreflight,
  wireThemeNavigation,
  validateNavigation,
  generateFinalLaunchReport,
  formatFinalLaunchReportMarkdown,
};
