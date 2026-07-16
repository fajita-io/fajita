#!/usr/bin/env bash
# After a migration SQL edit, push to the linked fajita-io Supabase project.
set -euo pipefail

input="$(cat)"

if ! echo "$input" | grep -qE 'supabase/(migrations|seed\.sql|roles\.sql).*\.sql'; then
  exit 0
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
log_file="${ROOT}/.cursor/hooks/supabase-migrate.log"
mkdir -p "$(dirname "$log_file")"

if ! output="$("${ROOT}/scripts/supabase-push.sh" 2>&1)"; then
  {
    echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) push failed ==="
    echo "$output"
  } >> "$log_file"
  printf '%s\n' "{\"additional_context\":\"Supabase migration push failed. Fix the SQL and rerun ./scripts/supabase-push.sh. Log: .cursor/hooks/supabase-migrate.log\"}"
  exit 0
fi

{
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) push ok ==="
  echo "$output"
} >> "$log_file"

printf '%s\n' "{\"additional_context\":\"Supabase migrations pushed to olvnjsqspvywvwfchtuc (fajita-io).\"}"
exit 0
