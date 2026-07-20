#!/usr/bin/env bash
# Push Clerk + Stripe auth env from local files into Vercel Production.
# Run after: clerk auth login && clerk env pull .env.clerk.production --instance prod
#
# Usage:
#   ./scripts/sync-vercel-auth-env.sh
#
# Reads:
#   .env.clerk.production  (Clerk keys from `clerk env pull --instance prod`)
#   .env.local             (Stripe test/live keys, webhook secrets)
#
# Never commit either file.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

read_env() {
  local file="$1"
  local key="$2"
  if [[ ! -f "$file" ]]; then
    return 1
  fi
  local line
  line="$(grep -E "^${key}=" "$file" | tail -1 || true)"
  [[ -n "$line" ]] || return 1
  local val="${line#*=}"
  val="${val%\"}"
  val="${val#\"}"
  val="${val%\'}"
  val="${val#\'}"
  [[ -n "$val" ]] || return 1
  printf '%s' "$val"
}

push_var() {
  local name="$1"
  local value="$2"
  echo "→ Vercel production: $name"
  vercel env add "$name" production --value "$value" --force --yes --sensitive
}

CLERK_FILE="${CLERK_ENV_FILE:-.env.clerk.production}"
LOCAL_FILE="${LOCAL_ENV_FILE:-.env.local}"

for key in \
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
  CLERK_SECRET_KEY \
  CLERK_WEBHOOK_SIGNING_SECRET \
  NEXT_PUBLIC_CLERK_SIGN_IN_URL \
  NEXT_PUBLIC_CLERK_SIGN_UP_URL \
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL \
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL \
  NEXT_PUBLIC_APP_URL; do
  val=""
  val="$(read_env "$CLERK_FILE" "$key" 2>/dev/null || true)"
  if [[ -z "$val" ]]; then
    val="$(read_env "$LOCAL_FILE" "$key" 2>/dev/null || true)"
  fi
  if [[ -n "$val" ]]; then
    push_var "$key" "$val"
  else
    echo "skip $key (not in $CLERK_FILE or $LOCAL_FILE)"
  fi
done

for key in \
  STRIPE_SECRET_KEY \
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
  STRIPE_WEBHOOK_SECRET; do
  val="$(read_env "$LOCAL_FILE" "$key" 2>/dev/null || true)"
  if [[ -n "$val" ]]; then
    push_var "$key" "$val"
  else
    echo "skip $key (add to $LOCAL_FILE first)"
  fi
done

echo ""
echo "Done. Run: vercel env pull .env.vercel.production --environment=production"
echo "Then: npm run auth:verify:prod (with production env loaded)"
