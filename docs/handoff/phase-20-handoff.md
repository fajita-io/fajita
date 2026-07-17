# Phase 20 handoff: Controlled scale

**Date:** 2026-07-17  
**Scale authorization:** **BLOCKED**  
**Current scale stage:** **Stage 0 (Baseline operations)**

## Prerequisite gate

| Prerequisite | Result | Link |
| --- | --- | --- |
| Phase 18 Ready or Conditionally Ready | **Not Ready** | `/internal/readiness`, `docs/handoff/phase-18-handoff.md` |
| Phase 19 stabilization active | **Blocked / inactive** (Phase 19 gate shipped; growth not authorized) | `/internal/post-launch`, `docs/handoff/phase-19-handoff.md`, SB-002 |
| Critical security/billing/monitoring blockers | Open (inherited from Phase 18) | `/internal/readiness` |
| Live activation/retention baselines | Unavailable | `/internal/product/activation` |
| Support capacity for traffic increase | Not cleared | Stage 0 only |

**Do not intentionally increase paid, affiliate, partner, referral, or high-volume organic traffic.**

## What shipped

### Governance

- Scale readiness gate (`src/lib/scale/readiness.ts`) with states: not eligible, stabilizing, eligible limited/channel/accelerated, paused, restricted
- Scale stages 0–4 (`src/lib/scale/stages.ts`) with entry criteria, caps, stop conditions
- Scale command center `/internal/scale/overview`
- Decision/risk/review surfaces under `/internal/scale/*`
- Permissions: `scale.*` (marketing operators do not get `scale.capacity.manage`)
- Lifetime deal default: **No lifetime deal**

### Economics

- Retained revenue model (`retained-mrr-v1`)
- Activated CAC / retained CAC / payback estimates
- Channel scorecards (fixture education until live cohorts)
- Forecast scenarios: conservative, base, accelerated with assumption registry

### Distribution

- Channel inventory and stop conditions
- Campaign registry + URL builder allowlist
- Marketplace listing registry
- Content compounding tiers
- Affiliate scale view (Phase 12 ledger remains authoritative)
- Customer referrals: `/app/referrals`, `/r/[code]`, distinct from `/api/ref`
- Partner registry, agency boundaries, native integration gate
- Public integration directory detail routes `/integrations/[slug]`
- Founder content queue (no automated posting)

### Capacity and hiring

- Worker/DB/support thresholds and scale stop controls
- Provider capacity inventory
- Hiring triggers + role scorecards (none satisfied; budgets missing)

### QA assets

- `/internal/scale-lab` fixtures
- Unit tests: `src/lib/scale/scale.test.ts`, permissions coverage
- Docs under `docs/engineering`, `docs/application`, `docs/growth`, `docs/operations`, `docs/finance`, `docs/security`, `docs/privacy`, `docs/legal`, `docs/analytics`, `docs/observability`, `docs/performance`, `docs/testing`, `docs/handoff`

### Data

- Migration `20260801000000_phase20_controlled_scale.sql` applied to fajita-io (`olvnjsqspvywvwfchtuc`)
- Stage 0 seed row active

## What did not ship / known limitations

- Phase 19 product stabilization system (explicit blocker)
- Live retained CAC evidence (no production cohorts)
- Paid acquisition go-live
- Partner launches
- Referral prompt ramp
- Background worker processes for scale jobs (registry only; calculations not yet scheduled in a worker binary)
- Staging campaign launch/stop e2e against live providers
- Load-test results (documented as pending)

## Confirmations

1. No campaign scaled without activation and retention measurement (gate blocks launches).
2. No second affiliate/referral commission ledger; Phase 12 remains authoritative for commissions.
3. No partner unauthorized customer access paths.
4. No invasive tracking, fake social proof, fake scarcity, deceptive pricing, spam outreach, paid backlinks, autonomous advertising/posting/hiring, or Accomplish portfolio administration.

## Next 30 days (approved actions)

1. Keep Stage 0. Existing organic + existing affiliate only.
2. Clear Phase 18 critical blockers toward Ready / Conditionally Ready.
3. Establish Phase 19 stabilization (activation, retention, support, cost-to-serve baselines).
4. Do **not** enable paid search, paid social, partner launches, or referral acceleration.
5. Re-evaluate scale gate weekly after Phase 18/19 progress.

## Stop conditions (active)

- Phase 18 Not Ready
- Phase 19 inactive
- Critical production incident
- Billing/entitlement reconciliation unclean
- Monitoring/alert/status degradation
- Support capacity unsafe
- Any attempt to advance stage without approval

## Commands

```bash
npm test -- src/lib/scale/scale.test.ts src/lib/platform/permissions.test.ts
npm run typecheck
./scripts/supabase-push.sh
```
