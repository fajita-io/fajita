---
name: motion-choreographer
description: >-
  Motion design direction for fajita-io. Defines easing, duration, entrances,
  and signature motion. Motion must explain hierarchy, causality, or state.
  Accessible and performant.
---

# Motion choreographer

## Purpose

Define a motion language that explains hierarchy, causality, state, progression, spatial relationships, or brand personality. Delete motion that does none of these.

> Motion must explain hierarchy, causality, state, progression, spatial relationships, or brand personality. Delete motion that does none of these.

## When to invoke

- After approved direction exists
- Phase 4 visual slice or product UI with state changes
- Before adding animation libraries
- When pages feel static or over-animated
- During QA for motion scores below 9

## Required inputs

- Approved direction and brand-world motion personality
- Interaction inventory (nav, modals, lists, charts, page transitions)
- Performance budget
- `prefers-reduced-motion` requirements

## Step-by-step workflow

### 1. Establish motion principles

Name 3-5 principles (e.g., "quick confirm," "slow reveal for proof," "nothing moves without cause").

### 2. Define tokens

| Token | Specification |
| --- | --- |
| Easing families | Names, curves, when to use |
| Duration ranges | Instant, fast, medium, slow with ms bounds |
| Stagger rules | When allowed, max delay |
| Distance | Default translate distances |

### 3. Choreograph behaviors

Define for each:

- Page transitions
- Section entrances and exits
- Hover and press
- Navigation movement
- Scroll response (restrained)
- Cursor response (if any)
- Drag behavior
- Loading animation
- Data and chart transitions
- Notifications
- Modals and menus
- **What must remain still**

### 4. Signature motion

One recurring motion behavior tied to brand (e.g., status-state transition, alert propagation, recovery cooling per `fajita-master-directive.mdc`). Must have reduced-motion alternative.

### 5. Reduced motion

For every non-essential animation, document the `prefers-reduced-motion` fallback (instant state change, opacity only, or off).

### 6. Prevent abuse

Do not:

- Animate every element
- Stagger every section
- Use excessive scroll hijacking
- Add slow decorative transitions
- Use parallax that reduces readability
- Add cursor effects that interfere with interaction
- Import animation frameworks without need

## Required outputs

- **Motion spec** (principles, tokens, behavior table)
- **Signature motion definition** with reduced-motion alt
- **Stillness map** (what never animates)
- **Library decision** (CSS only, View Transitions, or justified dependency)

## Quality gates

- [ ] Every animation maps to hierarchy, causality, state, or personality
- [ ] Durations feel snappy on interaction, deliberate on narrative
- [ ] Reduced-motion alternatives defined
- [ ] No scroll hijacking on primary conversion paths
- [ ] Performance: transform/opacity preferred
- [ ] Signature motion is ownable, not generic fade-up

## Failure conditions

- Decorative motion on every section
- 800ms+ transitions on routine UI
- Motion without state change
- Missing reduced-motion support
- Adding Framer Motion / GSAP without justification

## Design memory updates

| File | What to write |
| --- | --- |
| `approved-direction.md` | Motion language section |
| `visual-decisions.md` | Tokens, signature behavior, library choice |

## Do not code yet

Define motion during Phase 4 slice. Encode tokens in Phase 6 `design-system-engineer`. Do not animate full site before slice approval.

Cross-reference: `signature-moment-designer`, `million-dollar-motion` (user skill if available), `frontend-quality.mdc`.
