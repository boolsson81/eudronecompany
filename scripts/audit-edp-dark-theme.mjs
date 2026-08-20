#!/usr/bin/env node
/**
 * Audit theme files for light color scheme usage outside scheme-edp.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "theme");
const LIGHT_SCHEMES = /"color_scheme"\s*:\s*"scheme-(?!edp)[^"]+"/g;
const GLOBAL_LIGHT = /"(card|collection_card|blog_card)_color_scheme"\s*:\s*"scheme-(?!edp)[^"]+"/g;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const issues = [];
for (const file of walk(ROOT)) {
  if (!/\.(json|liquid)$/.test(file)) continue;
  const rel = file.replace(ROOT + "/", "");
  const text = readFileSync(file, "utf8");
  for (const re of [LIGHT_SCHEMES, GLOBAL_LIGHT]) {
    const matches = text.match(re);
    if (matches) {
      issues.push({ file: rel, matches: [...new Set(matches)] });
    }
  }
}

console.log("# EDP dark theme audit\n");
if (!issues.length) {
  console.log("✅ All template/config color_scheme references use scheme-edp (or no explicit scheme).");
  process.exit(0);
}

console.log(`❌ ${issues.length} file(s) with light scheme references:\n`);
for (const { file, matches } of issues) {
  console.log(`- ${file}`);
  matches.forEach((m) => console.log(`    ${m}`));
}
process.exit(1);
