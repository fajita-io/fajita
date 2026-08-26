#!/usr/bin/env bash
# Apply Supabase migrations to a PostgreSQL database in filename order.
# Safe to re-run: migrations use idempotent patterns where possible.
# Does not drop or recreate the database.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-${ROOT}/supabase/migrations}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory at $MIGRATIONS_DIR" >&2
  exit 1
fi

echo "Waiting for PostgreSQL..."
for i in $(seq 1 60); do
  if psql "$DATABASE_URL" -c "select 1" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Database not reachable after 60 attempts" >&2
    exit 1
  fi
  sleep 2
done

echo "Recording applied migrations..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create table if not exists public.schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);
SQL

applied=0
skipped=0
for file in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$file" ] || continue
  version="$(basename "$file")"
  exists="$(psql "$DATABASE_URL" -tAc "select 1 from public.schema_migrations where version = '$version' limit 1" 2>/dev/null || echo "")"
  if [ "$exists" = "1" ]; then
    skipped=$((skipped + 1))
    continue
  fi
  echo "Applying $version..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "insert into public.schema_migrations (version) values ('$version')"
  applied=$((applied + 1))
done

echo "Migrations complete. Applied: $applied, skipped: $skipped"
