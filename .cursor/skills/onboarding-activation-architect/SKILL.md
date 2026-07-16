---
name: onboarding-activation-architect
description: >-
  Fajita onboarding to meaningful activation and first value. Short honest route,
  not configuration theater.
---

# Onboarding activation architect

## Purpose

Design onboarding that moves users to a meaningful outcome (activation, first value), not merely collects configuration.

## When to invoke

- Experience Phase C in `DESIGN_WORKFLOW.md`
- Before implementing signup-first-run flows
- When activation metrics undefined
- When onboarding is long, generic, or ends in empty dashboard

## Inputs

- `critical-user-journeys.md`
- `analytics-plan.md` (activation definition)
- Product capabilities (uptime monitoring per `fajita-master-directive.mdc`; monitor/alert signals from `DataFastGoals`)
- `experience-principles.md`

## Workflow

### 1. Define activation

What event means user received first value? Align with `DataFastGoals` (e.g., `first_monitor`, `onboarding_complete`).

### 2. Information audit

| Question | Decision |
| --- | --- |
| What is genuinely necessary? | Collect now |
| What can be inferred? | Auto-fill |
| What can be deferred? | Ask later |
| What can be preconfigured? | Smart defaults |
| What should be demonstrated? | Show, don't tell |

### 3. Design flow

Require:
- Clear progress indicator
- Back navigation
- Safe exit and resume
- Preserved entered information
- Skippable nonessential steps
- Relevant examples (realistic per `content-realism-editor`)
- Immediate product feedback during setup
- Personalized next steps after completion
- Compelling completion state
- Useful first dashboard (not empty)
- Return path for incomplete setup

### 4. Avoid

- Long setup questionnaires
- Decorative welcome screens
- Asking before explaining why
- Forced product tours
- Tooltips on every element
- Confetti without achievement
- Empty dashboard after onboarding
- Generic checklists unrelated to value

### 5. Measure

Define activation events and funnel steps in `analytics-plan.md`.

## Required outputs

- Onboarding flow spec (steps, skip rules, resume)
- Activation and first-value definitions
- Progress and completion UI direction
- Post-onboarding first screen spec
- Analytics event list

## Quality gates

- [ ] Shortest honest path to first value documented
- [ ] Activation event measurable
- [ ] No empty post-onboarding state
- [ ] Exit/resume preserves data
- [ ] Mobile flow art-directed

## Failure conditions

- Onboarding without activation metric
- Required fields without justification
- Completion lands on blank screen
- Forced tour blocking primary action

## Memory updates

| File | Content |
| --- | --- |
| `critical-user-journeys.md` | Onboarding journey template |
| `analytics-plan.md` | Activation, funnel events |
| `interaction-decisions.md` | Progress, skip, completion behaviors |

## Validation

Complete onboarding as new user on mobile and desktop. Time to first value. Verify analytics fire once.

Cross-reference: `interface-state-director`, `product-analytics-architect`, `content-realism-editor`.
