# Controlled scale architecture

Phase 20 operating layer for retained-revenue growth. Extends Phase 17 command center and Phase 18 readiness. Does not duplicate affiliate ledger, billing ledger, or lifecycle systems.

## Packages

- `src/lib/scale/`: readiness, stages, metrics, channels, campaigns, referrals, capacity, hiring, forecast
- `supabase/migrations/20260801000000_phase20_controlled_scale.sql`: registries
- `/internal/scale/*`: operator UI
- `/internal/scale-lab`: fixtures only
- `/app/referrals`: customer referral foundation
- `/r/[code]`: customer referral redirect (distinct from `/api/ref` affiliate)

## Authority

- Scale gate fails closed when Phase 18 is Not Ready or Phase 19 stabilization is inactive
- Stage 0 is the default
- Campaign launch requires approval + capacity + support + claims reviews
