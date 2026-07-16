---
name: maintainability-critic
description: >-
  Fresh-context architecture review for Fajita. Duplication, boundaries, perf,
  a11y, security UI. Preserve intentional art direction.
---

# Maintainability critic

## Purpose

Fresh-context review of implementation quality. Remove accidental duplication without erasing intentional art direction.

> Reusability should remove accidental duplication, not erase intentional art direction.

## When to invoke

- Experience Phase G in `DESIGN_WORKFLOW.md`
- Before release or large PR
- After rapid feature implementation
- Implementing agent should not be sole approver

## Inputs

- Git diff or scope files
- `release-scorecard.md`
- `approved-direction.md` (signature compositions to preserve)
- `visual-decisions.md` (documented exceptions)

## Workflow

### 1. Inspect

Duplicated components/styling, oversized components, unclear boundaries, prop complexity, unnecessary client components, unnecessary state, fragile effects, race conditions, inconsistent error/loading, a11y regressions, framework anti-patterns, bad abstractions, missing tests, dead code, unused deps, animation lib bloat, hardcoded demo in production paths, hidden coupling, perf regressions, security UI mistakes, leaked env vars.

### 2. Classify findings

| Severity | Criteria |
| --- | --- |
| Critical | Security, data leak, broken journey |
| High | Duplication causing drift, race, a11y block |
| Medium | Maintainability, missing tests |
| Low | Style, minor cleanup |

### 3. Preserve intentional uniqueness

Do not flatten signature hero, editorial layouts, or art-directed exceptions into generic components without documenting in `visual-decisions.md`.

### 4. Recommend fixes

Per finding: correction, files affected, regression risk, verification steps. Defer debt only with rationale.

### 5. Verify

Typecheck, lint, tests, spot browser check after fixes.

## Required outputs

- Severity-ranked findings list
- Recommended corrections
- Files affected
- Regression risks
- Verification steps
- Deferred debt with rationale

## Quality gates

- [ ] No critical/high findings open for release
- [ ] No client-exposed secrets
- [ ] Demo data separated from production paths
- [ ] Intentional design exceptions documented
- [ ] Independent reviewer (fresh context) when possible

## Failure conditions

- Refactor that removes approved art direction
- Approving own work without checklist
- Ignoring duplicated loading/error patterns
- Leaked `process.env` in client bundle

## Memory updates

| File | Content |
| --- | --- |
| `release-scorecard.md` | Maintainability category |
| `visual-decisions.md` | If refactor affects documented exceptions |

## Validation

Run `pnpm build` / `npm run build`, lint, grep client bundles for secret patterns. Re-run affected journeys.

Cross-reference: `release-quality-gates.mdc`, `design-system-engineer`, `layout-perfection-critic`.
