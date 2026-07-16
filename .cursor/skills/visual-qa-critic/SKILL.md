---
name: visual-qa-critic
description: >-
  Screenshot-based visual critique and iteration for fajita-io. Scores pages
  1-10 across twelve criteria. Scores below 9 require another pass. Fresh-eye
  review.
---

# Visual QA critic

## Purpose

Operate as a ruthless screenshot-based reviewer. Compare rendered output against the creative thesis and approved direction. Iterate until quality gates are met.

Prefer fresh-context review when possible rather than relying entirely on the implementing agent's self-evaluation.

## When to invoke

- Phase 5 visual slice review
- Phase 10 final visual QA
- After any major design implementation
- Before PR or launch
- When AI-Slop Test is suspected to fail

## Required inputs

- `creative-thesis.md`
- `approved-direction.md`
- `rejected-patterns.md`
- `visual-decisions.md`
- Running application (dev or preview)
- Route list
- Screenshot capture at all breakpoints in `frontend-quality.mdc`

## Step-by-step workflow

### 1. Load context

Read all design-memory files. Note approved direction status. If not approved, fail fast and invoke `creative-director`.

### 2. Run and visit

Start the project. Visit every significant route (marketing, app, auth, settings, empty states).

### 3. Capture screenshots

Widths: 1440, 1280, 1024, 768, 430, 390, 360.

Include: default, hover/focus samples, loading/empty/error if present.

### 4. Inspect visually

Open screenshots and inspect. Do not only generate files.

### 5. Score each page

Rate 1-10:

| Criterion | Question |
| --- | --- |
| Originality | Ownable or generic? |
| Brand coherence | Same world as thesis? |
| Composition | Composed or assembled? |
| Typography | Character and rhythm? |
| Hierarchy | Clear reading order? |
| Product clarity | Understandable quickly? |
| Interaction | States and feedback clear? |
| Motion | Purposeful or decorative? |
| Responsiveness | Recomposed or stacked? |
| Accessibility | Contrast, focus, touch? |
| Conversion clarity | Obvious next step? |
| Production polish | Shipped or draft? |

**Any score below 9 triggers another improvement pass** unless a technical limitation is documented in `critique-log.md`.

### 6. Identify issues

Look for:

- Generic sections, template residue, repetitive cards
- Weak headline wrapping, inconsistent spacing
- Accidental alignment, broken rhythm
- Missing responsive decisions, dead space, overcrowding
- Low contrast, inaccessible interactions
- Weak CTAs, over/under-animation
- Unclear product screenshots, placeholder content
- Broken assets, horizontal overflow
- Inconsistent radii or icons
- Unresolved loading/empty states
- Generic mobile stacking
- AI-generated feel

### 7. Fix highest impact first

Prioritize: comprehension, conversion, broken layout, brand-breaking genericity.

### 8. Re-capture and repeat

Loop until scores meet gate or documented limitation.

### 9. Log each round

Record in `critique-log.md` per entry:

- Date or iteration number
- Route
- Breakpoint
- Problem
- Severity
- Fix
- Status
- Remaining concern

## Required outputs

- **Score tables** per route
- **Critique log entries** with screenshot references
- **Fix list** with status
- **Ship recommendation** (pass / pass with documented exceptions / fail)

## Quality gates

- [ ] All significant routes reviewed at all breakpoints
- [ ] Screenshots visually inspected
- [ ] All scores ≥ 9 or exceptions documented
- [ ] AI-Slop Test passed on key pages
- [ ] `critique-log.md` updated
- [ ] No placeholder content on customer-facing routes

## Failure conditions

- Self-approval without screenshots
- Scores below 9 ignored
- Empty critique log after review
- Approving with known generic sections unaddressed

## Design memory updates

| File | What to write |
| --- | --- |
| `critique-log.md` | Full iteration entries and score tables |
| `visual-decisions.md` | Fixes that establish new precedents |
| `rejected-patterns.md` | Patterns found in implementation to ban |

## Do not prematurely pass

A passing code review is not a passing visual QA. Run this skill after implementation, not instead of it.

Cross-reference: `responsive-art-director`, `anti-ai-slop.mdc`, `frontend-quality.mdc`, `DESIGN_WORKFLOW.md` Phases 5 and 10.
