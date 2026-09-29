export const SKI_PASSES = ["epic", "ikon", "indy"] as const;
export type SkiPass = (typeof SKI_PASSES)[number];

export const PASS_LABELS: Record<SkiPass, string> = {
  epic: "Epic",
  ikon: "Ikon",
  indy: "Indy",
};

/** Official resort lists, linked from the board so riders can double-check. */
export const PASS_RESORT_URLS: Record<SkiPass, string> = {
  epic: "https://www.epicpass.com/passes/epic-pass.aspx",
  ikon: "https://www.ikonpass.com/en/destinations",
  indy: "https://www.indyskipass.com/our-resorts",
};

export const PASS_BADGE_STYLES: Record<SkiPass, string> = {
  epic: "bg-blue-700 text-white",
  ikon: "bg-zinc-950 text-white ring-1 ring-inset ring-zinc-400",
  indy: "bg-violet-600 text-white",
};

export const NO_PASS_LABEL = "No major pass";

export function isSkiPass(value: unknown): value is SkiPass {
  return (
    typeof value === "string" && (SKI_PASSES as readonly string[]).includes(value)
  );
}

export type MountainPassInfo = {
  pass: SkiPass;
  tierNote: string | null;
  season: string;
  sourceUrl: string | null;
  verifiedAt: string | null;
};
