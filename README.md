# 5 Borough Boarders

NYC snowboarding community site. Build plan: [`docs/PLAN.md`](docs/PLAN.md).

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Neon Postgres · Drizzle · Vitest · pnpm

## Local setup (after Neon is ready)

```bash
pnpm install
cp .env.example .env.local
# Put your Neon *dev* branch DATABASE_URL in .env.local
# or run: pnpm db:neon-dev   (requires neonctl auth)

pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm test` | Vitest |
| `pnpm db:generate` | Create Drizzle SQL migration from schema |
| `pnpm db:migrate` | Apply migrations (**dev branch only**) |
| `pnpm db:seed` | Upsert 10 mountains |
| `pnpm db:neon-dev` | Create/use Neon `dev` branch and write `DATABASE_URL` |

## Rules

- Local migrations always target the Neon **`dev`** branch — never production.
- Shop is gated by `SHOP_ENABLED` (default `false`).
- Full phase plan lives in `docs/PLAN.md` — follow that over any shorter summary.
