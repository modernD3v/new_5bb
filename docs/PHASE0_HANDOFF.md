# Phase 0 handoff — Cursor Cloud + Neon `dev`

This project runs on **Cursor Cloud Agents**. Neon connection strings are injected
as **environment secrets** — never commit them, never write them into the repo,
and never paste them into docs or issues.

Auth is **Auth.js** (NextAuth v5) in a later phase. Ignore Neon Auth env vars
if the Neon integration adds them.

## 1. Database secrets (required for Phase 0 acceptance)

In the Cursor Cloud environment for this repo, set these secrets so they point
at the Neon **`dev`** branch (not production):

| Secret | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon URL — app runtime + `pnpm db:seed` |
| `DATABASE_URL_UNPOOLED` | Direct Neon URL — `pnpm db:migrate` (drizzle-kit) |

`drizzle.config.ts` prefers `DATABASE_URL_UNPOOLED`, then falls back to
`DATABASE_URL`.

Do **not** use `neonctl` or `pnpm db:neon-dev` on Cloud Agents. Those helpers
were for optional local machines; Cloud uses secrets only.

Once secrets are available in the agent shell:

```bash
pnpm db:migrate
pnpm db:seed
```

Confirm ten mountain rows exist (agent will query `mountains` after seed).

## 2. Vercel (hosting)

1. Import this GitHub repo into Vercel.
2. Framework: Next.js · Install: `pnpm install` · Build: `pnpm build`.
3. Wire Neon (or paste env vars) for Preview + Production:
   - **Production** → Neon production branch URLs
   - **Preview** → Neon `dev` (or a dedicated preview branch)
4. Set at least:
   - `DATABASE_URL` (and `DATABASE_URL_UNPOOLED` if you run migrations in CI)
   - `NEXT_PUBLIC_SITE_URL`
   - `SHOP_ENABLED=false`
5. Deploy. Phase 0 home page should load.

Leave Auth.js / Resend / Stripe / Blob vars blank until later phases — keys are
listed in `.env.example` (names only, no values).

## 3. Brand asset

Drop the circular B&W logo into:

```
public/brand/logo.svg   # or .png
```

## 4. Phase 0 acceptance checklist

- [x] Next.js + Tailwind + shadcn + ESLint/Prettier + Vitest scaffold
- [x] Full plan in `docs/PLAN.md`
- [x] Drizzle schema + migration generated
- [x] Mountain seed data verified with source comments
- [x] `pnpm db:migrate` against Neon **`dev`** (via `DATABASE_URL_UNPOOLED`)
- [x] `pnpm db:seed` — 10 rows in `mountains`
- [x] `pnpm test` and `pnpm build` still green
- [ ] Site deploys on Vercel (optional for starting Phase 1; migrate/seed already pass)

**Phase 0 migrate + seed confirmed against Neon `dev`. Ready for Phase 1 when you say go.**
