// One-shot: (1) sync cloner_stores.access_token from shopify_app_installations,
// (2) reset 401-failed items to retry, (3) map Shopify standard taxonomy
// metafield/metaobject definitions on target → mark as published with target_id.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const MIGRATION_ID = "3d9876af-885c-49e9-a4b0-c4943c06112f";
const API_VERSION = "2025-10";

async function shopifyGraphql(domain: string, token: string, query: string, variables?: any) {
  const r = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(`shopify ${r.status}: ${JSON.stringify(j.errors || j)}`);
  return j.data;
}

async function fetchTargetMetafieldDefs(domain: string, token: string) {
  const owners = ["PRODUCT", "PRODUCTVARIANT", "COLLECTION", "CUSTOMER", "ORDER", "COMPANY", "LOCATION", "MARKET", "SHOP", "ARTICLE", "BLOG", "PAGE"];
  const map = new Map<string, string>(); // key: `${ownerType}::${namespace}.${key}` → gid
  for (const owner of owners) {
    let cursor: string | null = null;
    do {
      const data: any = await shopifyGraphql(domain, token, `
        query($owner: MetafieldOwnerType!, $after: String) {
          metafieldDefinitions(ownerType: $owner, first: 250, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { id namespace key ownerType }
          }
        }`, { owner, after: cursor });
      for (const n of data.metafieldDefinitions.nodes) {
        map.set(`${n.ownerType}::${n.namespace}.${n.key}`, n.id);
      }
      cursor = data.metafieldDefinitions.pageInfo.hasNextPage ? data.metafieldDefinitions.pageInfo.endCursor : null;
    } while (cursor);
  }
  return map;
}

