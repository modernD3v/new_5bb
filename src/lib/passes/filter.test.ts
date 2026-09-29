import { describe, expect, it } from "vitest";
import type { SkiPass } from "./config";
import {
  filterByPassSelection,
  isAllSelected,
  mountainMatchesPassSelection,
  parsePassSelection,
  resolveInitialPassSelection,
  serializePassSelection,
  togglePassSelection,
} from "./filter";

const m = (slug: string, passes: SkiPass[]) => ({
  slug,
  passes: passes.map((pass) => ({ pass })),
});

const MOUNTAINS = [
  m("hunter", ["epic"]),
  m("killington", ["ikon"]),
  m("shawnee", ["indy"]),
  m("windham", []),
  m("both", ["ikon", "indy"]),
];

const slugs = (rows: { slug: string }[]) => rows.map((r) => r.slug);

describe("parsePassSelection", () => {
  it("treats missing or empty as All", () => {
    expect(parsePassSelection(null)).toEqual([]);
    expect(parsePassSelection(undefined)).toEqual([]);
    expect(parsePassSelection("")).toEqual([]);
  });

  it("parses a comma list in canonical order, deduped, case-insensitive", () => {
    expect(parsePassSelection("indy,IKON,ikon")).toEqual(["ikon", "indy"]);
    expect(parsePassSelection(" none , epic ")).toEqual(["epic", "none"]);
  });

  it("ignores unknown tokens", () => {
    expect(parsePassSelection("ikon,mountain-collective")).toEqual(["ikon"]);
    expect(parsePassSelection("bogus")).toEqual([]);
  });

  it("'all' clears everything", () => {
    expect(parsePassSelection("all,ikon")).toEqual([]);
  });

  it("accepts repeated params (?pass=ikon&pass=indy)", () => {
    expect(parsePassSelection(["ikon", "indy"])).toEqual(["ikon", "indy"]);
  });

  it("collapses every chip on to All", () => {
    expect(parsePassSelection("epic,ikon,indy,none")).toEqual([]);
  });
});

describe("serializePassSelection", () => {
  it("returns null for All so the query param is dropped", () => {
    expect(serializePassSelection([])).toBeNull();
    expect(serializePassSelection(["epic", "ikon", "indy", "none"])).toBeNull();
  });

  it("round-trips with parse", () => {
    const s = serializePassSelection(["indy", "ikon"]);
    expect(s).toBe("ikon,indy");
    expect(parsePassSelection(s)).toEqual(["ikon", "indy"]);
  });
});

describe("togglePassSelection", () => {
  it("adds and removes chips (multi-select)", () => {
    let s = togglePassSelection([], "ikon");
    expect(s).toEqual(["ikon"]);
    s = togglePassSelection(s, "indy");
    expect(s).toEqual(["ikon", "indy"]);
    s = togglePassSelection(s, "ikon");
    expect(s).toEqual(["indy"]);
  });

  it("'all' clears the others", () => {
    expect(togglePassSelection(["ikon", "indy"], "all")).toEqual([]);
    expect(isAllSelected(togglePassSelection(["none"], "all"))).toBe(true);
  });

  it("turning the last chip off goes back to All", () => {
    expect(isAllSelected(togglePassSelection(["epic"], "epic"))).toBe(true);
  });
});

describe("mountainMatchesPassSelection / filterByPassSelection", () => {
  it("All shows every mountain", () => {
    expect(slugs(filterByPassSelection(MOUNTAINS, []))).toEqual(
      slugs(MOUNTAINS),
    );
  });

  it("Indy shows only Indy mountains", () => {
    expect(slugs(filterByPassSelection(MOUNTAINS, ["indy"]))).toEqual([
      "shawnee",
      "both",
    ]);
  });

  it("Ikon + Indy is a union", () => {
    expect(slugs(filterByPassSelection(MOUNTAINS, ["ikon", "indy"]))).toEqual([
      "killington",
      "shawnee",
      "both",
    ]);
  });

  it("No pass shows only mountains without pass rows", () => {
    expect(slugs(filterByPassSelection(MOUNTAINS, ["none"]))).toEqual([
      "windham",
    ]);
    expect(mountainMatchesPassSelection([], ["epic"])).toBe(false);
  });

  it("No pass can combine with a pass", () => {
    expect(slugs(filterByPassSelection(MOUNTAINS, ["epic", "none"]))).toEqual([
      "hunter",
      "windham",
    ]);
  });
});

describe("resolveInitialPassSelection", () => {
  it("prefers the shared URL over everything", () => {
    expect(
      resolveInitialPassSelection({
        urlParam: "ikon",
        memberPasses: ["epic"],
        stored: "indy",
      }),
    ).toEqual(["ikon"]);
  });

  it("?pass=all overrides a stored default", () => {
    expect(
      resolveInitialPassSelection({ urlParam: "all", stored: "indy" }),
    ).toEqual([]);
  });

  it("uses member passes, then localStorage, then All", () => {
    expect(
      resolveInitialPassSelection({ memberPasses: ["epic"], stored: "indy" }),
    ).toEqual(["epic"]);
    expect(resolveInitialPassSelection({ stored: "indy,none" })).toEqual([
      "indy",
      "none",
    ]);
    expect(resolveInitialPassSelection({})).toEqual([]);
  });
});
