---
name: editorial-layout
description: >-
  Layout art direction for fajita-io marketing and narrative surfaces.
  Editorial grids, asymmetric composition, pacing, and responsive
  recomposition. Not card-stack templates.
---

# Editorial layout

## Purpose

Art-direct layouts as editorial compositions that guide attention and tell a story. Reject the default SaaS section stack.

## When to invoke

- Designing or revising marketing pages, landing flows, launch pages
- Phase 4 layout exploration in `DESIGN_WORKFLOW.md`
- When a page reads as "headline, cards, testimonials, pricing"
- Responsive passes that need recomposition, not stacking

## Required inputs

- Approved direction and creative thesis
- Page goal and dominant CTA (from `conversion-experience-designer`)
- Content inventory (real or realistic)
- Breakpoint requirements from `frontend-quality.mdc`

## Step-by-step workflow

### 1. Define narrative arc

Every significant marketing page needs:

1. **Decisive visual opening** (not a centered headline in a void)
2. **Clear change in rhythm** (density, scale, or viewpoint shift)
3. **Memorable midpoint** (proof, demo, or editorial beat)
4. **Strong final act** (CTA, pricing, or commitment moment)

### 2. Choose layout vocabulary

Apply as needed:

- Editorial grids (asymmetric columns, hang lines)
- Intentional whitespace and quiet moments
- Controlled overlap and depth
- Scale contrast between elements
- Cropping and framing for images and product
- Visual tension (pairing opposites deliberately)
- Full-bleed vs. inset moments
- Dense vs. sparse sections alternating
- Modular and non-modular sections mixed
- Repeated motifs and anchor elements
- Section transitions (hard cut, fade, shared anchor)

### 3. Compose desktop first, then recompose

For each section, sketch:

- Focal point
- Reading order
- What breaks the grid and why
- What stays quiet

**Prevent this default stack:**

```text
headline
paragraph
button
three cards
image
testimonials
pricing
footer
```

### 4. Mobile recomposition

Mobile is not desktop squeezed narrow. For each section at 390px and 360px:

- Reorder for story, not DOM order
- Resize type for wraps, not shrink-only
- Crop or swap images
- Simplify overlap if clarity suffers
- Preserve signature moment

### 5. Document layout decisions

Log grid choices, motif repeats, and pacing map.

## Required outputs

- **Page narrative map** (section sequence with rhythm notes)
- **Composition notes** per major section (desktop + mobile)
- **Anchor and motif list**
- **Responsive recomposition notes**

## Quality gates

- [ ] Four-act narrative present on major pages
- [ ] At least one asymmetry or tension device per page
- [ ] No three-column feature-card default section
- [ ] Mobile layouts recomposed, not only stacked
- [ ] CTA visibility preserved through composition
- [ ] AI-Slop Test composition items pass

## Failure conditions

- Every section centered with identical width
- Card grid as primary layout vocabulary
- No rhythm change between sections
- Mobile = smaller desktop with no recomposition

## Design memory updates

| File | What to write |
| --- | --- |
| `visual-decisions.md` | Grid, pacing, motif, and section composition decisions |

## Do not code yet

In Phase 4, prototype only: navigation, homepage hero, one content section, one product surface, signature moment. Do not build the full site until the slice passes `visual-qa-critic`.

Cross-reference: `responsive-art-director`, `conversion-experience-designer`, `signature-moment-designer`.
