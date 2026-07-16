---
name: interactive-demo-engineer
description: >-
  Build realistic interactive Fajita product demonstrations. Input-to-outcome
  proof without fake capabilities or fragile live APIs.
---

# Interactive demo engineer

## Purpose

Demonstrate product value through realistic interactive experiences, not static screenshots alone.

## When to invoke

- Experience Phase B in `DESIGN_WORKFLOW.md`
- Marketing needs product proof before full app exists
- `signature-moment-designer` needs interactive format
- Homepage lacks understandable transformation

## Inputs

- Creative thesis and central value proposition
- `critical-user-journeys.md`
- `content-realism-editor` demo dataset
- `trust-and-claims.mdc` constraints
- Technical stack (Next.js)

## Workflow

### 1. Choose demo format

Consider: guided sandbox, before/after, simulated workflow, animated narrative, real shell with deterministic sample data, clickable use-case, personalized preview, scenario selector.

### 2. Requirements

Demo must:
- Explain product quickly
- Show input-to-outcome transformation
- Use realistic content
- Avoid account creation to try
- Avoid unnecessary paid API calls
- Work reliably (deterministic where possible)
- Reset safely
- Support keyboard and touch
- Have reduced-motion mode
- Work on mobile or simplified mobile alt
- Lead to primary CTA

### 3. Do not build

- Fake demo misrepresenting live capabilities
- Video disguised as interactive UI
- Fragile live demo on external services
- Complex playground that delays understanding

### 4. Fallback

Graceful degradation when demo fails (static outcome + CTA).

### 5. Trust register

Log what demo shows vs. what is live in `trust-evidence-register.md`.

## Required outputs

- Demo format selection and rationale
- Interaction spec (steps, reset, fallback)
- Sample data requirements
- Mobile and a11y plan
- CTA handoff

## Quality gates

- [ ] Central value prop clear in < 30 seconds
- [ ] Content realistic and consistent
- [ ] No false capability claims
- [ ] Reduced-motion alternative
- [ ] Analytics events for demo engagement

## Failure conditions

- Demo requires signup to see value
- Live API dependency without fallback
- Misleading output vs. production
- Mobile broken with no alt

## Memory updates

| File | Content |
| --- | --- |
| `critical-user-journeys.md` | Demo journey entry |
| `interaction-decisions.md` | Demo interactions |
| `trust-evidence-register.md` | Demo accuracy claims |

## Validation

Complete demo as new visitor on mobile/desktop. Verify reset, keyboard, reduced-motion. Register claims.

Cross-reference: `signature-moment-designer`, `content-realism-editor`, `trust-experience-designer`.
