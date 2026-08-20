import type { ShopAccess } from "../cloner-shopify-access.ts";
import { shopifyGraphql } from "../cloner-shopify-access.ts";
import { CANONICAL_MENU_HANDLES } from "./config.ts";
import { toEnglishHandle } from "./slug-en.ts";

const MENUS_DETAIL = `
  query MenusDetail($cursor: String) {
    menus(first: 50, after: $cursor) {
      nodes {
        id handle title isDefault
        items {
          title url type
          items {
            title url type
            items { title url type }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query Collections($cursor: String) {
    collections(first: 250, after: $cursor) {
      edges { node { handle } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PAGES_QUERY = `
  query Pages($cursor: String) {
    pages(first: 250, after: $cursor) {
      edges { node { handle } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export type LinkIssue = {
  menu_handle: string;
  menu_title: string;
  item_title: string;
  url: string;
  issue: string;
  severity: "error" | "warn";
};

export type NavigationValidation = {
  passed: boolean;
  desktop_menu: { handle: string; items: number; issues: LinkIssue[] };
  mobile_menu: { handle: string; items: number; issues: LinkIssue[] };
  mega_menus: Array<{ handle: string; items: number; issues: LinkIssue[] }>;
  all_menus: Array<{ handle: string; title: string; item_count: number; issues: LinkIssue[] }>;
  internal_link_issues: LinkIssue[];
  collection_link_issues: LinkIssue[];
  swedish_handle_urls: LinkIssue[];
  en_subfolder_urls: LinkIssue[];
  summary: {
    total_issues: number;
    errors: number;
    warnings: number;
    menus_checked: number;
  };
};

const SWEDISH_TOKENS = ["tillbehor", "dronare", "dronar", "guider", "blogg", "energi-infrastruktur",
  "raddningstjanst", "konsumentdronare", "fjarrkontroll", "propellrar", "reservdelar"];

function parseResourceUrl(url: string): { type: string; handle: string } | null {
  const clean = url.replace(/^https?:\/\/[^/]+/, "");
  const m = clean.match(/\/(collections|pages|blogs|products)\/([^/?#]+)/);
  if (!m) return null;
  return { type: m[1], handle: m[2] };
}

function hasSwedishHandle(url: string): boolean {
  const p = url.toLowerCase();
  return SWEDISH_TOKENS.some((t) => p.includes(`/${t}`) || p.includes(`-${t}`));
}

async function fetchHandleSets(access: ShopAccess) {
  const collections = new Set<string>();
  const pages = new Set<string>();
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const data = await shopifyGraphql(access, COLLECTIONS_QUERY, { cursor });
    for (const e of data?.collections?.edges || []) collections.add(e.node.handle);
    if (!data?.collections?.pageInfo?.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }
  cursor = null;
  for (let i = 0; i < 10; i++) {
    const data = await shopifyGraphql(access, PAGES_QUERY, { cursor });
    for (const e of data?.pages?.edges || []) pages.add(e.node.handle);
    if (!data?.pages?.pageInfo?.hasNextPage) break;
    cursor = data.pages.pageInfo.endCursor;
  }
  return { collections, pages };
}

function walkMenuItems(
  menuHandle: string,
  menuTitle: string,
  items: any[],
  ctx: { collections: Set<string>; pages: Set<string> },
  path: string[] = [],
): LinkIssue[] {
  const issues: LinkIssue[] = [];
  for (const it of items || []) {
    const title = [...path, it.title].join(" › ");
    const url = String(it.url || "");

    if (url.includes("/en/")) {
      issues.push({
        menu_handle: menuHandle, menu_title: menuTitle, item_title: title, url,
        issue: "/en/ subfolder on canonical URL — remove for .com primary",
        severity: "error",
      });
    }

    if (hasSwedishHandle(url)) {
      const parsed = parseResourceUrl(url);
      const expected = parsed ? toEnglishHandle(parsed.handle) : null;
      issues.push({
        menu_handle: menuHandle, menu_title: menuTitle, item_title: title, url,
        issue: expected
          ? `Swedish handle in URL — expected /${parsed!.type}/${expected}`
          : "Swedish handle token in URL",
        severity: "error",
      });
    }

    if (url.includes("actionking")) {
      issues.push({
        menu_handle: menuHandle, menu_title: menuTitle, item_title: title, url,
        issue: "Legacy ActionKing reference",
        severity: "error",
      });
    }

    const parsed = parseResourceUrl(url);
    if (parsed) {
      if (parsed.type === "collections" && !ctx.collections.has(parsed.handle)) {
        issues.push({
          menu_handle: menuHandle, menu_title: menuTitle, item_title: title, url,
          issue: `Collection not found: ${parsed.handle}`,
          severity: "error",
        });
      }
      if (parsed.type === "pages" && !ctx.pages.has(parsed.handle)) {
        issues.push({
          menu_handle: menuHandle, menu_title: menuTitle, item_title: title, url,
          issue: `Page not found: ${parsed.handle}`,
          severity: "warn",
        });
      }
    } else if (url.startsWith("/") && !url.startsWith("/policies") && !url.startsWith("/account") &&
      !url.startsWith("/cart") && !url.startsWith("/search") && url !== "/") {
      if (!url.match(/^\/(collections|pages|blogs|products|policies|account)/)) {
        issues.push({
          menu_handle: menuHandle, menu_title: menuTitle, item_title: title, url,
          issue: "Unrecognized internal path",
          severity: "warn",
        });
      }
    }

    if (it.items?.length) {
      issues.push(...walkMenuItems(menuHandle, menuTitle, it.items, ctx, [...path, it.title]));
    }
  }
  return issues;
}

function countItems(items: any[]): number {
  return (items || []).reduce((n, it) => n + 1 + countItems(it.items || []), 0);
}

/** Validate desktop, mobile, mega menus and all internal/collection links */
export async function validateNavigation(access: ShopAccess): Promise<NavigationValidation> {
  const handleSets = await fetchHandleSets(access);
  const allMenus: any[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 10; i++) {
    const data = await shopifyGraphql(access, MENUS_DETAIL, { cursor });
    allMenus.push(...(data?.menus?.nodes || []));
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }

  const all_menus: NavigationValidation["all_menus"] = [];
  const allIssues: LinkIssue[] = [];

  for (const m of allMenus) {
    const handle = String(m.handle);
    const issues = walkMenuItems(handle, String(m.title), m.items || [], handleSets);
    all_menus.push({
      handle,
      title: String(m.title),
      item_count: countItems(m.items || []),
      issues,
    });
    allIssues.push(...issues);
  }

  const mainMenu = allMenus.find((m) => m.handle === "main-menu") || allMenus.find((m) => m.isDefault);
  const footerMenu = allMenus.find((m) => m.handle === "footer");
  const enterpriseMenu = allMenus.find((m) => m.handle === "enterprise-drones");

  const desktopIssues = allIssues.filter((i) =>
    i.menu_handle === "main-menu" || CANONICAL_MENU_HANDLES.includes(i.menu_handle as any),
  );
  const mobileIssues = desktopIssues; // Shopify uses same menu for mobile in OS 2.0 by default
  const collectionIssues = allIssues.filter((i) => i.url.includes("/collections/"));
  const swedishUrls = allIssues.filter((i) => i.issue.includes("Swedish"));
  const enSubfolder = allIssues.filter((i) => i.url.includes("/en/"));

  const errors = allIssues.filter((i) => i.severity === "error").length;
  const warnings = allIssues.filter((i) => i.severity === "warn").length;

  return {
    passed: errors === 0,
    desktop_menu: {
      handle: mainMenu?.handle || "main-menu",
      items: countItems(mainMenu?.items || []),
      issues: desktopIssues,
    },
    mobile_menu: {
      handle: mainMenu?.handle || "main-menu",
      items: countItems(mainMenu?.items || []),
      issues: mobileIssues,
    },
    mega_menus: enterpriseMenu ? [{
      handle: enterpriseMenu.handle,
      items: countItems(enterpriseMenu.items || []),
      issues: allIssues.filter((i) => i.menu_handle === enterpriseMenu.handle),
    }] : [],
    all_menus,
    internal_link_issues: allIssues,
    collection_link_issues: collectionIssues,
    swedish_handle_urls: swedishUrls,
    en_subfolder_urls: enSubfolder,
    summary: {
      total_issues: allIssues.length,
      errors,
      warnings,
      menus_checked: all_menus.length,
    },
  };
}
