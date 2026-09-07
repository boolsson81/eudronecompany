/**
 * Genererar `public/sitemap.xml` och `public/robots.txt`.
 *
 * Körs med `npm run sitemap`. Filerna checkas in — Vite kopierar `public/` rakt
 * in i `dist/` vid build, så ingen extra deploy-konfiguration behövs.
 *
 * Rutterna kommer från `src/lib/publicRoutes.ts` och domänen från
 * `DRONE_SITE_ORIGIN` i `src/lib/publicSite.ts`. Datamodulerna importerar
 * bilder och `@/`-alias, vilket vanlig Node inte löser — därför laddas de genom
 * Vites egen SSR-laddare i stället för med ett extra beroende.
 *
 * Lägger du till innehåll utan att köra skriptet fastnar det i
 * `scripts/__tests__/sitemap.test.ts`, som jämför den incheckade filen med den
 * som skulle genererats.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createServer } from "vite";

/** Startsidan och sektionsingångarna uppdateras oftare än en enskild detaljsida. */
export function changefreq(path) {
  return path.split("/").filter(Boolean).length <= 2 ? "weekly" : "monthly";
}

/** Ingångarna ska ranka före detaljsidorna när de konkurrerar om samma fråga. */
export function priority(path) {
  const depth = path.split("/").filter(Boolean).length;
  if (depth === 1) return "1.0";
  if (depth === 2) return "0.8";
  return "0.6";
}

export function renderSitemap(routes, origin, lastmod) {
  const urls = routes
    .map((path) =>
      [
        "  <url>",
        `    <loc>${origin}${path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq(path)}</changefreq>`,
        `    <priority>${priority(path)}</priority>`,
        "  </url>",
      ].join("\n"),
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function renderRobots(origin) {
  return `# EU Drone Company — publika drönarsidor
User-agent: *
Allow: /

# Driftsvyerna kräver inloggning och har inget att göra i sökresultaten.
Disallow: /admin
Disallow: /login

Sitemap: ${origin}/sitemap.xml
`;
}

/** Laddar TS-modulerna genom Vite, så att alias och bildimporter fungerar. */
export async function loadSiteData() {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "warn",
  });
  try {
    const routes = await server.ssrLoadModule("/src/lib/publicRoutes.ts");
    const site = await server.ssrLoadModule("/src/lib/publicSite.ts");
    return { routes: routes.getPublicRoutes(), origin: site.DRONE_SITE_ORIGIN };
  } finally {
    await server.close();
  }
}

/** Datum utan klockslag — sitemapen ska inte ändras vid varje körning. */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

// Kör bara filskrivningen när skriptet startas direkt, inte när testet importerar det.
if (process.argv[1] && process.argv[1].endsWith("generate-sitemap.mjs")) {
  const { routes, origin } = await loadSiteData();
  const publicDir = join(process.cwd(), "public");
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(join(publicDir, "sitemap.xml"), renderSitemap(routes, origin, today()));
  writeFileSync(join(publicDir, "robots.txt"), renderRobots(origin));
  console.log(`sitemap.xml: ${routes.length} sökvägar på ${origin}`);
  console.log("robots.txt: skriven");
}
