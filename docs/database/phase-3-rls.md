# Phase 3 row-level security

Migration: `supabase/migrations/20260717000100_phase3_rls.sql` (applied). RLS test harness: `supabase/tests/phase3_rls_isolation.sql`.

## Model

RLS is enabled on every tenant table. It is defense-in-depth **read** isolation. All application writes go through server actions using the service-role connection (which bypasses RLS) after an explicit in-code authorization check. No table grants INSERT/UPDATE/DELETE to the `authenticated` role, so RLS denies every direct write.

Caller identity in SQL is `app.current_external_id()` / `app.current_profile_id()`, derived from the JWT `sub` claim, so policies work under PostgREST and in tests that set `request.jwt.claims`.

## SELECT policies

| Table | A caller may read |
| --- | --- |
| user_profiles | their own profile (`external_id = current_external_id()`) |
| user_preferences | their own row |
| notification_preferences | their own row |
| organizations | orgs where they are an active member (`is_org_member`) |
| organization_members | members of orgs they belong to |
| organization_invitations | only if org admin/owner (`has_org_role('admin')`) |
| organization_onboarding | members of the org |
| audit_events | org events if org admin/owner; user-level events if the actor |
| notifications | their own notifications |
| export_requests | the requester, or org admins |
| deletion_requests | the subject user, or org owner |
| feature_flag_overrides | members of the org (or global rows) |
| billing_accounts / billing_subscriptions | owner-scoped by Clerk id |

## What the policies guarantee

- User A cannot read organization B's rows.
- Revoked/removed members lose read access (policies check `status = 'active'`).
- Suspended/deleted profiles resolve to a null profile id, so their membership-scoped reads return nothing.
- No cross-tenant reads of audit events, notifications, invitations, exports, or deletion requests.
- No direct writes for the authenticated role on any table.

## Test harness

`supabase/tests/phase3_rls_isolation.sql` sets `role authenticated` and `request.jwt.claims` for two users across two organizations (shared member, revoked member, deleted org, suspended user) inside a transaction that rolls back. Run it in a controlled (non-production) database with pgTAP or plain assertions; it is not executed against the production project automatically. The authorization logic that backs these policies is also covered by unit tests (`tests/app-roles.test.ts`, `tests/app-feature-flags.test.ts`).
