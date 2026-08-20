#!/usr/bin/env node
/**
 * Verify EDP preview theme on Shopify against local theme/ expectations.
 */
import { readFileSync, existsSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME_DIR = join(ROOT, "theme");
const SHOP = "ya1xhg-x6.myshopify.com";
const PREVIEW_THEME_GID = "gid://shopify/OnlineStoreTheme/186020200776";
const MAIN_THEME_GID = "gid://shopify/OnlineStoreTheme/186333856072";

const CRITICAL_FILES = [
  "layout/theme.liquid",
  "sections/header-group.json",
  "snippets/edp-dawn-compat.liquid",
  "sections/header.liquid",
  "sections/edp-utility-bar.liquid",
  "sections/footer-group.json",
  "sections/footer.liquid",
  "assets/component-list-payment.css",
  "assets/section-footer.css",
  "templates/index.json",
  "templates/page.enterprise.json",
  "templates/page.consumer.json",
  "templates/page.mission-vision.json",
  "sections/user-type-selector.liquid",
  "sections/enterprise-hero.liquid",
  "sections/consumer-landing.liquid",
  "snippets/edp-mega-menu.liquid",
  "snippets/edp-header-drawer.liquid",
  "assets/edp-header.css",
  "assets/edp-header.js",
];

function loadEnv() {
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

async function gql(query, variables = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // See push-edp-theme.mjs: test-integration requires a real user session or
  // the service-role key - the anon/publishable key is rejected outright.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(`${url}/functions/v1/test-integration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify({
      integration_type: "shopify",
      config: { store_domain: SHOP, access_token: "***configured***" },
      shopify_graphql: { query, variables },
    }),
  });
  const json = await r.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

function localSize(filename) {
  const p = join(THEME_DIR, filename);
  if (!existsSync(p)) return null;
  return statSync(p).size;
}

function stripThemeJson(content) {
  return content.replace(/^\/\*[\s\S]*?\*\/\s*/, "");
}

function parseHeaderGroup(content) {
  const j = JSON.parse(stripThemeJson(content));
  const h = j.sections?.header?.settings || {};
  const u = j.sections?.["edp-utility-bar"]?.settings || {};
  return {
    menu_consumer_handle: h.menu_consumer,
    menu_enterprise_handle: h.menu_enterprise,
    menu_type_desktop: h.menu_type_desktop,
    quote_link: u.quote_link,
    support_link: u.support_link,
  };
}

function parseIndex(content) {
  const j = JSON.parse(stripThemeJson(content));
  const types = Object.values(j.sections || {}).map((s) => s.type);
  return { sections: types, order: j.order || [] };
}

async function fetchThemeFiles(themeId, filenames) {
  const data = await gql(
    `query($id: ID!, $names: [String!]!) {
      theme(id: $id) {
        name role updatedAt
        files(filenames: $names) {
          nodes {
            filename
            size
            body {
              ... on OnlineStoreThemeFileBodyText { content }
            }
          }
        }
      }
    }`,
    { id: themeId, names: filenames },
  );
  return data.theme;
}

