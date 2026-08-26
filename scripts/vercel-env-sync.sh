#!/usr/bin/env bash
set -euo pipefail

# Sync selected env vars from .env.local to Vercel.
# Usage: ./scripts/vercel-env-sync.sh [production|preview|development|all]

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.local"
TARGET="${1:-production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

get_env() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$ENV_FILE" | tail -1 | cut -d= -f2- || true)"
  printf '%s' "$value"
}

add_env() {
  local key="$1"
  local envs="$2"
  local value
  value="$(get_env "$key")"
  if [[ -z "$value" ]]; then
    echo "skip $key (not in .env.local)"
    return
  fi
  for env in $envs; do
    printf '%s' "$value" | vercel env add "$key" "$env" --force >/dev/null
    echo "set $key → $env"
  done
}

case "$TARGET" in
  all) ENVS="production preview development" ;;
  *) ENVS="$TARGET" ;;
esac

# Required for email + cron on Vercel
add_env RESEND_API_KEY "$ENVS"
add_env RESEND_FULL_API_KEY "$ENVS"
add_env ALERT_EMAIL_FROM "$ENVS"
add_env MONITOR_SECRET_KEYRING "$ENVS"
add_env CRON_SECRET "$ENVS"
add_env SUBSCRIBER_EMAIL_WEBHOOK_SECRET "$ENVS"
add_env ALERT_WORKER_TOKEN "$ENVS"
add_env SUBSCRIBER_WORKER_TOKEN "$ENVS"
add_env LIFECYCLE_WORKER_TOKEN "$ENVS"
add_env NEXT_PUBLIC_APP_URL "$ENVS"
add_env NEXT_PUBLIC_CLERK_SIGN_IN_URL "$ENVS"
add_env NEXT_PUBLIC_CLERK_SIGN_UP_URL "$ENVS"
add_env NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL "$ENVS"
add_env NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL "$ENVS"

add_env NEXT_PUBLIC_DATAFAST_WEBSITE_ID "$ENVS"
add_env NEXT_PUBLIC_DATAFAST_DOMAIN "$ENVS"
add_env DATAFAST_API_KEY "$ENVS"
add_env DATAFAST_BOT_TOKEN "$ENVS"
add_env NEXT_PUBLIC_GA_MEASUREMENT_ID "$ENVS"

echo "Done. Redeploy production for changes to take effect."
