/**
 * Phase 0 approved main-menu — English handles on live store.
 * Maps to /collections/{handle}. No redirects.
 */

function col(handle) {
  return `/collections/${handle}`;
}

function item(title, url, children = []) {
  return { title, type: "HTTP", url, items: children };
}

function colItem(title, handle, children = []) {
  return item(title, col(handle), children);
}

/** Build nested menu items for main-menu */
export function buildApprovedMainMenuItems() {
  return [
    colItem("Consumer Drones", "drones-with-camera", [
      colItem("DJI Mini", "dji-mini-4-series"),
      colItem("DJI Air", "dji-air-3-series"),
      colItem("DJI Mavic", "dji-mavic-3-series"),
      colItem("DJI Flip", "dji-flip-drones"),
      colItem("DJI Neo", "dji-neo"),
      colItem("DJI Avata", "dji-avata-series"),
    ]),
    colItem("Enterprise Drones", "enterprise-drones", [
      colItem("Matrice", "dji-matrice-series"),
      colItem("FlyCart", "dji-flycart-series"),
      colItem("Agras", "dji-agras-drones"),
      colItem("Mapping", "mapping-survey-drones"),
      colItem("Thermal", "drones-with-thermal-camera"),
      colItem("Enterprise Accessories", "enterprise-drone-accessories", [
        colItem("Enterprise Accessories", "enterprise-accessories"),
        colItem("Enterprise Propellers", "enterprise-propellers"),
        colItem("DJI Enterprise RC", "dji-enterprise-remote-controls"),
        colItem("Matrice 350 RTK", "dji-matrice-350-rtk-accessories"),
        colItem("Matrice 4 Accessories", "dji-matrice-4-accessories"),
      ]),
    ]),
    colItem("Spare Parts", "dji-drone-spare-parts", [
      colItem("Motors & Gimbals", "spare-parts-gimbal-drones-motors"),
      colItem("Propellers", "drones-propellers-accessories"),
      colItem("Flight Electronics", "drone-electronics-flight-components"),
      colItem("DJI Neo Repair", "dji-neo-spare-parts"),
    ]),
    colItem("Accessories", "drone-accessories", [
      colItem("Filters", "drone-filters"),
      colItem("Bags & Cases", "drone-backpack-bags", [colItem("Covers", "drone-covers")]),
      colItem("Chargers", "batteries"),
      colItem("Landing Gear", "drone-landing-gear", [
        colItem("Landing Pads", "drone-landing-pads"),
        colItem("Protection", "drone-protection"),
      ]),
      colItem("Controllers", "drone-remote-controls", [
        colItem("RC Accessories", "drone-remote-control-accessories"),
        colItem("DJI RC", "dji-rc-remote-controls"),
      ]),
      colItem("Lighting", "drone-lighting"),
      colItem("DJI Mini 4 Pro Accessories", "dji-mini-4-pro-accessories"),
      colItem("DJI Mavic 3 Accessories", "dji-mavic-3-accessories"),
    ]),
    colItem("Payloads & Sensors", "enterprise-sensors", [
      colItem("Cameras", "drone-cameras"),
      colItem("Searchlights", "enterprise-lighting"),
      colItem("Speakers", "enterprise-speaker-systems"),
      colItem("Airdrop Systems", "airdrop-system"),
    ]),
    colItem("Brands", "dji-drones", [
      colItem("DJI", "dji-drones"),
      colItem("Sunnylife", "sunnylife"),
      colItem("PGYTECH", "pgytech-accessories"),
      colItem("PolarPro", "polarpro"),
      colItem("Master Airscrew", "master-airscrew-dji-propellers"),
      colItem("BRDRC", "brdrc-accessories"),
    ]),
    colItem("Support", "repair-precision-tools", [
      colItem("Repair Tools", "repair-precision-tools"),
      colItem("Precision Tools", "precision-tools"),
      colItem("Cleaning", "cleaning-products-actionking"),
      colItem("Service", "enterprise-service-drones"),
    ]),
  ];
}

export const MAIN_MENU = {
  handle: "main-menu",
  title: "Main menu",
  items: buildApprovedMainMenuItems(),
};
