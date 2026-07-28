# Final production readiness

**Date:** 2026-07-27  
**Environment:** production (`https://fajita.io`)  
**Owner:** founder / engineering / operations  
**Classification:** **Conditionally Ready**

## Principle

> Production readiness is an evidence-backed decision, not a feeling.

## Summary

- Total gates: 32
- Status counts: {"passed":24,"passed_with_condition":7,"not_started":0,"failed":0,"in_progress":1}
- Critical gates still blocking: 0 (Sentry DSN deployment is passed_with_condition, not blocking Stage 0)
- Open critical blockers: 0
- Open high blockers: 0
- Launch stage approved: `Stage 0 / soft launch`

## Evidence completed 2026-07-27

| Area | Evidence |
| --- | --- |
| Self-monitoring | Seed run; `FAJITA_SERVICE_STATUS_SLUG=platform`; `/status` live |
| Public smoke | `npm run smoke:public` 57/57 on fajita.io |
| Authenticated smoke | `npm run smoke:authenticated` 15/16 (Sentry DSN pending) |
| Monitor execution | Vercel cron `/api/cron/monitor-tick`; checks updating |
| Billing | Prices verified; API + Checkout UI fixtures; enforcement on |
| Alerts | `npm run launch:alert-fixture` |
| DB restore | `npm run launch:restore-evidence` |
| Billing RLS | `supabase/tests/phase10_billing_rls.sql` |
| Legal | In force at `/legal/*` (administrative approval) |

## Remaining condition

| Item | Action |
| --- | --- |
| Sentry DSN | Run `npm run wire:sentry` after creating Sentry project; redeploy; hit sentry-probe |
| PITR | Disabled on current Supabase plan; enable Pro PITR when customer volume warrants |
| Browser E2E smoke | Optional before Stage 2 public signup (`production-smoke-test.md`) |

## Decision

- Classification: **Conditionally Ready** for Stage 0 soft launch and founder verification traffic.
- Do not claim full Stage 2 paid public launch until Sentry DSN is live and browser login smoke is recorded.
- No unsupported SOC 2, penetration-test, or uptime guarantee claims.

## Evidence package

See `docs/handoff/phase-18-handoff.md`, `docs/operations/production-smoke-test.md`, and domain reviews under `docs/security/`, `docs/reliability/`, `docs/operations/`.
