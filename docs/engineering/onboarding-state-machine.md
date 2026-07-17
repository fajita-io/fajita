# Onboarding state machine

Phase 11. Organization and user progress is tracked with structured records,
not one overloaded status field.

## Organization progress

Three layers, each with a distinct job:

1. **Milestone timestamps** on `organization_onboarding`:
   `first_monitor_activated_at`, `first_real_check_at`, `alert_path_ready_at`,
   `status_page_ready_at`, `activated_at`, plus `checklist_dismissed_at`.
   These are write-once (null to value) and are the activation authority.
2. **Step records** in `organization_onboarding_steps`, unique on
   `(organization_id, version, step_key)` with status `pending`, `completed`,
   or `skipped` and a `source` of `user`, `system`, or `reconciliation`.
   Database uniqueness prevents duplicate completion under concurrency.
3. **Funnel events** in `onboarding_events`, append-only, emitted once per
   transition. Analytics reads events; product logic reads milestones.

Current checklist state is always derived from live product data by
`getActivationSignals` (active monitors, real check executions with
`is_test = false`, verified alert channels with a qualifying routing rule,
published status pages with a mapped component). Milestones record when a
thing first became true; the derivation records whether it is true now. Both
are kept because resources can be deleted after activation, and historical
completion must never be erased.

## User progress

`user_onboarding` holds per-user tour state (`tours` jsonb keyed by tour key
with `started`, `completed`, `dismissed` timestamps) and a `replay_count`.
Replays are tracked separately from original completion so analytics stay
honest.

## Supported operations

| Operation | Mechanism |
| --- | --- |
| Resume | Checklist is server-derived; the next incomplete eligible step is always current. Deep links land on the real feature route. |
| Skip | `skipChecklistStepAction` records a skipped step row (optional steps only) |
| Re-enter | Steps link to real routes; nothing locks after completion |
| Multi-user | Steps completed by any member update the shared organization state |
| Permission changes | `getOnboardingState` marks steps not actionable with a reason when the viewer lacks the permission |
| Plan changes | Steps for entitlement-gated features surface availability from the feature registry |
| Resource deletion | Milestones stay; current-state derivation reflects the deletion |
| Recalculation | `syncActivationMilestones` and `reconcileOnboardingBatch` are idempotent |

## Concurrency guarantees

- Milestone writes filter on `is null`, so two concurrent syncs cannot
  double-write or move a timestamp.
- Step rows have a unique constraint; the second writer conflicts and is
  ignored.
- Funnel events are only emitted by the writer that performed the
  null-to-value transition.
