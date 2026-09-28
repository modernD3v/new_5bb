import { describe, expect, it } from "vitest";
import { MOUNTAIN_SEEDS } from "@/lib/db/seed-data";

describe("mountain seed data", () => {
  it("includes exactly 10 mountains with unique slugs", () => {
    expect(MOUNTAIN_SEEDS).toHaveLength(10);
    const slugs = MOUNTAIN_SEEDS.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(10);
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
});
