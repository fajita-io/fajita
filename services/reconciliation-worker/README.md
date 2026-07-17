# Reconciliation worker (Phase 17)

Cross-domain reconciliation is invoked from the platform ops UI (dry-run first)
and from existing domain workers (billing, lifecycle, affiliates, support).

This service directory documents the operational entry points. Domain-specific
reconcile functions remain in:

- `src/lib/billing/` (Stripe vs Fajita)
- `src/lib/lifecycle/reconciliation.ts`
- `src/lib/affiliates/reconciliation.ts`
- `src/lib/support/` (support reconciliation runs)
- `src/lib/platform/` (platform_reconciliation_runs ledger)

Do not add a second ledger. Record runs in `platform_reconciliation_runs`.
