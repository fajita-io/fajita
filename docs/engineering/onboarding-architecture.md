# Onboarding architecture

Phase 11. How guided setup works from first session through full activation.

## Principle

Show the value first. Explain the machinery when it becomes useful. Onboarding
never blocks the application, never invents completion, and derives every
"done" state from real product data rather than button clicks.

## Components

| Layer | Location | Responsibility |
| --- | --- | --- |
| Step registry | `src/lib/onboarding/definitions.ts` | Versioned step definitions, use-case options, monitor recommendations, product tours, funnel event types |
| Activation signals | `src/lib/onboarding/activation.ts` | Derives milestone timestamps from monitors, checks, alert channels, routing rules, and status pages; persists them idempotently |
| Checklist state | `src/lib/app/onboarding.ts` | `getOnboardingState` merges signals, step records, permissions, and feature flags into the checklist view |
| Server actions | `src/lib/app/actions/onboarding.ts` | Context save, skip, dismiss, reopen, tour state |
| First session UI | `src/components/app/onboarding/first-session.tsx` | Use case, first concern, responsibility, recommendation, primary action |
| Checklist UI | `src/components/app/onboarding/activation-checklist.tsx` | Persistent server-derived checklist on the overview |
| Reconciliation | `src/lib/lifecycle/reconciliation.ts` | Repairs missed milestones and cancels stale reminders |

## Data flow

1. Signup and organization creation finish (Phase 3). A row exists in
   `organization_onboarding`.
2. The first session collects optional context (use case, first concern,
   responsibility role) and recommends a first monitor type.
3. Real product actions happen through the normal Phase 4 to 8 flows. No
   onboarding-specific create paths exist, so security and entitlements are
   the production ones.
4. `syncActivationMilestones` observes product state and fills milestone
   timestamps forward (`first_monitor_activated_at`, `first_real_check_at`,
   `alert_path_ready_at`, `status_page_ready_at`, `activated_at`). It only
   writes null-to-value transitions, completes the matching step rows in
   `organization_onboarding_steps`, and appends funnel events to
   `onboarding_events` exactly once per transition.
5. The lifecycle rule engine (`src/lib/lifecycle/rules.ts`) reads the same
   signals to schedule or cancel guidance email.
6. A scheduled worker (`/api/internal/lifecycle/run`) runs rules, reports,
   recaps, delivery, and reconciliation in bounded batches.

## What onboarding does not do

- It does not gate any route. Every step links to the real feature.
- It does not weaken SSRF protection, permissions, or entitlements.
- It does not count manual tests or sample fixtures as first value.
- It does not store its state in one JSON blob; steps, events, and milestones
  are structured rows.

## Related documents

- `onboarding-state-machine.md`
- `onboarding-versioning.md`
- `onboarding-reconciliation.md`
- `../application/first-five-minute-activation.md`
