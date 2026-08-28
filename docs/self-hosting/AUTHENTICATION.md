# Self-hosted authentication

Fajita uses [Clerk](https://clerk.com) for authentication in both Cloud and self-hosted modes. Self-hosters run **their own Clerk application**. Fajita's production Clerk tenant is never required.

## Supported approach (Phase 2)

**Option A: Clerk with your own keys** (recommended, lowest risk)

Self-hosters create a Clerk application, configure redirect URLs, and enable the Supabase third-party auth integration so Postgres RLS receives Clerk JWTs.

There is no alternate self-hosted identity backend in Phase 2.

## Setup checklist

1. Create a Clerk application.
2. Copy `pk_test_` / `sk_test_` (or live keys for production) into `.env`.
3. Configure URLs:
   - Sign-in: `/login`
   - Sign-up: `/signup`
   - After sign-in redirect: `/app`
4. Add your public app URL to Clerk allowed origins.
5. Enable Clerk webhooks:
   - Endpoint: `https://<your-host>/api/webhooks/clerk`
   - Signing secret → `CLERK_WEBHOOK_SIGNING_SECRET`
   - Events: user and organization lifecycle events used by provisioning
6. Connect Clerk to Supabase (Clerk dashboard → Supabase integration) so session tokens include the claims RLS expects.

## First user / organization

The standard product flow applies:

1. First registered user signs in via Clerk.
2. User creates or joins an organization through the app shell.
3. Organization membership drives tenant isolation via RLS.

No separate bootstrap admin password is required. Platform admin (`PLATFORM_ADMIN_USER_IDS`) is optional and usually empty for self-host.

## Limitations

- Clerk account required (free tier available for development).
- Webhook endpoint must be reachable for full user sync (tunnel for local dev; see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#clerk-webhook-during-local-development)).
- Step-up and org policies follow Clerk configuration.

## Security notes

- Never use Fajita Cloud Clerk keys in a self-hosted `.env`.
- Keep `CLERK_SECRET_KEY` server-only.
- Empty `PLATFORM_ADMIN_USER_IDS` is the safe default.

See also [QUICKSTART.md](./QUICKSTART.md).
