# Onboarding foundation

State machine: `src/lib/app/onboarding.ts`. Actions: `src/lib/app/actions/onboarding.ts`. Surfaces: `/app/new-organization`, `/app/onboarding`, and the overview checklist.

## Two levels

- **User level**: `user_profiles.onboarding_status` (`account_created` -> `email_verified` -> `organization_created` -> `completed`). Coarse and synced from identity.
- **Organization level**: `organization_onboarding` with a versioned `steps` jsonb map plus product-context fields (`use_case`, `monitoring_scope`, `service_count`, `alert_destination`, `plans_status_page`).

Versioning (`version` column) lets later phases add steps without corrupting old progress.

## Steps

Implemented and interactive in Phase 3:

1. Account created (automatic)
2. Email verified (from Clerk)
3. Organization created
4. Timezone confirmed
5. Product context provided
6. Teammate invited (optional)
7. Notification preferences reviewed

Reserved and truthfully locked (later phases): create first monitor, connect alert channel, publish status page.

## Behavior

- Save and resume: progress is server-side per organization; the overview reflects it.
- Skip optional steps.
- Re-enter onboarding from the overview.
- Steps complete as a side effect of the real action (saving timezone marks it confirmed; saving notification preferences marks that reviewed) so the checklist stays truthful.
- Locked steps are shown honestly and are not clickable into broken flows.

## Analytics

`onboardingStarted`, `onboarding step completed`, `onboardingSkipped`, `onboardingResumed`, `onboardingComplete` (see `../analytics/application-phase-3-events.md`). No monitoring target is collected before the monitoring engine exists.
