import { describe, expect, it } from "vitest";
import {
  formatSeasonDate,
  getSeasonStatus,
  isScoreVisible,
  seasonLabelFor,
  seasonMessage,
  seasonShortLabel,
} from "./status";

const status = (
  today: string,
  openingDate: string | null = null,
  closingDate: string | null = null,
  isIndoor = false,
) => getSeasonStatus({ today, openingDate, closingDate, isIndoor });

describe("seasonLabelFor", () => {
  it("rolls over on Jul 1", () => {
    expect(seasonLabelFor("2026-06-30")).toBe("2025-26");
    expect(seasonLabelFor("2026-07-01")).toBe("2026-27");
    expect(seasonLabelFor("2026-09-29")).toBe("2026-27");
    expect(seasonLabelFor("2027-02-14")).toBe("2026-27");
    expect(seasonLabelFor("2099-12-01")).toBe("2099-00");
  });
});

describe("getSeasonStatus", () => {
  it("before opening_date is preseason with the date", () => {
    expect(status("2026-11-20", "2026-11-21")).toEqual({
      state: "preseason",
      opensOn: "2026-11-21",
    });
  });

  it("opening day and after is open", () => {
    expect(status("2026-11-21", "2026-11-21").state).toBe("open");
    expect(status("2027-01-10", "2026-11-21").state).toBe("open");
  });

  it("an early opening_date beats the Nov 15 default", () => {
    expect(status("2026-10-31", "2026-10-30").state).toBe("open");
  });

  it("with no opening_date, preseason until Nov 15", () => {
    expect(status("2026-09-29")).toEqual({ state: "preseason", opensOn: null });
    expect(status("2026-11-14")).toEqual({ state: "preseason", opensOn: null });
    expect(status("2026-11-15").state).toBe("open");
  });

  it("after closing_date is closed; closing day itself is open", () => {
    expect(status("2027-04-12", "2026-11-21", "2027-04-12").state).toBe("open");
    expect(status("2027-04-13", "2026-11-21", "2027-04-12")).toEqual({
      state: "closed",
      closedOn: "2027-04-12",
    });
  });

  it("a late closing_date keeps spring riding open past Apr 30", () => {
    expect(status("2027-05-20", "2026-11-10", "2027-05-25").state).toBe("open");
  });

  it("with no closing_date, closed after Apr 30", () => {
    expect(status("2027-04-30").state).toBe("open");
    expect(status("2027-05-01")).toEqual({ state: "closed", closedOn: null });
  });

  it("ignores last season's dates (October after a spring close)", () => {
    expect(status("2027-10-05", "2026-11-21", "2027-04-12")).toEqual({
      state: "preseason",
      opensOn: null,
    });
  });

  it("indoor mountains are always open", () => {
    expect(status("2026-08-01", null, null, true).state).toBe("open");
  });

  it("only shows scores when open", () => {
    expect(isScoreVisible({ state: "open" })).toBe(true);
    expect(isScoreVisible({ state: "preseason", opensOn: null })).toBe(false);
    expect(isScoreVisible({ state: "closed", closedOn: null })).toBe(false);
  });
});

describe("season copy", () => {
  it("formats pin labels", () => {
    expect(
      seasonShortLabel({ state: "preseason", opensOn: "2026-11-21" }),
    ).toBe("Opens Nov 21");
    expect(seasonShortLabel({ state: "preseason", opensOn: null })).toBe(
      "Preseason",
    );
    expect(seasonShortLabel({ state: "closed", closedOn: null })).toBe(
      "Closed",
    );
    expect(seasonShortLabel({ state: "open" })).toBeNull();
  });

  it("formats mountain page messages without em dashes", () => {
    const pre = seasonMessage(
      { state: "preseason", opensOn: null },
      "Hunter Mountain",
    );
    expect(pre).toBe(
      "Season hasn't started. Scores start when Hunter Mountain opens.",
    );
    const post = seasonMessage({ state: "closed", closedOn: null }, "Hunter");
    expect(post).toBe("Season's over. See you next winter.");
    expect(`${pre}${post}`).not.toContain("\u2014");
  });

  it("formats dates as calendar days regardless of server timezone", () => {
    expect(formatSeasonDate("2026-11-01")).toBe("Nov 1");
    expect(formatSeasonDate("2026-11-01", true)).toBe("Nov 1, 2026");
  });
});
