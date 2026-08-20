/**
 * Unit tests for Sunsky variant field mapping (Phase V0).
 *
 * Run:
 *   deno test supabase/functions/_shared/sunsky-product-map.test.ts
 */
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  getVariantParseIssues,
  normalizeSunskyProduct,
  parseVariantGroup,
} from "./sunsky-product-map.ts";
import {
  FIXTURE_LEGACY_MODEL_LIST,
  FIXTURE_LEGACY_OPTION_MAP,
  FIXTURE_MALFORMED_MODEL_LIST,
  FIXTURE_MALFORMED_OPTION_LIST,
  FIXTURE_MULTI_COLOR_CABLE,
  FIXTURE_PICTURE_OPTIONS,
  FIXTURE_SINGLE_SKU,
} from "./fixtures/sunsky-variant-api-fixtures.ts";

Deno.test("parseVariantGroup: official modelList key/value + optionList items", () => {
  const vg = parseVariantGroup(FIXTURE_MULTI_COLOR_CABLE);

  assertEquals(vg.group_item_no, "EDA002324802");
  assertEquals(vg.model_label, "Color");
  assertEquals(vg.base_img_count, 4);
  assertEquals(vg.model_list.length, 5);
  assertEquals(vg.model_list[0], { itemNo: "EDA002324802A", label: "Pink", price: undefined });
  assertEquals(vg.model_list[4], { itemNo: "EDA002324802E", label: "Yellow", price: undefined });

  assertEquals(vg.option_list.display, "text");
  assertEquals(vg.option_list.items.length, 2);
  assertEquals(vg.option_list.items[0], { itemNo: "EDA002324801E", keywords: "12W" });
  assertEquals(vg.option_list.items[1], { itemNo: "EDA002324802E", keywords: "20W" });
  assertEquals(vg.option_list_legacy, undefined);
  assertEquals(getVariantParseIssues().length, 0);
});

Deno.test("parseVariantGroup: single SKU — empty modelList and optionList", () => {
  const vg = parseVariantGroup(FIXTURE_SINGLE_SKU);

  assertEquals(vg.group_item_no, "SPS-DRONE-001");
  assertEquals(vg.model_list.length, 0);
  assertEquals(vg.option_list.items.length, 0);
  assertEquals(vg.option_list.display, null);
  assertEquals(getVariantParseIssues().length, 0);
});

Deno.test("parseVariantGroup: legacy itemNo/label modelList backwards compatibility", () => {
  const vg = parseVariantGroup(FIXTURE_LEGACY_MODEL_LIST);

  assertEquals(vg.model_list.length, 2);
  assertEquals(vg.model_list[0], { itemNo: "LEGACY-001-S", label: "Small", price: undefined });
  assertEquals(vg.model_list[1], { itemNo: "LEGACY-001-M", label: "Medium", price: undefined });
  assertEquals(getVariantParseIssues().length, 0);
});

Deno.test("parseVariantGroup: legacy flat-map optionList populates option_list_legacy", () => {
  const vg = parseVariantGroup(FIXTURE_LEGACY_OPTION_MAP);

  assertEquals(vg.option_list.items.length, 0);
  assertEquals(vg.option_list_legacy, { Wattage: ["12W", "20W"] });
  const issues = getVariantParseIssues();
  assert(issues.length >= 1);
  assertEquals(issues[0].field, "optionList");
});

Deno.test("parseVariantGroup: picture display optionList", () => {
  const vg = parseVariantGroup(FIXTURE_PICTURE_OPTIONS);

  assertEquals(vg.option_list.display, "picture");
  assertEquals(vg.option_list.items[0].itemNo, "PIC-001A");
  assertEquals(getVariantParseIssues().length, 0);
});

Deno.test("parseVariantGroup: logs malformed modelList entries", () => {
  const vg = parseVariantGroup(FIXTURE_MALFORMED_MODEL_LIST);

  assert(vg.model_list.length >= 1);
  assertEquals(vg.model_list[0].itemNo, "GOOD-SKU");
  const issues = getVariantParseIssues();
  assert(issues.length >= 1);
  assert(issues.some((i) => i.field === "modelList" && i.message.includes("missing key")));
});

Deno.test("parseVariantGroup: logs malformed optionList items and unknown display", () => {
  const vg = parseVariantGroup(FIXTURE_MALFORMED_OPTION_LIST);

  assertEquals(vg.option_list.items.length, 1);
  assertEquals(vg.option_list.items[0].itemNo, "VALID-001");
  assertEquals(vg.option_list.display, null);
  const issues = getVariantParseIssues();
  assert(issues.some((i) => i.field === "optionList.items"));
  assert(issues.some((i) => i.field === "optionList.display"));
});

Deno.test("normalizeSunskyProduct: embeds fixed variant_group", () => {
  const normalized = normalizeSunskyProduct(FIXTURE_MULTI_COLOR_CABLE);

  assertEquals(normalized.item_no, "EDA002324802E");
  assertEquals(normalized.variant_group.model_list.length, 5);
  assertEquals(normalized.variant_group.option_list.items[1].keywords, "20W");
  assertEquals(normalized.attributes.baseImgCount, 4);
});
