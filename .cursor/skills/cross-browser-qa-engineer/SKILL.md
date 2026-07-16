---
name: cross-browser-qa-engineer
description: >-
  Browser, viewport, input-method, and visual regression testing for Fajita.
  Chromium, Safari, Firefox. No compatibility claims without testing.
---

# Cross-browser QA engineer

## Purpose

Verify the product works across browsers, viewports, input methods, and conditions. Screenshot regression for major routes.

## When to invoke

- Experience Phase G in `DESIGN_WORKFLOW.md`
- Before release (`release-quality-gates.mdc`)
- After layout, form, modal, or animation changes
- When user reports browser-specific bugs

## Inputs

- Route list from `critical-user-journeys.md`
- `interface-state-inventory.md` (states to test)
- `release-scorecard.md`
- Browsers: Chromium, Safari/WebKit, Firefox

## Workflow

### 1. Matrix

| Dimension | Variants |
| --- | --- |
| Browser | Chrome, Safari, Firefox (minimum) |
| Viewport | 360, 390, 768, 1024, 1440 |
| Input | Mouse/keyboard, touch |
| Preferences | Reduced motion, increased text size |
| Theme | Dark and light if both supported |
| Network | Fast, slow 3G spot check |
| Conditions | Offline/interrupted where relevant |

### 2. Test areas

Navigation, menus, modals, forms, auth, checkout, tables, charts, uploads, animations, sticky elements, dvh layouts, virtual keyboard, safe areas, back button, refresh, deep links, copy/paste, focus, scroll restoration.

### 3. Per route

- Happy path
- One error state
- One empty state if applicable
- Mobile primary journey

### 4. Screenshot regression

Capture before/after for major routes. Inspect visually; file in `critique-log.md` or `release-scorecard.md`.

### 5. Log failures

Severity, browser, viewport, reproduction, fix, reverification.

## Required outputs

- Test matrix completed (checklist)
- Failure log with severity
- Screenshot references
- Browser coverage statement (honest: what was/wasn't tested)

## Quality gates

- [ ] Critical journeys pass Chrome + Safari minimum
- [ ] Mobile 360px no overflow
- [ ] Forms usable with virtual keyboard
- [ ] Modals trap focus; escape closes
- [ ] Reduced motion honored
- [ ] No compatibility claim without test evidence

## Failure conditions

- "Works in Chrome" only for release
- Skipping Safari for sticky/modal CSS
- No mobile touch test
- Declaring pass without screenshots

## Memory updates

| File | Content |
| --- | --- |
| `release-scorecard.md` | Browser coverage evidence |
| `critique-log.md` | Defects found |
| `interface-state-inventory.md` | Testing status updates |

## Validation

Re-run failed cases after fix. Update scorecard with evidence links.

Cross-reference: `responsive-art-director`, `layout-perfection-critic`, `visual-qa-critic`.
