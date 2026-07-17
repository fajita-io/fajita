# Onboarding and lifecycle observability

Phase 11. What is visible, where, and with which labels.

## Signals

| Signal | Source |
| --- | --- |
| Step completion and skips | `organization_onboarding_steps` (source column distinguishes user, system, reconciliation) |
| Funnel events | `onboarding_events` (append-only) |
| Activation completion | Milestone timestamps on `organization_onboarding` |
| Lifecycle rule outcomes | `lifecycle_delivery_intents` creation with dedup outcomes |
| Delivery, retry, dead letter | Intent status plus `lifecycle_delivery_attempts` (error category, HTTP status, duration, next retry) |
| Suppression | Intent `suppression_reason` and `lifecycle_suppressions` |
| Weekly report generation and failure | `weekly_reports` rows and worker pass results |
| Incident recap generation | `incident_recaps` rows and worker pass results |
| Reconciliation differences | Audit events `onboarding.reconciled`, `lifecycle.reconciled` with counts |
| Queue lag | Oldest due pending intent age (visible in `/internal/lifecycle` dry-run counts) |

## Worker results

`/api/internal/lifecycle/run` returns a JSON summary per job (evaluated
organizations, intents created, deliveries attempted, delivered, failed,
suppressed, reports generated, recaps generated, reconciliation counts).
The scheduler's logs of these responses are the operational record.

## Label discipline

Bounded labels only: message keys, statuses, error categories, event
types. Never user email, monitor URL, incident title, or organization name
in any metric or log label.

## Where to look

- `/internal/lifecycle`: state distribution, intent statuses, recent
  failures and dead letters, funnel counts, churn reasons, version
  adoption, delivery drift, reconciliation controls.
- `/internal/onboarding-lab`: template rendering health across all
  messages (a broken renderer fails visibly here and in unit tests).
- Audit log: every admin action, preference change, recipient change, and
  reconciliation run.
