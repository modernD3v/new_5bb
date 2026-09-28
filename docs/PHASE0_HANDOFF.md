# Phase 0 handoff — what you do by hand

The repo scaffolds the app, schema, seed, Vitest, and Neon *dev-branch* helper.
You still need to wire hosting and secrets once.

## 1. Neon Postgres

1. Create a Neon project (or use the one from the Vercel Neon integration in step 2).
2. Note the **production** branch connection string — this is for Vercel Production only.
3. Authenticate the CLI locally:
   ```bash
   pnpm dlx neonctl auth
   ```
4. Optional: put `NEON_PROJECT_ID=...` in `.env.local`.
5. Create/use the isolated **dev** branch and write `DATABASE_URL`:
   ```bash
   pnpm db:neon-dev
   ```
   This creates a branch named `dev` parented on `production` (if missing) and
   overwrites `DATABASE_URL` in `.env.local` with the **pooled** `dev` connection string.
6. Apply schema + seed against **dev only**:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```
7. Confirm in the Neon console that migrations landed on branch `dev`, not `production`.

If `neonctl` parent branch is not named `production` in your project, edit
`scripts/setup-neon-dev.sh` (`--parent`) to match, or create the `dev` branch
in the Neon UI and paste its connection string into `.env.local` manually.

## 2. Vercel project

1. Import this GitHub repo into Vercel.
2. Framework preset: Next.js. Install command: `pnpm install`. Build: `pnpm build`.
3. Add the **Neon** integration (or paste `DATABASE_URL`) for Preview + Production.
   - **Production** env: production branch connection string.
   - **Preview** env: prefer a `preview` Neon branch (or temporarily the `dev` branch).
4. Set at least:
   ```
   DATABASE_URL=...
   NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
   SHOP_ENABLED=false
   ```
5. Deploy. Empty Phase 0 home page should load.

Leave Auth / Resend / Stripe / Blob vars blank until later phases — keys are listed in `.env.example`.

## 3. Brand asset

Drop the circular B&W logo into:

```
public/brand/logo.svg   # or .png
```

## 4. Sanity checks after you finish Neon

```bash
pnpm test
pnpm db:migrate && pnpm db:seed
pnpm build
pnpm dev
```

Phase 0 is done when: empty site deploys, `pnpm db:migrate` and `pnpm db:seed` work against the Neon **dev** branch.
