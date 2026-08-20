/** Product compliance metafields and validation (IOSS, GPSR, CE, customs). */

export const COMPLIANCE_NAMESPACE = "custom";

export const COMPLIANCE_METAFIELDS = {
  hsCode: "hs_code",
  countryOfOrigin: "country_of_origin",
  economicOperator: "economic_operator",
  batteryType: "battery_type",
  ceDocumentUrl: "ce_document_url",
} as const;

export type ProductComplianceData = {
  hs_code?: string | null;
  country_of_origin?: string | null;
  economic_operator?: string | null;
  battery_type?: string | null;
  ce_document_url?: string | null;
};

export type ComplianceValidationIssue = {
  field: string;
  message: string;
  severity: "error" | "warning";
};

const ISO_COUNTRY = /^[A-Z]{2}$/i;
const HS_CODE = /^\d{6,10}$/;
const HTTPS_URL = /^https:\/\/.+/i;

export function validateCompliance(data: ProductComplianceData): ComplianceValidationIssue[] {
  const issues: ComplianceValidationIssue[] = [];

  if (data.hs_code != null && data.hs_code !== "") {
    const digits = data.hs_code.replace(/\D/g, "");
    if (!HS_CODE.test(digits)) {
      issues.push({ field: "hs_code", message: "HS-kod måste vara 6–10 siffror", severity: "error" });
    }
  } else {
    issues.push({ field: "hs_code", message: "HS-kod saknas", severity: "warning" });
  }

  if (data.country_of_origin != null && data.country_of_origin !== "") {
    if (!ISO_COUNTRY.test(data.country_of_origin.trim())) {
      issues.push({ field: "country_of_origin", message: "Ursprungsland måste vara ISO 3166-1 alpha-2 (t.ex. CN)", severity: "error" });
    }
  } else {
    issues.push({ field: "country_of_origin", message: "Ursprungsland saknas", severity: "warning" });
  }

  if (!data.economic_operator?.trim()) {
    issues.push({ field: "economic_operator", message: "Ekonomisk aktör saknas", severity: "warning" });
  }

  if (data.ce_document_url != null && data.ce_document_url !== "") {
    if (!HTTPS_URL.test(data.ce_document_url.trim())) {
      issues.push({ field: "ce_document_url", message: "CE-dokument måste vara en HTTPS-URL", severity: "error" });
    }
  } else {
    issues.push({ field: "ce_document_url", message: "CE-dokument saknas", severity: "warning" });
  }

  return issues;
}

export function complianceKpis(records: Array<ProductComplianceData & { validation_errors?: ComplianceValidationIssue[] }>) {
  let missingHs = 0;
  let missingCe = 0;
  let missingOperator = 0;
  let complete = 0;

  for (const r of records) {
    const issues = r.validation_errors ?? validateCompliance(r);
    const fields = new Set(issues.filter((i) => i.severity === "warning" || i.severity === "error").map((i) => i.field));
    if (!r.hs_code?.trim()) missingHs++;
    if (!r.ce_document_url?.trim()) missingCe++;
    if (!r.economic_operator?.trim()) missingOperator++;
    if (fields.size === 0 || (!fields.has("hs_code") && !fields.has("ce_document_url") && !fields.has("economic_operator"))) {
      if (r.hs_code && r.country_of_origin && r.economic_operator && r.ce_document_url) complete++;
    }
  }

  return { total: records.length, missingHs, missingCe, missingOperator, complete };
}

export function metafieldsToCompliance(
  fields: Map<string, string>,
): ProductComplianceData {
  return {
    hs_code: fields.get(COMPLIANCE_METAFIELDS.hsCode) ?? null,
    country_of_origin: fields.get(COMPLIANCE_METAFIELDS.countryOfOrigin) ?? null,
    economic_operator: fields.get(COMPLIANCE_METAFIELDS.economicOperator) ?? null,
    battery_type: fields.get(COMPLIANCE_METAFIELDS.batteryType) ?? null,
    ce_document_url: fields.get(COMPLIANCE_METAFIELDS.ceDocumentUrl) ?? null,
  };
}

export const COMPLIANCE_METAFIELD_DEFINITIONS = [
  { key: COMPLIANCE_METAFIELDS.hsCode, name: "HS code", type: "single_line_text_field" },
  { key: COMPLIANCE_METAFIELDS.countryOfOrigin, name: "Country of origin", type: "single_line_text_field" },
  { key: COMPLIANCE_METAFIELDS.economicOperator, name: "Economic operator", type: "single_line_text_field" },
  { key: COMPLIANCE_METAFIELDS.batteryType, name: "Battery type", type: "single_line_text_field" },
  { key: COMPLIANCE_METAFIELDS.ceDocumentUrl, name: "CE document URL", type: "url" },
];
