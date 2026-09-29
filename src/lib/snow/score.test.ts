import { describe, expect, it } from "vitest";
import { indoorScore, scoreWeekend } from "./score";
import { getTargetWeekend, addNyDays } from "./weekend";
import { feetToMeters, SCORE_TTL_MINUTES } from "./config";
import { WEIGHTS } from "./weights";

describe("feetToMeters", () => {
  it("converts summit elevation for Open-Meteo", () => {
    expect(feetToMeters(3200)).toBeCloseTo(975.36, 2);
  });
});

describe("scoreWeekend fixtures (PLAN §7.8)", () => {
  it("big powder weekend scores 9 or 10", () => {
    const result = scoreWeekend({
      recentSnowIn: 8,
      weekendSnowIn: 4,
      dayTempF: 22,
      rainIn: 0,
      coldNights: 3,
      maxGustMph: 15,
    });
    expect(result.score).toBeGreaterThanOrEqual(9);
    expect(result.score).toBeLessThanOrEqual(10);
    expect(result.label).toBe("Send it");
  });

  it("rainy warm weekend scores 1 to 3", () => {
    const result = scoreWeekend({
      recentSnowIn: 0,
      weekendSnowIn: 0,
      dayTempF: 48,
      rainIn: 0.8,
      coldNights: 0,
      maxGustMph: 20,
    });
    expect(result.score).toBeGreaterThanOrEqual(1);
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.label).toBe("Skip it");
  });

  it("cold dry week with lots of snowmaking scores 6 or 7", () => {
    const result = scoreWeekend({
      recentSnowIn: 0.5,
      weekendSnowIn: 0,
      dayTempF: 25,
      rainIn: 0,
      coldNights: 5,
      maxGustMph: 18,
    });
    expect(result.score).toBeGreaterThanOrEqual(6);
    expect(result.score).toBeLessThanOrEqual(7);
    expect(result.label).toBe("Solid");
  });

  it("applies windy weekend penalty", () => {
    const calm = scoreWeekend({
      recentSnowIn: 2,
      weekendSnowIn: 1,
      dayTempF: 25,
      rainIn: 0,
      coldNights: 2,
      maxGustMph: 20,
    });
    const windy = scoreWeekend({
      recentSnowIn: 2,
      weekendSnowIn: 1,
      dayTempF: 25,
      rainIn: 0,
      coldNights: 2,
      maxGustMph: 45,
    });
    expect(calm.score - windy.score).toBeGreaterThanOrEqual(2);
    expect(windy.reasons.some((r) => /Gusts/i.test(r))).toBe(true);
  });

  it("clamps at both ends", () => {
    const high = scoreWeekend({
      recentSnowIn: 20,
      weekendSnowIn: 20,
      dayTempF: 20,
      rainIn: 0,
      coldNights: 5,
      maxGustMph: 5,
    });
    const low = scoreWeekend({
      recentSnowIn: 0,
      weekendSnowIn: 0,
      dayTempF: 55,
      rainIn: 2,
      coldNights: 0,
      maxGustMph: 50,
    });
    expect(high.score).toBe(WEIGHTS.scoreMax);
    expect(low.score).toBe(WEIGHTS.scoreMin);
  });

  it("indoor mountain skips numeric score", () => {
    const result = indoorScore();
    expect(result.score).toBeNull();
    expect(result.label).toBe("Indoor: always on");
  });
});

describe("getTargetWeekend", () => {
  it("maps each weekday correctly (winter EST, UTC-5)", () => {
    // Local NY noon = 17:00Z in January
    const cases: Array<[string, string]> = [
      ["2026-01-12T17:00:00.000Z", "2026-01-17"], // Mon
      ["2026-01-13T17:00:00.000Z", "2026-01-17"], // Tue
      ["2026-01-14T17:00:00.000Z", "2026-01-17"], // Wed
      ["2026-01-15T17:00:00.000Z", "2026-01-17"], // Thu
      ["2026-01-16T17:00:00.000Z", "2026-01-17"], // Fri
      ["2026-01-17T17:00:00.000Z", "2026-01-17"], // Sat
      ["2026-01-18T17:00:00.000Z", "2026-01-17"], // Sun
    ];
    for (const [when, sat] of cases) {
      const w = getTargetWeekend(new Date(when));
      expect(w.saturday).toBe(sat);
      expect(w.sunday).toBe(addNyDays(sat, 1));
    }
  });

  it("handles US DST spring-forward week (EDT, UTC-4)", () => {
    // DST 2026 starts March 8. NY noon = 16:00Z
    const fri = getTargetWeekend(new Date("2026-03-13T16:00:00.000Z"));
    expect(fri.saturday).toBe("2026-03-14");
    const sun = getTargetWeekend(new Date("2026-03-15T16:00:00.000Z"));
    expect(sun.saturday).toBe("2026-03-14");
  });

  it("handles US DST fall-back week", () => {
    // Before fall-back still EDT; after Nov 1 EST.
    const fri = getTargetWeekend(new Date("2026-10-30T16:00:00.000Z"));
    expect(fri.saturday).toBe("2026-10-31");
    const sun = getTargetWeekend(new Date("2026-11-01T17:00:00.000Z"));
    expect(sun.saturday).toBe("2026-10-31");
  });
});

describe("config", () => {
  it("exports 40 minute TTL", () => {
    expect(SCORE_TTL_MINUTES).toBe(40);
  });
});
