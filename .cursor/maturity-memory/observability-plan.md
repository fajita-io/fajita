# Observability plan

How Fajita's important behavior is made diagnosable, recoverable, and safe to release. Governed by `operations-and-observability.mdc`. Update via `operations-and-observability-architect`.

**Distinguish proposed targets from implemented behavior.** Almost everything here is proposed; only the noted items exist today.

---

## Critical operations

| Operation | Exists today | Notes |
| --- | --- | --- |
| Stripe webhook processing | Yes (signature verified) | No idempotency/persistence/retry yet (gap) |
| DataFast analytics + bot tracking | Yes | Product analytics, not error monitoring |
| Monitor checks (core product) | No | `[UNRESOLVED]` runner/schedule |
| Alert delivery | No | `[UNRESOLVED]` channels |
| Scheduled/cron tasks | No | `[UNRESOLVED]` |
| Email delivery | No | No provider wired |
| Imports / exports | No | `[UNRESOLVED]` |
| AI operations | No | `ANTHROPIC_API_KEY` present, unused |

## Logging policy

Structured logs. Capture where appropriate: timestamp, environment, service, operation, request/trace ID, privacy-conscious user ID (opaque), workspace ID, job ID, provider, error category, retry count, duration, outcome.

Never log: passwords, full access tokens, secret keys, private signing secrets, full payment details, sensitive uploaded content, raw private prompts (without an explicit safe policy), unnecessary PII (including email addresses).

**Status:** policy defined; no centralized logging pipeline configured yet.

## Error-monitoring policy

Proposed: one managed error monitor for server and client exceptions with environment separation and PII scrubbing. **Vendor `[UNRESOLVED]`.** Not implemented.

## Performance-monitoring policy

Proposed where appropriate (Core Web Vitals on public pages per `pixel-perfect-quality.mdc`; server timing on critical routes). Vendor/targets `[UNRESOLVED]`.

## Metrics

Proposed minimal set tied to real alerts: webhook failure rate, job failure rate, alert-delivery latency, check backlog. Track only signals someone will act on. `[UNRESOLVED]`.

## Alert thresholds

`[UNRESOLVED]`. Define per operation once operations exist. Each alert needs a threshold and an owner.

## Alert ownership

`[UNRESOLVED]` (no on-call rotation defined). Assign an owner per alert before enabling it.

## Environment separation

Dev, preview (Vercel), and production must not share keys or state. Use provider environment scoping. Supabase project ref is fixed (`supabase-migrations.mdc`); ensure non-prod does not write prod data. **Status: to verify.**

## Sensitive-data restrictions

Support-facing and status-facing views expose no secrets, no other tenants' data, no stack traces, and no internal infrastructure detail.

## Support diagnostics

Proposed: a redacted, ownership-scoped view for support to see a user's recent operational events. `[UNRESOLVED]`.

## Health checks

`[UNRESOLVED]`. Proposed: a liveness endpoint and dependency checks (DB, Stripe, provider reachability) once background systems exist.

## Feature flags

`[UNRESOLVED]`. Proposed for risky rollouts (new billing logic, alert delivery). Prefer a simple managed or config-driven flag before adding a vendor.

## Release monitoring

Proposed: watch error and job-failure rates after each deploy; define a rollback trigger. Rollback via Vercel deploy promotion/rollback. `[UNRESOLVED]` thresholds.

## Status-page behavior

Public status pages are a Fajita product feature and must be accurate (no fabricated uptime). Internal service status (Fajita's own availability) is separate and `[UNRESOLVED]`.

## Status

Installation baseline recorded 2026-07-16. Only Stripe webhook verification and DataFast analytics exist. Resolve monitoring vendor, alerts, ownership, and health checks via `operations-and-observability-architect` at Gate 5.
