import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { resolveShopAccess, type ShopAccess } from "./cloner-shopify-access.ts";

export type MenuPagePublishResult = {
  handle: string;
  title: string;
  result: "created" | "updated" | "skipped" | "failed";
  target_id?: string;
  error?: string;
  published: boolean;
};

/** Neutral EuroDroneParts placeholder copy — no ActionKing branding. */
export const MENU_PAGE_PLACEHOLDERS: Record<string, { title: string; body_html: string }> = {
  kontakt: {
    title: "Kontakt",
    body_html:
      "<p>Kontakta Europe Drone Parts för frågor om drönare, tillbehör och reservdelar. Vi återkommer så snart vi kan.</p>",
  },
  information: {
    title: "Information",
    body_html:
      "<p>Information om Europe Drone Parts — din partner för DJI-drönare och professionellt tillbehör i Europa.</p>",
  },
  "ansok-om-partnership": {
    title: "Ansök om partnership",
    body_html:
      "<p>Intresserad av samarbete med Europe Drone Parts? Kontakta oss för partnership och återförsäljarfrågor.</p>",
  },
  "reklamationer-aterkop": {
    title: "Reklamationer & Återköp",
    body_html:
      "<p>Information om reklamationer och återköp hos Europe Drone Parts. Kontakta kundservice om du behöver hjälp.</p>",
  },
};

const TITLE_TO_HANDLE: Record<string, string> = {
  kontakt: "kontakt",
  information: "information",
  "ansök om partnership": "ansok-om-partnership",
  "reklamationer & återköp": "reklamationer-aterkop",
};

function urlPageHandle(url: string): string | null {
  const m = String(url || "").match(/\/pages\/([^/?#]+)/i);
  return m ? m[1] : null;
}

function walkMenuLinks(items: any[], out: Array<{ title: string; url: string; page_handle: string | null }>) {
  for (const it of items || []) {
    const title = String(it.title || "").trim();
    const url = String(it.url || "");
    const fromUrl = urlPageHandle(url);
    const fromTitle = TITLE_TO_HANDLE[title.toLowerCase()] || null;
    out.push({ title, url, page_handle: fromUrl || fromTitle });
    walkMenuLinks(it.items, out);
  }
}

export async function discoverMenuPageHandles(
  admin: SupabaseClient,
  migrationId: string,
): Promise<string[]> {
  const { data: menus } = await admin
    .from("cloner_migration_items")
    .select("source_payload")
    .eq("migration_id", migrationId)
    .eq("object_type", "menu");

  const handles = new Set<string>();
  for (const m of menus || []) {
    const links: Array<{ title: string; url: string; page_handle: string | null }> = [];
    walkMenuLinks((m.source_payload as any)?.items || [], links);
    for (const l of links) {
      if (l.page_handle) handles.add(l.page_handle);
      const th = TITLE_TO_HANDLE[l.title.toLowerCase()];
      if (th) handles.add(th);
    }
  }
  for (const h of Object.keys(MENU_PAGE_PLACEHOLDERS)) handles.add(h);
  return [...handles];
}

async function rest(access: ShopAccess, method: string, path: string, body?: unknown) {
  const r = await fetch(`https://${access.domain}/admin/api/${access.apiVersion}/${path}`, {
    method,
    headers: {
      "X-Shopify-Access-Token": access.token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(`shopify ${r.status}: ${text.slice(0, 400)}`);
  return json;
}

async function fetchLivePageHandles(access: ShopAccess): Promise<Map<string, { id: number; published: boolean }>> {
  const map = new Map<string, { id: number; published: boolean }>();
  let pageInfo: string | null = null;
  for (let i = 0; i < 20; i++) {
    const path = pageInfo
      ? `pages.json?limit=250&page_info=${pageInfo}`
      : "pages.json?limit=250&fields=id,handle,published_at";
    const j = await rest(access, "GET", path);
    for (const p of j.pages || []) {
      map.set(String(p.handle), { id: p.id, published: !!p.published_at });
    }
    if (!j.pages?.length || j.pages.length < 250) break;
  }
  return map;
}

export async function publishMenuDependencyPages(
  admin: SupabaseClient,
  targetStore: any,
  opts: { migrationId: string; dryRun?: boolean; handles?: string[] },
): Promise<{ pages: MenuPagePublishResult[]; summary: { total: number; created: number; updated: number; skipped: number; failed: number } }> {
  const access = await resolveShopAccess(targetStore);
  const wanted = opts.handles?.length
    ? opts.handles
    : await discoverMenuPageHandles(admin, opts.migrationId);
  const live = await fetchLivePageHandles(access);
  const results: MenuPagePublishResult[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const handle of wanted) {
    const placeholder = MENU_PAGE_PLACEHOLDERS[handle] || {
      title: handle.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      body_html: `<p>Europe Drone Parts — ${handle.replace(/-/g, " ")}.</p>`,
    };
    const existing = live.get(handle);

    if (existing?.published) {
      results.push({ handle, title: placeholder.title, result: "skipped", target_id: String(existing.id), published: true });
      skipped++;
      continue;
    }

    if (opts.dryRun) {
      results.push({
        handle,
        title: placeholder.title,
        result: existing ? "updated" : "created",
        target_id: existing ? String(existing.id) : undefined,
        published: true,
      });
      if (existing) updated++;
      else created++;
      continue;
    }

    try {
      const payload = {
        page: {
          title: placeholder.title,
          handle,
          body_html: placeholder.body_html,
          published: true,
        },
      };
      let targetId: string;
      if (existing) {
        const j = await rest(access, "PUT", `pages/${existing.id}.json`, {
          page: { ...payload.page, id: existing.id },
        });
        targetId = String(j.page.id);
        updated++;
        results.push({ handle, title: placeholder.title, result: "updated", target_id: targetId, published: true });
      } else {
        const j = await rest(access, "POST", "pages.json", payload);
        targetId = String(j.page.id);
        created++;
        results.push({ handle, title: placeholder.title, result: "created", target_id: targetId, published: true });
      }

      await admin.from("cloner_migration_items").upsert({
        migration_id: opts.migrationId,
        object_type: "page",
        source_id: `menu-placeholder:${handle}`,
        source_handle: handle,
        source_payload: { handle, title: placeholder.title, body: placeholder.body_html },
        publish_status: "published",
        target_id: targetId,
        target_handle: handle,
        approval_status: "approved",
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "migration_id,object_type,source_id" } as any).catch(() => null);
    } catch (e) {
      failed++;
      results.push({
        handle,
        title: placeholder.title,
        result: "failed",
        error: (e as Error).message,
        published: false,
      });
    }
  }

  return {
    pages: results,
    summary: { total: results.length, created, updated, skipped, failed },
  };
}
