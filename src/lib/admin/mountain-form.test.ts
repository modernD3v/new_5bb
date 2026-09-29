import { describe, expect, it } from "vitest";
import { enabledPasses, parseMountainSeasonForm, seasonSchema } from "./mountain-form";

const ID = "7c1f2b8e-2f7a-4f39-9a57-0f7a0d3b9c11";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("parseMountainSeasonForm", () => {
  it("parses dates, checked passes and blanks to null", () => {
    const res = parseMountainSeasonForm(
      form({
        mountainId: ID,
        season: "2026-27",
        openingDate: "2026-11-21",
        closingDate: "",
        "ikon.enabled": "on",
        "ikon.tierNote": " Ikon: 7 days, Base: 5 days ",
        "ikon.sourceUrl": "https://www.ikonpass.com/en/compare-passes",
        "ikon.verifiedAt": "2026-09-29",
        "indy.tierNote": "ignored because unchecked",
      }),
    );
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.openingDate).toBe("2026-11-21");
    expect(res.data.closingDate).toBeNull();
    expect(enabledPasses(res.data)).toEqual([
      {
        pass: "ikon",
        tierNote: "Ikon: 7 days, Base: 5 days",
        sourceUrl: "https://www.ikonpass.com/en/compare-passes",
        verifiedAt: "2026-09-29",
      },
    ]);
  });

  it("rejects closing before opening", () => {
    const res = parseMountainSeasonForm(
      form({
        mountainId: ID,
        season: "2026-27",
        openingDate: "2026-12-01",
        closingDate: "2026-11-01",
      }),
    );
    expect(res.success).toBe(false);
  });

  it("rejects non-http source URLs and bad dates", () => {
    expect(
      parseMountainSeasonForm(
        form({
          mountainId: ID,
          season: "2026-27",
          "epic.enabled": "on",
          "epic.sourceUrl": "javascript:alert(1)",
        }),
      ).success,
    ).toBe(false);
    expect(
      parseMountainSeasonForm(
        form({ mountainId: ID, season: "2026-27", openingDate: "2026-13-45" }),
      ).success,
    ).toBe(false);
  });

  it("validates the season label", () => {
    expect(seasonSchema.safeParse("2026-27").success).toBe(true);
    expect(seasonSchema.safeParse("2026-28").success).toBe(false);
    expect(seasonSchema.safeParse("26-27").success).toBe(false);
  });
});
