# Onboarding and lifecycle reconciliation

Phase 11. Drift between real product state and derived state is detected and
repaired on a schedule. History is never erased.

## Onboarding reconciliation

`reconcileOnboardingBatch` (`src/lib/lifecycle/reconciliation.ts`):

- Selects not-yet-activated organizations touched in the last 30 days,
  bounded per pass.
- Runs `syncActivationMilestones` for each: any milestone that is true in
  the product but missing in onboarding state is filled forward, matching
  step rows are completed with `source = 'reconciliation'`, and funnel
  events fire once. Idempotent by construction (null-to-value writes plus
  unique step rows).
- Cancels pending reminder intents whose step has since completed
  (`setup_reminder` when a monitor is active, `alert_channel_reminder` when
  the alert path is ready, `status_page_reminder` when a page is ready),
  recording `step_completed` as the suppression reason.
- Emits one audit event (`onboarding.reconciled`) summarizing repairs.

Detected cases from the phase specification map as follows: milestone
missed but resource exists (repaired by sync), reminder pending after step
completed (canceled), user removed or preference disabled (enforced by the
send-time eligibility re-check in the delivery worker), duplicate completion
(prevented by unique step rows), version mismatch (rows keep their version;
see `onboarding-versioning.md`).

## Delivery reconciliation

`reconcile_lifecycle_delivery` (SQL RPC) counts and, outside dry-run,
repairs: intents stuck in `processing` with expired or missing leases
(returned to `pending`), and reports old pending intents with no attempts.
Nothing is marked delivered without a real attempt; the function never
fabricates delivery.

## Operation

- Both run in the scheduled worker (`jobs: ["reconcile"]`) and on demand
  from `/internal/lifecycle` (platform-admin gated, audited).
- Dry-run is the default for the SQL primitive; the internal page shows the
  dry-run counts before any repair.
- Batches are bounded (100 organizations, 500 intents per pass).
