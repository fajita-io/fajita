# Auth and tenancy transfer (buyer handoff)

How a new owner takes over the Phase 3 authentication and tenancy systems. No secret values appear here; only names, purpose, owner, and rotation/transfer procedure.

## External services

| Service | Role | Transfer |
| --- | --- | --- |
| Clerk | Authentication authority (sessions, MFA, passkeys, verification, webhooks) | Transfer Clerk application ownership; rotate `CLERK_SECRET_KEY` and the webhook signing secret |
| Supabase (project ref `olvnjsqspvywvwfchtuc`) | Postgres, RLS, storage | Transfer Supabase org/project; rotate service-role key and DB password |
| Vercel | Hosting, environment variables | Transfer project; re-enter env vars in the new account |
| DataFast | Product analytics | Transfer website; rotate API key |
| Stripe | Billing (Checkout, Customer Portal, webhooks, org-scoped customers) | Transfer Stripe account; rotate `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, publishable key |

## Environment variables

Public (client-safe, `NEXT_PUBLIC_*`): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`.

Server-only secrets: `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

Configuration (non-secret): `PLATFORM_ADMIN_USER_IDS` (comma-separated Clerk user ids; empty = no admins). Optional: `FAJITA_ENFORCE_STEP_UP=1` to enforce reverification when Clerk supports it.

Public Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

Each secret's owner is the account holder of the corresponding service. Rotation: regenerate in the provider dashboard, update Vercel env, redeploy. Never commit secrets; `.env.example` documents names only.

## Database

Schema and RLS are versioned in `supabase/migrations/`. Phase 3 migrations: `20260717000000_phase3_identity_and_tenancy.sql`, `20260717000100_phase3_rls.sql` (both applied). Apply pending migrations with `./scripts/supabase-push.sh`; check status with `supabase migration list --linked`. Generated types live in `src/lib/supabase/types.ts` and are regenerated from the remote schema.

## Authentication webhooks

Clerk webhook endpoint: `src/app/api/webhooks/clerk/route.ts`. Verifies the signature with `CLERK_WEBHOOK_SIGNING_SECRET` and processes `user.created`, `user.updated`, `user.deleted` via idempotent provisioning (`src/lib/auth/provisioning.ts`). Configure the endpoint URL in the Clerk dashboard on transfer and update the signing secret.

## Supabase ↔ Clerk

Enable Clerk as a third-party auth provider on the Supabase project so JWT `sub` matches `user_profiles.external_id` for RLS read isolation. See `docs/operations/auth-production-setup.md`. Application writes use the service role with explicit authorization in server actions.

## Stripe ↔ organizations

Each organization maps to one Stripe customer (`billing_customers`, metadata `organization_id`). Created at org birth and reused for Checkout. Webhooks: `src/app/api/webhooks/stripe/route.ts`.

## Administrative-role assignment

Edit `PLATFORM_ADMIN_USER_IDS` in the hosting environment. No code change, no database change. See `../security/platform-admin-foundation.md`.

## Local development

1. Copy `.env.example` to `.env.local` and fill values from the transferred providers.
2. `npm install`.
3. `npm run dev`.
4. `npm test`, `npm run build` to verify.

## Production deployment

Vercel builds from the repository. Ensure all env vars above are set in the production environment. `robots.txt`, `sitemap.xml`, and `llms.txt` remain reachable (auth pages are noindex; the app is noindex).
