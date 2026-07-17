# Feature availability

Registry: `src/lib/app/feature-flags.ts`. Server resolution: `src/lib/app/feature-flags.server.ts`. Overrides: `feature_flag_overrides` table.

## Stages

`development`, `internal`, `private_beta`, `public_beta`, `ga`, `disabled`, `deprecated`.

A feature is customer-available only at `public_beta` or `ga` (`isStageAvailable`). Earlier stages are visible only to platform admins as a truthful Planned state, never as a working customer surface.

## Phase 3 state

| Feature | Stage | Customer-visible |
| --- | --- | --- |
| commandPalette | ga | yes |
| notificationCenter | ga | yes |
| globalSearch | ga | yes |
| monitors | development | no (Planned for admins) |
| incidents | development | no |
| statusPages | development | no |
| integrations | development | no |
| billing | development | no |
| affiliates | development | no |
| pamphletSupport | public_beta | yes (Ask Fajita; Pamphlet provider APIs deferred until verified) |

## Resolution

The code registry is the source of truth. `feature_flag_overrides` can enable a flag for a specific organization (private beta) without a deploy. Enforcement is server-side; the client receives only the resolved boolean `FeatureMap`, never the stage machinery. Safe default is off. Flag definitions are typed (`FeatureKey`) with a documented owner/description.

## Relationship to the public claims registry

Availability aligns with `../product/public-claims-registry.md`. If a feature is not GA/public beta, no public or in-app surface may imply it works. Moving a feature to a customer-visible stage is a deliberate registry-aligned change.
