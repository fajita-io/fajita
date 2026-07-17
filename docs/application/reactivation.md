# Reactivation

Phase 11, built on the Phase 10 billing authority.

## Workflow

Reactivation restores billing through Phase 10
(`reactivateSubscriptionAction`), recalculates entitlements from Stripe as
the source of truth, and resumes monitoring safely: schedules resume
through the normal Phase 4 scheduler (staggered by existing interval logic,
so no check storm), and prior history, incidents, status pages, and
subscriber records are preserved untouched.

## Reactivation checklist

Shown after reactivation: confirm subscription active, confirm monitors
resumed, confirm first fresh result, test alert channels, confirm
status-page freshness, confirm custom domains, confirm subscriber email
provider, review usage limits. Reactivation is not treated as complete
until fresh monitoring evidence exists (a new real check result), because
integrations may have gone stale during the canceled period.

## Lifecycle messages

Bounded and lawful (see `docs/engineering/lifecycle-rule-engine.md`):

1. One enriched cancellation confirmation (monitor count, status-page
   count, export link, retention date, reactivation link).
2. One optional reactivation reminder midway through retention, only for
   users with `reactivation_reminders` enabled and no suppression.
3. Pre-deletion reminders at 7 days and 1 day before scheduled deletion.

No repeated discount offers, nothing after deletion, nothing to users who
opted out of product email beyond required notices. Reminders are canceled
automatically when the organization reactivates (reconciliation and dedup
keys are scoped to the cancellation record).
