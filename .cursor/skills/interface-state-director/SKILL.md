---
name: interface-state-director
description: >-
  Inventory and design all realistic interface states for Fajita surfaces.
  Empty, loading, error, restricted, and edge states before feature complete.
---

# Interface state director

## Purpose

Inventory and implement every realistic interface state so users always understand what is happening.

## When to invoke

- Experience Phase D in `DESIGN_WORKFLOW.md`
- Before marking any feature complete
- When adding pages, data surfaces, or workflows
- After `state-completeness.mdc` audit fails

## Inputs

- Feature or route scope
- `interface-state-inventory.md`
- Data and permission dependencies
- `voice-and-boundaries.mdc` for copy
- Brand direction for visual treatment

## Workflow

### 1. Identify surfaces

List each major route, feature, component group.

### 2. Enumerate states

Per `state-completeness.mdc`: default, empty, loading, success, error, restricted, sparse, dense, offline, etc. Mark which apply.

### 3. Prioritize

Implement P0 states first: empty, loading, error, success, restricted.

### 4. Per state define

- State-specific copy (specific, calm, actionable)
- Visual treatment (skeleton, illustration, message)
- Available actions
- Recovery behavior
- Analytics event if meaningful

### 5. Empty states

Must explain, motivate, create first item, demonstrate outcome, import, example, or redirect.

### 6. Error states

What happened, what preserved, what to do, retry safety, help path.

### 7. Implement and test

Update inventory status. Test mobile and reduced-motion.

## Required outputs

- State matrix for scope (route × states)
- Copy for each state
- Implementation checklist
- Updated inventory with Implementation/Testing status

## Quality gates

- [ ] No surface ships with only happy path
- [ ] Empty states actionable
- [ ] Errors preserve input
- [ ] Loading skeletons match layout
- [ ] Restricted states explain upgrade without hiding intent

## Failure conditions

- Blank empty state
- Infinite spinner
- Generic error only
- State inventory not updated

## Memory updates

| File | Content |
| --- | --- |
| `interface-state-inventory.md` | Matrix rows and status |
| `interaction-decisions.md` | State transition behaviors |

## Validation

Force each state in dev (empty DB, slow network, 403, validation fail). Screenshot and verify copy.

Cross-reference: `microinteraction-director`, `cross-browser-qa-engineer`, `empty-error-edge` (user skill if available).
