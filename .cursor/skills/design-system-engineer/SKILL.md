---
name: design-system-engineer
description: >-
  Encode approved fajita-io art direction into scalable design tokens and
  primitives. Use only after creative direction is approved. Must preserve
  distinctiveness, not neutralize it.
---

# Design system engineer

## Purpose

Convert approved art direction into an implementation system: tokens, primitives, states, and responsive rules. The system must scale production without averaging away the creative direction.

> The design system must encode the approved art direction. It must never neutralize, sanitize, or average away the distinctiveness of the creative direction.

## When to invoke

- Phase 6 of `DESIGN_WORKFLOW.md`
- After visual slice approval (Phase 5)
- After `typography-director`, `motion-choreographer`, and `brand-world-builder` outputs exist
- When implementing tokens in CSS, Tailwind, or component primitives

**Do not invoke** before creative direction is approved.

## Required inputs

- `approved-direction.md` (approved status)
- `visual-decisions.md`
- Typography, motion, and layout specs
- Target stack (inspect `package.json`, Tailwind config, CSS approach)
- Accessibility requirements from `frontend-quality.mdc`

## Step-by-step workflow

### 1. Audit implementation surface

Identify where tokens live: CSS variables, Tailwind theme, component library. Match existing conventions.

### 2. Define semantic tokens

| Category | Tokens |
| --- | --- |
| Color | Semantic (background, foreground, accent, border, destructive, etc.) |
| Typography | Families, sizes, weights, line heights, tracking |
| Spacing | Scale with named steps |
| Grid | Columns, gutters, max widths |
| Breakpoints | Align with `frontend-quality.mdc` |
| Surface hierarchy | Base, raised, inset, overlay |
| Border logic | Width, color, when borders exist vs. space |
| Radius logic | Intentional variation, not one radius everywhere |
| Shadow logic | Restrained; no glow-as-brand |
| Depth | z-index system |
| Opacity | Interactive and disabled |
| Icon sizing | Steps aligned to type |
| Illustration sizing | Max widths per context |
| Motion | Durations, easings from motion spec |
| Data viz | Series, grid, label colors |

### 3. Component states

- Default, hover, focus, active, disabled
- Input: empty, filled, error, success
- Feedback: toast, banner, inline

### 4. Build primitives, not page clones

Create reusable primitives where they improve consistency:

- Button, link, input, label, card (if cards are on-brand), stack, grid

**Do not** over-generalize one-off signature compositions into bland components. Preserve hero and signature layouts as intentional exceptions documented in `visual-decisions.md`.

### 5. Responsive and a11y encoding

- Fluid type tokens
- Focus ring tokens
- Reduced-motion media queries
- Touch target minimums

### 6. Document exceptions

List components or sections that intentionally break the token defaults (signature moment, editorial hero).

## Required outputs

- **Token specification** (names, values, usage rules)
- **Primitive component list** with state coverage
- **Exception register** (non-token compositions)
- **Implementation files** (CSS/Tailwind/theme as appropriate)

## Quality gates

- [ ] Tokens trace to approved direction, not generic defaults
- [ ] Radius and shadow logic avoid AI-slop sameness
- [ ] Typography tokens preserve display character
- [ ] Motion tokens match motion spec
- [ ] Focus and contrast states defined
- [ ] Signature compositions not flattened into generic Card

## Failure conditions

- Implementing before approval
- Inter/system-ui smuggled in as silent default
- Single border-radius on everything
- Token set that could belong to any SaaS
- Abstraction that removes editorial layouts

## Design memory updates

| File | What to write |
| --- | --- |
| `visual-decisions.md` | Token naming, primitives, exceptions |

## Do not code yet

This skill **is** implementation encoding, but only after Phases 1-5 complete. Do not tokenize exploratory directions that failed QA.

Cross-reference: `typography-director`, `motion-choreographer`, `product-ui-art-director`, `frontend-quality.mdc`.
