# Status page observability

## Signals to track

Public render success/failure, cache hit/miss, projection age, projection rebuild, cache invalidation, custom-domain resolution, TLS provisioning/renewal, domain verification, publication success/failure, incident/maintenance projection updates, badge requests, public API requests, private-page auth failures, subscriber-form attempts (once active).

## Label discipline

Use bounded labels. Do not use full custom domains as unbounded metric labels unless normalized and cardinality-controlled. Never include subscriber email or any secret.

## Current wiring

- Application analytics (DataFast) covers the customer-facing product events in `docs/analytics/application-phase-8-events.md`.
- Server actions log unexpected errors via the shared `toActionError` path without leaking SQL or provider objects.
- Snapshot age is captured in `status_page_public_snapshots.generated_at`; the renderer surfaces staleness to visitors and can drive an operator alert.

## Deferred

An error-monitoring vendor and formal alert thresholds are not yet wired (operations phase). The reconciliation job below is the intended home for drift detection.

## Reconciliation (modeled, sweep deferred)

Detect: published page without snapshot, snapshot behind published version, custom domain active without valid TLS, domain mapped to wrong org, component mapped to deleted monitor, resolved incident still shown active, completed maintenance still shown active, missing cache invalidation, powered-by/SEO mismatch, subscriber form active before Phase 9. Requirements when built: dry-run, safe repair, bounded batches, platform-admin only, idempotency, audit, metrics. Never silently rewrite public incident history.
