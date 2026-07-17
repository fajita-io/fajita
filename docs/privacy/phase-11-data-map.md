# Phase 11 privacy data map

What Phase 11 collects, why, where it lives, and how it leaves.

## Collected data

| Data | Table | Purpose | Retention |
| --- | --- | --- | --- |
| Use case, first concern, responsibility role | `organization_onboarding` | Tailor setup guidance only | Life of organization |
| Onboarding step status and milestones | `organization_onboarding_steps`, `organization_onboarding` | Checklist and activation measurement | Life of organization |
| Funnel events | `onboarding_events` | Aggregate funnel analysis | Prune after 12 months (aggregate first) |
| Tour state | `user_onboarding` | Resume and replay | Life of user |
| Lifecycle state and transitions | `lifecycle_states`, `lifecycle_events` | Guidance and operations | Current state life of org; events pruned after 12 months |
| Email preferences | `lifecycle_email_preferences` | Consent enforcement | Life of user |
| Suppressions | `lifecycle_suppressions` | Bounce/complaint compliance | Life of user (compliance record) |
| Delivery intents and attempts | `lifecycle_delivery_*` | Idempotent delivery, history | Attempts pruned after 12 months; intents retained for dedup while relevant |
| Weekly report snapshots | `weekly_reports` | Historical reports | Per plan retention; deleted with organization |
| Incident recap snapshots | `incident_recaps` + revisions | Post-incident record | Deleted with organization |
| Cancellation feedback | `billing_cancellation_records` | Churn analysis | Billing and legal policy (Phase 10) |

## Minimization

- No revenue, funding, phone, job title, or company-size collection.
- Role and use-case selections are the selected option only; no inference.
- Analytics goals carry counts and enum metadata only: never monitor URLs,
  secret headers, organization names, customer emails, incident content,
  status-page domains, subscriber data, or free-text feedback.
- Written cancellation feedback stays in the database; it is not shown in
  the internal aggregate view and is never sent to analytics providers.

## Access

Customers read their own data per the RLS map. Platform admins see
aggregates in `/internal/lifecycle`. No lifecycle data is used for
advertising, sold, or shared beyond the existing subprocessors (Supabase
for storage, Resend for delivery, DataFast for count-based analytics).

## Deletion

Account deletion removes user-scoped rows through existing cascades
(`on delete cascade` from `user_profiles`); organization deletion removes
org-scoped rows the same way. Aggregate activation metrics may be retained
only in anonymized form.
