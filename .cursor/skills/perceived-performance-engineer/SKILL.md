---
name: perceived-performance-engineer
description: >-
  Make Fajita feel immediate while improving real performance. Async workflows,
  budgets, loading patterns, and CWV.
---

# Perceived performance engineer

## Purpose

Make the experience feel immediate while improving actual performance. Define how every async workflow communicates progress and failure.

## When to invoke

- Experience Phase E in `DESIGN_WORKFLOW.md`
- Adding data fetching, search, filters, uploads, AI generation, exports
- CWV or INP regressions
- When spinners appear without context

## Inputs

- `performance-budget.md`
- `interaction-decisions.md`
- Route and workflow inventory
- `perceived-performance.mdc`, `pixel-perfect-quality.mdc`

## Workflow

### 1. Audit workflows

Initial load, navigation, search, filter, tables, dashboards, forms, uploads, AI generation, reports, exports, auth, billing, modals, mobile.

### 2. Per async workflow define

| Stage | Behavior |
| --- | --- |
| Immediate response | UI ack < 100ms |
| Loading representation | Skeleton, inline, toast |
| Progress | Determinate or indeterminate |
| Background work | Can user continue? |
| Cancellation | Allowed? |
| Retry | Safe? |
| Failure | Message + preserved state |
| Completion | Confirmation + next step |
| Notification | If background |
| Persistence | Survives refresh? |

### 3. Performance budgets

Update `performance-budget.md` with targets for: JS payload, images, fonts, LCP element, CLS, INP, API latency expectations, AI-operation feedback, animation FPS, mobile constraints.

Record **targets** separately from **measurements**.

### 4. Optimize without harming UX

- Parallelize safe requests
- Prefetch likely routes
- Reserve image dimensions
- Do not lazy-load LCP
- Optimistic UI only when rollback is safe

### 5. Measure

Lighthouse mobile on changed routes. Log in `release-scorecard.md`.

## Required outputs

- Workflow performance spec table
- Updated performance budget (targets)
- Measurement log (after audit)
- Fix list prioritized by user impact

## Quality gates

- [ ] Every async workflow answers 6 questions (`perceived-performance.mdc`)
- [ ] Skeletons match final layout
- [ ] CWV targets in budget doc
- [ ] No serial waterfall without justification
- [ ] Input preserved on failure

## Failure conditions

- Optimizing Lighthouse only by removing content
- Infinite loading without escape
- Layout shift on data load
- Budget doc invents fake measurements

## Memory updates

| File | Content |
| --- | --- |
| `performance-budget.md` | Targets and measurements |
| `interaction-decisions.md` | Loading and progress patterns |

## Validation

Throttle network in DevTools. Test upload, search, AI, navigation. Measure INP on primary buttons.

Cross-reference: `layout-perfection-critic`, `interface-state-director`.
