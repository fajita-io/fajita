# Experience memory

Behavioral, operational, and product-experience decisions for Fajita. Complements `.cursor/design-memory/` (visual/creative). Both systems are required.

## Purpose

Preserve how the product **behaves**, not only how it looks. Agents read these before changing onboarding, navigation, journeys, states, analytics, performance, trust, or release standards.

## Files

| File | Purpose |
| --- | --- |
| `experience-principles.md` | Experience promise and behavioral principles |
| `critical-user-journeys.md` | End-to-end journey specs |
| `interface-state-inventory.md` | State matrix per surface |
| `interaction-decisions.md` | Interaction and feedback log |
| `trust-evidence-register.md` | Claims and verification |
| `performance-budget.md` | Targets vs. measurements |
| `analytics-plan.md` | Events, funnels, privacy |
| `release-scorecard.md` | Ship gates and evidence |

## Rules for agents

1. Read relevant experience-memory files before product/UX work (see `experience-quality.mdc`).
2. Read design-memory for visual decisions (`design-workflow-auto.mdc`).
3. Update after material experience decisions.
4. Do not fabricate product facts; mark `[UNRESOLVED]`.
5. Do not silently overwrite approved behavior; supersede with date and reason.

## Workflow integration

Experience phases A–G in `DESIGN_WORKFLOW.md` run **alongside** creative phases. Experience work does not replace creative direction.

Recommended order:
1. Creative Phases 1–2 (thesis, direction)
2. **Experience Phase A** (journeys) in parallel with Phase 3
3. Creative Phase 4–5 (visual slice)
4. **Experience Phases B–D** (demo, onboarding, states) on vertical slice
5. Creative Phases 6–9 (system, build, responsive)
6. **Experience Phases E–G** (trust, perf, analytics, production review)
7. Phase 11 + release scorecard

## Related

- Rules: `experience-quality.mdc`, `state-completeness.mdc`, `perceived-performance.mdc`, `trust-and-claims.mdc`, `release-quality-gates.mdc`
- Creative: `design-memory/`, `DESIGN_WORKFLOW.md`
