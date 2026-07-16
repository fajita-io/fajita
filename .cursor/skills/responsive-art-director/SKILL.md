---
name: responsive-art-director
description: >-
  Independently art-direct fajita-io at every breakpoint. Mobile is a composed
  edition, not a squeezed desktop. Screenshot evidence required.
---

# Responsive art director

## Purpose

Art-direct each breakpoint as its own composition. Preserve brand, narrative, and conversion clarity while adapting layout, type, and motion.

> Mobile is not the desktop design squeezed into a narrower tube. It is a deliberately composed edition of the same brand experience.

## When to invoke

- Phase 9 of `DESIGN_WORKFLOW.md`
- After initial desktop implementation
- When mobile looks like "stacked desktop"
- When horizontal overflow or broken wraps appear
- During `visual-qa-critic` for responsiveness scores below 9

## Required inputs

- Approved direction and layout narrative map
- Route list to test
- Running dev server or preview URL
- Screenshot capture method (browser, Playwright, manual)

## Step-by-step workflow

### 1. Set breakpoint matrix

| Breakpoint | Width | Context |
| --- | --- | --- |
| Wide desktop | 1440px+ | Full composition |
| Standard desktop | 1280px | Laptop |
| Laptop | 1024px | Tablet landscape / small laptop |
| Tablet landscape | 1024px | Split view |
| Tablet portrait | 768px | Tablet |
| Large mobile | 430px | iPhone Plus class |
| Standard mobile | 390px | iPhone class |
| Small mobile | 360px | Narrow Android |

### 2. Per breakpoint, reconsider

- Reading order
- Composition and grid
- Hero behavior
- Navigation pattern (menu, drawer, bottom bar)
- Typography scale and wraps
- Image cropping and product demos
- Animation (reduce or simplify if needed)
- Sticky elements
- Decorative assets (hide, swap, or simplify)
- Tables and charts
- Forms and touch targets
- Content density
- CTA placement and dominance
- Signature moment behavior

### 3. Capture screenshot evidence

For each significant route × breakpoint, capture and **inspect** screenshots. Store references in critique log (path or description).

### 4. Fix and recompose

Prioritize:

1. Broken layout / overflow
2. Illegible type or failed CTA
3. Signature moment failure on mobile
4. Composition that reads as afterthought

### 5. Log decisions

Document why mobile hero differs from desktop, not just that it does.

## Required outputs

- **Breakpoint audit** per key route
- **Screenshot evidence** (paths or iteration refs)
- **Recomposition changelog**
- **Outstanding issues** for `critique-log.md`

## Quality gates

- [ ] All required widths tested on all key routes
- [ ] No horizontal overflow at 360px
- [ ] CTAs visible without excessive scroll on mobile
- [ ] Navigation usable one-handed on mobile
- [ ] Signature moment has mobile-specific plan
- [ ] Typography re-wrapped intentionally, not shrunk only
- [ ] Screenshots inspected, not only generated

## Failure conditions

- Single-column stack with no recomposition thought
- Hidden primary CTA on mobile
- Disabled signature moment on mobile without alternative
- Tables that overflow without responsive strategy
- Screenshot generation without visual inspection

## Design memory updates

| File | What to write |
| --- | --- |
| `visual-decisions.md` | Breakpoint-specific composition decisions |
| `critique-log.md` | Issues found, fixes, screenshot refs |

## Do not code yet

Run after substantial pages exist. Phase 4 slice must include mobile pass before full-site build approval.

Cross-reference: `editorial-layout`, `visual-qa-critic`, `frontend-quality.mdc`.
