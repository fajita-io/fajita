# Onboarding versioning

Phase 11. How onboarding definitions evolve without corrupting progress.

## Model

- `CURRENT_ONBOARDING_VERSION` (`src/lib/onboarding/definitions.ts`) is 2.
  Version 1 was the Phase 3 wizard (use-case survey with locked steps);
  version 2 is the activation checklist derived from real product state.
- Step definitions are a typed TypeScript registry, reviewed in code. The
  database stores adoption: every row in `organization_onboarding_steps` and
  `onboarding_events` carries the `version` it was recorded under.
- Definitions include key, kind (core or optional), order, title,
  description, destination route, and required permission.

## Publishing a new version

1. Add the new step array (for example `ONBOARDING_V3_STEPS`) and bump
   `CURRENT_ONBOARDING_VERSION`.
2. Existing step rows keep their old version value. Nothing rewrites or
   deletes them, so historical analytics stay accurate.
3. Milestone timestamps on `organization_onboarding` are version-independent
   (activation is a product fact, not a flow fact), so organizations mid-way
   through an old version keep their progress.
4. `getOnboardingState` reads steps for the current version; completed
   milestones satisfy the new version's core steps automatically because
   completion is derived from product state, not from old step rows.
5. If a new version adds a step that maps to an existing product fact,
   reconciliation backfills it with `source = 'reconciliation'`.

## Rules

- Never overwrite prior completion timestamps.
- Never delete rows from `onboarding_events`.
- Version adoption is visible in `/internal/lifecycle` (step rows by
  version).
- Analytics must segment funnels by version (`onboarding_events.version`).
