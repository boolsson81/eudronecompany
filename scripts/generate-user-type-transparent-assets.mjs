#!/usr/bin/env node
/**
 * Generate transparent PNG theme assets for user-type selector cards.
 *
 * Usage: node scripts/generate-user-type-transparent-assets.mjs
 */
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "theme/assets");

const CARDS = [
  {
    url: "https://ya1xhg-x6.myshopify.com/cdn/shop/files/edp-home-user-type-consumer.webp",
    filename: "edp-home-user-type-consumer-transparent.png",
  },
  {
    url: "https://ya1xhg-x6.myshopify.com/cdn/shop/files/edp-home-user-type-enterprise.webp",
    filename: "edp-home-user-type-enterprise-transparent.png",
  },
];

const PY = `
from PIL import Image
import urllib.request, sys, json
url, out = sys.argv[1], sys.argv[2]
img = Image.open(urllib.request.urlopen(url, timeout=30)).convert('RGBA')
max_dim = 600
if max(img.size) > max_dim:
    img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
w, h = img.size
px = img.load()
band=max(8, min(w,h)//12)
rs=gs=bs=n=0
for x in range(w):
  for y in list(range(band))+list(range(h-band,h)):
    r,g,b,a=px[x,y]; rs+=r; gs+=g; bs+=b; n+=1
for y in range(h):
  for x in list(range(band))+list(range(w-band,w)):
    r,g,b,a=px[x,y]; rs+=r; gs+=g; bs+=b; n+=1
bg=(rs//n, gs//n, bs//n)
changed=0
for y in range(h):
  for x in range(w):
    r,g,b,a=px[x,y]
    if abs(r-bg[0])<=42 and abs(g-bg[1])<=42 and abs(b-bg[2])<=42:
      if a: changed+=1
      px[x,y]=(r,g,b,0)
img.save(out, 'PNG', optimize=True)
print(json.dumps({'bg': bg, 'changed': changed, 'size': [w,h]}))
`;

function ensurePillow() {
  try {
    execSync("python3 -c 'import PIL'", { stdio: "ignore" });
  } catch {
    execSync("pip install Pillow -q");
  }
}

function main() {
  ensurePillow();
  mkdirSync(OUT_DIR, { recursive: true });
  const scriptPath = join(ROOT, ".tmp-generate-transparent.py");
  writeFileSync(scriptPath, PY);

  try {
    for (const card of CARDS) {
      const out = join(OUT_DIR, card.filename);
      const result = execSync(`python3 ${scriptPath} "${card.url}" "${out}"`, {
        encoding: "utf8",
      });
      console.log(card.filename, result.trim());
    }
  } finally {
    try {
      unlinkSync(scriptPath);
    } catch {
      /* ignore */
    }
  }

  console.log(`\nWrote assets to ${OUT_DIR}`);
  console.log("Commit PNGs and run: node scripts/push-edp-theme.mjs --execute");
}

main();
