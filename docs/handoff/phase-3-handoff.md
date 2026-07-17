# Phase 3 handoff

Secure multi-tenant application foundation. Continues from `phase-2-handoff.md`. This is the map another engineer uses to continue without guessing.

## What is implemented

- Clerk authentication wired end to end: middleware protection for `/app` and `/internal`, branded `ClerkProvider`, auth routes (`/login`, `/signup`, `/forgot-password`, `/verify-email`, `/auth/callback`, `/auth/error`), signature-verified idempotent webhook provisioning.
- Supabase schema and RLS for identity, organizations, membership, invitations, preferences, onboarding, audit, notifications, exports, deletions, and feature-flag overrides (two applied migrations).
- Central role/permission model and server-side guards.
- App shell: sidebar, top bar, mobile nav, org switcher, account menu, command palette, notification center, toasts, dialogs, error/loading/not-found boundaries.
- Organization creation, switching, and settings; slug validation.
- Onboarding state machine and truthful overview checklist.
- Team management with secure invitations (hashed tokens, expiry, email binding, idempotent acceptance, rate limiting).
- Settings: profile, organization, security, preferences, notifications, data.
- Data-export and account/organization-deletion request foundations with ownership-conflict protection and cooling-off.
- Feature-availability system, platform-admin foundation, App Lab, typed analytics events.

## What is simulated / gated

- Product routes (monitors, incidents, status pages, integrations) are development-stage: hidden from customers, shown to platform admins as truthful Planned pre-feature states. No fake metrics or uptime data anywhere.
- App Lab uses clearly-labeled simulated fixtures only.

## What is deferred

- Email delivery (invitations, security notices) via Resend.
- Export artifact generation and the deletion worker (durable requests exist; execution does not).
- Logo upload storage bucket.
- Step-up enforcement (foundation present; enforced when Clerk reverification is enabled and `FAJITA_ENFORCE_STEP_UP=1`).
- E2E and accessibility automation; live RLS execution against a disposable database.
- Session/device visibility surfaces (as Clerk features are enabled).

## Key locations

| Concern | Path |
| --- | --- |
| Auth guards | `src/lib/auth/context.ts`, `roles.ts`, `provisioning.ts`, `errors.ts` |
| Supabase clients | `src/lib/supabase/service.ts`, `server.ts`, `types.ts` |
| Migrations | `supabase/migrations/2026071700*.sql`; RLS test `supabase/tests/phase3_rls_isolation.sql` |
| App shell | `src/components/app/*`, `src/app/(app)/layout.tsx` |
| Onboarding | `src/lib/app/onboarding.ts`, `src/app/(onboarding)/*` |
| Server actions | `src/lib/app/actions/*` |
| Feature flags | `src/lib/app/feature-flags.ts`, `feature-flags.server.ts` |
| Docs | `docs/application/*`, `docs/security/*`, `docs/database/*` |

## How future monitoring attaches

New product tables reference `organizations(id)`, enable RLS with the same membership-based read policies (`app.is_org_member` / `app.has_org_role`), and gate writes through server actions using `requireOrganizationPermission(orgId, 'monitors:manage')` (permission already defined). Add nav entries by moving the feature stage to `public_beta`/`ga` in `feature-flags.ts`. No foundation rework required.

## Readiness for Phase 4

- Tenant scoping, permissions, audit, notifications, and onboarding hooks are ready for monitors to attach.
- `monitors:manage` / `incidents:manage` / `status_pages:manage` / `integrations:manage` permissions and reserved routes exist.
- Feature stage flip is the single switch to expose a shipped monitoring surface.

## Verification snapshot

102 unit tests passing, type check clean, production build succeeds, both migrations applied. Lint: warnings only. No monitoring engine, monitors, incidents, status pages, billing, affiliates, Pamphlet, or fake operational data were implemented.
