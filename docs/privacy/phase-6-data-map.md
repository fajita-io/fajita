# Phase 6 privacy and data map

New data introduced by the incident engine, its access, retention, and deletion.

## Data categories

| Data | Store | Access | Sensitivity |
| --- | --- | --- | --- |
| Incident titles / internal summary / resolution summary | `incidents` | Org members (RLS) | Internal; may reference service names. |
| Public title / public summary | `incidents`, `incident_public_projections` | Org members; projection has no customer read | Public-ready; not published. |
| Internal notes | `incident_notes` | Org members with permission | Private operator commentary. |
| Public-ready updates | `incident_updates` | Org members | Saved, not delivered. |
| Assignee / acknowledger ids | `incidents`, `incident_assignments`, `incident_acknowledgments` | Org members | User ids only, not email. |
| Evidence | `incident_evidence` | Org members | References to check executions; no bodies/headers/secrets. |
| Timeline events | `incident_events` | Org members | Safe descriptions. |
| Maintenance descriptions | `maintenance_windows`, `maintenance_occurrences` | Org members | Customer-authored. |
| Outbox payloads | `incident_delivery_outbox` | No customer access | Allowlisted, non-sensitive. |

## Retention

Incident records and summaries persist while the account exists (subject to plan
and legal rules). Raw evidence follows monitor-result retention; incident
summaries survive even when raw evidence expires. Outbox processing metadata may
be pruned after an operationally useful period. Internal notes follow customer
deletion and legal-retention rules.

## Deletion

- Monitor deletion: preserve incident history per retention; snapshot a safe
  monitor name; stop future checking; keep evidence references where allowed.
- Organization deletion: stop evaluation, cancel future maintenance, cancel
  pending outbox, remove projections, process incident data through the deletion
  workflow, keep only legally required audit data.
- User deletion: preserve system actions with an anonymized actor; remove
  personal profile data; do not break incident-history integrity.

## Warnings and analytics

Product copy warns operators not to place passwords, API keys, private customer
information, or sensitive security detail in incident content. Incident content is
never sent to analytics (see `../analytics/application-phase-6-events.md`) and
internal notes are never exposed to future public systems.
