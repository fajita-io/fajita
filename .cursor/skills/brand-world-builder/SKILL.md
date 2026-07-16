---
name: brand-world-builder
description: >-
  Turn an approved creative territory into a coherent brand universe for
  fajita-io. Use after creative direction is approved. Defines full visual and
  verbal world across marketing and product.
---

# Brand world builder

## Purpose

Convert an approved creative territory into a complete, actionable brand-world specification. The result must pass the logo-hidden test: recognizable without the mark.

## When to invoke

- After `creative-director` and user approval of a direction
- Phase 3 of `DESIGN_WORKFLOW.md`
- Before `typography-director` and `design-system-engineer`
- When marketing and product surfaces feel like different companies

## Required inputs

- Approved direction from `approved-direction.md`
- Creative thesis from `creative-thesis.md`
- Product surfaces inventory (marketing routes, app shell, emails if known)
- Existing voice rules (`draper-honeycopy.mdc`, `voice-and-boundaries.mdc`)

## Step-by-step workflow

### 1. Anchor the brand idea

Distill the approved territory into: brand idea, central metaphor, emotional promise.

### 2. Define identity systems

Work through each domain below. Be specific enough to implement; avoid mood-board vagueness.

| Domain | Deliverable |
| --- | --- |
| Symbol behavior | Logo usage, clearspace, forbidden treatments |
| Wordmark behavior | Case, spacing, pairing with symbol |
| Color relationships | Primary, secondary, accent, semantic, surface hierarchy |
| Typography hierarchy | Display, reading, interface, numeric roles |
| Layout character | Grid, margins, asymmetry, density |
| Graphic devices | Lines, frames, marks, patterns |
| Texture and material | Grain, paper, depth, flatness |
| Photography / image | Crop, grade, context |
| Illustration | Style boundaries |
| Icon philosophy | Metaphor level, stroke, corner |
| Data visualization | Chart personality, color logic |
| Motion personality | Easing family, duration, restraint |
| Sound / haptic | If relevant; otherwise "not in scope" |
| Voice and vocabulary | Tone, words to use, words to ban |

### 3. Map expressions by surface

| Surface | Guidance |
| --- | --- |
| Marketing pages | Narrative pacing, proof, CTA |
| Product interface | Density, hierarchy, chrome |
| Loading states | Motion, message tone |
| Empty states | Illustration or type-led |
| Success / error / warning | Color, icon, copy pattern |
| Notifications | Placement, duration, tone |
| Social previews | OG image logic |
| Launch imagery | Key visual |
| Email | Layout, type, CTA |
| Documentation | Calmer density, same DNA |

### 4. Logo-hidden test

Describe how each of these remains on-brand without the logo: homepage hero, app shell, empty state, error toast.

### 5. Document and hand off

Output concise brand-world spec. Flag open questions.

## Required outputs

- **Brand-world specification** (structured document, ~2-4 pages equivalent)
- **Logo-hidden test results** (pass/fail per surface with fixes if fail)
- **Open questions** for `creative-thesis.md`

## Quality gates

- [ ] Every domain in the workflow table has a decision or explicit "TBD with constraint"
- [ ] Marketing and product expressions share DNA, differ in density
- [ ] Voice aligns with Draper + Honeycopy rules without contradicting brand metaphor
- [ ] No generic SaaS defaults smuggled in as "practical"
- [ ] States (empty, loading, error) are designed, not deferred

## Failure conditions

- Building a "palette and font list" without metaphor, devices, or motion
- Product UI spec that ignores approved marketing direction
- Silent override of approved creative territory
- Skipping state-surface definitions

## Design memory updates

| File | What to write |
| --- | --- |
| `approved-direction.md` | Expand with full brand-world fields |
| `visual-decisions.md` | Log each major identity decision |

## Do not code yet

Complete this spec before `design-system-engineer` encodes tokens. Typography and layout skills may run in parallel after the brand idea is locked.

Cross-reference: `brand-copy-director`, `typography-director`, `motion-choreographer`.
