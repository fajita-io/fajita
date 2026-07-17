# Security model

Source of truth for Fajita security behavior. Governed by `security-and-privacy.mdc`. Update via `security-and-privacy-architect`. Mark unknowns `[UNRESOLVED]`; do not invent controls.

**Status legend:** Known = confirmed in repo · Planned = intended, not built · `[UNRESOLVED]` = undecided

---

## Protected assets

- User accounts and sessions (identity in Clerk). **Status: Planned** (Clerk configured, not wired).
- Workspace / tenant data model. `[UNRESOLVED]` (no workspace tables yet; `user_id` is the current owner key).
- Monitors, incidents, status pages, alert channels (core product data). `[UNRESOLVED]` (not implemented).
- Billing records: `billing_accounts`, `billing_subscriptions` (Supabase). **Status: Known** (tables exist, RLS on, no policies).
- Secrets: Stripe, Clerk, Supabase service role, database URL, Anthropic, DataFast keys. **Status: Known** (env-managed).
- Public status pages (intentionally public, must not leak private config). `[UNRESOLVED]`.

## Actors

| Actor | Description | Status |
| --- | --- | --- |
| Anonymous visitor | Marketing, public status pages | Known (marketing placeholder) |
| Authenticated user | Signed-in customer (Clerk) | Planned |
| Workspace member / admin / owner | Team roles | `[UNRESOLVED]` (no team model yet) |
| Internal support | Trusted operator, diagnostics only | `[UNRESOLVED]` |
| System administrator | Highest internal privilege | `[UNRESOLVED]` |
| Service process | Webhooks, jobs, server routes using service role | Known (Stripe webhook route) |

## Trust boundaries

- Browser to Next.js server (all authorization server-side; only `NEXT_PUBLIC_*` reaches the client). Known.
- Next.js server to Supabase (service role server-only; RLS for user-scoped access). Known / policies Planned.
- Next.js server to Stripe (secret key server-only; webhook signature verified). Known.
- Next.js server to Clerk (secret key server-only). Planned.
- Stripe/Clerk to app via webhooks (signature verification required). Stripe: Known. Clerk: `[UNRESOLVED]`.

## Authentication model

- Provider: Clerk. Do not build custom auth. **Status: Planned** (env present, UI not wired).
- Sessions, cookies, MFA, OAuth, magic links, recovery: delegated to Clerk defaults; specific configuration `[UNRESOLVED]`.

## Authorization model

- Server-side checks on every protected action. Deny by default. Ownership checks against `user_id`. **Status: Planned.**
- Role model beyond single-owner: `[UNRESOLVED]`.

## Workspace / tenant isolation

`[UNRESOLVED]`. Current data keys on Clerk `user_id`. Multi-tenant workspace isolation must be designed before team features via `security-and-privacy-architect`. RLS policies required on every user-scoped table.

## Administrative access

`[UNRESOLVED]`. No admin surface exists. Any future impersonation or admin action must be least-privilege, audited, and separate from customer auth. Impersonation is not permitted until explicitly designed and logged.

## Secrets model

- Server-only: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SUPABASE_ACCESS_TOKEN`, `ANTHROPIC_API_KEY`, `DATAFAST_API_KEY`. Known.
- Public: `NEXT_PUBLIC_*` only (publishable keys, website ID, domain, app URL). Known.
- Never commit or log secrets (`supabase-migrations.mdc`, `operations-and-observability.mdc`).

## Webhook security

- Stripe: signature verified via `stripe.webhooks.constructEvent`. **Known.** Idempotency and duplicate protection: **not implemented** (gap).
- Clerk / other webhooks: `[UNRESOLVED]`.

## Upload security

`[UNRESOLVED]`. No uploads implemented. When added: validate type and size, restrict extensions/content types, never trust client filename or MIME, scan where appropriate.

## AI data handling

`[UNRESOLVED]`. `ANTHROPIC_API_KEY` present; no AI feature wired. If AI consumes external content, guard against prompt injection and sensitive-output leakage; define whether prompts may be logged (default: no raw private prompts).

## Logging and redaction

Structured logs, no sensitive content (`operations-and-observability.mdc`). Never log passwords, tokens, secrets, signing secrets, full payment details, sensitive uploads, or raw private prompts. Use opaque user IDs. **Status: Policy defined, no logging pipeline yet.**

## Data export

`[UNRESOLVED]`. Not implemented. Must be authorized, ownership-scoped, and audited.

## Data deletion

`[UNRESOLVED]`. Not implemented. Must cascade correctly (Stripe cancels/anonymizes; Clerk deletes identity; Supabase cascades). `billing_subscriptions` cascades on `billing_accounts` delete. Define retention and confirm no orphaned sensitive data.

## Abuse prevention

`[UNRESOLVED]`. Rate limiting for auth, recovery, invites, uploads, and public endpoints to be designed where abuse is realistic.

## Known risks

- Stripe webhook lacks idempotency and does not persist state (double-processing / drift risk).
- RLS enabled on billing tables but no policies (access relies entirely on server routes today).
- Auth not wired; no enforced authorization boundary in the app yet.
- Tenant/workspace model undefined; isolation strategy pending.

## Required tests

`[UNRESOLVED]` pending feature implementation. At minimum: authorization deny-by-default, cross-account access rejection, webhook signature rejection, webhook idempotency, secret non-exposure in client bundle.

## Phase 3 resolution (2026-07-17)

Authentication and multi-tenant authorization are now implemented. Full internal document: `docs/security/application-auth-and-tenancy.md`.

- **Auth authority**: Clerk. Middleware protects `/app` and `/internal`. Idempotent webhook provisioning (`src/app/api/webhooks/clerk/route.ts`, signature-verified).
- **Authorization**: central role model (`owner`/`admin`/`member`) in `src/lib/auth/roles.ts`; server guards in `src/lib/auth/context.ts` (`requireAuthenticatedUser`, `requireOrganizationMembership`, `requireOrganizationPermission`, `requirePlatformAdmin`, `requireStepUpAuthentication`). Deny by default.
- **Tenant isolation**: RLS enabled on all identity/tenancy tables plus billing tables (`supabase/migrations/20260717000100_phase3_rls.sql`). Reads are membership-scoped; the authenticated role has no write policies (all writes go through service-role server actions after in-code authorization). Harness: `supabase/tests/phase3_rls_isolation.sql`.
- **Invitations**: hashed tokens, expiry, email binding, idempotent acceptance, rate limiting (`docs/security/invitation-security.md`).
- **Platform admin**: explicit Clerk-id allowlist, separate from org roles, empty default (`docs/security/platform-admin-foundation.md`).
- **Deletion/export**: cooling-off scheduled requests, ownership-conflict protection, step-up foundation.

Closed earlier risks: billing RLS read policies added; auth boundary now enforced; tenant model defined. Still open: webhook idempotency/state persistence for Stripe (billing phase), email delivery, export generation + deletion worker, step-up enforcement, dedicated rate-limit store, error monitoring.

## Status

Installation baseline recorded 2026-07-16. Phase 3 auth and tenancy resolved 2026-07-17. Remaining `[UNRESOLVED]` items belong to later phases (billing, integrations, monitoring). Resolve via the matching architect skill at each gate.
