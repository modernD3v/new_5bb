# Phase 0 handoff — Cursor Cloud + Neon `dev`

This project runs on **Cursor Cloud Agents**. Neon connection strings are injected
as **environment secrets** — never commit them, never write them into the repo.

Auth is **Auth.js** (NextAuth v5) in a later phase. Ignore Neon Auth env vars.

## 1. Database secrets

| Secret | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon URL — app runtime + seed |
| `DATABASE_URL_UNPOOLED` | Direct Neon URL — `pnpm db:migrate` (drizzle-kit) |

`drizzle.config.ts` prefers `DATABASE_URL_UNPOOLED`, then `DATABASE_URL`.

Skip `neonctl` / `pnpm db:neon-dev` on Cloud Agents.

```bash
pnpm db:migrate
pnpm db:seed:mountains
```

Vercel build also runs migrate + `db:seed:mountains` automatically (`vercel.json` / `pnpm build`).

## 2. Vercel

1. Import the GitHub repo.
2. Install: `pnpm install`. Build command comes from `vercel.json`.
3. Set `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEXT_PUBLIC_SITE_URL`, `SHOP_ENABLED=false`.
4. Production → Neon production branch; Preview → `dev` or a preview branch.

## 3. Brand

```
public/brand/logo.svg
```

## 4. Phase 0 acceptance

- [x] Scaffold + Vitest + plan docs
- [x] Drizzle schema + migration
- [x] Verified mountain seed
- [x] `pnpm db:migrate` / `pnpm db:seed:mountains` on Neon `dev`
- [x] `pnpm test` + `pnpm build`
- [ ] Optional: production Vercel domain

**Phase 0 complete. Phase 1 (scores + map) follows `docs/PLAN.md` §§7–8.**
