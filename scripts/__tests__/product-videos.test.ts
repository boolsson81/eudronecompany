import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import registry from "../../src/data/product-videos.json";
import { PRODUCT_VIDEOS, videoId } from "../../src/data/productVideos";
import { ENTERPRISE_DRONE_PRODUCTS } from "../../src/data/enterpriseDroneProducts";
import { ENTERPRISE_CAMERA_PRODUCTS } from "../../src/data/enterpriseCameraProducts";
import { getDroneMedia } from "../../src/data/commercialDroneIndustries";
import { missingVideos, plan, youtubeUrl } from "../wisson/apply-product-videos.mjs";

const ROOT = join(__dirname, "..", "..");
const OFFICIAL_CHANNELS = ["DJI", "DJI Enterprise", "DJI Agriculture", "DJI Tutorials", "Wisson"];
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** ID:n som tidigare låg i koden men var döda eller pekade på fel produkt. */
const RETIRED_IDS = [
  "fKkR6D-UGq0", // Zenmuse H30 — borttagen från YouTube
  "g1JmzqBGUKA", // Zenmuse L2 — borttagen
  "H_0cEpCdIjw", // Zenmuse P1 — borttagen
  "BNEmDcQr6hk", // "Introducing DJI Mavic 4 Pro" låg på Mavic 3 Pro-sidan
  "IwIoeaGim6Q", // Privat Inspire 3-film, inte DJI:s
];

/** Drönare där DJI ännu inte har någon egen film på sina kanaler. */
const DRONES_WITHOUT_OFFICIAL_VIDEO = ["agras-t100", "flycart-30"];