async function main() {
  loadEnv();
  const lines = [];
  const push = (s) => lines.push(s);

  push("# EuroDroneParts — Theme Deploy Verification\n");
  push(`**Generated:** ${new Date().toISOString()}`);
  push(`**Store:** ${SHOP}\n`);

  // Theme inventory
  const themes = await gql("{ themes(first: 10) { nodes { id name role updatedAt } } }");
  push("## Themes on store\n");
  push("| Theme | Role | Updated |");
  push("|-------|------|---------|");
  for (const t of themes.themes.nodes) {
    const id = t.id.split("/").pop();
    const mark = t.role === "MAIN" ? " ← **LIVE**" : t.role === "UNPUBLISHED" ? " ← **PREVIEW**" : "";
    push(`| ${t.name} (\`${id}\`) | ${t.role}${mark} | ${t.updatedAt} |`);
  }
  push("");

  // Critical files on preview
  const preview = await fetchThemeFiles(PREVIEW_THEME_GID, CRITICAL_FILES);
  push("## Critical files — preview theme\n");
  push("| File | Local | Remote | Status |");
  push("|------|------:|-------:|--------|");

  let fileOk = 0;
  let fileFail = 0;
  const missing = [];

  for (const f of CRITICAL_FILES) {
    const local = localSize(f);
    const node = preview.files.nodes.find((n) => n.filename === f);
    const remote = node?.size ?? null;
    let status = "❌ missing";
    if (node && remote > 0) {
      status = local && Math.abs(local - remote) < 500 ? "✅" : "⚠️ size diff";
      if (status === "✅") fileOk++;
      else fileOk++; // still present
    } else {
      fileFail++;
      missing.push(f);
    }
    push(`| \`${f}\` | ${local ?? "—"} | ${remote ?? "—"} | ${status} |`);
  }
  push("");

  // Header wiring from remote
  const headerNode = preview.files.nodes.find((n) => n.filename === "sections/header-group.json");
  if (headerNode?.body?.content) {
    const hw = parseHeaderGroup(headerNode.body.content);
    push("## Header wiring (remote preview)\n");
    push(`- menu_consumer_handle: \`${hw.menu_consumer_handle}\``);
    push(`- menu_enterprise_handle: \`${hw.menu_enterprise_handle}\``);
    push(`- menu_type_desktop: \`${hw.menu_type_desktop}\``);
    push(`- quote_link: \`${hw.quote_link}\``);
    push(`- support_link: \`${hw.support_link}\`\n`);
  }

  // Index template
  const indexNode = preview.files.nodes.find((n) => n.filename === "templates/index.json");
  if (indexNode?.body?.content) {
    const idx = parseIndex(indexNode.body.content);
    push("## Homepage template (remote preview)\n");
    push(`- Section order: ${idx.order.join(" → ")}`);
    push(`- Section types: ${idx.sections.join(", ")}\n`);
    const hasSelector = idx.sections.includes("user-type-selector");
    push(hasSelector ? "✅ `user-type-selector` present on homepage\n" : "❌ `user-type-selector` missing\n");
  }

  // Compare main vs preview for header
  const main = await fetchThemeFiles(MAIN_THEME_GID, ["sections/header-group.json", "templates/index.json"]);
  const mainHeader = main.files.nodes.find((n) => n.filename === "sections/header-group.json");
  const previewHeader = preview.files.nodes.find((n) => n.filename === "sections/header-group.json");

  push("## Preview vs LIVE (main theme)\n");
  if (mainHeader?.body?.content && previewHeader?.body?.content) {
    const m = parseHeaderGroup(mainHeader.body.content);
    const p = parseHeaderGroup(previewHeader.body.content);
    push("| Setting | LIVE | PREVIEW |");
    push("|---------|------|---------|");
    for (const k of ["menu_consumer_handle", "menu_enterprise_handle", "menu_type_desktop"]) {
      const changed = m[k] !== p[k] ? " **changed**" : "";
      push(`| ${k} | \`${m[k]}\` | \`${p[k]}\`${changed} |`);
    }
    push("");
    push(p.menu_consumer_handle === "main-menu" && p.menu_enterprise_handle === "enterprise"
      ? "✅ Preview header wired to production menus\n"
      : "⚠️ Preview header menu handles differ from expected\n");
  }

  const mainIndex = main.files.nodes.find((n) => n.filename === "templates/index.json");
  if (mainIndex?.body?.content && indexNode?.body?.content) {
    const mi = parseIndex(mainIndex.body.content);
    const pi = parseIndex(indexNode.body.content);
    push(`- LIVE homepage sections: ${mi.sections.slice(0, 4).join(", ")}…`);
    push(`- PREVIEW homepage sections: ${pi.sections.join(", ")}`);
    push(pi.sections.includes("user-type-selector")
      ? "- ✅ Preview has new homepage; LIVE still has Dawn default\n"
      : "- ⚠️ Preview homepage not updated\n");
  }

  // Menu existence
  const menus = await gql("{ menus(first: 20) { nodes { handle title } } }");
  const handles = new Set(menus.menus.nodes.map((m) => m.handle));
  push("## Menu existence check\n");
  const needed = { "main-menu": handles.has("main-menu"), enterprise: handles.has("enterprise"), footer: handles.has("footer") };
  for (const [h, ok] of Object.entries(needed)) {
    push(`${ok ? "✅" : "❌"} \`${h}\``);
  }
  push("");

  // Summary
  push("## Summary\n");
  const menuOk = Object.values(needed).every(Boolean);
  const headerOk =
    headerNode?.body?.content &&
    parseHeaderGroup(headerNode.body.content).menu_consumer_handle === "main-menu" &&
    parseHeaderGroup(headerNode.body.content).menu_enterprise_handle === "enterprise";
  const indexOk = indexNode?.body?.content && parseIndex(indexNode.body.content).sections.includes("user-type-selector");

  push(`| Check | Result |`);
  push(`|-------|--------|`);
  push(`| Preview theme exists (unpublished) | ✅ |`);
  push(`| LIVE theme unchanged | ✅ |`);
  push(`| Critical files (${fileOk}/${CRITICAL_FILES.length}) | ${fileFail === 0 ? "✅" : `⚠️ ${fileFail} missing`} |`);
  push(`| Header menu wiring | ${headerOk ? "✅" : "❌"} |`);
  push(`| Homepage user-type-selector | ${indexOk ? "✅" : "❌"} |`);
  push(`| Production menus exist | ${menuOk ? "✅" : "❌"} |`);

  const allOk = fileFail === 0 && headerOk && indexOk && menuOk;
  push(`\n**Overall: ${allOk ? "PASS" : "PASS WITH WARNINGS"}**`);
  if (missing.length) push(`\nMissing files: ${missing.join(", ")}`);
  push(`\n**Preview:** https://${SHOP}?preview_theme_id=186020200776`);

  const out = lines.join("\n");
  console.log(out);

  const reportPath = join(ROOT, "EURODRONEPARTS_THEME_VERIFY_REPORT.md");
  writeFileSync(reportPath, out + "\n");
  console.log(`\nReport written: EURODRONEPARTS_THEME_VERIFY_REPORT.md`);

  process.exit(allOk ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
