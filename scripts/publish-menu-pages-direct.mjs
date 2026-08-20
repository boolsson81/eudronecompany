#!/usr/bin/env node
/**
 * Publish menu dependency pages directly to ya1xhg-x6.myshopify.com.
 * Requires EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN (or pass via env).
 * After success, run: node scripts/run-menu-recovery-via-worker.mjs
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOMAIN = (process.env.SHOPIFY_STORE_DOMAIN || "ya1xhg-x6.myshopify.com").replace(/^https?:\/\//, "");
const API_VER = "2024-10";

const PLACEHOLDERS = {
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

function loadEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function rest(token, method, path, body) {
  const r = await fetch(`https://${DOMAIN}/admin/api/${API_VER}/${path}`, {
    method,
    headers: {
      "X-Shopify-Access-Token": token,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : {};
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${text.slice(0, 300)}`);
  return json;
}

async function fetchPages(token) {
  const map = new Map();
  for (let page = 1; page <= 10; page++) {
    const j = await rest(token, "GET", `pages.json?limit=250&page=${page}&fields=id,handle,published_at`);
    for (const p of j.pages || []) map.set(p.handle, { id: p.id, published: !!p.published_at });
    if (!j.pages?.length || j.pages.length < 250) break;
  }
  return map;
}

async function main() {
  loadEnv();
  const token = process.env.EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!token) {
    console.error("Set EUDRONEPARTS_SHOPIFY_ADMIN_TOKEN in .env or environment");
    process.exit(1);
  }

  const live = await fetchPages(token);
  const results = [];

  for (const [handle, ph] of Object.entries(PLACEHOLDERS)) {
    const existing = live.get(handle);
    if (existing?.published) {
      results.push({ handle, result: "skipped", id: existing.id, published: true });
      continue;
    }
    const payload = { page: { title: ph.title, handle, body_html: ph.body_html, published: true } };
    if (existing) {
      const j = await rest(token, "PUT", `pages/${existing.id}.json`, { page: { ...payload.page, id: existing.id } });
      results.push({ handle, result: "updated", id: j.page.id, published: true });
    } else {
      const j = await rest(token, "POST", "pages.json", payload);
      results.push({ handle, result: "created", id: j.page.id, published: true });
    }
  }

  console.log(JSON.stringify({ domain: DOMAIN, pages: results }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
