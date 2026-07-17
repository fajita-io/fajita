# Post-launch operations architecture

**Status:** Gate only (Phase 19 blocked)  
**Date:** 2026-07-17

## Purpose

Phase 19 turns live usage into disciplined product decisions. Implementation of registries, experiments, and analytics **must not** start while Phase 18 is Not Ready.

This document describes the **prerequisite and guard layer** that enforces that rule.

## Source of truth

| Concern | Module |
| --- | --- |
| Phase 18 classification | `src/lib/platform/readiness/classification.ts` |
| Launch blockers | `src/lib/platform/readiness/blockers.ts` |
| Phase 19 prerequisites | `src/lib/platform/post-launch/prerequisites.ts` |
| Stabilization window | `src/lib/platform/post-launch/stabilization.ts` |
| Action guards | `src/lib/platform/post-launch/guards.ts` |
| Route inventory | `src/lib/platform/post-launch/routes.ts` |

## Authorization model

```text
Phase 18 Not Ready            → Phase 19 Blocked
Phase 18 Conditionally Ready  → Phase 19 Conditionally Authorized (high fails may remain)
Phase 18 Ready + critical prereqs pass → Phase 19 Authorized
```

Critical prerequisite failures always force **Blocked**, even if classification later flips without closing linked blockers.

## Stabilization phases

| Phase | Experiments | Traffic expansion | Change freeze |
| --- | --- | --- | --- |
| `pre_launch` | no | no | yes |
| `intensive_72h` | no | no | yes |
| `launch_14d` | no | no | prefer defects only |
| `controlled_30d` | prepare only | limited if fully authorized | baselines + interviews |
| `normal` | yes (with registry) | yes if authorized | normal governance |

Clock starts only when authorized **and** a launch start date exists.

## Guarded actions

Server code that would start experiments, change onboarding/pricing, expand features for growth, or increase traffic must call `evaluateGuardedAction` or `assertPhase19GrowthAllowed`.

While blocked, all of those return `allowed: false`.

## What must not be duplicated

Phase 19 builds on Phase 17 ops truth. Do not create a second:

- Revenue dashboard
- Customer 360
- Support ops
- Content ops
- Affiliate ops
- Security ops
- Audit log
- Feature-flag system
- Approval system
- Analytics product (DataFast remains the product analytics layer)
- Billing system
- Lifecycle email system

## Deferred architecture (after authorization)

Documented for acquisition readiness, not implemented while blocked:

- Feedback / bug / request registries (Postgres + RLS)
- Experiment assignment service (deterministic, server-side)
- Exposure and guardrail jobs (isolated from monitor workers)
- Research consent and redacted exports
- Read models for activation, retention, churn, growth quality
- Weekly / monthly review generators
- Public changelog (customer-facing) with editorial review

## Security

Post-launch routes live under `/internal`, inherit ops layout auth (`allowInternalPage`), and set `robots: noindex`. Research and experiment data, when later added, require platform permissions, audit, and step-up for high-risk actions.

## Related

- `docs/application/post-launch-command-center.md`
- `docs/handoff/phase-19-handoff.md`
- `docs/handoff/phase-18-handoff.md`
- `docs/readiness/go-live-approval.md`
