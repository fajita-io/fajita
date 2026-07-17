# Onboarding and lifecycle security review

Phase 11. Verified properties and how they are enforced.

## Permissions and tenancy

- Onboarding never bypasses permissions: every checklist action deep-links
  to the real feature route, which enforces its own Phase 3 permission and
  Phase 10 entitlement checks. There are no onboarding-specific create
  paths.
- Cross-tenant access is blocked by RLS: all Phase 11 tables are
  org-scoped or user-scoped with SELECT-only member policies and
  service-role writes (`docs/database/phase-11-rls.md`).
- Report and recap queries filter on `organization_id` server-side in
  addition to RLS.
- Invited members see steps they cannot perform as not actionable with the
  reason; owner-only actions are not exposed to them.
- Report recipients must be active verified members; recipient management
  requires `org:update` and is audited.

## Drafts, links, and secrets

- Draft monitor secrets stay in the Phase 5 encrypted storage; onboarding
  reads only safe names and types.
- Lifecycle email links point to fixed application routes
  (`https://<app>/app/...`); no session tokens, no signed redirects, no
  user-controlled destinations. Preference changes require authenticated
  access.
- Draft reminders reference safe hostnames only, never full URLs, query
  parameters, or header names.
- Onboarding recommendation metadata contains monitor type and copy only.

## Sample monitors

No customer-facing sample monitor shipped in this phase (deferred; see the
handoff). Nothing exempts any monitor from SSRF validation or billing
counters.

## Internal surfaces

`/internal/lifecycle` and `/internal/onboarding-lab` are platform-admin
only in production (layout guard on `isPlatformAdmin`), noindex, absent
from navigation, aggregate-only, and their mutations (reconciliation) are
audited. The lab renders fixtures exclusively.

## Worker authentication

`/api/internal/lifecycle/run` requires the `LIFECYCLE_WORKER_TOKEN` bearer
token, mirroring the Phase 7 alert worker pattern. All RPCs are
service-role-execute only.

## Cancellation and deletion

Cancellation, export, and deletion actions require an authenticated session
with the billing permission; email links lead to those authenticated
surfaces rather than performing actions directly.