async function fetchTargetMetaobjectDefs(domain: string, token: string) {
  const map = new Map<string, string>(); // type → gid
  let cursor: string | null = null;
  do {
    const data: any = await shopifyGraphql(domain, token, `
      query($after: String) {
        metaobjectDefinitions(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { id type }
        }
      }`, { after: cursor });
    for (const n of data.metaobjectDefinitions.nodes) map.set(n.type, n.id);
    cursor = data.metaobjectDefinitions.pageInfo.hasNextPage ? data.metaobjectDefinitions.pageInfo.endCursor : null;
  } while (cursor);
  return map;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // AuthZ: this function copies Shopify access tokens between tables and
    // mutates Shopify metafield/metaobject definitions. Restrict to
    // service-role or a platform admin caller.
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    let authorized = false;
    if (bearer && bearer === serviceRole) {
      authorized = true;
    } else if (bearer) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      const { data: userRes } = await userClient.auth.getUser();
      if (userRes?.user) {
        const adminClient = createClient(supabaseUrl, serviceRole);
        const { data: isAdmin } = await adminClient.rpc("has_role", {
          _user_id: userRes.user.id,
          _role: "admin",
        });
        if (isAdmin) authorized = true;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRole);
    const result: any = { steps: {} };

    // STEP A: sync access tokens
    const { data: mig } = await admin.from("cloner_migrations")
      .select("source_store_id,target_store_id").eq("id", MIGRATION_ID).single();
    const { data: stores } = await admin.from("cloner_stores")
      .select("id,shop_domain,access_token").in("id", [mig!.source_store_id, mig!.target_store_id]);
    const tokenSync: any[] = [];
    for (const s of stores!) {
      const { data: inst } = await admin.from("shopify_app_installations")
        .select("access_token,uninstalled_at").eq("shopify_domain", s.shop_domain)
        .is("uninstalled_at", null).maybeSingle();
      if (inst?.access_token && inst.access_token !== s.access_token) {
        await admin.from("cloner_stores").update({ access_token: inst.access_token, last_validated_at: new Date().toISOString(), validation_error: null }).eq("id", s.id);
        tokenSync.push({ domain: s.shop_domain, updated: true });
      } else {
        tokenSync.push({ domain: s.shop_domain, updated: false, reason: inst?.access_token ? "same" : "no_install" });
      }
    }
    result.steps.token_sync = tokenSync;

    // Reload target store with fresh token
    const { data: target } = await admin.from("cloner_stores").select("shop_domain,access_token").eq("id", mig!.target_store_id).single();

    // STEP B: reset 401-failed items to idle
    const { data: failed401, error: selErr } = await admin.from("cloner_migration_items")
      .select("id").eq("migration_id", MIGRATION_ID).eq("publish_status", "failed")
      .like("error", "%401%");
    if (selErr) throw selErr;
    if (failed401 && failed401.length > 0) {
      const ids = failed401.map((r: any) => r.id);
      // chunk update
      for (let i = 0; i < ids.length; i += 500) {
        await admin.from("cloner_migration_items").update({ publish_status: "idle", error: null }).in("id", ids.slice(i, i + 500));
      }
    }
    result.steps.reset_401 = { count: failed401?.length ?? 0 };

    // STEP C: standard taxonomy mapping
    const [mfMap, moMap] = await Promise.all([
      fetchTargetMetafieldDefs(target!.shop_domain, target!.access_token),
      fetchTargetMetaobjectDefs(target!.shop_domain, target!.access_token),
    ]);
    result.steps.target_def_counts = { metafield: mfMap.size, metaobject: moMap.size };

    // Map metafieldDefinition items — try mapping; if missing standard, attempt standardMetafieldDefinitionEnable
    const { data: mfItems } = await admin.from("cloner_migration_items")
      .select("id,source_payload").eq("migration_id", MIGRATION_ID)
      .eq("object_type", "metafieldDefinition")
      .in("publish_status", ["failed", "idle", "pending"]);
    let mfMapped = 0, mfUnmapped = 0, mfEnabled = 0, mfEnableFailed = 0;
    const mfUnmappedSamples: any[] = [];
    const mfEnableErrors: any[] = [];
    for (const it of mfItems ?? []) {
      const p: any = it.source_payload || {};
      const owner = p.ownerType;
      const ns = p.namespace;
      const key = p.key;
      let gid = mfMap.get(`${owner}::${ns}.${key}`);
      if (!gid && ns === "shopify") {
        try {
          const data: any = await shopifyGraphql(target!.shop_domain, target!.access_token, `
            mutation($owner: MetafieldOwnerType!, $ns: String!, $key: String!) {
              standardMetafieldDefinitionEnable(ownerType: $owner, namespace: $ns, key: $key) {
                createdDefinition { id }
                userErrors { field message code }
              }
            }`, { owner, ns, key });
          const created = data?.standardMetafieldDefinitionEnable?.createdDefinition?.id;
          const errs = data?.standardMetafieldDefinitionEnable?.userErrors ?? [];
          if (created) {
            gid = created;
            mfMap.set(`${owner}::${ns}.${key}`, created);
            mfEnabled++;
          } else {
            mfEnableFailed++;
            if (mfEnableErrors.length < 8) mfEnableErrors.push({ owner, key, errors: errs });
          }
        } catch (e) {
          mfEnableFailed++;
          if (mfEnableErrors.length < 8) mfEnableErrors.push({ owner, key, error: (e as Error).message });
        }
      }
      if (gid) {
        await admin.from("cloner_migration_items").update({ target_id: gid, publish_status: "published", error: null }).eq("id", it.id);
        mfMapped++;
      } else {
        mfUnmapped++;
        if (mfUnmappedSamples.length < 10) mfUnmappedSamples.push({ owner, ns, key });
      }
    }
    result.steps.metafield_mapping = { mapped: mfMapped, enabled_via_mutation: mfEnabled, enable_failed: mfEnableFailed, unmapped: mfUnmapped, unmapped_samples: mfUnmappedSamples, enable_errors: mfEnableErrors };

    // Map metaobjectDefinition items
    const { data: moItems } = await admin.from("cloner_migration_items")
      .select("id,source_payload").eq("migration_id", MIGRATION_ID)
      .eq("object_type", "metaobjectDefinition")
      .in("publish_status", ["failed", "idle", "pending"]);
    let moMapped = 0, moUnmapped = 0;
    const moUnmappedSamples: any[] = [];
    for (const it of moItems ?? []) {
      const p: any = it.source_payload || {};
      const type = p.type || p.definition?.type;
      const gid = type ? moMap.get(type) : null;
      if (gid) {
        await admin.from("cloner_migration_items").update({ target_id: gid, publish_status: "published", error: null }).eq("id", it.id);
        moMapped++;
      } else {
        moUnmapped++;
        if (moUnmappedSamples.length < 10) moUnmappedSamples.push({ type });
      }
    }
    result.steps.metaobject_mapping = { mapped: moMapped, unmapped: moUnmapped, samples: moUnmappedSamples };

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
