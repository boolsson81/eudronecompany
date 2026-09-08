/**
 * Publik origin för drönarfrontenden — den som canonical-URL:er, JSON-LD
 * breadcrumbs och sitemap pekar på.
 *
 * OBS: detta är INTE `EDP_ORIGIN` i `edp-hreflang.ts`. Den pekar på
 * `eudronecompany.com`, som är Shopify-butiken. Frontenden i det här repot kan
 * inte ligga där — apexen är Shopifys och `/kommersiella-dronare/*` finns inte
 * på den värden. Se `docs/FRONTEND_MIGRATION.md` § Måldomän.
 *
 * Måldomänen beslutades 2026-09-07: `enterprise.eudronecompany.com`, en egen
 * subdomän som lämnar butiken på apexen orörd. Pekade tidigare på
 * `actionking.se`, där innehållet serverades före flytten.
 *
 * Ändras domänen igen räcker det att ändra här — sidorna, brödsmulorna och
 * `scripts/generate-sitemap.mjs` läser alla den här konstanten.
 */
export const DRONE_SITE_ORIGIN = "https://enterprise.eudronecompany.com";

/**
 * Absolut URL för en sökväg på drönarsajten.
 *
 * `droneUrl("/kommersiella-dronare/kameror")` →
 * `https://enterprise.eudronecompany.com/kommersiella-dronare/kameror`
 */
export function droneUrl(path = "/"): string {
  return `${DRONE_SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Standardbrödsmula som alla drönarsidor delar. */
export const DRONE_BREADCRUMB_ROOT = [
  { name: "Hem", url: droneUrl("/") },
  { name: "Kommersiella drönare", url: droneUrl("/kommersiella-dronare") },
];
