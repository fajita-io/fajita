# Evidence manifest

**Date:** 2026-07-17

| Artifact | Location | Result | Limitations |
| --- | --- | --- | --- |
| Scorecard | docs/readiness/final-production-readiness.md | Not Ready | — |
| Blockers | docs/readiness/launch-blocker-register.md | open critical 5 | — |
| Go-live | docs/readiness/go-live-approval.md | rejected | — |
| SSRF tests | monitor-worker Go tests | pass 2026-07-17 | staging fixtures |
| Vitest | npm test | pass (incl. webhook-inbox + readiness) | not full e2e |
| RLS inventory | scripts/rls-inventory.ts | must pass | SQL harness gap LB-010 |
| Secret scan | scripts/secret-scan.ts | must pass | not gitleaks history |
| Restore | docs/reliability/database-restore-exercise.md | partial dump; PITR off | LB-004 |
| Live payment | docs/operations/real-payment-test.md | not run (no Fajita Stripe keys) | LB-006 |
| Public smoke | scripts/public-smoke.ts | passed locally | LB-008 mitigating |
| Sentry | @sentry/nextjs wired | DSN pending in Vercel | LB-001 closed |

