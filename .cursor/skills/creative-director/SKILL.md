---
name: creative-director
description: >-
  Primary creative direction skill for fajita-io. Use before any broad UI
  implementation. Develops creative thesis, category audit, three distinct
  territories, and recommendation. Do not code until direction is selected.
---

# Creative director

## Purpose

Act as a world-class creative director before implementation begins. Establish a distinct creative thesis, explore genuinely different visual territories, and record the approved direction so future agents build from intention, not defaults.

## When to invoke

- Starting a new product surface, rebrand, or major visual overhaul
- Before Phase 2 of `DESIGN_WORKFLOW.md`
- When work drifts toward generic SaaS aesthetics
- When no approved direction exists in `approved-direction.md`
- When a stakeholder asks "what should this look and feel like?"

**Do not invoke for:** small bug fixes, copy-only edits, or implementation within an already-approved direction.

## Required inputs

- Repository inspection (README, routes, product copy, existing UI if any)
- Business context: product, audience, business model, pricing, category
- Desired user action (signup, purchase, create, share, etc.)
- Any references the user supplied (optional)
- Current `creative-thesis.md` and `approved-direction.md`

## Step-by-step workflow

### 1. Understand the product

Document: product, audience, business model, pricing, category, competitive landscape, and the single most important desired action.

### 2. Define emotional response

What should the visitor or user *feel* within the first five seconds? Name it precisely (e.g., "trusted clarity," "editorial authority," "calm precision"). Avoid vague words like "modern" or "premium" without definition.

### 3. Audit category conventions

List what the category does visually and verbally by default: layout patterns, color habits, typography, motion, proof patterns, pricing presentation, dashboard clichés.

### 4. Separate usability from art direction

| Preserve (usability) | Reject (differentiation) |
| --- | --- |
| Clear CTAs, legible type, standard form patterns | Gradient heroes, card grids, reference-site mimicry |
| Predictable nav, accessible focus | Generic dark-mode neon, meaningless decoration |

### 5. Develop three genuinely distinct creative territories

**Not allowed:** dark version, light version, colorful version of the same idea.

Each territory must be conceptually different. For each, define:

| Attribute | Description |
| --- | --- |
| Name | Memorable territory title |
| Strategic idea | One sentence governing concept |
| Central metaphor | Image or system that organizes the world |
| Emotional tone | Feeling vocabulary |
| Composition | Grid character, asymmetry, density |
| Typography | Display and reading direction |
| Color behavior | Relationships, not just palette |
| Graphic devices | Recurring motifs |
| Image treatment | Photo, screenshot, illustration approach |
| Motion language | What moves, what stays still |
| Product visualization | How the product is shown |
| Signature moment | One unforgettable interaction or composition |
| Risks | What could go wrong |

### 6. Product specificity

For each territory, explain:

- Why it belongs specifically to **this** product
- Why a competitor could not copy it without appearing derivative

### 7. Recommend

Name the strongest direction. State tradeoffs honestly. If the user has not chosen, mark recommendation clearly and **do not begin broad implementation**.

### 8. Record

Update design memory before any coding.

## Required outputs

1. **Creative brief** (1 page equivalent)
2. **Category convention audit**
3. **Three creative territories** (full attribute tables)
4. **Recommendation** with rationale
5. **Initial creative thesis** (one sentence + supporting bullets)
6. **Explicit rejected ideas** (patterns and directions ruled out)

## Quality gates

- [ ] Three territories are conceptually distinct, not palette swaps
- [ ] Each territory has a named signature moment
- [ ] Emotional response is named and testable
- [ ] Category clichés are explicitly listed
- [ ] Recommendation ties to product truth, not trend
- [ ] AI-Slop Test from `anti-ai-slop.mdc` would not immediately fail all three
- [ ] Design memory updated

## Failure conditions

- Proceeding to full-site build without a selected or recommended direction
- Territories that differ only by color or light/dark mode
- Generic mood words without strategic backing
- Recommending direct imitation of a reference site
- Skipping design-memory updates

## Design memory updates

| File | What to write |
| --- | --- |
| `creative-thesis.md` | Product facts, emotional objective, thesis, conventions, success criteria |
| `approved-direction.md` | Full direction spec when user approves; otherwise "Not yet approved" with recommended direction noted |
| `rejected-patterns.md` | Rejected territories, clichés, and ideas with reasons |

## Do not code yet

**Do not begin broad UI implementation** until one direction is selected or clearly recommended and recorded. Prototyping a visual slice (hero, nav, one section, one app surface) may begin only after this skill completes and Phase 4 of `DESIGN_WORKFLOW.md` begins.

Cross-reference: `reference-deconstruction` for supplied references, `brand-world-builder` after approval.
