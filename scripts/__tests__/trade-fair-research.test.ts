import { describe, expect, it } from "vitest";
import {
  guardResearchResponse,
  guardResearchedEvent,
  slugifyEventName,
  toEventRow,
} from "../../src/lib/tradeFairResearch";

const base = {
  name: "Geo Week Europe",
  organizer: "Diversified",
  country: "Tyskland",
  city: "Berlin",
  venue: "Messe Berlin",
  dateStatus: "confirmed",
  startDate: "2027-05-10",
  endDate: "2027-05-12",
  website: "https://example.org/geoweek",
  categories: ["geospatial", "sensors"],
  topics: ["LiDAR", "Mapping"],
  targetIndustries: ["Construction"],
  whyRelevant: "Payloadtillverkare på plats.",
  relevantExhibitors: ["RIEGL", "YellowScan"],
  estimatedRelevance: 82,
  source: "Arrangörens sida",
};

describe("guardResearchedEvent", () => {
  it("släpper igenom ett välformat resultat", () => {
    const out = guardResearchedEvent(base)!;
    expect(out.name).toBe("Geo Week Europe");
    expect(out.startDate).toBe("2027-05-10");
    expect(out.dateStatus).toBe("confirmed");
    expect(out.categories).toEqual(["geospatial", "sensors"]);
    expect(out.dropped).toHaveLength(0);
  });

  it("markerar alltid resultatet som needs-review", () => {
    // Även när modellen påstår motsatsen.
    const out = guardResearchedEvent({ ...base, verification: "verified" })!;
    expect(out.verification).toBe("needs-review");
  });

  it("kastar datum som inte är bekräftade", () => {
    const out = guardResearchedEvent({ ...base, dateStatus: "tbc" })!;
    expect(out.startDate).toBeNull();
    expect(out.endDate).toBeNull();
    expect(out.dateStatus).toBe("tbc");
    expect(out.dropped.join(" ")).toMatch(/utan att vara bekräftat/);
  });

  it("kastar datum som inte är ISO-format", () => {
    const out = guardResearchedEvent({ ...base, startDate: "maj 2027", endDate: "2027-05-12" })!;
    expect(out.startDate).toBeNull();
    expect(out.dropped.join(" ")).toMatch(/inte ett ISO-datum/);
  });

  it("kastar ett intervall som slutar innan det börjar", () => {
    const out = guardResearchedEvent({ ...base, startDate: "2027-05-12", endDate: "2027-05-10" })!;
    expect(out.startDate).toBeNull();
    expect(out.endDate).toBeNull();
    expect(out.dropped.join(" ")).toMatch(/före startdatum/);
  });

  it("kastar kategorier och ämnen utanför taxonomin, och säger vilka", () => {
    const out = guardResearchedEvent({
      ...base,
      categories: ["geospatial", "underwater"],
      topics: ["LiDAR", "Kvantradar"],
    })!;
    expect(out.categories).toEqual(["geospatial"]);
    expect(out.topics).toEqual(["LiDAR"]);
    expect(out.dropped.join(" ")).toMatch(/underwater/);
    expect(out.dropped.join(" ")).toMatch(/Kvantradar/);
  });

  it("släpper inte igenom en webbadress som inte är http", () => {
    const out = guardResearchedEvent({ ...base, website: "javascript:alert(1)" })!;
    expect(out.website).toBeNull();
    expect(out.dropped.join(" ")).toMatch(/webbadressen/);
  });

  it("klämmer relevanstalet till 0–100 och tål skräp", () => {
    expect(guardResearchedEvent({ ...base, estimatedRelevance: 900 })!.estimatedRelevance).toBe(100);
    expect(guardResearchedEvent({ ...base, estimatedRelevance: -5 })!.estimatedRelevance).toBe(0);
    expect(guardResearchedEvent({ ...base, estimatedRelevance: "mycket" })!.estimatedRelevance).toBe(0);
  });

  it("avvisar en post utan namn", () => {
    expect(guardResearchedEvent({ ...base, name: "  " })).toBeNull();
    expect(guardResearchedEvent(null)).toBeNull();
    expect(guardResearchedEvent("Geo Week")).toBeNull();
  });

  it("tål att fält saknas helt", () => {
    const out = guardResearchedEvent({ name: "Okänd mässa" })!;
    expect(out.country).toBeNull();
    expect(out.categories).toEqual([]);
    expect(out.dateStatus).toBe("tbc");
    expect(out.verification).toBe("needs-review");
  });

  it("avdubblar listor", () => {
    const out = guardResearchedEvent({ ...base, topics: ["LiDAR", "LiDAR", "Mapping"] })!;
    expect(out.topics).toEqual(["LiDAR", "Mapping"]);
  });
});

describe("guardResearchResponse", () => {
  it("plockar ut listan och kastar de poster som inte går att granska", () => {
    const out = guardResearchResponse({ events: [base, { name: "" }, null, { name: "Andra mässan" }] });
    expect(out.map((e) => e.name)).toEqual(["Geo Week Europe", "Andra mässan"]);
  });

  it("ger tom lista när svaret inte har någon lista", () => {
    expect(guardResearchResponse({})).toEqual([]);
    expect(guardResearchResponse(null)).toEqual([]);
    expect(guardResearchResponse({ events: "nej" })).toEqual([]);
  });
});

describe("slugifyEventName", () => {
  it("gör en slug av svenska och tyska namn", () => {
    expect(slugifyEventName("Geo Week Europe")).toBe("geo-week-europe");
    expect(slugifyEventName("Mässa för drönare & sensorer")).toBe("massa-for-dronare-sensorer");
    expect(slugifyEventName("  INTERGEO 2027  ")).toBe("intergeo-2027");
  });
});

describe("toEventRow", () => {
  const shop = "e6ad2afc-e468-49a7-8d33-9b1837419ed8";

  it("sparar ett fynd som kandidat, inte som beslut", () => {
    const row = toEventRow(guardResearchedEvent(base)!, shop);
    expect(row.priority).toBe("C");
    expect(row.verification).toBe("needs-review");
    expect(row.attendance_plan).toBe("considering");
    expect(row.shop_id).toBe(shop);
    expect(row.slug).toBe("geo-week-europe");
  });

  it("sätter status efter om datumet höll", () => {
    expect(toEventRow(guardResearchedEvent(base)!, shop).status).toBe("confirmed");
    expect(toEventRow(guardResearchedEvent({ ...base, dateStatus: "tbc" })!, shop).status).toBe(
      "unconfirmed",
    );
  });

  it("behåller rådata för granskning", () => {
    const row = toEventRow(guardResearchedEvent({ ...base, categories: ["underwater"] })!, shop);
    expect(row.research_payload).toBeDefined();
    expect((row.research_payload as { dropped: string[] }).dropped.join(" ")).toMatch(/underwater/);
  });
});
