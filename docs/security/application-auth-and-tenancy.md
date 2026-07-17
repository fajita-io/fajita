# Application auth and tenancy (internal)

Internal security document. Do not expose publicly.

## Trust boundaries

1. Browser (untrusted). Holds a Clerk session cookie only.
2. Clerk (identity authority). Issues sessions and JWTs; owns credentials, MFA, passkeys, verification.
3. Next.js server (trusted app tier). Middleware gates `/app` and `/internal`; server actions and route handlers authorize every mutation.
4. Supabase Postgres (trusted data tier). RLS enabled on every tenant table; service-role connection used only from server code after authorization.

The service-role key never reaches the client. Only `NEXT_PUBLIC_*` values are public.

## Authentication flow

Clerk `clerkMiddleware` protects `/app` and `/internal`. `ClerkProvider` wraps the root layout with Fajita-branded appearance. Auth routes: `/login`, `/signup`, `/forgot-password`, `/verify-email`, `/auth/callback`, `/auth/error`. On first authenticated request, `getCurrentProfile` provisions a `user_profiles` row from the Clerk identity (idempotent via unique `external_id`).

## Authorization flow

Every protected server action calls a guard from `src/lib/auth/context.ts`:

- `requireAuthenticatedUser` (rejects anonymous, suspended, soft-deleted),
- `requireOrganizationMembership` (active membership + usable org),
- `requireOrganizationPermission` (central permission gate, deny by default),
- `requirePlatformAdmin` (explicit Clerk-id allowlist),
- `requireStepUpAuthentication` (reverification foundation).

Role always comes from the membership row, never from client input. UI hiding is never the authorization boundary.

## Tenant-isolation model

Writes: all mutations run server-side with the service-role connection after an explicit in-code authorization check. RLS is defense-in-depth for reads.

Reads: RLS policies (see `../database/phase-3-rls.md`) restrict the authenticated role to its own rows and rows for organizations it actively belongs to. Caller identity in SQL comes from `app.current_external_id()` / `app.current_profile_id()`, derived from the JWT `sub` claim. No table grants INSERT/UPDATE/DELETE to the authenticated role, so RLS denies all direct writes.

## Invitation security

See `invitation-security.md`. Hashed tokens, expiry, email binding, idempotent acceptance, rate limiting, no account-enumeration.

## Administrative-role model

Platform admin is an internal role from `PLATFORM_ADMIN_USER_IDS` (explicit Clerk-id allowlist), fully separate from organization roles, never inferred from email domain, empty by default. Platform-admin controls are not in the customer sidebar; hidden routes are not treated as security. See `platform-admin-foundation.md`.

## Deletion and export security

Cooling-off scheduled requests; ownership-conflict detection prevents owner orphaning; step-up foundation; typed confirmation; audit events. Exports are generated server-side with short-lived signed links (generation deferred). See `../application/deletion-flows.md` and `../application/data-export.md`.

## Known limitations (Phase 3)

- Reverification is a foundation: enforced only when the Clerk instance supports it and `FAJITA_ENFORCE_STEP_UP=1`; otherwise typed UI confirmation is the guard.
- Email delivery (invitations, security notices) is not wired.
- Export artifact generation and the deletion worker are deferred; only durable requests exist.
- No dedicated rate-limit store yet; invitation rate limiting is enforced at the data layer.
- Logo upload/storage bucket not configured.

## Future security work

Wire reverification enforcement, add a shared rate-limit store, ship the deletion worker and export generator with signed storage, add error-monitoring, and add session/device visibility surfaces as Clerk features are enabled.
