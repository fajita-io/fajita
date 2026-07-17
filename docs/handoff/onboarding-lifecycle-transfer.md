# Onboarding and lifecycle transfer guide

For a future operator or buyer. How to change, operate, and diagnose the
Phase 11 systems without the original authors.

## Change onboarding steps

Edit `ONBOARDING_V2_STEPS` in `src/lib/onboarding/definitions.ts` (key,
kind, order, title, description, href, permission). Derivation of "done"
lives in `getOnboardingState` (`src/lib/app/onboarding.ts`); add the
product predicate there for a new core step.

## Create a new onboarding version

Add a new step array, bump `CURRENT_ONBOARDING_VERSION`, keep old rows
untouched. See `docs/engineering/onboarding-versioning.md`.

## Change reminder timing

Edit `LIFECYCLE_TIMING` in `src/lib/lifecycle/messages.ts`. Stages and
caps are encoded in dedup keys; adding a stage means adding a key builder
and a rule branch.

## Disable a lifecycle rule

Remove it from `RULES` in `src/lib/lifecycle/rules.ts` (code review is the
control surface; there is deliberately no runtime toggle a customer or
admin can flip silently). Pending intents can be canceled with
`cancel_lifecycle_intents`.

## Update an email template

Add a new renderer version in `src/lib/lifecycle/emails/templates.ts`,
register it in `TEMPLATES`, bump `templateVersion` in
`LIFECYCLE_MESSAGES`, update the fixture. Never rewrite an existing
version; historical intents record the version they rendered.

## Generate a report manually

POST `/api/internal/lifecycle/run` with the worker token and
`{"jobs":["reports"]}`, or call `generateWeeklyReport(orgId)` from a
server context. Regeneration is dedup-safe (unique org + period).

## Diagnose a report failure

Check the worker response for the reports job, then `weekly_reports` for
the period row and its `data_completeness`. Missing rows mean the org had
no active monitor or generation failed; the worker result carries the
error category.

## Diagnose duplicate lifecycle email

Duplicates should be impossible while `dedup_key` is unique. Verify the
key scope in `dedupKeys` and check `lifecycle_delivery_attempts` for
multiple `delivered` results on one intent (provider-side duplicate).

## Reconcile onboarding

`/internal/lifecycle` buttons, or `{"jobs":["reconcile"]}` on the worker
route. Dry-run counts are shown before repair. See
`docs/engineering/onboarding-reconciliation.md`.

## Review the funnel and churn

`/internal/lifecycle` shows funnel event counts, lifecycle state
distribution, and cancellation reasons. Raw data: `onboarding_events`,
`lifecycle_states`, `billing_cancellation_records`.

## Transfer the email provider

Lifecycle sending is isolated in `src/lib/lifecycle/delivery/sender.ts`
(Resend via `RESEND_API_KEY`, sender from `ALERT_EMAIL_FROM`). Replace the
send call and outcome mapping; the intent/attempt pipeline is
provider-agnostic. Phase 7 and Phase 9 senders are separate files with the
same pattern.

## Environment variables

`LIFECYCLE_WORKER_TOKEN` (worker route auth), plus the existing
`RESEND_API_KEY` and `ALERT_EMAIL_FROM`. No new secrets elsewhere.

## Independence

Nothing in Phase 11 references any product outside this repository. All
lifecycle messaging, analytics, and operations run entirely on the
project's own Supabase, Resend, and DataFast configuration.
