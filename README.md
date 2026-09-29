# 5 Borough Boarders

NYC snowboarding community site. Build plan: [`docs/PLAN.md`](docs/PLAN.md).

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Neon Postgres · Drizzle · Leaflet · Vitest · pnpm

<<<<<<< HEAD
## Cursor Cloud / Vercel

`DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) are environment **secrets**.
Never commit connection strings. Auth is Auth.js later — ignore Neon Auth vars.

Vercel / `pnpm build` runs:

```bash
pnpm db:migrate && pnpm db:seed:mountains && next build
```

(`vercel.json` uses the same sequence via `build:next`.) Migrations prefer `DATABASE_URL_UNPOOLED`.

```bash
pnpm install
pnpm db:migrate
pnpm db:seed:mountains
pnpm test
pnpm build:next   # or pnpm build (includes migrate+seed)
=======
## Cursor Cloud setup

`DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) are environment
**secrets** pointing at the Neon **`dev`** branch. Never commit connection strings.

```bash
pnpm install
pnpm db:migrate   # uses DATABASE_URL_UNPOOLED when set
pnpm db:seed
pnpm test
pnpm build
>>>>>>> origin/main
pnpm dev
```

See `docs/PHASE0_HANDOFF.md` for Vercel + brand steps. Skip `neonctl` / `db:neon-dev` on Cloud.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
<<<<<<< HEAD
| `pnpm build` | Migrate + seed mountains + Next build |
| `pnpm build:next` | Next build only |
| `pnpm test` | Vitest (scoring fixtures + refresh lock) |
| `pnpm db:migrate` | Apply migrations (prefers `DATABASE_URL_UNPOOLED`) |
| `pnpm db:seed` / `db:seed:mountains` | Idempotent mountain upsert on `slug` |

## Phase status

- **Phase 0** — setup ✅
- **Phase 1** — weekend scores + `/board` + `/mountains/[slug]`

## Rules

- Migrations/seed target Neon **`dev`** for Cloud work — never point local tooling at production by accident.
- Shop is gated by `SHOP_ENABLED` (default `false`).
- Full phase plan lives in `docs/PLAN.md`.
=======
| `pnpm test` | Vitest |
| `pnpm db:generate` | Create Drizzle SQL migration from schema |
| `pnpm db:migrate` | Apply migrations (prefers `DATABASE_URL_UNPOOLED`) |
| `pnpm db:seed` | Upsert 10 mountains |

## Rules

- Migrations target Neon **`dev`** only — never production.
- Shop is gated by `SHOP_ENABLED` (default `false`).
- Full phase plan lives in `docs/PLAN.md` — follow that over any shorter summary.
- Auth is Auth.js; ignore Neon Auth env vars.
>>>>>>> origin/main
