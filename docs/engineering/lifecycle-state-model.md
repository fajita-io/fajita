# Lifecycle state model

Phase 11. Evidence-based organization lifecycle, separate from billing and
onboarding.

## States

Stored in `lifecycle_states` (one row per organization, current state plus
`previous_state`, `reasons` jsonb, `computed_at`). Transitions append to
`lifecycle_events`.

| State | Evidence |
| --- | --- |
| `new` | Organization created recently, no setup progress |
| `setup_in_progress` | Some setup activity, no first value |
| `first_value` | First real scheduled check completed |
| `activated` | Full activation (monitor + real check + alert path + status page) |
| `engaged` | Activated with recent meaningful activity |
| `setup_stalled` | No active monitor after the stall window |
| `inactive` | No meaningful activity for an extended period |
| `at_risk` | Monitors paused, failing channels, or long inactivity after activation |
| `payment_issue` | Billing state past due or in recovery (Phase 10) |
| `cancellation_scheduled` | Cancellation record scheduled and not reversed |
| `canceled_read_only` | Cancellation effective, retention active |
| `reactivated` | Reactivated after cancellation |
| `pending_deletion` | Deletion request scheduled |
| `deleted` | Organization deleted |

## Precedence

Deletion and billing facts override product facts: `deleted` >
`pending_deletion` > `canceled_read_only` > `cancellation_scheduled` >
`payment_issue` > product-derived states. Implemented in
`assessLifecycleState` (`src/lib/lifecycle/state.ts`).

## Inputs

Onboarding milestones, monitor activity, alert-channel health, status-page
state, recent audit events (login and configuration changes), billing
subscription state, cancellation records, deletion requests. No behavioral
profiling and no third-party enrichment.

## Sync

`syncLifecycleState` persists the assessment and appends a lifecycle event
only when the state changed. It runs inside the batch evaluator, so state is
refreshed on the worker cadence, not during customer page loads.

## Usage boundaries

Lifecycle state powers setup prompts, lifecycle email eligibility, and the
internal operations view. It is never shown to customers as a label, never
used for pricing, and never sent to analytics with identifying content.
