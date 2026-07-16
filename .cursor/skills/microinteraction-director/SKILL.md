---
name: microinteraction-director
description: >-
  Small interaction details for Fajita: hover, press, save, filter, undo, upload.
  Responsive, expensive feel with restraint.
---

# Microinteraction director

## Purpose

Art-direct small interactions that make the product feel responsive and considered. Each must communicate affordance, state, causality, progress, completion, error prevention, spatial relationship, or brand personality.

## When to invoke

- Experience Phase D in `DESIGN_WORKFLOW.md`
- When implementing interactive controls
- When product feels static or inconsistent
- After `interface-state-director` defines states

## Inputs

- `interaction-decisions.md`
- `approved-direction.md` motion language
- Component inventory (buttons, forms, tables, menus)
- `motion-choreographer` motion tokens

## Workflow

### 1. Audit control families

Cover as applicable: hover, press, focus, selection, drag/drop, reorder, save/autosave, copy, share, filter, search, expand/collapse, view switch, menus, overlays, confirm, undo, upload, process, complete, fail.

### 2. Per microinteraction define

| Field | Spec |
| --- | --- |
| Trigger | User action |
| Immediate feedback | < 100ms perceived |
| Duration | ms range |
| Easing | From motion tokens |
| State change | What updates |
| Failure | Rollback or message |
| Mobile | Touch equivalent |
| Reduced motion | Fallback |
| Consistency | Matches sibling controls |

### 3. Restraint rules

- Do not animate for demonstration alone
- Same control types behave the same everywhere
- Delete motion that communicates nothing (`motion-choreographer`)

### 4. High-value patterns for SaaS

Prioritize: save/saved, optimistic safe updates, filter feedback, destructive confirm, undo, upload progress, search debounce feedback.

### 5. Document and implement

Log decisions before coding. Implement with CSS or minimal JS.

## Required outputs

- Microinteraction spec table per control family
- Consistency map (which components share behavior)
- Reduced-motion fallbacks
- Implementation notes

## Quality gates

- [ ] Every primary action has immediate feedback
- [ ] Save/autosave states visible where applicable
- [ ] Destructive actions have confirm + optional undo
- [ ] Focus visible on keyboard nav
- [ ] Consistent across app shell

## Failure conditions

- Inconsistent button press across pages
- Hover-only critical feedback
- Animation without state change
- Missing reduced-motion

## Memory updates

| File | Content |
| --- | --- |
| `interaction-decisions.md` | Per-interaction decision log |
| `visual-decisions.md` | If motion affects brand signature |

## Validation

Keyboard and touch test on 390px. Tab through forms. Trigger save, error, undo paths.

Cross-reference: `perceived-performance-engineer`, `motion-choreographer`, `interaction-polish` (user skill).
