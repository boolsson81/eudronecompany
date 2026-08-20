/**
 * Run: deno test supabase/functions/_shared/dji-compatibility.test.ts
 */
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  classifyOptionKeyword,
  detectDjiModels,
  extractDjiCompatibility,
  formatDjiCompatibilitySeo,
} from "./dji-compatibility.ts";
import { FIXTURE_MULTI_COLOR_CABLE } from "./fixtures/sunsky-variant-api-fixtures.ts";

Deno.test("classifyOptionKeyword: model vs kit", () => {
  assertEquals(classifyOptionKeyword("Mini 4 Pro / Mini 3 Pro"), "model");
  assertEquals(classifyOptionKeyword("Transmitter"), "kit");
  assertEquals(classifyOptionKeyword("65W Portable Charger"), "model");
});

Deno.test("detectDjiModels: title with multiple models", () => {
  const ids = detectDjiModels(
    "Original Goggles 3 For DJI Avata 2 / Mini 4 Pro / Air 3",
  );
  assert(ids.includes("dji_avata_2"));
  assert(ids.includes("dji_mini_4_pro"));
  assert(ids.includes("dji_air_3"));
});

Deno.test("detectDjiModels: excludes Ronin Flip Axis false positive", () => {
  const ids = detectDjiModels("Original Flip Axis Locking Kit for DJI Ronin 2");
  assertEquals(ids.includes("dji_flip"), false);
});

Deno.test("extractDjiCompatibility: propeller branch SKU", () => {
  const raw = {
    itemNo: "TBD0421393001A",
    name: "Original 2 Pairs Propeller For DJI Mini 4 Pro / Mini 3 Pro (Black)",
    brandName: "DJI",
    optionList: {
      display: "text",
      items: [
        { keywords: "Mini 4 Pro / Mini 3 Pro", itemNo: "TBD0421393001A" },
        { keywords: "Mini 2 / Mini SE", itemNo: "TBD0422753601A" },
      ],
    },
  };
  const compat = extractDjiCompatibility({
    title: raw.name,
    item_no: raw.itemNo,
    brand: raw.brandName,
    variant_group: {
      group_item_no: "TBD0421393001",
      model_label: null,
      base_img_count: null,
      model_list: [],
      option_list: {
        display: "text",
        items: raw.optionList.items.map((i) => ({
          itemNo: i.itemNo,
          keywords: i.keywords,
        })),
      },
    },
  });

  assert(compat);
  assert(compat!.compatible_model_ids.includes("dji_mini_4_pro"));
  assert(compat!.compatible_model_ids.includes("dji_mini_3_pro"));
  assertEquals(compat!.accessory_type, "propeller");
  assertEquals(compat!.option_list_role, "compatibility");
  assert(compat!.series.includes("dji_consumer_mini"));
});

Deno.test("extractDjiCompatibility: kit picker does not add drone models from kit keywords", () => {
  const compat = extractDjiCompatibility({
    title: "Original Monitor Hood For DJI RC Plus",
    item_no: "TBD06046930",
    brand: "DJI",
    variant_group: {
      group_item_no: "TBD06046930",
      model_label: null,
      base_img_count: null,
      model_list: [],
      option_list: {
        display: "picture",
        items: [
          { itemNo: "TBD06046930", keywords: "RC Plus Monitor Hood" },
          { itemNo: "TBD04261950", keywords: "Thumb Rocker" },
        ],
      },
    },
  });

  assert(compat);
  assertEquals(compat!.compatible_model_ids.length, 0);
  assertEquals(compat!.option_list_role, "kit_picker");
});

Deno.test("extractDjiCompatibility: non-DJI product returns null", () => {
  const compat = extractDjiCompatibility({
    title: "USB Cable for iPhone",
    item_no: "EDA002324802E",
    brand: "Generic",
    variant_group: FIXTURE_MULTI_COLOR_CABLE as any,
  });
  assertEquals(compat, null);
});

Deno.test("formatDjiCompatibilitySeo: Swedish list", () => {
  const text = formatDjiCompatibilitySeo(["dji_mini_4_pro", "dji_air_3"]);
  assertEquals(text, "Passar till: DJI Mini 4 Pro, DJI Air 3.");
});