describe("product-videos.json", () => {
  it("har giltiga YouTube-ID:n från tillverkarnas egna kanaler", () => {
    for (const [key, v] of Object.entries(registry.videos)) {
      expect(v.youtubeId, key).toMatch(YOUTUBE_ID);
      expect(OFFICIAL_CHANNELS, `${key} (${v.channel})`).toContain(v.channel);
      expect(v.title.length, key).toBeGreaterThan(5);
      expect(v.verified, key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("har unika ID:n", () => {
    const ids = Object.values(registry.videos).map((v) => v.youtubeId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("innehåller inga av de döda eller felaktiga ID:n som byttes ut", () => {
    const ids = Object.values(registry.videos).map((v) => v.youtubeId);
    for (const retired of RETIRED_IDS) expect(ids).not.toContain(retired);
  });

  it("använder nyckelprefix som matchar varumärket", () => {
    for (const [key, v] of Object.entries(registry.videos)) {
      const brand = v.channel.startsWith("DJI") ? "dji-" : "wisson-";
      expect(key.startsWith(brand), `${key} → ${v.channel}`).toBe(true);
    }
  });

  it("pekar bara på kända nycklar för Wisson-produkterna", () => {
    for (const [model, keys] of Object.entries(registry.wissonProducts)) {
      if (model.startsWith("_")) continue;
      expect(Array.isArray(keys), model).toBe(true);
      for (const key of keys as string[]) {
        expect(PRODUCT_VIDEOS[key as keyof typeof PRODUCT_VIDEOS], `${model} → ${key}`).toBeDefined();
        expect(key.startsWith("wisson-"), `${model} → ${key}`).toBe(true);
      }
    }
  });
});

describe("videoId()", () => {
  it("ger samma ID som registret", () => {
    expect(videoId("dji-matrice-400")).toBe(registry.videos["dji-matrice-400"].youtubeId);
  });
});

describe("produktdata använder registret", () => {
  const ids = new Set(Object.values(registry.videos).map((v) => v.youtubeId));

  it("ger varje DJI-drönare en verifierad film, utom de som DJI inte filmat", () => {
    for (const p of ENTERPRISE_DRONE_PRODUCTS) {
      if (DRONES_WITHOUT_OFFICIAL_VIDEO.includes(p.slug)) {
        expect(p.youtubeId, p.slug).toBeUndefined();
        continue;
      }
      expect(p.youtubeId, p.slug).toBeDefined();
      expect(ids, p.slug).toContain(p.youtubeId);
    }
  });

  it("ger varje Zenmuse-payload en verifierad film", () => {
    for (const c of ENTERPRISE_CAMERA_PRODUCTS) {
      expect(c.youtubeId, c.slug).toBeDefined();
      expect(ids, c.slug).toContain(c.youtubeId);
    }
  });

  it("låter branschsidornas media följa produktsidans film", () => {
    for (const p of ENTERPRISE_DRONE_PRODUCTS) {
      const media = getDroneMedia(p.name);
      if (media) expect(media.youtubeId, p.name).toBe(p.youtubeId);
    }
  });

  it("har inga hårdkodade YouTube-ID:n kvar i src", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name) && !full.endsWith("productVideos.ts")) {
          const text = readFileSync(full, "utf8");
          if (/youtubeId:\s*"[A-Za-z0-9_-]{11}"/.test(text) || /\{ id: "[A-Za-z0-9_-]{11}"/.test(text)) {
            offenders.push(full.replace(ROOT + "/", ""));
          }
        }
      }
    };
    walk(join(ROOT, "src"));
    expect(offenders).toEqual([]);
  });
});

describe("Wisson-temamallar", () => {
  const templates = readdirSync(join(ROOT, "theme", "templates")).filter((f) =>
    /^page\.(wisson|fasadtvatt-dronare|vindkraftsunderhall-dronare)/.test(f)
  );

  it("har en produktfilm från registret på varje system- och lösningssida", () => {
    const ids = new Set(Object.values(registry.videos).map((v) => v.youtubeId));
    expect(templates.length).toBe(8);
    for (const file of templates) {
      const tpl = JSON.parse(readFileSync(join(ROOT, "theme", "templates", file), "utf8"));
      const video = tpl.sections.product_video;
      expect(video?.type, file).toBe("edp-video");
      expect(ids, file).toContain(video.settings.youtube_id);
      expect(tpl.order, file).toEqual(["industry_landing", "product_video", "enterprise_contact", "faq"]);
      expect(tpl.sections.faq?.type, file).toBe("edp-metafield-faq");
      expect(video.settings.heading.length, file).toBeGreaterThan(5);
      expect(video.settings.credit, file).toBe("Film: Wisson Robotics");
    }
  });

  it("har sektionen edp-video i temat med egna etiketter", () => {
    const section = readFileSync(join(ROOT, "theme", "sections", "edp-video.liquid"), "utf8");
    expect(section).toContain('"id": "youtube_id"');
    expect(section).toContain("youtube-nocookie.com/embed/");
    // Etiketterna ligger i schemat, inte i locale-filerna, så sektionen kan
    // pushas till ett tema utan att de stora locale-filerna skrivs över.
    const schema = JSON.parse(section.match(/{% schema %}([\s\S]*?){% endschema %}/)![1]);
    expect(schema.name).toBe("Produktfilm");
    expect(section).not.toContain("t:sections.edp-video");
    const css = readFileSync(join(ROOT, "theme", "assets", "section-enterprise.css"), "utf8");
    expect(css).toContain(".edp-video__player");
  });
});

describe("apply-product-videos", () => {
  it("bygger en plan per Wisson-modell med model-tagg", () => {
    const items = plan(registry);
    const models = items.map((i) => i.model);
    expect(models).toContain("AP3-P3");
    for (const item of items) {
      expect(item.tag).toBe(`model:${item.model.toLowerCase()}`);
      expect(item.videos.length).toBeGreaterThan(0);
      for (const v of item.videos) expect(v.youtubeId).toMatch(YOUTUBE_ID);
    }
  });

  it("hoppar över filmer som redan ligger på produkten", () => {
    const videos = [{ youtubeId: "r3t5Rj9Lth8" }, { youtubeId: "AGniMobXasY" }];
    const product = {
      media: {
        nodes: [
          { mediaContentType: "IMAGE" },
          { mediaContentType: "EXTERNAL_VIDEO", originUrl: youtubeUrl("r3t5Rj9Lth8") },
          { mediaContentType: "EXTERNAL_VIDEO", originUrl: "https://youtu.be/7wde2_BgUL4" },
        ],
      },
    };
    expect(missingVideos(product, videos).map((v) => v.youtubeId)).toEqual(["AGniMobXasY"]);
    expect(missingVideos(product, [{ youtubeId: "7wde2_BgUL4" }])).toEqual([]);
    expect(missingVideos({ media: { nodes: [] } }, videos)).toHaveLength(2);
  });
});
