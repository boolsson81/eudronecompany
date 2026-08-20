/**
 * Canonical English menu trees for EuroDroneParts navigation.
 */
import { buildSparePartsMenuChildren, ENTERPRISE_SOFTWARE } from "./approved-taxonomy.mjs";

export function buildMenuTrees() {
  const url = (h, type = "collection") => `/${type === "page" ? "pages" : "collections"}/${h}`;

  return [
    {
      menu: "main-menu",
      title: "Main Menu",
      children: [
        {
          label: "Drones",
          children: [
            { label: "DJI Mini Series", url: url("dji-mini-4-series") },
            { label: "DJI Air Series", url: url("dji-air-series") },
            { label: "DJI Mavic Series", url: url("dji-mavic-series") },
            { label: "DJI Avata / FPV", url: url("dji-avata-series") },
            { label: "DJI Neo", url: url("dji-neo") },
            { label: "DJI Flip", url: url("dji-flip-drones") },
            { label: "HoverAir", url: url("hoverair-drones") },
            { label: "All Consumer Drones", url: url("dji-drones") },
            {
              label: "Legacy DJI",
              children: [
                { label: "Phantom", url: url("dji-phantom-3-se") },
                { label: "Air 2 / Air 2S", url: url("dji-air-2-series") },
                { label: "Mini 2", url: url("accessories-dji-mini-2-2-se") },
                { label: "Mavic 2", url: url("dji-mavic-2-series") },
              ],
            },
          ],
        },
        {
          label: "Accessories",
          children: [
            { label: "Drone Filters", url: url("drone-filters") },
            { label: "Propellers", url: url("drones-propellers-accessories") },
            { label: "Batteries", url: url("batteries") },
            { label: "Bags & Cases", url: url("drone-backpack-bags") },
            { label: "Remote Controls", url: url("drone-remote-controls") },
            { label: "Mounts & Tripods", url: url("camera-tripod-stand") },
            { label: "Memory Cards & Storage", url: url("memory-card-storage") },
            { label: "Drone Lighting", url: url("drone-lighting") },
          ],
        },
        {
          label: "Brands",
          children: [
            { label: "DJI", url: url("dji-drones") },
            { label: "PolarPro", url: url("polarpro") },
            { label: "PGYTech", url: url("pgytech") },
            { label: "Sunnylife", url: url("sunnylife") },
            { label: "GoPro", url: url("gopro-accessories") },
            { label: "BRDRC", url: url("brdrc-accessories") },
          ],
        },
      ],
    },
    {
      menu: "enterprise",
      title: "Enterprise",
      legacyHandles: ["enterprise-expansion-deploy", "enterprise-dr-nare", "enterprise-drones"],
      children: [
        { label: "Enterprise Overview", url: url("enterprise-drones") },
        { label: "DJI Matrice", url: url("dji-matrice-series") },
        { label: "Mavic Enterprise", url: url("dji-mavic-series-enterprise") },
        { label: "DJI Agras", url: url("dji-agras-drones") },
        { label: "FlyCart", url: url("dji-flycart-series") },
        { label: "DJI Dock", url: url("dji-dock-series") },
        {
          label: "Industry Solutions",
          children: [
            { label: "Inspection", url: url("inspection-drones") },
            { label: "Agriculture", url: url("agriculture-drones") },
            { label: "Forestry", url: url("forestry-drones") },
            { label: "Mapping & Survey", url: url("mapping-survey-drones") },
            { label: "Energy & Infrastructure", url: url("energy-infrastructure") },
            { label: "Transport & Logistics", url: url("transport-logistics") },
          ],
        },
        {
          label: "Payloads & Sensors",
          children: [
            { label: "Enterprise Sensors", url: url("enterprise-sensors") },
            { label: "Thermal Cameras", url: url("thermal-drones") },
            { label: "Speaker Systems", url: url("enterprise-speaker-systems") },
            { label: "Lifting Systems", url: url("enterprise-lifting-systems") },
            { label: "Enterprise Lighting", url: url("enterprise-lighting") },
          ],
        },
        { label: ENTERPRISE_SOFTWARE.label, url: ENTERPRISE_SOFTWARE.url },
      ],
    },
    {
      menu: "spare-parts",
      title: "Spare Parts",
      legacyHandles: ["spare-parts-deploy"],
      children: [
        ...buildSparePartsMenuChildren(url),
        { label: "Repair & Precision Tools", url: url("repair-precision-tools") },
        { label: "DJI Drone Spare Parts (hub)", url: url("dji-drone-spare-parts") },
      ],
    },
    {
      menu: "service-support",
      title: "Support",
      legacyHandles: ["service-support-deploy"],
      children: [
        { label: "Service & Support", url: url("service-support", "page") },
        { label: "DJI Service", url: url("dji-service", "page") },
        { label: "Enterprise Service", url: url("dji-enterprise-service", "page") },
        { label: "FlyCart Service", url: url("flycart-service", "page") },
        { label: "Matrice Service", url: url("matrice-service", "page") },
        { label: "RMA", url: url("rma", "page") },
        { label: "Repairs", url: url("repairs", "page") },
        { label: "Troubleshooting", url: url("troubleshooting", "page") },
        { label: "Calibration", url: url("calibration", "page") },
        { label: "Contact Us", url: url("contact-us", "page") },
        { label: "Terms of Sale", url: url("terms-of-sale", "page") },
      ],
    },
    {
      menu: "business",
      title: "Business",
      legacyHandles: ["b2b-enterprise-deploy", "b2b-enterprise"],
      children: [
        {
          label: "Industries",
          children: [
            { label: "Energy & Infrastructure", url: url("industry-energy-infrastructure", "page") },
            { label: "Wind Power", url: url("industry-wind-power", "page") },
            { label: "Solar Parks", url: url("industry-solar-parks", "page") },
            { label: "Power Grid", url: url("industry-power-grid", "page") },
            { label: "Forestry", url: url("industry-forestry", "page") },
            { label: "Agriculture", url: url("industry-agriculture", "page") },
            { label: "Mapping", url: url("industry-mapping", "page") },
            { label: "Construction", url: url("industry-construction", "page") },
            { label: "Security & Rescue", url: url("industry-security-rescue", "page") },
            { label: "Transport & Logistics", url: url("industry-transport-logistics", "page") },
          ],
        },
        {
          label: "Services",
          children: [
            { label: "Business Account", url: url("business-account", "page") },
            { label: "Request a Quote", url: url("request-a-quote", "page") },
            { label: "Leasing", url: url("leasing", "page") },
            { label: "Financing", url: url("financing", "page") },
            { label: "Service Agreement", url: url("service-agreement", "page") },
            { label: "Support Agreement", url: url("support-agreement", "page") },
            { label: "Training", url: url("training", "page") },
            { label: "Partner Program", url: url("partner-program", "page") },
          ],
        },
      ],
    },
  ];
}

export function toShopifyMenuItems(nodes) {
  return (nodes || []).map((n) => {
    const item = {
      title: n.label,
      type: "HTTP",
      url: n.url || (n.children?.length ? "#" : "/"),
    };
    if (n.children?.length) item.items = toShopifyMenuItems(n.children);
    return item;
  });
}
