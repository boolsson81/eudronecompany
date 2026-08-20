import type { ShopAccess } from "../cloner-shopify-access.ts";
import { shopifyGraphql, shopifyRest } from "../cloner-shopify-access.ts";
import { CANONICAL_MENU_HANDLES, HANDLE_OVERRIDES, LEGACY_MENU_HANDLES } from "./config.ts";
import { toEnglishHandle } from "./slug-en.ts";

/** Theme settings keys that reference Shopify menus */
const MENU_SETTING_KEYS = [
  "menu", "main_menu", "main-menu", "mobile_menu", "mobile-menu",
  "footer_menu", "footer-menu", "navigation", "main_linklist", "footer_linklist",
  "menu_desktop", "menu_mobile", "mega_menu", "drawer_menu",
];

/** Legacy menu handle → canonical English handle */
export const THEME_MENU_HANDLE_MAP: Record<string, string> = {
  meny: "main-menu",
  "enterprise-dr-nare": "enterprise-drones",
  dronare: "main-menu",
  actionkameror: "main-menu",
  "vandring-outdoor": "main-menu",
};

export type ThemeNavRef = {
  asset: string;
  setting_key: string;
  old_handle: string;
  new_handle: string;
  snippet: string;
};

export type ThemeUrlFix = {
  asset: string;
  old_url: string;
  new_url: string;
  count: number;
};

export type ThemeNavigationResult = {
  theme: { id: number; name: string; role: string } | null;
  scanned_assets: number;
  menu_refs: ThemeNavRef[];
  url_fixes: ThemeUrlFix[];
  mega_menu_sections: string[];
  mobile_menu_refs: ThemeNavRef[];
  desktop_menu_refs: ThemeNavRef[];
  updates_applied: number;
  dry_run: boolean;
  errors: string[];
};

function buildUrlReplacements(): Array<{ from: string; to: string }> {
  const pairs: Array<{ from: string; to: string }> = [];
  for (const [sv, en] of Object.entries(HANDLE_OVERRIDES)) {
    if (sv === en) continue;
    for (const prefix of ["/collections/", "/pages/", "/blogs/", "/en/collections/", "/en/pages/", "/en/blogs/"]) {
      pairs.push({ from: `${prefix}${sv}`, to: `${prefix.replace("/en/", "/")}${en}` });
    }
  }
  // Strip /en/ prefix on .com canonical paths
  pairs.push({ from: "/en/collections/", to: "/collections/" });
  pairs.push({ from: "/en/pages/", to: "/pages/" });
  pairs.push({ from: "/en/blogs/", to: "/blogs/" });
  pairs.push({ from: "/en/products/", to: "/products/" });
  return pairs;
}

const URL_REPLACEMENTS = buildUrlReplacements();

function scanMenuRefs(content: string, asset: string): ThemeNavRef[] {
  const refs: ThemeNavRef[] = [];
  const menuKeyPattern = new RegExp(
    `"(${MENU_SETTING_KEYS.join("|")})"\\s*:\\s*"([a-z0-9-_]+)"`,
    "gi",
  );
  let m;
  while ((m = menuKeyPattern.exec(content)) !== null) {
    const key = m[1];
    const handle = m[2];
    const newHandle = THEME_MENU_HANDLE_MAP[handle] ||
      (LEGACY_MENU_HANDLES.includes(handle as any) ? "main-menu" : null) ||
      (CANONICAL_MENU_HANDLES.includes(handle as any) ? handle : null);
    if (newHandle && newHandle !== handle) {
      refs.push({
        asset,
        setting_key: key,
        old_handle: handle,
        new_handle: newHandle,
        snippet: content.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, " "),
      });
    }
  }
  return refs;
}

function scanUrlFixes(content: string, asset: string): ThemeUrlFix[] {
  const fixes: ThemeUrlFix[] = [];
  for (const { from, to } of URL_REPLACEMENTS) {
    if (!content.includes(from)) continue;
    const count = content.split(from).length - 1;
    fixes.push({ asset, old_url: from, new_url: to, count });
  }
  return fixes;
}

