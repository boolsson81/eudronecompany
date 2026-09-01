import { describe, expect, it } from "vitest";
import {
  ENTERPRISE_CAMERA_PRODUCTS,
  CAMERA_CATEGORIES,
  getCameraBySlug,
  getCamerasByCategory,
  getCameraSlugForAccessory,
  getRelatedCameras,
} from "../../src/data/enterpriseCameraProducts";
import {
  DRONE_CAMERAS,
  COMPARISON_PRESETS,
  COMPARISON_SPEC_LABELS,
  getCameraDetailPath,
} from "../../src/data/droneCameras";
import { DRONE_ACCESSORIES } from "../../src/data/droneAccessories";

describe("ENTERPRISE_CAMERA_PRODUCTS", () => {
  it("has unique slugs", () => {
    const slugs = ENTERPRISE_CAMERA_PRODUCTS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("covers the whole Zenmuse payload line", () => {
    const slugs = ENTERPRISE_CAMERA_PRODUCTS.map((c) => c.slug);
    for (const expected of [
      "zenmuse-h30t",
      "zenmuse-h30",
      "zenmuse-h20t",
      "zenmuse-h20n",
      "zenmuse-h20",
      "zenmuse-l1",
      "zenmuse-l2",
      "zenmuse-l3",
      "zenmuse-p1",
      "zenmuse-s1",
      "zenmuse-v1",
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("each product has the content a detail page renders", () => {
    for (const camera of ENTERPRISE_CAMERA_PRODUCTS) {
      expect(camera.features.length).toBeGreaterThanOrEqual(4);
      expect(camera.specs.length).toBeGreaterThanOrEqual(4);
      expect(camera.applications.length).toBeGreaterThanOrEqual(4);
      expect(camera.compatibleDrones.length).toBeGreaterThanOrEqual(1);
      expect(camera.faq.length).toBeGreaterThanOrEqual(2);
      expect(camera.longDesc.length).toBeGreaterThan(120);
      expect(CAMERA_CATEGORIES[camera.category]).toBeDefined();
    }
  });

  it("keeps SEO title and description within search-result limits", () => {
    for (const camera of ENTERPRISE_CAMERA_PRODUCTS) {
      expect(camera.seoTitle.length, camera.slug).toBeLessThanOrEqual(70);
      expect(camera.seoDesc.length, camera.slug).toBeLessThanOrEqual(160);
    }
  });

  it("resolves by slug and by category", () => {
    expect(getCameraBySlug("zenmuse-h20n")?.name).toBe("Zenmuse H20N");
    expect(getCameraBySlug("finns-inte")).toBeUndefined();
    expect(getCamerasByCategory("lidar").map((c) => c.slug)).toEqual([
      "zenmuse-l2",
      "zenmuse-l1",
      "zenmuse-l3",
    ]);
  });

  it("suggests related cameras from the same category", () => {
    const related = getRelatedCameras("zenmuse-l2");
    expect(related.length).toBeGreaterThan(0);
    expect(related.map((c) => c.slug)).not.toContain("zenmuse-l2");
    for (const camera of related) {
      expect(camera.category).toBe("lidar");
    }
  });
});

describe("getCameraSlugForAccessory", () => {
  it("maps every mapped name to an existing product", () => {
    const names = Object.values(DRONE_ACCESSORIES)
      .flat()
      .map((a) => a.name);
    for (const name of names) {
      const slug = getCameraSlugForAccessory(name);
      if (slug) expect(getCameraBySlug(slug), name).toBeDefined();
    }
  });

  it("maps the payload names used in the accessory lists", () => {
    expect(getCameraSlugForAccessory("Zenmuse H20 / H20T / H20N")).toBe("zenmuse-h20t");
    expect(getCameraSlugForAccessory("Zenmuse L3")).toBe("zenmuse-l3");
    expect(getCameraSlugForAccessory("TB65 Intelligent Battery")).toBeUndefined();
  });
});

describe("DRONE_CAMERAS", () => {
  it("has unique ids", () => {
    const ids = DRONE_CAMERAS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("fills every comparison spec row for every camera", () => {
    for (const camera of DRONE_CAMERAS) {
      const labels = camera.specs.map((s) => s.label);
      for (const label of COMPARISON_SPEC_LABELS) {
        expect(labels, `${camera.id} saknar "${label}"`).toContain(label);
      }
    }
  });

  it("links every Zenmuse payload to an existing detail page", () => {
    for (const camera of DRONE_CAMERAS.filter((c) => c.id.startsWith("zenmuse-"))) {
      expect(camera.detailSlug, camera.id).toBeDefined();
      expect(getCameraBySlug(camera.detailSlug!), camera.id).toBeDefined();
      expect(getCameraDetailPath(camera)).toBe(
        `/kommersiella-dronare/kameror/${camera.detailSlug}`,
      );
    }
  });

  it("leaves integrated Mavic cameras without a payload detail page", () => {
    for (const camera of DRONE_CAMERAS.filter((c) => c.category === "compact" || c.category === "multispectral")) {
      expect(getCameraDetailPath(camera), camera.id).toBeUndefined();
    }
  });

  it("only references known camera ids from the presets", () => {
    const ids = new Set(DRONE_CAMERAS.map((c) => c.id));
    for (const preset of COMPARISON_PRESETS) {
      expect(preset.cameraIds.length).toBeGreaterThanOrEqual(2);
      for (const id of preset.cameraIds) {
        expect(ids, `${preset.id} → ${id}`).toContain(id);
      }
    }
  });
});
