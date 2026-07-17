# Phase 4 privacy and data map

Internal data map for monitoring data. Not for publication. Prepares (not
finalizes) legal language for later counsel review.

## Data collected

| Data | Where | Sensitivity | Notes |
| --- | --- | --- | --- |
| Target URLs | `monitors`, `monitor_versions` | Customer config | Stored normalized; user input retained where needed |
| Request methods/headers (non-secret) | `monitor_versions` snapshot | Customer config | Secret headers referenced by id, not inlined |
| Encrypted secrets | `monitor_secrets` | High | AES-256-GCM; never returned in full; masked labels only |
| Response metadata | `check_results` | Low | Status, sizes, redirect count, final URL |
| Response timing | `check_results` | Low | Explicit `_ms` fields |
| Diagnostic snippets | `check_results` | Low/medium | Bounded and sanitized; full bodies never stored |
| TLS certificate metadata | `check_results` | Low | Issuer, validity, fingerprint |
| IP resolution data | logs/events | Low | For SSRF classification |
| Worker logs | telemetry sink | Low | Redacted; no secrets or full sensitive URLs |
| Security events | `monitor_security_events` | Low | Safe summaries only |
| Heartbeat tokens | `heartbeat_tokens` | High | SHA-256 hashes only |
| Heartbeat events | `heartbeat_events` | Low | Bounded metadata |

## Access

- Customers: read-only, own organization, via RLS (see
  `docs/database/phase-4-rls.md`). No access to secrets, tokens, worker, or lease
  tables.
- Worker: `EXECUTE`-only on `app.*` functions.
- Platform admins: internal worker view and security events, no secret values.

## Retention (initial)

- High-resolution check results: short window, then future aggregation
  (Phase 6+). Do not delete results needed for active incident evaluation once
  Phase 6 exists.
- Test execution records and worker heartbeats: short window.
- Audit and security events: per operational and abuse-investigation needs.
- Monitor configuration versions: retained while the account exists, subject to
  deletion policy.

Scheduled pruning/aggregation is a documented worker task for a later phase;
raw-result design already supports efficient aggregation.

## Export and deletion

Monitoring data participates in the existing account export and deletion flows
(Phase 3). Deleting an organization removes its monitoring rows; secrets are
destroyed with their rows.

## Regional processing and subprocessors

Region identity is stored per result. Subprocessors: Supabase (database), the
approved container platform (worker), the approved telemetry provider, DataFast
(non-PII analytics). Record specifics at deployment in
`docs/handoff/monitor-worker-transfer.md`.

## Draft legal themes (not counsel-reviewed)

Authorization to monitor submitted destinations; prohibition on unauthorized
scanning; customer responsibility for endpoints; monitoring limitations; false
positives and negatives; alert limitations; data retention; secret handling;
abuse suspension. These are drafts, not reviewed by outside counsel.