function applyThemePatches(content: string): { content: string; changes: number } {
  let out = content;
  let changes = 0;

  // Menu handle replacements
  for (const [oldH, newH] of Object.entries(THEME_MENU_HANDLE_MAP)) {
    const pattern = new RegExp(`"(${MENU_SETTING_KEYS.join("|")})"\\s*:\\s*"${oldH}"`, "gi");
    const replaced = out.replace(pattern, (_m, key) => {
      changes++;
      return `"${key}": "${newH}"`;
    });
    out = replaced;
  }

  // URL replacements (longest first to avoid partial matches)
  const sorted = [...URL_REPLACEMENTS].sort((a, b) => b.from.length - a.from.length);
  for (const { from, to } of sorted) {
    if (!out.includes(from)) continue;
    const parts = out.split(from);
    changes += parts.length - 1;
    out = parts.join(to);
  }

  // Swedish collection handles in URLs — apply toEnglishHandle per segment
  const urlPattern = /\/(collections|pages|blogs)\/([a-z0-9-]+)/g;
  out = out.replace(urlPattern, (match, type, handle) => {
    const en = toEnglishHandle(handle);
    if (en === handle) return match;
    changes++;
    return `/${type}/${en}`;
  });

  return { content: out, changes };
}

/**
 * Scan and optionally update theme navigation to English menu handles and URLs.
 */
export async function wireThemeNavigation(
  access: ShopAccess,
  opts: { dryRun?: boolean } = {},
): Promise<ThemeNavigationResult> {
  const dryRun = opts.dryRun !== false;
  const errors: string[] = [];
  const menu_refs: ThemeNavRef[] = [];
  const url_fixes: ThemeUrlFix[] = [];
  const mega_menu_sections: string[] = [];
  let updates_applied = 0;

  const themesRes: any = await shopifyRest(access, "GET", "themes.json");
  const themes = themesRes?.themes || [];
  const mainTheme = themes.find((t: any) => t.role === "main") || themes[0];
  if (!mainTheme) {
    return {
      theme: null, scanned_assets: 0, menu_refs, url_fixes,
      mega_menu_sections, mobile_menu_refs: [], desktop_menu_refs: [],
      updates_applied: 0, dry_run: dryRun, errors: ["no_main_theme_found"],
    };
  }

  const assetsRes: any = await shopifyRest(access, "GET", `themes/${mainTheme.id}/assets.json`);
  const allAssets = assetsRes?.assets || [];
  const targetAssets = allAssets.filter((a: any) => {
    const k = String(a.key || "");
    return (k.endsWith(".json") || k.endsWith(".liquid")) &&
      (k.startsWith("config/") || k.startsWith("sections/") || k.startsWith("snippets/") ||
        k.startsWith("templates/") || k.startsWith("layout/"));
  });

  for (const a of targetAssets) {
    try {
      const r: any = await shopifyRest(access, "GET",
        `themes/${mainTheme.id}/assets.json?asset[key]=${encodeURIComponent(a.key)}`);
      const content: string = r?.asset?.value || "";
      if (!content) continue;

      menu_refs.push(...scanMenuRefs(content, a.key));
      url_fixes.push(...scanUrlFixes(content, a.key));

      if (/mega.?menu|menu_type.*mega/i.test(content) || /"type"\s*:\s*"mega"/i.test(content)) {
        mega_menu_sections.push(a.key);
      }

      if (!dryRun) {
        const { content: patched, changes } = applyThemePatches(content);
        if (changes > 0) {
          await shopifyRest(access, "PUT", `themes/${mainTheme.id}/assets.json`, {
            asset: { key: a.key, value: patched },
          });
          updates_applied += changes;
        }
      }
    } catch (e) {
      errors.push(`${a.key}: ${(e as Error).message}`);
    }
  }

  const mobile_menu_refs = menu_refs.filter((r) =>
    /mobile|drawer/i.test(r.setting_key) || /mobile|drawer/i.test(r.asset),
  );
  const desktop_menu_refs = menu_refs.filter((r) => !mobile_menu_refs.includes(r));

  return {
    theme: { id: mainTheme.id, name: mainTheme.name, role: mainTheme.role },
    scanned_assets: targetAssets.length,
    menu_refs,
    url_fixes,
    mega_menu_sections,
    mobile_menu_refs,
    desktop_menu_refs,
    updates_applied: dryRun ? 0 : updates_applied,
    dry_run: dryRun,
    errors,
  };
}
