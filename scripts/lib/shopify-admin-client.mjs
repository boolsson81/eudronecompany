/**
 * EuroDroneParts Shopify Admin GraphQL client (read-only by default).
 * Uses Supabase test-integration proxy when no direct token is set.
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "ya1xhg-x6.myshopify.com";

let envLoaded = false;

export function loadEnv() {
  if (envLoaded) return;
  envLoaded = true;
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

function supabaseConfig() {
  loadEnv();
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.CLONER_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return { url, key };
}

export async function shopifyGraphQL(query, variables = {}) {
  loadEnv();
  const directToken = process.env.EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (directToken) {
    const res = await fetch(`https://${SHOP_DOMAIN}/admin/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": directToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
    return json.data;
  }

  const { url, key } = supabaseConfig();
  if (!url || !key) throw new Error("No Shopify credentials: set EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN or Supabase keys in .env");

  const res = await fetch(`${url}/functions/v1/test-integration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: SHOP_DOMAIN, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || JSON.stringify(json.errors || json));
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

const COLLECTION_BY_HANDLE = `
  query CollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      productsCount { count }
      ruleSet {
        appliedDisjunctively
        rules { column relation condition }
      }
    }
  }
`;

const COLLECTION_PRODUCTS = `
  query CollectionProducts($id: ID!, $cursor: String) {
    node(id: $id) {
      ... on Collection {
        products(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id }
        }
      }
    }
  }
`;

const URL_REDIRECT_CREATE = `
  mutation UrlRedirectCreate($urlRedirect: UrlRedirectInput!) {
    urlRedirectCreate(urlRedirect: $urlRedirect) {
      urlRedirect { id path target }
      userErrors { field message }
    }
  }
`;

export async function createRedirect(path, target) {
  const data = await shopifyGraphQL(URL_REDIRECT_CREATE, { urlRedirect: { path, target } });
  const errs = data?.urlRedirectCreate?.userErrors || [];
  if (errs.length && !/already been taken/i.test(errs.map((e) => e.message).join(" "))) {
    throw new Error(errs.map((e) => e.message).join("; "));
  }
  return data?.urlRedirectCreate?.urlRedirect;
}

const URL_REDIRECT_LOOKUP = `
  query UrlRedirectLookup($query: String!) {
    urlRedirects(first: 5, query: $query) {
      nodes { id path target }
    }
  }
`;

export async function fetchCollectionByHandle(handle) {
  const data = await shopifyGraphQL(COLLECTION_BY_HANDLE, { handle });
  return data?.collectionByHandle || null;
}

export async function fetchAllCollectionProductIds(collectionId) {
  const ids = new Set();
  let cursor = null;
  for (let page = 0; page < 200; page++) {
    const data = await shopifyGraphQL(COLLECTION_PRODUCTS, { id: collectionId, cursor });
    const conn = data?.node?.products;
    if (!conn) break;
    for (const n of conn.nodes || []) ids.add(n.id);
    if (!conn.pageInfo?.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return ids;
}

export async function lookupRedirect(path) {
  const data = await shopifyGraphQL(URL_REDIRECT_LOOKUP, { query: `path:${path}` });
  return data?.urlRedirects?.nodes || [];
}

export async function pingShop() {
  const data = await shopifyGraphQL(`query { shop { name myshopifyDomain } }`);
  return data?.shop;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function assertNoErrors(userErrors, context) {
  const errs = userErrors || [];
  if (errs.length) throw new Error(`${context}: ${errs.map((e) => e.message).join("; ")}`);
}

export async function updateCollection(input) {
  const data = await shopifyGraphQL(
    `mutation CollectionUpdate($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { id handle title productsCount { count } ruleSet { appliedDisjunctively rules { column relation condition } } }
        userErrors { field message }
      }
    }`,
    { input },
  );
  assertNoErrors(data?.collectionUpdate?.userErrors, "collectionUpdate");
  return data.collectionUpdate.collection;
}

export async function updateCollectionRules(id, ruleSet) {
  return updateCollection({ id, ruleSet });
}

export async function createCollection(input) {
  const data = await shopifyGraphQL(
    `mutation CollectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle title }
        userErrors { field message }
      }
    }`,
    { input },
  );
  assertNoErrors(data?.collectionCreate?.userErrors, "collectionCreate");
  return data.collectionCreate.collection;
}

export async function deleteCollection(id) {
  const data = await shopifyGraphQL(
    `mutation CollectionDelete($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) {
        deletedCollectionId
        userErrors { field message }
      }
    }`,
    { input: { id } },
  );
  assertNoErrors(data?.collectionDelete?.userErrors, "collectionDelete");
  return data.collectionDelete.deletedCollectionId;
}

export async function addProductsToCollection(id, productIds) {
  const CHUNK = 200;
  let added = 0;
  for (let i = 0; i < productIds.length; i += CHUNK) {
    const batch = productIds.slice(i, i + CHUNK);
    const data = await shopifyGraphQL(
      `mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
        collectionAddProducts(id: $id, productIds: $productIds) {
          userErrors { field message }
        }
      }`,
      { id, productIds: batch },
    );
    assertNoErrors(data?.collectionAddProducts?.userErrors, "collectionAddProducts");
    added += batch.length;
    await sleep(250);
  }
  return added;
}

const PAGE_BY_HANDLE = `
  query PagesByHandle($query: String!) {
    pages(first: 1, query: $query) {
      nodes { id handle title }
    }
  }
`;

export async function fetchPageByHandle(handle) {
  const data = await shopifyGraphQL(PAGE_BY_HANDLE, { query: `handle:${handle}` });
  return data?.pages?.nodes?.[0] || null;
}

export async function updatePage(id, page) {
  const data = await shopifyGraphQL(
    `mutation PageUpdate($id: ID!, $page: PageUpdateInput!) {
      pageUpdate(id: $id, page: $page) {
        page { id handle title }
        userErrors { field message }
      }
    }`,
    { id, page },
  );
  assertNoErrors(data?.pageUpdate?.userErrors, "pageUpdate");
  return data.pageUpdate.page;
}

export async function createPage(page) {
  const data = await shopifyGraphQL(
    `mutation PageCreate($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { id handle title }
        userErrors { field message }
      }
    }`,
    { page },
  );
  assertNoErrors(data?.pageCreate?.userErrors, "pageCreate");
  return data.pageCreate.page;
}

const MENUS_QUERY = `
  query Menus($cursor: String) {
    menus(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes { id handle title }
    }
  }
`;

const MENU_QUERY = `
  query Menu($id: ID!) {
    menu(id: $id) {
      id handle title
      items {
        id title url type
        items {
          id title url type
          items { id title url type items { id title url type } }
        }
      }
    }
  }
`;

export async function fetchAllMenus() {
  const menus = [];
  let cursor = null;
  for (let page = 0; page < 20; page++) {
    const data = await shopifyGraphQL(MENUS_QUERY, { cursor });
    menus.push(...(data?.menus?.nodes || []));
    if (!data?.menus?.pageInfo?.hasNextPage) break;
    cursor = data.menus.pageInfo.endCursor;
  }
  return menus;
}

export async function fetchMenuById(id) {
  const data = await shopifyGraphQL(MENU_QUERY, { id });
  return data?.menu || null;
}

export async function updateMenu(id, title, items) {
  const data = await shopifyGraphQL(
    `mutation MenuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
      menuUpdate(id: $id, title: $title, items: $items) {
        menu { id handle title }
        userErrors { field message }
      }
    }`,
    { id, title, items },
  );
  assertNoErrors(data?.menuUpdate?.userErrors, "menuUpdate");
  return data.menuUpdate.menu;
}

export async function createMenu(title, handle, items) {
  const data = await shopifyGraphQL(
    `mutation MenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
      menuCreate(title: $title, handle: $handle, items: $items) {
        menu { id handle title }
        userErrors { field message }
      }
    }`,
    { title, handle, items },
  );
  assertNoErrors(data?.menuCreate?.userErrors, "menuCreate");
  return data.menuCreate.menu;
}

export async function deleteMenu(id) {
  const data = await shopifyGraphQL(
    `mutation MenuDelete($id: ID!) {
      menuDelete(id: $id) {
        deletedMenuId
        userErrors { field message }
      }
    }`,
    { id },
  );
  assertNoErrors(data?.menuDelete?.userErrors, "menuDelete");
  return data.menuDelete.deletedMenuId;
}

const BLOGS_QUERY = `
  query Blogs($cursor: String) {
    blogs(first: 20, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id handle title
        articles(first: 100) {
          nodes { id handle title }
        }
      }
    }
  }
`;

export async function fetchAllBlogs() {
  const blogs = [];
  let cursor = null;
  for (let page = 0; page < 10; page++) {
    const data = await shopifyGraphQL(BLOGS_QUERY, { cursor });
    blogs.push(...(data?.blogs?.nodes || []));
    if (!data?.blogs?.pageInfo?.hasNextPage) break;
    cursor = data.blogs.pageInfo.endCursor;
  }
  return blogs;
}

export async function updateBlog(id, blog) {
  const data = await shopifyGraphQL(
    `mutation BlogUpdate($id: ID!, $blog: BlogUpdateInput!) {
      blogUpdate(id: $id, blog: $blog) {
        blog { id handle title }
        userErrors { field message }
      }
    }`,
    { id, blog },
  );
  assertNoErrors(data?.blogUpdate?.userErrors, "blogUpdate");
  return data.blogUpdate.blog;
}

export async function updateArticle(id, article) {
  const data = await shopifyGraphQL(
    `mutation ArticleUpdate($id: ID!, $article: ArticleUpdateInput!) {
      articleUpdate(id: $id, article: $article) {
        article { id handle title blog { handle } }
        userErrors { field message }
      }
    }`,
    { id, article },
  );
  assertNoErrors(data?.articleUpdate?.userErrors, "articleUpdate");
  return data.articleUpdate.article;
}

export async function fetchMarkets() {
  const data = await shopifyGraphQL(
    `query {
      markets(first: 20) {
        nodes { id name handle primary enabled }
      }
    }`,
  );
  return data?.markets?.nodes || [];
}
