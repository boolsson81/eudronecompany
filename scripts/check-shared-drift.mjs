#!/usr/bin/env node
/**
 * Jämför de speglade `supabase/functions/_shared/`-modulerna mot digitalsignal-repot.
 *
 *   node scripts/check-shared-drift.mjs [sökväg-till-digitalsignal]
 *
 * Modulerna nedan finns i båda repona eftersom funktioner som stannade kvar i
 * DigitalSignal (Sunsky-dropship, leverantörs-FTP, GEO) fortfarande använder dem.
 * DigitalSignal är källan — ändringar där ska speglas hit.
 *
 * Exitkod 1 om någon fil skiljer sig eller saknas.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const HERE = resolve(dirname(new URL(import.meta.url).pathname), "..");
const OTHER = resolve(process.argv[2] ?? join(HERE, "../digitalsignal"));

// Inga filer utanför _shared speglas längre — AdminDroneRegulations flyttade hit
// tillsammans med droneRegulations.ts.
const SRC_MIRRORED = [];

const MIRRORED = [
  "cloner-shopify-access.ts",
  "compliance-sync.ts",
  "dji-compatibility.ts",
  "edp-launch/config.ts",
  "missing-product-type-report.ts",
  "origin-compliance.ts",
  "product-compliance-shopify.ts",
  "product-compliance.ts",
  "product-draft-safety.ts",
  "shopify-auth.ts",
  "shopify-client.ts",
  "shopify-product-feed.ts",
  "shopify-product-templates.ts",
  "suggest-product-type.ts",
  "sunsky-product-map.ts",
  "sunsky-stock.ts",
];

const digest = (p) => (existsSync(p) ? createHash("sha256").update(readFileSync(p)).digest("hex") : null);

if (!existsSync(OTHER)) {
  console.error(`Hittar inte digitalsignal-repot på ${OTHER}. Ange sökväg som argument.`);
  process.exit(2);
}

const paths = [...MIRRORED.map((rel) => `supabase/functions/_shared/${rel}`), ...SRC_MIRRORED];

let drift = 0;
for (const rel of paths) {
  const mine = digest(join(HERE, rel));
  const theirs = digest(join(OTHER, rel));
  if (mine === theirs) continue;
  drift++;
  if (mine === null) console.log(`SAKNAS HÄR      ${rel}`);
  else if (theirs === null) console.log(`SAKNAS I DS     ${rel}`);
  else console.log(`SKILJER SIG     ${rel}`);
}

console.log(
  drift === 0
    ? `Alla ${paths.length} speglade filer är identiska.`
    : `\n${drift} av ${paths.length} filer har glidit isär. DigitalSignal är källan.`,
);
process.exit(drift === 0 ? 0 : 1);
