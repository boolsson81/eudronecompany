import type { ShopAccess } from "../cloner-shopify-access.ts";
import { shopifyGraphql, shopifyRest } from "../cloner-shopify-access.ts";
import { buildHandleMapping, detectHandleCollisions } from "./slug-en.ts";

export type ResourceKind = "collection" | "page" | "blog";

export type RenameResult = {
  kind: ResourceKind;
  from: string;
  to: string;
  id: string;
  status: "renamed" | "skipped" | "failed" | "dry_run";
  error?: string;
};

const COLLECTIONS_QUERY = `
  query Collections($cursor: String) {
    collections(first: 250, after: $cursor) {
      edges { cursor node { id handle title } }
      pageInfo { hasNextPage }
    }
  }
`;

const PAGES_QUERY = `
  query Pages($cursor: String) {
    pages(first: 250, after: $cursor) {
      edges { cursor node { id handle title } }
      pageInfo { hasNextPage }
    }
  }
`;

const COLLECTION_UPDATE = `
  mutation CollectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

async function fetchAllCollections(access: ShopAccess) {
  const out: Array<{ id: string; handle: string; title: string }> = [];
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const data = await shopifyGraphql(access, COLLECTIONS_QUERY, { cursor });
    for (const edge of data?.collections?.edges || []) {
      out.push({ id: edge.node.id, handle: edge.node.handle, title: edge.node.title });
      cursor = edge.cursor;
    }
    if (!data?.collections?.pageInfo?.hasNextPage) break;
  }
  return out;
}

async function fetchAllPages(access: ShopAccess) {
  const out: Array<{ id: string; handle: string; title: string }> = [];
  let cursor: string | null = null;
  for (let i = 0; i < 10; i++) {
    const data = await shopifyGraphql(access, PAGES_QUERY, { cursor });
    for (const edge of data?.pages?.edges || []) {
      out.push({ id: edge.node.id, handle: edge.node.handle, title: edge.node.title });
      cursor = edge.cursor;
    }
    if (!data?.pages?.pageInfo?.hasNextPage) break;
  }
  return out;
}

async function fetchAllBlogs(access: ShopAccess) {
  const res: any = await shopifyRest(access, "GET", "blogs.json?limit=250");
  return (res?.blogs || []).map((b: any) => ({
    id: String(b.id),
    handle: String(b.handle),
    title: String(b.title || ""),
  }));
}

/**
 * Rename Shopify resource handles in place.
 * NEVER creates URL redirects — safe for pre-launch stores with no indexed URLs.
 */
export async function renameHandles(
  access: ShopAccess,
  opts: {
    dryRun?: boolean;
    kinds?: ResourceKind[];
    /** Limit to specific source handles */
    handles?: string[];
  } = {},
): Promise<{
  results: RenameResult[];
  collisions: Array<{ from: string; to: string; reason: string }>;
  summary: { renamed: number; skipped: number; failed: number; dry_run: number };
}> {
  const kinds = opts.kinds || ["collection", "page", "blog"];
  const filter = opts.handles?.length ? new Set(opts.handles.map((h) => h.toLowerCase())) : null;
  const results: RenameResult[] = [];

  const [collections, pages, blogs] = await Promise.all([
    kinds.includes("collection") ? fetchAllCollections(access) : Promise.resolve([]),
    kinds.includes("page") ? fetchAllPages(access) : Promise.resolve([]),
    kinds.includes("blog") ? fetchAllBlogs(access) : Promise.resolve([]),
  ]);

  const allHandles = new Set([
    ...collections.map((c) => c.handle),
    ...pages.map((p) => p.handle),
    ...blogs.map((b) => b.handle),
  ]);

  const mappings: Array<{ kind: ResourceKind; from: string; to: string; id: string }> = [];

  for (const c of collections) {
    if (filter && !filter.has(c.handle)) continue;
    const to = buildHandleMapping([c.handle])[0];
    if (to) mappings.push({ kind: "collection", from: c.handle, to: to.to, id: c.id });
  }
  for (const p of pages) {
    if (filter && !filter.has(p.handle)) continue;
    const to = buildHandleMapping([p.handle])[0];
    if (to) mappings.push({ kind: "page", from: p.handle, to: to.to, id: p.id });
  }
  for (const b of blogs) {
    if (filter && !filter.has(b.handle)) continue;
    const to = buildHandleMapping([b.handle])[0];
    if (to) mappings.push({ kind: "blog", from: b.handle, to: to.to, id: b.id });
  }

  const collisions = detectHandleCollisions(
    mappings.map((m) => ({ from: m.from, to: m.to })),
    allHandles,
  );
  const blocked = new Set(collisions.map((c) => c.from));

  for (const m of mappings) {
    if (blocked.has(m.from)) {
      results.push({
        kind: m.kind,
        from: m.from,
        to: m.to,
        id: m.id,
        status: "failed",
        error: collisions.find((c) => c.from === m.from)?.reason || "collision",
      });
      continue;
    }

    if (opts.dryRun) {
      results.push({ kind: m.kind, from: m.from, to: m.to, id: m.id, status: "dry_run" });
      continue;
    }

    try {
      if (m.kind === "collection") {
        const data = await shopifyGraphql(access, COLLECTION_UPDATE, {
          input: { id: m.id, handle: m.to },
        });
        const errs = data?.collectionUpdate?.userErrors || [];
        if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
        results.push({ kind: m.kind, from: m.from, to: m.to, id: m.id, status: "renamed" });
      } else if (m.kind === "page") {
        const pageId = m.id.replace(/^gid:\/\/shopify\/Page\//i, "");
        await shopifyRest(access, "PUT", `pages/${pageId}.json`, { page: { handle: m.to } });
        results.push({ kind: m.kind, from: m.from, to: m.to, id: m.id, status: "renamed" });
      } else if (m.kind === "blog") {
        await shopifyRest(access, "PUT", `blogs/${m.id}.json`, { blog: { id: m.id, handle: m.to } });
        results.push({ kind: m.kind, from: m.from, to: m.to, id: m.id, status: "renamed" });
      }
    } catch (e) {
      results.push({
        kind: m.kind,
        from: m.from,
        to: m.to,
        id: m.id,
        status: "failed",
        error: (e as Error).message,
      });
    }
  }

  const summary = {
    renamed: results.filter((r) => r.status === "renamed").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    dry_run: results.filter((r) => r.status === "dry_run").length,
  };

  return { results, collisions, summary };
}

/** Preview all handle mappings without touching Shopify */
export async function previewHandleMappings(access: ShopAccess) {
  const [collections, pages, blogs] = await Promise.all([
    fetchAllCollections(access),
    fetchAllPages(access),
    fetchAllBlogs(access),
  ]);

  const all = [
    ...collections.map((c) => ({ kind: "collection" as const, handle: c.handle, title: c.title })),
    ...pages.map((p) => ({ kind: "page" as const, handle: p.handle, title: p.title })),
    ...blogs.map((b) => ({ kind: "blog" as const, handle: b.handle, title: b.title })),
  ];

  const mappings = buildHandleMapping(all.map((a) => a.handle));
  const allHandles = new Set(all.map((a) => a.handle));
  const collisions = detectHandleCollisions(mappings, allHandles);

  const enriched = mappings.map((m) => {
    const src = all.find((a) => a.handle === m.from);
    return { ...m, kind: src?.kind, title: src?.title };
  });

  const unchanged = all.filter((a) => !mappings.find((m) => m.from === a.handle));

  return { mappings: enriched, unchanged, collisions, counts: {
    collections: collections.length,
    pages: pages.length,
    blogs: blogs.length,
    toRename: mappings.length,
    unchanged: unchanged.length,
  }};
}
