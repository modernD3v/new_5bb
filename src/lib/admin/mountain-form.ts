import { z } from "zod";
import { SKI_PASSES, type SkiPass } from "@/lib/passes/config";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), "Not a real date");

const optionalDate = z
  .string()
  .trim()
  .transform((s) => (s === "" ? null : s))
  .pipe(isoDate.nullable());

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => (s === "" ? null : s));

const optionalUrl = z
  .string()
  .trim()
  .transform((s) => (s === "" ? null : s))
  .pipe(z.url({ protocol: /^https?$/ }).nullable());

export const seasonSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Season looks like 2026-27")
  .refine((s) => {
    const start = Number(s.slice(0, 4));
    return String(start + 1).slice(2) === s.slice(5);
  }, "Season years must be consecutive, like 2026-27");

const passFieldsSchema = z.object({
  enabled: z.boolean(),
  tierNote: optionalText(200),
  sourceUrl: optionalUrl,
  verifiedAt: optionalDate,
});

export const mountainSeasonFormSchema = z
  .object({
    mountainId: z.uuid(),
    season: seasonSchema,
    openingDate: optionalDate,
    closingDate: optionalDate,
    passes: z.object({
      epic: passFieldsSchema,
      ikon: passFieldsSchema,
      indy: passFieldsSchema,
    }),
  })
  .refine(
    (v) => !v.openingDate || !v.closingDate || v.closingDate >= v.openingDate,
    { message: "Closing date is before opening date", path: ["closingDate"] },
  );

export type MountainSeasonForm = z.infer<typeof mountainSeasonFormSchema>;

export function passFieldName(pass: SkiPass, field: string) {
  return `${pass}.${field}`;
}

function str(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v : "";
}

export function parseMountainSeasonForm(formData: FormData) {
  const passes = Object.fromEntries(
    SKI_PASSES.map((p) => [
      p,
      {
        enabled: formData.get(passFieldName(p, "enabled")) === "on",
        tierNote: str(formData, passFieldName(p, "tierNote")),
        sourceUrl: str(formData, passFieldName(p, "sourceUrl")),
        verifiedAt: str(formData, passFieldName(p, "verifiedAt")),
      },
    ]),
  );
  return mountainSeasonFormSchema.safeParse({
    mountainId: str(formData, "mountainId"),
    season: str(formData, "season"),
    openingDate: str(formData, "openingDate"),
    closingDate: str(formData, "closingDate"),
    passes,
  });
}

export function enabledPasses(form: MountainSeasonForm) {
  return SKI_PASSES.filter((p) => form.passes[p].enabled).map((p) => ({
    pass: p,
    tierNote: form.passes[p].tierNote,
    sourceUrl: form.passes[p].sourceUrl,
    verifiedAt: form.passes[p].verifiedAt,
  }));
}
