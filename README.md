# 5 Borough Boarders

NYC snowboarding community site. Build plan: [`docs/PLAN.md`](docs/PLAN.md).

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Neon Postgres · Drizzle · Vitest · pnpm

## Cursor Cloud setup

`DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) are environment
**secrets** pointing at the Neon **`dev`** branch. Never commit connection strings.

```bash
pnpm install
pnpm db:migrate   # uses DATABASE_URL_UNPOOLED when set
pnpm db:seed
pnpm test
pnpm build
pnpm dev
```

See `docs/PHASE0_HANDOFF.md` for Vercel + brand steps. Skip `neonctl` / `db:neon-dev` on Cloud.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm test` | Vitest |
| `pnpm db:generate` | Create Drizzle SQL migration from schema |
| `pnpm db:migrate` | Apply migrations (prefers `DATABASE_URL_UNPOOLED`) |
| `pnpm db:seed` | Upsert 10 mountains |

## Rules

- Migrations target Neon **`dev`** only — never production.
- Shop is gated by `SHOP_ENABLED` (default `false`).
- Full phase plan lives in `docs/PLAN.md` — follow that over any shorter summary.
- Auth is Auth.js; ignore Neon Auth env vars.
