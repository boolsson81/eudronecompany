/**
 * User-approved taxonomy additions (execution plan — not yet live).
 */
export const COMPONENT_SUFFIXES = [
  "propellers",
  "batteries",
  "motors",
  "arms",
  "cameras",
  "gimbal",
  "shell",
  "landing-gear",
  "cables",
  "antennas",
  "sensors",
  "accessories",
];

/** All 11 spare-parts model groups in menu order */
export const SPARE_PART_MODELS = [
  { label: "DJI Mini 4 Pro", hub: "dji-mini-4-pro-spare-parts", prefix: "dji-mini-4-pro", status: "LIVE" },
  { label: "DJI Air 3", hub: "dji-air-3-spare-parts", prefix: "dji-air-3", status: "LIVE" },
  { label: "DJI Air 3S", hub: "dji-air-3s-spare-parts", prefix: "dji-air-3s", status: "APPROVED_CREATE" },
  { label: "DJI Neo", hub: "dji-neo-spare-parts", prefix: "dji-neo", status: "APPROVED_CREATE", merge_from: ["repair-dji-neo-spare-parts"] },
  { label: "DJI Flip", hub: "dji-flip-spare-parts", prefix: "dji-flip", status: "APPROVED_CREATE" },
  { label: "DJI Avata 2", hub: "dji-avata-2-spare-parts", prefix: "dji-avata-2", status: "APPROVED_CREATE" },
  { label: "DJI Mavic 3 Enterprise", hub: "dji-mavic-3-enterprise-spare-parts", prefix: "dji-mavic-3-enterprise", status: "LIVE" },
  { label: "DJI Matrice 4 Series", hub: "dji-matrice-4-spare-parts", prefix: "dji-matrice-4", status: "LIVE" },
  { label: "DJI Matrice 30 Series", hub: "dji-matrice-30-spare-parts", prefix: "dji-matrice-30", status: "APPROVED_CREATE" },
  { label: "DJI Matrice 350 RTK", hub: "dji-matrice-350-rtk-spare-parts", prefix: "dji-matrice-350-rtk", status: "LIVE" },
  { label: "DJI FlyCart 30", hub: "dji-flycart-30-spare-parts", prefix: "dji-flycart-30", status: "LIVE" },
];

export const APPROVED_MERGE_ADDITIONS = {
  "repair-dji-neo-spare-parts": "dji-neo-spare-parts",
};

export const ENTERPRISE_SOFTWARE = {
  label: "Enterprise Software",
  handle: "enterprise-software",
  resource_type: "page",
  url: "/pages/enterprise-software",
  menu: "enterprise",
  status: "APPROVED_CREATE",
};

export function plannedCreates() {
  const rows = [];
  for (const model of SPARE_PART_MODELS) {
    if (model.status !== "APPROVED_CREATE") continue;
    rows.push({
      resource_type: "collection",
      proposed_handle: model.hub,
      taxonomy_pillar: "Spare Parts",
      action: "CREATE",
      menu_path: `Spare Parts > ${model.label}`,
      proposed_url: `/collections/${model.hub}`,
      note: "Approved hub collection",
    });
    for (const suffix of COMPONENT_SUFFIXES) {
      rows.push({
        resource_type: "collection",
        proposed_handle: `${model.prefix}-${suffix}`,
        taxonomy_pillar: "Spare Parts",
        action: "CREATE_OR_ASSIGN",
        menu_path: `Spare Parts > ${model.label} > ${suffix}`,
        proposed_url: `/collections/${model.prefix}-${suffix}`,
        note: "Component collection — create if missing, assign products via rules",
      });
    }
    for (const from of model.merge_from || []) {
      rows.push({
        resource_type: "collection",
        proposed_handle: from,
        taxonomy_pillar: "Spare Parts",
        action: "MERGE",
        menu_path: `Spare Parts > ${model.label}`,
        proposed_url: `/collections/${model.hub}`,
        note: `Merge into ${model.hub}`,
      });
    }
  }
  rows.push({
    resource_type: ENTERPRISE_SOFTWARE.resource_type,
    proposed_handle: ENTERPRISE_SOFTWARE.handle,
    taxonomy_pillar: "Enterprise",
    action: "CREATE",
    menu_path: `Enterprise > ${ENTERPRISE_SOFTWARE.label}`,
    proposed_url: ENTERPRISE_SOFTWARE.url,
    note: "Approved enterprise software landing",
  });
  return rows;
}

export function buildSparePartsMenuChildren(url) {
  return SPARE_PART_MODELS.map((model) => ({
    label: model.label,
    url: url(model.hub),
    handle: model.hub,
    status: model.status,
    children: COMPONENT_SUFFIXES.map((s) => ({
      label: s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      url: url(`${model.prefix}-${s}`),
      handle: `${model.prefix}-${s}`,
    })),
  }));
}
