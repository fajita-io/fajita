# Auth production setup (Clerk + Supabase + Stripe)

Operational checklist for wiring authentication, database identity, and billing on production (`fajita.io`). No secret values in this doc.

## 1. Clerk production instance

1. Sign in: `clerk auth login`
2. Confirm link: `clerk whoami` (should show the Fajita production instance)
3. Pull env into a local file for review (do not commit):  
   `clerk env pull .env.clerk.production --instance prod`
4. Copy these into **Vercel Production** environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_live_…`)
   - `CLERK_SECRET_KEY` (`sk_live_…`)
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/app`

## 2. Clerk webhook

In Clerk Dashboard → Webhooks → Add endpoint:

| Field | Value |
| --- | --- |
| URL | `https://fajita.io/api/webhooks/clerk` |
| Events | `user.created`, `user.updated`, `user.deleted` |

Copy the signing secret into Vercel as `CLERK_WEBHOOK_SIGNING_SECRET` (`whsec_…`).

Handler: `src/app/api/webhooks/clerk/route.ts` (Svix signature verification, idempotent profile sync).

## 3. Supabase ↔ Clerk third-party auth

RLS policies read the Clerk user id from JWT `sub` via `app.current_external_id()`. Enable the integration so `userClient()` and direct anon-key reads work as defense-in-depth.

1. Clerk: follow [clerk.com/setup/supabase](https://clerk.com/setup/supabase) for the production instance. Note the Clerk domain.
2. Supabase Dashboard → **Authentication** → **Sign In / Up** → **Third-party** → **Clerk** → Enable and paste the Clerk domain.
3. Redeploy after env is set. No migration required; RLS is already keyed on `external_id`.

Application writes continue through the service role with server-side authorization. RLS is read isolation only.

## 4. Stripe production

Set in Vercel Production:

- `STRIPE_SECRET_KEY` (`sk_live_…`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_…`)
- `STRIPE_WEBHOOK_SECRET` (`whsec_…`)

Stripe Dashboard → Webhooks → endpoint `https://fajita.io/api/webhooks/stripe` with subscription and checkout events (see `src/lib/billing/webhook-processor.ts`).

Each organization gets a Stripe customer at creation (`getOrCreateOrgStripeCustomer` in `src/lib/app/organizations.ts`). Metadata includes `organization_id` for webhook reconciliation.

## 5. Supabase secrets (Vercel Production)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://fajita.io`

## 6. Verify before deploy

```bash
npm run auth:verify          # dev keys from .env.local
npm run auth:verify:prod     # requires live Clerk + Stripe keys in env
clerk doctor
npm test
npm run typecheck
```

### Vercel production env

Run `npm run wire:production` to sync `.env.production.local` → Vercel Production (webhooks, Clerk, Stripe, Supabase, Resend, worker tokens). Then `vercel --prod`.

Verify:

```bash
npm run auth:verify:prod
npm run stripe:verify-prices
SMOKE_BASE_URL=https://fajita.io npm run smoke:public
```

Clerk custom domain DNS (`npm run dns:clerk`) requires `CLOUDFLARE_API_TOKEN` with Zone DNS Edit for `fajita.io`. See `docs/operations/cloudflare-dns.md`.

Or set each variable manually in the Vercel dashboard.

## 7. Post-deploy smoke

1. Sign up on production → lands in `/app`
2. Confirm `user_profiles` row with matching `external_id` (Clerk user id)
3. Create organization → confirm `billing_customers` row and Stripe customer with `organization_id` metadata
4. Start checkout on a paid plan → webhook updates `billing_subscriptions`

## Related

- `docs/handoff/auth-and-tenancy-transfer.md`
- `scripts/auth-production-verify.ts`
- `src/lib/auth/production-readiness.ts`
