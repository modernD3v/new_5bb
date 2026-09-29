import { describe, expect, it } from "vitest";
import { MOUNTAIN_SEEDS, PASS_SEEDS } from "@/lib/db/seed-data";

describe("mountain seed data", () => {
  it("includes exactly 20 mountains with unique slugs", () => {
    expect(MOUNTAIN_SEEDS).toHaveLength(20);
    const slugs = MOUNTAIN_SEEDS.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(20);
  });

  it("marks only Big Snow as indoor", () => {
    const indoor = MOUNTAIN_SEEDS.filter((m) => m.isIndoor);
    expect(indoor).toHaveLength(1);
    expect(indoor[0]?.slug).toBe("big-snow");
  });

  it("keeps summit above base for every mountain", () => {
    for (const m of MOUNTAIN_SEEDS) {
      expect(m.summitElevFt).toBeGreaterThan(m.baseElevFt);
    }
  });

  it("keeps every mountain in the NYC day-trip box", () => {
    for (const m of MOUNTAIN_SEEDS) {
      expect(m.lat).toBeGreaterThan(40);
      expect(m.lat).toBeLessThan(44.5);
      expect(m.lon).toBeGreaterThan(-76.5);
      expect(m.lon).toBeLessThan(-72);
    }
  });

  it("keeps copy free of em dashes", () => {
    for (const m of MOUNTAIN_SEEDS) {
      expect(`${m.name}${m.driveNote}`).not.toContain("\u2014");
    }
    for (const p of PASS_SEEDS) expect(p.tierNote).not.toContain("\u2014");
  });
});

describe("pass seed data (2026-27)", () => {
  const slugs = new Set(MOUNTAIN_SEEDS.map((m) => m.slug));
  const passFor = (slug: string) =>
    PASS_SEEDS.filter((p) => p.slug === slug).map((p) => p.pass);

  it("only references seeded mountains", () => {
    for (const p of PASS_SEEDS) expect(slugs.has(p.slug)).toBe(true);
  });

  it("is unique on (mountain, pass) and has an https source for every row", () => {
    const keys = PASS_SEEDS.map((p) => `${p.slug}:${p.pass}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const p of PASS_SEEDS) expect(p.sourceUrl).toMatch(/^https:\/\//);
  });

  it("assigns the expected pass to each mountain", () => {
    expect(passFor("hunter")).toEqual(["epic"]);
    expect(passFor("mount-snow")).toEqual(["epic"]);
    expect(passFor("okemo")).toEqual(["epic"]);
    expect(passFor("jack-frost")).toEqual(["epic"]);
    expect(passFor("big-boulder")).toEqual(["epic"]);
    expect(passFor("killington")).toEqual(["ikon"]);
    expect(passFor("stratton")).toEqual(["ikon"]);
    expect(passFor("camelback")).toEqual(["ikon"]);
    expect(passFor("blue-mountain")).toEqual(["ikon"]);
    expect(passFor("jiminy-peak")).toEqual(["ikon"]);
    for (const s of ["shawnee", "bear-creek", "montage", "catamount", "mohawk", "magic"]) {
      expect(passFor(s)).toEqual(["indy"]);
    }
    for (const s of ["windham", "belleayre", "mountain-creek", "big-snow"]) {
      expect(passFor(s)).toEqual([]);
    }
  });

  it("uses the agreed tier notes", () => {
    const note = (slug: string) => PASS_SEEDS.find((p) => p.slug === slug)?.tierNote;
    expect(note("killington")).toBe("Ikon: 7 days, Base: 5 days");
    expect(note("jiminy-peak")).toBe("Bonus mountain: 2 days, full Ikon Pass only");
    for (const p of PASS_SEEDS.filter((p) => p.pass === "indy")) {
      expect(p.tierNote).toBe("2 days per season");
    }
  });
});
