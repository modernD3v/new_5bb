#!/usr/bin/env bash
# Create / use a Neon *dev* branch so local migrations never touch production.
#
# Prerequisites:
#   1. Neon project exists (or create via Vercel Neon integration).
#   2. neonctl logged in: `pnpm dlx neonctl auth`
#   3. Optional: NEON_PROJECT_ID in .env.local
#
# Usage:
#   pnpm db:neon-dev
#
# Writes DATABASE_URL for the "dev" branch into .env.local (creates or updates).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
  # shellcheck disable=SC1091
  set -a
  source .env.local
  set +a
fi

PROJECT_FLAG=()
if [[ -n "${NEON_PROJECT_ID:-}" ]]; then
  PROJECT_FLAG=(--project-id "$NEON_PROJECT_ID")
fi

echo "==> Ensuring Neon branch 'dev' exists (child of production)…"
if pnpm dlx neonctl branches get dev "${PROJECT_FLAG[@]}" >/dev/null 2>&1; then
  echo "    Branch 'dev' already exists."
else
  pnpm dlx neonctl branches create \
    --name dev \
    --parent production \
    "${PROJECT_FLAG[@]}"
  echo "    Created branch 'dev'."
fi

echo "==> Fetching connection string for branch 'dev'…"
CONN="$(
  pnpm dlx neonctl connection-string dev \
    --role-name neondb_owner \
    --database-name neondb \
    --pooled \
    "${PROJECT_FLAG[@]}"
)"

if [[ -z "$CONN" ]]; then
  echo "Failed to fetch connection string." >&2
  exit 1
fi

ENV_FILE=".env.local"
if [[ -f "$ENV_FILE" ]] && grep -q '^DATABASE_URL=' "$ENV_FILE"; then
  # Replace existing DATABASE_URL
  tmp="$(mktemp)"
  grep -v '^DATABASE_URL=' "$ENV_FILE" >"$tmp" || true
  printf 'DATABASE_URL=%s\n' "$CONN" >>"$tmp"
  mv "$tmp" "$ENV_FILE"
else
  printf 'DATABASE_URL=%s\n' "$CONN" >>"$ENV_FILE"
fi

echo "==> Wrote DATABASE_URL (dev branch) to $ENV_FILE"
echo "    Run: pnpm db:migrate && pnpm db:seed"
echo "    Never point drizzle-kit at the production branch for local work."
