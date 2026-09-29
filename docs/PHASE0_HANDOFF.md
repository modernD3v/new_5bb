# Phase 0 handoff — Cursor Cloud + Neon `dev`

This project runs on **Cursor Cloud Agents**. Neon connection strings are injected
as **environment secrets** — never commit them, never write them into the repo,
and never paste them into docs or issues.

Auth is **Auth.js** (NextAuth v5) in a later phase. Ignore Neon Auth env vars
if the Neon integration adds them.

## 1. Database secrets

| Secret | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon URL — app runtime + seed |
| `DATABASE_URL_UNPOOLED` | Direct Neon URL — `pnpm db:migrate` (drizzle-kit) |

`drizzle.config.ts` prefers `DATABASE_URL_UNPOOLED`, then falls back to
`DATABASE_URL`.

Do **not** use `neonctl` or `pnpm db:neon-dev` on Cloud Agents. Cloud uses secrets only.

```bash
pnpm db:migrate
pnpm db:seed:mountains
```

Vercel build also runs migrate + `db:seed:mountains` automatically (`vercel.json` / `pnpm build`).

## 2. Vercel

1. Import the GitHub repo.
2. Install: `pnpm install`. Build command comes from `vercel.json` (migrate + seed + Next).
3. Set `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEXT_PUBLIC_SITE_URL`, `SHOP_ENABLED=false`.
4. Production → Neon production branch; Preview → `dev` or a preview branch.
5. Deploy.

Leave Auth.js / Resend / Stripe / Blob vars blank until later phases — keys are
listed in `.env.example` (names only, no values).

## 3. Brand asset

Drop the circular B&W logo into:

```
public/brand/logo.svg   # or .png / logo-badge.svg for nav
```

## 4. Phase 0 acceptance checklist

- [x] Next.js + Tailwind + shadcn + ESLint/Prettier + Vitest scaffold
- [x] Full plan in `docs/PLAN.md`
- [x] Drizzle schema + migration generated
- [x] Mountain seed data verified with source comments
- [x] `pnpm db:migrate` against Neon **`dev`** (via `DATABASE_URL_UNPOOLED`)
- [x] `pnpm db:seed:mountains` — 10 rows in `mountains`
- [x] `pnpm test` and `pnpm build` still green
- [ ] Optional: production Vercel domain

**Phase 0 complete. Phase 1 (scores + map) follows `docs/PLAN.md` §§7–8.**
