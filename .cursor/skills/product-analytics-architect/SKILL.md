---
name: product-analytics-architect
description: >-
  Privacy-conscious product analytics for Fajita. Meaningful events via DataFast,
  activation funnels, no secrets or PII leakage.
---

# Product analytics architect

## Purpose

Define analytics around business questions, not vanity tracking. Map events to journeys with privacy exclusions.

## When to invoke

- Experience Phase F in `DESIGN_WORKFLOW.md`
- Before implementing tracking on new flows
- When `analytics-plan.md` incomplete
- When adding goals to `src/lib/analytics/goals.ts`

## Inputs

- `analytics-plan.md`
- `critical-user-journeys.md`
- Existing `DataFastGoals` in `src/lib/analytics/goals.ts`
- `datafastConfig` and DataFast docs constraints
- Privacy/legal requirements

## Workflow

### 1. Business questions

What must we answer? Activation rate, demo engagement, conversion, feature adoption, churn signals, error frequency.

### 2. Funnel stages

Landing → demo → CTA → signup → onboarding → activation → first value → retention → upgrade → cancellation.

### 3. Event dictionary

For each event define:

| Field | Spec |
| --- | --- |
| Event name | snake_case per `DataFastGoals` pattern |
| Trigger | When it fires |
| User intent | Why user did it |
| Properties | Allowed keys (sanitized) |
| Exclusions | No secrets, passwords, PII, raw form content |
| Business question | What it answers |
| Success/failure interpretation | How to read it |

### 4. Existing goals (repository)

Already defined in code: `signup`, `sign_in`, `newsletter_subscribe`, `initiate_checkout`, `waitlist_join`, `demo_request`, `first_monitor`, `monitor_created`, `alert_channel_added`, `status_page_published`, `invite_sent`, `onboarding_complete`.

Extend with documented purpose; do not duplicate reserved payment goal names (see `goals.ts` comment).

### 5. Privacy rules

- Stable naming
- `sanitizeGoalParams` for properties
- No analytics failure blocking product actions
- No duplicate firing
- No vanity events without purpose
- AI crawler tracking separate (`middleware.ts`); do not conflate

### 6. Definitions

Document activation, first value, engagement, retention, conversion, failure indicators in `analytics-plan.md`.

## Required outputs

- Updated event dictionary
- Funnel diagram
- Activation/first-value definitions
- Implementation checklist (client/server track calls)
- Validation plan (dev tools, DataFast dashboard)

## Quality gates

- [ ] Every critical journey has ≥1 meaningful event
- [ ] No PII in properties
- [ ] Goals use `DataFastGoals` constants
- [ ] Reserved Stripe goal names avoided
- [ ] Analytics failures non-blocking

## Failure conditions

- Track everything without questions
- Password or email in event properties
- Duplicate events on re-render
- Undefined activation metric

## Memory updates

| File | Content |
| --- | --- |
| `analytics-plan.md` | Full plan and dictionary |
| `critical-user-journeys.md` | Analytics column per journey |

## Validation

Trigger each event in dev. Verify single fire. Inspect network payload for excluded data.

Cross-reference: `onboarding-activation-architect`, `product-experience-director`, `src/lib/analytics/`.
