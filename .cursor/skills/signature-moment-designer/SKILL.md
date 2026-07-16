---
name: signature-moment-designer
description: >-
  Design one to three memorable product-specific signature interactions for
  fajita-io. Ownable moments that reinforce the central idea. Not gimmicks.
---

# Signature moment designer

## Purpose

Design one primary signature moment (up to three total in the finished product) that reinforces the product's central idea, aids understanding or recall, and cannot transfer to an unrelated company.

## When to invoke

- Phase 4 of `DESIGN_WORKFLOW.md`
- After creative thesis and approved direction exist
- When a page lacks a memorable beat (AI-Slop Test failure)
- Before investing in complex hero or demo interactions

## Required inputs

- Creative thesis and central metaphor
- Product demonstration needs
- Technical constraints (framework, performance, a11y)
- Conversion path (must not delay primary action)
- Breakpoint requirements

## Step-by-step workflow

### 1. Generate concepts

Propose **at least three** signature moment concepts. Possible formats:

- Living hero composition
- Custom interactive demonstration
- Generative brand device
- Spatial page transition
- Transforming brand symbol
- Product-data-driven visual
- Unique navigation mechanic
- Interactive before-and-after system
- Tactile cursor interaction
- Immersive onboarding moment
- Custom post-footer experience
- Unusual visualization
- Product interface that transforms as users interact

### 2. Evaluate each concept

| Criterion | Question |
| --- | --- |
| Product fit | Does it reinforce the central idea? |
| Clarity | Does it help explain the product? |
| Recall | Will users remember it? |
| Technical fit | Appropriate for stack and perf? |
| Device fit | Works on mobile and desktop? |
| Accessibility | Reduced-motion alternative? |
| Gimmick test | Still valuable on repeat visit? |
| Friction | Does it delay signup or core action? |
| Transfer test | Would it feel wrong on another SaaS? |

### 3. Select primary moment

Choose one primary. Optional secondary moments must not compete. **Limit: three major signature interactions in the full product.**

### 4. Specify implementation

- User entry and exit
- States and loading
- Mobile behavior
- Reduced-motion behavior
- Performance budget
- Fallback if JS fails

### 5. Prototype in visual slice only

Build in Phase 4 slice before rolling to full site.

## Required outputs

- **Three concept briefs** with evaluation scores
- **Selected primary moment** (full spec)
- **Secondary moments** (if any, with scope limits)
- **Accessibility and perf plan**

## Quality gates

- [ ] At least three concepts documented
- [ ] Primary moment passes transfer test
- [ ] Reduced-motion alternative defined
- [ ] Primary CTA reachable without completing moment
- [ ] Mobile version art-directed, not disabled
- [ ] Total signature interactions ≤ 3 for product

## Failure conditions

- Generic parallax or floating cards as "signature"
- Moment that blocks conversion
- No mobile or reduced-motion plan
- More than three major signature interactions approved
- Moment copyable from any AI landing page generator

## Design memory updates

| File | What to write |
| --- | --- |
| `approved-direction.md` | Signature moment section |
| `visual-decisions.md` | Concept log, selection rationale, implementation notes |

## Do not code yet

Spec concepts before building. Implement only the approved primary moment in the Phase 4 visual slice first.

Cross-reference: `motion-choreographer`, `editorial-layout`, `visual-qa-critic`.
