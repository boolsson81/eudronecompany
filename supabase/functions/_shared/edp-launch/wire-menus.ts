import type { ShopAccess } from "../cloner-shopify-access.ts";
import { shopifyGraphql } from "../cloner-shopify-access.ts";
import {
  CANONICAL_MENU_HANDLES,
  LEGACY_MENU_HANDLES,
  MENU_DEFINITIONS,
  type MenuDef,
  type MenuItemDef,
} from "./config.ts";

const MENUS_QUERY = `
  query Menus($cursor: String) {
    menus(first: 50, after: $cursor) {
      nodes { id handle title }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const MENU_UPDATE = `
  mutation MenuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu { id handle title }
      userErrors { field message }
    }
  }
`;

const MENU_DELETE = `
  mutation MenuDelete($id: ID!) {
    menuDelete(id: $id) {
      deletedMenuId
      userErrors { field message }
    }
  }
`;

const MENU_CREATE = `
  mutation MenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu { id handle title }
      userErrors { field message }
    }
  }
`;

async function fetchTargetMenus(access: ShopAccess): Promise<Map<string, { id: string; title: string }>> {
  const map = new Map<string, { id: string; title: string }>();
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const data = await shopifyGraphql(access, MENUS_QUERY, { cursor });
    for (const node of data?.menus?.nodes || []) {
      if (node?.handle) map.set(String(node.handle), { id: node.id, title: node.title });
    }
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return map;
}

function toShopifyMenuItems(items: MenuItemDef[]): any[] {
  return items.map((it) => ({
    title: it.title,
    type: it.type === "COLLECTION" || it.type === "PAGE" || it.type === "BLOG" ? "HTTP" : it.type,
    url: it.url,
    items: it.items?.length ? toShopifyMenuItems(it.items) : [],
  }));
}

export type MenuWireResult = {
  handle: string;
  action: "updated" | "created" | "deleted" | "skipped" | "dry_run" | "failed";
  error?: string;
  itemCount?: number;
};

/**
 * Wire canonical menus to English URL structure.
 * Deletes legacy menus when confirm_delete is true.
 */
export async function wireMenus(
  access: ShopAccess,
  opts: {
    dryRun?: boolean;
    confirmDelete?: boolean;
    menuDefs?: MenuDef[];
    deleteHandles?: string[];
  } = {},
): Promise<{ results: MenuWireResult[]; summary: Record<string, number> }> {
  const menuDefs = opts.menuDefs || MENU_DEFINITIONS;
  const deleteHandles = opts.deleteHandles || [...LEGACY_MENU_HANDLES];
  const targetMenus = await fetchTargetMenus(access);
  const results: MenuWireResult[] = [];

  // Rename enterprise-dr-nare → enterprise-drones if it exists
  const legacyEnterprise = targetMenus.get("enterprise-dr-nare");
  if (legacyEnterprise && !targetMenus.has("enterprise-drones")) {
    // Shopify doesn't support menu handle rename — recreate via update title only
    // The enterprise-drones menu def will create or update
  }

  for (const def of menuDefs) {
    const existing = targetMenus.get(def.handle);
    const items = toShopifyMenuItems(def.items);

    if (opts.dryRun) {
      results.push({
        handle: def.handle,
        action: "dry_run",
        itemCount: items.length,
      });
      continue;
    }

    try {
      if (existing) {
        const data = await shopifyGraphql(access, MENU_UPDATE, {
          id: existing.id,
          title: def.title,
          items,
        });
        const errs = data?.menuUpdate?.userErrors || [];
        if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
        results.push({ handle: def.handle, action: "updated", itemCount: items.length });
      } else if (CANONICAL_MENU_HANDLES.includes(def.handle as any)) {
        const data = await shopifyGraphql(access, MENU_CREATE, {
          title: def.title,
          handle: def.handle,
          items,
        });
        const errs = data?.menuCreate?.userErrors || [];
        if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
        results.push({ handle: def.handle, action: "created", itemCount: items.length });
      } else {
        results.push({ handle: def.handle, action: "skipped", error: "not canonical and not on target" });
      }
    } catch (e) {
      results.push({ handle: def.handle, action: "failed", error: (e as Error).message });
    }
  }

  for (const handle of deleteHandles) {
    const existing = targetMenus.get(handle);
    if (!existing) {
      results.push({ handle, action: "skipped", error: "not found" });
      continue;
    }
    if (!opts.confirmDelete) {
      results.push({ handle, action: "skipped", error: "confirm_delete required" });
      continue;
    }
    if (opts.dryRun) {
      results.push({ handle, action: "dry_run" });
      continue;
    }
    try {
      const data = await shopifyGraphql(access, MENU_DELETE, { id: existing.id });
      const errs = data?.menuDelete?.userErrors || [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      results.push({ handle, action: "deleted" });
    } catch (e) {
      results.push({ handle, action: "failed", error: (e as Error).message });
    }
  }

  const summary: Record<string, number> = {};
  for (const r of results) {
    summary[r.action] = (summary[r.action] || 0) + 1;
  }
  return { results, summary };
}

/** List current menus on target store */
export async function listMenus(access: ShopAccess) {
  const menus = await fetchTargetMenus(access);
  return [...menus.entries()].map(([handle, m]) => ({ handle, ...m }));
}
