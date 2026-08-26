# Secret rotation runbook (pre-public release)

Rotate these secrets before making the repository public or after any suspected exposure. **Names only.** Never commit values.

## When to rotate

- Before first public GitHub visibility
- After any secret appears in a commit, log, or support ticket
- After an operator laptop compromise
- Quarterly for production (recommended)

## Rotation checklist

| Secret | Where to rotate | After rotation |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | Update Vercel env; redeploy |
| `DATABASE_URL` | Supabase → Database → reset password | Update all workers + Vercel |
| `SUPABASE_ACCESS_TOKEN` | Supabase account tokens | Update local/CI secrets |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys | Update Vercel; redeploy |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk → Webhooks → endpoint | Update Vercel; test webhook |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | Roll key; update Vercel |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → roll secret | Update Vercel webhook route |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | Update Vercel (public) |
| `RESEND_API_KEY` | Resend → API Keys | Update Vercel |
| `RESEND_FULL_API_KEY` | Resend (admin key) | Operator scripts only |
| `MONITOR_SECRET_KEYRING` | Generate new key version; keep old for decrypt | See encryption rotation docs |
| `CRON_SECRET` | Generate new random value | Vercel + scheduler |
| `ALERT_WORKER_TOKEN` | Generate new random value | Vercel + worker |
| `SUBSCRIBER_WORKER_TOKEN` | Generate new random value | Vercel + worker |
| `LIFECYCLE_WORKER_TOKEN` | Generate new random value | Vercel + worker |
| `AFFILIATE_WORKER_TOKEN` | Generate new random value | Vercel + worker |
| `PLATFORM_ANALYTICS_WORKER_TOKEN` | Generate new random value | Vercel + worker |
| `SUBSCRIBER_EMAIL_WEBHOOK_SECRET` | Resend webhook signing secret | Vercel |
| `AFFILIATE_COOKIE_SECRET` | Generate new HMAC key | Vercel (invalidates referral cookies) |
| `DATAFAST_API_KEY` | DataFast dashboard | Vercel |
| `DATAFAST_BOT_TOKEN` | DataFast bot settings | Vercel |
| `ANTHROPIC_API_KEY` | Anthropic console | Vercel |
| `SENTRY_AUTH_TOKEN` | Sentry → Auth Tokens | CI/CD only |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Sentry project settings | Vercel |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → API Tokens | Operator secrets |
| `VERCEL_TOKEN` | Vercel account tokens | GitHub Actions secret |

## Monitor secret keyring rotation

1. Generate a new 32-byte key: `openssl rand -base64 32`
2. Append to keyring: `1:<old>,2:<new>` (increment version)
3. Deploy with updated `MONITOR_SECRET_KEYRING`
4. Re-encrypt or wait for natural rotation on monitor/channel updates
5. Remove old version only when no rows reference it

## Verification after rotation

```bash
npm run auth:verify:prod
npm run verify:production
npm run smoke:public
```

Run billing webhook test event from Stripe Dashboard. Send Clerk test webhook. Trigger cron with new `CRON_SECRET`.

## Cannot automate

Rotation requires production dashboard access. This runbook is the operator procedure; CI validates that secrets are not committed, not that they are fresh.
