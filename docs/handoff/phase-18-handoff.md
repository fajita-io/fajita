# Phase 18 handoff

**Date:** 2026-07-17  
**Classification:** **Not Ready**

## What shipped

- Readiness registry: `src/lib/platform/readiness/*`
- Ops UI: `/internal/readiness`, `/internal/readiness/[domain]`, `/internal/launch`
- Docs package under `docs/readiness`, `docs/security/final-*`, `docs/privacy/final-*`, `docs/legal/final-*`, `docs/reliability/*`, `docs/operations/*`, handoff package
- Automation: `scripts/rls-inventory.ts`, `scripts/secret-scan.ts`, `scripts/phase18-export-docs.ts`
- Billing inbox pure helpers + tests: `src/lib/billing/webhook-inbox.ts`

## What did not ship

- Error monitoring vendor
- Counsel approval
- Proven DB restore
- Live price verification
- Live payment / alert / smoke tests
- Billing enforcement enablement

## Go-live

**Not Ready.** Do not enable public paid launch. Stage 0 founder-only verification is allowed for non-customer traffic.

## Commands

```bash
npx tsx scripts/rls-inventory.ts
npx tsx scripts/secret-scan.ts
npx tsx scripts/phase18-export-docs.ts
npm test
npm run typecheck
(cd services/monitor-worker && go test ./internal/destination ./internal/executor)
```

