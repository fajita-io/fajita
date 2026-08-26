#!/usr/bin/env bash
# Push pending SQL migrations to the linked fajita-io Supabase project only.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ALLOWED_REF="${SUPABASE_PROJECT_REF:-}"
if [ -z "$ALLOWED_REF" ]; then
  echo "SUPABASE_PROJECT_REF is required (your linked Supabase project ref)." >&2
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found on PATH" >&2
  exit 1
fi

if [ ! -d "supabase/migrations" ]; then
  echo "No supabase/migrations directory; nothing to push." >&2
  exit 0
fi

linked_ref=""
if [ -f "supabase/.temp/project-ref" ]; then
  linked_ref="$(tr -d '[:space:]' < supabase/.temp/project-ref)"
fi

if [ "$linked_ref" != "$ALLOWED_REF" ]; then
  echo "Refusing to push: linked ref is '${linked_ref:-unset}', expected '${ALLOWED_REF}'." >&2
  exit 1
fi

if [ -f ".env.local" ]; then
  token="$(grep -E '^SUPABASE_ACCESS_TOKEN=' .env.local | head -1 | cut -d= -f2- | tr -d '"' || true)"
  if [ -n "${token:-}" ]; then
    export SUPABASE_ACCESS_TOKEN="$token"
  fi
fi

echo "Pushing migrations to linked project (${ALLOWED_REF})..."
supabase db push --linked --yes
