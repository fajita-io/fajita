# Phase 3 test matrix

## Automated (this repo)

Run: `npm test` (Vitest), `npx tsc --noEmit`, `npm run lint`, `npm run build`, `supabase migration list --linked`.

| Area | File | Status |
| --- | --- | --- |
| Role permissions, hierarchy, `permissionsFor` | `tests/app-roles.test.ts` | passing |
| Role assignment / no self-promotion / no owner grant | `tests/app-roles.test.ts` | passing |
| Slug normalize / validate / reserved words / suggest | `tests/app-slug.test.ts` | passing |
| Invitation token hashing (deterministic, not raw), email normalize | `tests/app-invitations.test.ts` | passing |
| Feature stages and base map | `tests/app-feature-flags.test.ts` | passing |
| Navigation gating (member vs platform admin) | `tests/app-feature-flags.test.ts` | passing |
| Audit action labels, relative time | `tests/app-format.test.ts` | passing |
| Phase 2 suites (site, brand, theme, SEO, demo, forms) | existing | passing |

Totals at time of writing: 17 test files, 102 tests passing. Type check clean. Lint: warnings only (avatar `<img>`, pre-existing DataFast script). Production build succeeds. Both Phase 3 migrations applied on the linked project.

## RLS / tenant isolation

`supabase/tests/phase3_rls_isolation.sql`: two users, two organizations, shared member, revoked member, suspended user, deleted org, and an authenticated-write denial. Transaction rolls back. Run in a controlled database (not production). The authorization model behind the policies is unit-tested above.

## Manual / deferred verification

The following require a running Clerk session and are validated manually or in a later E2E pass (no Clerk test harness wired yet):

- Unauthenticated redirect from `/app`, safe post-auth redirect.
- Webhook signature verification and idempotent provisioning.
- Suspended/deleted user handling in the live shell.
- Invitation acceptance email binding end-to-end.
- Step-up enforcement when the Clerk instance enables reverification.
- Visual QA matrix (see below), keyboard-only, screen reader, reduced motion, 200% zoom.

## Visual QA matrix

Breakpoints: 1440, 1280, 1024, 768, 430, 390, 360. Themes: light, dark, system. Conditions: reduced motion, keyboard-only, 200% zoom, long org/user/email names, zero/one/many organizations, suspended org, permission-restricted user, empty and large notification/team lists, invitation errors, server error boundary. Capture with `npm run qa:screens` (authenticated routes require a session) and record defects in `docs/website/visual-qa.md` or a Phase 3 addendum.

## Documented gaps

E2E (Playwright), accessibility automation (axe), and live RLS execution against a disposable database are not yet wired. They are the top of the Phase 3 follow-up list and are called out honestly rather than claimed as passing.
