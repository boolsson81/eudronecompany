/**
 * Publik origin för drönarfrontenden — den som canonical-URL:er och JSON-LD
 * breadcrumbs pekar på.
 *
 * OBS: detta är INTE `EDP_ORIGIN` i `edp-hreflang.ts`. Den pekar på
 * `eudronecompany.com`, som är Shopify-butiken. Frontenden i det här repot kan
 * inte ligga där — apexen är Shopifys och `/kommersiella-dronare/*` finns inte
 * på den värden. Se `docs/FRONTEND_MIGRATION.md` § Måldomän.
 *
 * Måldomänen är ännu inte bestämd. Fram tills den är det pekar sidorna på
 * `actionking.se`, som är där innehållet faktiskt serveras i dag. När beslutet
 * är fattat ändras konstanten här — inte på 16 ställen i sidorna.
 */
export const DRONE_SITE_ORIGIN = "https://actionking.se";

/**
 * Absolut URL för en sökväg på drönarsajten.
 *
 * `droneUrl("/kommersiella-dronare/kameror")` → `https://actionking.se/kommersiella-dronare/kameror`
 */
export function droneUrl(path = "/"): string {
  return `${DRONE_SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Standardbrödsmula som alla drönarsidor delar. */
export const DRONE_BREADCRUMB_ROOT = [
  { name: "Hem", url: droneUrl("/") },
  { name: "Kommersiella drönare", url: droneUrl("/kommersiella-dronare") },
];
