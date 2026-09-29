"use client";

import { useActionState } from "react";
import { passFieldName } from "@/lib/admin/mountain-form";
import { PASS_LABELS, SKI_PASSES, type MountainPassInfo } from "@/lib/passes/config";
import { saveMountainSeasonAction, type SaveState } from "./actions";

const inputClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7DD3FC]";

export function MountainSeasonForm({
  mountain,
  season,
  today,
}: {
  mountain: {
    id: string;
    openingDate: string | null;
    closingDate: string | null;
    passes: MountainPassInfo[];
  };
  season: string;
  today: string;
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    saveMountainSeasonAction,
    null,
  );
  const byPass = new Map(mountain.passes.map((p) => [p.pass, p]));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mountainId" value={mountain.id} />
      <input type="hidden" name="season" value={season} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs text-zinc-400">
          <span>Opening date (this season)</span>
          <input
            type="date"
            name="openingDate"
            defaultValue={mountain.openingDate ?? ""}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-xs text-zinc-400">
          <span>Closing date (this season)</span>
          <input
            type="date"
            name="closingDate"
            defaultValue={mountain.closingDate ?? ""}
            className={inputClass}
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs text-zinc-400">
          Passes for {season}. Leave all unchecked for &quot;No major pass&quot;.
        </legend>
        {SKI_PASSES.map((p) => {
          const current = byPass.get(p);
          return (
            <div key={p} className="rounded-md border border-zinc-800 p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name={passFieldName(p, "enabled")}
                  defaultChecked={Boolean(current)}
                  className="size-4 accent-sky-300"
                />
                {PASS_LABELS[p]}
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-[2fr_2fr_1fr]">
                <input
                  name={passFieldName(p, "tierNote")}
                  defaultValue={current?.tierNote ?? ""}
                  placeholder="Tier note, e.g. Ikon: 7 days, Base: 5 days"
                  aria-label={`${PASS_LABELS[p]} tier note`}
                  className={inputClass}
                />
                <input
                  name={passFieldName(p, "sourceUrl")}
                  defaultValue={current?.sourceUrl ?? ""}
                  placeholder="Source URL on the official pass site"
                  aria-label={`${PASS_LABELS[p]} source URL`}
                  type="url"
                  className={inputClass}
                />
                <input
                  name={passFieldName(p, "verifiedAt")}
                  defaultValue={current?.verifiedAt ?? today}
                  aria-label={`${PASS_LABELS[p]} verified date`}
                  type="date"
                  className={inputClass}
                />
              </div>
            </div>
          );
        })}
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {state && (
          <p
            role="status"
            className={`text-sm ${state.ok ? "text-green-400" : "text-red-400"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
