---
name: product-experience-director
description: >-
  Map complete Fajita product experience from discovery through recurring use.
  Journey architecture before broad app navigation. Connects marketing to product.
---

# Product experience director

## Purpose

Direct the complete product experience: marketing promise through signup, onboarding, first value, recurring use, upgrade, support, and return. Connect creative direction to operational product behavior.

## When to invoke

- Experience Phase A in `DESIGN_WORKFLOW.md`
- Before implementing broad app navigation or shell
- When journeys feel disconnected between marketing and product
- When adding auth, billing, or core workflows

## Inputs

- `creative-thesis.md`, `approved-direction.md`
- `experience-principles.md`, `critical-user-journeys.md`
- Repository routes and planned features
- `conversion-experience-designer` conversion map
- Business model and activation definition (or `[UNRESOLVED]`)

## Workflow

### 1. Map lifecycle stages

Connect: marketing promise → signup → auth → payment → onboarding → first value → recurring use → upgrade → support → cancellation → return.

### 2. Identify critical journeys

For each journey define:

| Field | Content |
| --- | --- |
| User intent | Job they are trying to do |
| Entry point | Where they start |
| Existing knowledge | What they already believe |
| Required information | What system needs |
| Primary action | One dominant action |
| Secondary actions | Supporting actions |
| Decision points | Where users choose |
| System feedback | What product communicates |
| Potential confusion | Risks |
| Error recovery | Paths back |
| Success condition | Done state |
| Next best action | What to do after success |
| Trust requirement | What proof they need |
| Analytics events | Per `analytics-plan.md` |

### 3. Progressive disclosure

Map what to show when. Reveal complexity over time; do not show every capability on day one.

### 4. Emotional beats

Identify moments that should feel: reassuring, fast, powerful, celebratory, quiet, urgent, explanatory.

### 5. Friction audit

List unnecessary steps, duplicate asks, dead ends, missing feedback.

### 6. Implementation sequence

Recommend build order aligned with vertical slice and `AGENTS.md` phases.

## Required outputs

- Critical journey map
- Information hierarchy
- Progressive-disclosure plan
- Friction audit
- Product-value timeline (when user feels value)
- Experience risks
- Recommended implementation sequence

## Quality gates

- [ ] All lifecycle stages considered
- [ ] Each critical journey has 8 workflow anatomy items (`experience-quality.mdc`)
- [ ] Analytics events named per `product-analytics-architect`
- [ ] No journey ends without next step
- [ ] Marketing promise matches first product experience

## Failure conditions

- Building app nav before journeys mapped
- Journeys that only cover happy path
- Missing trust or recovery on payment/auth flows
- Skipping experience-memory updates

## Memory updates

| File | Content |
| --- | --- |
| `critical-user-journeys.md` | Full journey templates |
| `experience-principles.md` | Clarity, feedback, disclosure principles |
| `interaction-decisions.md` | Major journey-level interaction choices |

## Validation

Walk each journey on paper or prototype. Ask: does user always know where they are, what to do, and what happened?

Cross-reference: `conversion-experience-designer`, `onboarding-activation-architect`, `product-ui-art-director`.
