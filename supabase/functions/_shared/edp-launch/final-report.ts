import type { ShopAccess } from "../cloner-shopify-access.ts";
import { shopifyGraphql, shopifyRest } from "../cloner-shopify-access.ts";
import { EDP_DOMAINS } from "./config.ts";
import { previewHandleMappings } from "./rename-handles.ts";
import { listMenus } from "./wire-menus.ts";
import { validateMarkets } from "./markets.ts";
import { validateNavigation } from "./validate-navigation.ts";
import { wireThemeNavigation } from "./theme-navigation.ts";

const BLOGS_QUERY = `query { blogs(first: 50) { nodes { handle title } } }`;

export type FinalLaunchReport = {
  generated_at: string;
  launch_ready: boolean;
  blockers: string[];
  active_menus: Array<{ handle: string; id: string; title: string }>;
  active_domains: Array<{ domain: string; market: string; locale: string; status: string }>;
  active_markets: Array<{ name: string; enabled: boolean; primary: boolean; hosts: string[] }>;
  collection_handles: string[];
  page_handles: string[];
  blog_handles: string[];
  unresolved_references: Array<{
    source: string;
    type: string;
    reference: string;
    issue: string;
  }>;
};

async function fetchAllHandles(access: ShopAccess) {
  const collections: string[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const data = await shopifyGraphql(access, `
      query($cursor: String) {
        collections(first: 250, after: $cursor) {
          edges { node { handle } }
          pageInfo { hasNextPage endCursor }
        }
      }`, { cursor });
    for (const e of data?.collections?.edges || []) collections.push(e.node.handle);
    if (!data?.collections?.pageInfo?.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }

  const pages: string[] = [];
  cursor = null;
  for (let i = 0; i < 10; i++) {
    const data = await shopifyGraphql(access, `
      query($cursor: String) {
        pages(first: 250, after: $cursor) {
          edges { node { handle } }
          pageInfo { hasNextPage endCursor }
        }
      }`, { cursor });
    for (const e of data?.pages?.edges || []) pages.push(e.node.handle);
    if (!data?.pages?.pageInfo?.hasNextPage) break;
    cursor = data.pages.pageInfo.endCursor;
  }

  let blogs: string[] = [];
  try {
    const data = await shopifyGraphql(access, BLOGS_QUERY, {});
    blogs = (data?.blogs?.nodes || []).map((b: any) => b.handle);
  } catch { /* optional */ }

  return { collections: collections.sort(), pages: pages.sort(), blogs: blogs.sort() };
}

/** Generate final launch report with menus, domains, markets, handles, unresolved refs */
export async function generateFinalLaunchReport(
  access: ShopAccess,
  prepResult?: {
    errors?: string[];
    handle_preview?: { collisions: Array<{ from: string; to: string; reason: string }> };
  },
): Promise<FinalLaunchReport> {
  const blockers: string[] = [...(prepResult?.errors || [])];

  const [menus, markets, handles, nav, theme] = await Promise.all([
    listMenus(access),
    validateMarkets(access),
    fetchAllHandles(access),
    validateNavigation(access).catch(() => null),
    wireThemeNavigation(access, { dryRun: true }).catch(() => null),
  ]);

  const active_menus = menus.map((m) => ({
    handle: m.handle,
    id: m.id,
    title: m.title,
  }));

  const active_domains = markets.rows.map((r) => ({
    domain: r.domain,
    market: r.expected,
    locale: r.defaultLocale,
    status: r.status,
  }));

  const active_markets = (markets.liveMarkets as any[]).map((m) => {
    const hosts: string[] = [];
    for (const wp of m.webPresences?.nodes || []) {
      if (wp.domain?.host) hosts.push(wp.domain.host);
    }
    return {
      name: m.name,
      enabled: m.enabled,
      primary: m.primary,
      hosts: [...new Set(hosts)],
    };
  });

  const unresolved_references: FinalLaunchReport["unresolved_references"] = [];

  // Navigation issues
  if (nav) {
    for (const issue of nav.internal_link_issues) {
      unresolved_references.push({
        source: `menu:${issue.menu_handle}`,
        type: "menu_link",
        reference: issue.url,
        issue: issue.issue,
      });
    }
  }

  // Theme menu refs still pointing to legacy handles
  if (theme) {
    for (const ref of theme.menu_refs) {
      unresolved_references.push({
        source: `theme:${ref.asset}`,
        type: "theme_menu_ref",
        reference: ref.old_handle,
        issue: `Should reference ${ref.new_handle}`,
      });
    }
    for (const fix of theme.url_fixes) {
      unresolved_references.push({
        source: `theme:${fix.asset}`,
        type: "theme_url",
        reference: fix.old_url,
        issue: `Should be ${fix.new_url} (${fix.count} occurrence(s))`,
      });
    }
  }

  // Handle collisions from preview
  if (prepResult?.handle_preview?.collisions) {
    for (const c of prepResult.handle_preview.collisions) {
      unresolved_references.push({
        source: "handle_mapping",
        type: "collision",
        reference: `${c.from} → ${c.to}`,
        issue: c.reason,
      });
    }
  }

  // Markets not ready
  for (const row of markets.rows) {
    if (row.status !== "ok") {
      blockers.push(`Market ${row.domain}: ${row.status}`);
    }
  }

  if (!markets.en_subfolder_check?.ok) {
    blockers.push(markets.en_subfolder_check.detail);
  }

  if (nav && !nav.passed) {
    blockers.push(`${nav.summary.errors} navigation error(s)`);
  }

  const swedishHandles = handles.collections.filter((h) =>
    /tillbehor|dronare|dronar|guider|energi-infrastruktur|raddningstjanst/.test(h),
  );
  if (swedishHandles.length) {
    blockers.push(`${swedishHandles.length} collection(s) still have Swedish handles`);
    for (const h of swedishHandles.slice(0, 10)) {
      unresolved_references.push({
        source: "collections",
        type: "swedish_handle",
        reference: h,
        issue: "Not yet renamed to English",
      });
    }
  }

  const launch_ready = blockers.length === 0 && unresolved_references.length === 0;

  return {
    generated_at: new Date().toISOString(),
    launch_ready,
    blockers: [...new Set(blockers)],
    active_menus,
    active_domains,
    active_markets,
    collection_handles: handles.collections,
    page_handles: handles.pages,
    blog_handles: handles.blogs,
    unresolved_references,
  };
}

export function formatFinalLaunchReportMarkdown(report: FinalLaunchReport): string {
  const lines: string[] = [
    "# EuroDroneParts — Final Launch Report",
    "",
    `**Generated:** ${report.generated_at}`,
    `**Launch ready:** ${report.launch_ready ? "YES" : "NO"}`,
    "",
  ];

  if (report.blockers.length) {
    lines.push("## Blockers", "");
    for (const b of report.blockers) lines.push(`- ${b}`);
    lines.push("");
  }

  lines.push("## Active menus", "");
  lines.push("| Handle | Title | ID |");
  lines.push("| --- | --- | --- |");
  for (const m of report.active_menus) {
    lines.push(`| ${m.handle} | ${m.title} | ${m.id} |`);
  }
  lines.push("");

  lines.push("## Active domains", "");
  lines.push("| Domain | Market | Default locale | Status |");
  lines.push("| --- | --- | --- | --- |");
  for (const d of report.active_domains) {
    lines.push(`| ${d.domain} | ${d.market} | ${d.locale} | ${d.status} |`);
  }
  lines.push("");

  lines.push("## Active markets", "");
  lines.push("| Name | Enabled | Primary | Hosts |");
  lines.push("| --- | --- | --- | --- |");
  for (const m of report.active_markets) {
    lines.push(`| ${m.name} | ${m.enabled} | ${m.primary} | ${m.hosts.join(", ") || "—"} |`);
  }
  lines.push("");

  lines.push("## Collection handles", `(${report.collection_handles.length} total)`, "");
  lines.push(report.collection_handles.map((h) => `\`${h}\``).join(", ") || "_none_");
  lines.push("");

  lines.push("## Page handles", `(${report.page_handles.length} total)`, "");
  lines.push(report.page_handles.map((h) => `\`${h}\``).join(", ") || "_none_");
  lines.push("");

  lines.push("## Blog handles", `(${report.blog_handles.length} total)`, "");
  lines.push(report.blog_handles.map((h) => `\`${h}\``).join(", ") || "_none_");
  lines.push("");

  if (report.unresolved_references.length) {
    lines.push("## Unresolved references", "");
    lines.push("| Source | Type | Reference | Issue |");
    lines.push("| --- | --- | --- | --- |");
    for (const r of report.unresolved_references.slice(0, 100)) {
      lines.push(`| ${r.source} | ${r.type} | ${r.reference} | ${r.issue} |`);
    }
    if (report.unresolved_references.length > 100) {
      lines.push(`\n_…and ${report.unresolved_references.length - 100} more_`);
    }
    lines.push("");
  } else {
    lines.push("## Unresolved references", "", "_None — all references resolve._", "");
  }

  lines.push("## Domain architecture", "");
  lines.push(`- Primary: ${EDP_DOMAINS.primary} (English, no /en/ subfolder)`);
  lines.push(`- Germany: ${EDP_DOMAINS.de}`);
  lines.push(`- Denmark: ${EDP_DOMAINS.dk}`);
  lines.push(`- Sweden: ${EDP_DOMAINS.se}`);
  lines.push("");

  return lines.join("\n");
}
