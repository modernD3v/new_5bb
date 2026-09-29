"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthorizedAdmin } from "@/lib/admin/auth";
import {
  enabledPasses,
  parseMountainSeasonForm,
  seasonSchema,
} from "@/lib/admin/mountain-form";
import { copyPassSeason, saveMountainSeason } from "@/lib/db/passes";

export type SaveState = { ok: boolean; message: string } | null;

async function requireAdmin() {
  const h = await headers();
  if (!isAuthorizedAdmin(h.get("authorization"))) {
    throw new Error("Unauthorized");
  }
}

export async function saveMountainSeasonAction(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  await requireAdmin();
  const parsed = parseMountainSeasonForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => i.message).join(". "),
    };
  }
  const form = parsed.data;
  await saveMountainSeason({
    mountainId: form.mountainId,
    season: form.season,
    openingDate: form.openingDate,
    closingDate: form.closingDate,
    passes: enabledPasses(form),
  });
  revalidatePath("/board");
  revalidatePath("/mountains/[slug]", "page");
  revalidatePath("/admin/mountains");
  return { ok: true, message: "Saved" };
}

export async function copySeasonAction(formData: FormData) {
  await requireAdmin();
  const from = seasonSchema.safeParse(formData.get("from"));
  const to = seasonSchema.safeParse(formData.get("to"));
  if (!from.success || !to.success || from.data === to.data) {
    redirect("/admin/mountains?error=copy");
  }
  const copied = await copyPassSeason(from.data, to.data);
  revalidatePath("/board");
  revalidatePath("/mountains/[slug]", "page");
  redirect(`/admin/mountains?season=${to.data}&copied=${copied}`);
}
