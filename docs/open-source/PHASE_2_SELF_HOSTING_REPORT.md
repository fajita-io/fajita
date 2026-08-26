# Phase 2 self-hosting report

Date: 2026-08-26

## Executive Summary

Phase 2 adds an explicit self-hosted deployment mode, Docker Compose stack, centralized configuration, optional SMTP email, billing/telemetry separation, operational scripts, and internal documentation. Fajita Cloud behavior remains the default when `FAJITA_DEPLOYMENT_MODE` is unset.

Self-hosters can run PostgreSQL, PostgREST, the web app, Go monitor worker, scheduler sidecar, and alert worker without Fajita-owned credentials. Clerk (operator-owned) is still required for authentication.

## Self-Hosted Architecture

See [docs/self-hosting/ARCHITECTURE.md](./self-hosting/ARCHITECTURE.md).

Core path: **Web + PostgREST + PostgreSQL + Go monitor worker + scheduler sidecar**.

## Services Required

| Mandatory | Optional |
| --- | --- |
| PostgreSQL | SMTP or Resend |
| PostgREST | Alert worker (recommended) |
| Next.js web | Subscriber/lifecycle workers |
| Go monitor worker | Sentry (opt-in) |
| Scheduler (cron HTTP) | Analytics (opt-in) |
| Clerk (external) | |

## Deployment Mode

- Env: `FAJITA_DEPLOYMENT_MODE=self_hosted`
- Code: `src/lib/deployment/config.ts`
- Helpers: `deploymentConfig().isSelfHosted`, `.billingEnabled`, `.analyticsEnabled`

## Configuration System

- Extended `src/lib/env.ts` with SMTP variables
- `.env.example` updated with deployment mode and Docker variables
- `npm run selfhost:doctor` validates configuration without printing secrets

## Docker Status

| Artifact | Status |
| --- | --- |
| `Dockerfile` | Web production image (standalone) |
| `docker/Dockerfile.worker` | Node worker processes |
| `services/monitor-worker/Dockerfile` | Existing Go worker (used by Compose) |
| `docker-compose.yml` | Full self-host stack |
| `.dockerignore` | Present |
| `docker/db/apply-migrations.sh` | Idempotent migration runner |

## Database Bootstrap

- Migrations tracked in `public.schema_migrations`
- `migrate` Compose service runs before web/worker
- Commands: `npm run db:migrate`, `npm run db:status`
- Does not destroy existing databases

## Authentication

Clerk with operator-owned keys (Option A). Documented in [AUTHENTICATION.md](./self-hosting/AUTHENTICATION.md).

## Monitoring Scheduler

- Primary: Go worker scheduler loop (always-on)
- Secondary: Compose `scheduler` service hits `/api/cron/monitor-tick` and hourly `/api/cron/tick`
- Vercel Cron unchanged for Cloud

## Workers

- Go worker: full HTTP/HTTPS/API/SSL execution, verification drain, heartbeat miss detection
- Vercel cron worker: fallback for Cloud/serverless; not primary for self-host
- Alert worker: `scripts/alert-worker.ts` via Compose

## Verification

Self-hosted uses local worker fleet for repeated verification. Multi-region probes are not faked. Same incident engine as Cloud.

## Heartbeats

Public URLs derived from `NEXT_PUBLIC_APP_URL`. Ingestion at `/api/heartbeat/{token}`. Miss detection via worker + cron.

## Status Pages

Path-based `/status/<slug>` works locally. Subdomain zone configurable via `NEXT_PUBLIC_STATUS_PAGE_DOMAIN`. Custom domain Cloud automation documented as operator responsibility (reverse proxy).

## Notifications

- Slack, Discord, webhooks: unchanged, user-configured
- Email: Resend **or** SMTP via `src/lib/email/transport.ts`

## Billing Separation

- `computeOrgBillingState()` returns `SELF_HOSTED_ENTITLEMENTS` when self-hosted
- `BILLING_ENFORCEMENT_ENABLED` false in self-hosted mode
- Stripe code preserved for Cloud

## Telemetry

Self-hosted defaults: analytics off, Sentry off unless explicit opt-in. See [TELEMETRY.md](./self-hosting/TELEMETRY.md).

## Network Security

SSRF protections preserved in Go worker. `FAJITA_ALLOW_PRIVATE_NETWORKS` defaults false. Go worker loopback flag remains dev-only.

## Local Development

- `supabase start` + `npm run dev` + Go worker (documented)
- Docker Compose one-command path (documented)

## Clean Install Test

- `npm run oss:selfhost-check` validates typecheck, lint, tests, compose config, optional Docker build
- CI: extend manually with `oss:selfhost-check:fast` as needed

## End-to-End Monitor Test

- Go worker includes `services/monitor-worker/internal/testfixture` for local state transitions
- Full Compose e2e requires Clerk + running stack (manual QA documented in QUICKSTART)
- Automated DB scheduler tests: `supabase/tests/phase4_scheduler.sql`

## Cloud Regression Test

- Cloud mode default preserved
- No marketing, pricing, or SEO changes
- `output: standalone` added to Next config (Cloud-compatible)

## Known Limitations

1. Clerk required (no native self-hosted auth).
2. PostgREST JWT keys must match Supabase-compatible setup (documented defaults for local).
3. Dedicated `fajita_monitor_worker` login role not auto-provisioned with password (worker uses postgres in Compose; document hardening for production).
4. Demo seed is a guarded placeholder (orgs require Clerk provisioning).
5. Custom domain TLS/DNS automation remains Cloud-specific.
6. Phase 1 audit docs were not present on disk at Phase 2 start; findings inferred from codebase.

## Remaining Public Release Blockers

- Public OSS announcement (operator decision)
- Published Docker images on a registry (Phase 3)
- Legal counsel sign-off on [LEGAL_REVIEW_CHECKLIST.md](./LEGAL_REVIEW_CHECKLIST.md)
- Production secret rotation per [SECRET_ROTATION_RUNBOOK.md](./SECRET_ROTATION_RUNBOOK.md) (operator task)
- White-labeling (explicitly deferred)
- Multi-region verification documentation for advanced self-host topologies

## Resolved in blocker-fix pass (2026-08-26)

1. **CI db bootstrap** — `.github/workflows/oss-readiness.yml` applies migrations to empty Postgres
2. **Compose smoke** — same workflow runs `docker compose up db` + `migrate` + table checks
3. **Go monitor tests** — `go test ./...` in CI (SSRF, executor, testfixture)
4. **Clerk webhook provisioning** — covered by `src/app/api/webhooks/clerk/route.test.ts`
5. **Node DNS rebinding parity** — `src/lib/monitoring/safe-http.ts` validates at connect time
6. **AGPL LICENSE + CONTRIBUTING.md** — added at repo root
7. **gitleaks** — CI via gitleaks-action
8. **npm audit** — 0 vulnerabilities (overrides + nodemailer 9)
9. **Public export guide** — [PUBLIC_EXPORT.md](./PUBLIC_EXPORT.md)

## Recommended Phase 3 Work

- Publish hardened production Compose reference (non-default postgres worker creds)
- CI job with testcontainers Postgres + migration smoke
- Clerk test instance for automated authenticated e2e (full stack)
- Self-hosted auth evaluation if Clerk friction is too high for target audience
- Release artifact pipeline (tagged images, checksums)

---

### READY FOR PUBLIC RELEASE (engineering)

Infrastructure, CI gates, licensing, documentation, and security hardening are complete. Before flipping the repository public:

1. Complete legal sign-off ([LEGAL_REVIEW_CHECKLIST.md](./LEGAL_REVIEW_CHECKLIST.md))
2. Rotate production secrets ([SECRET_ROTATION_RUNBOOK.md](./SECRET_ROTATION_RUNBOOK.md))
3. Run `npm run pre-release:verify` and one manual QUICKSTART clean-install
4. Create release tag `v0.1.0` to publish GHCR images (`.github/workflows/release.yml`)
5. Follow [RELEASE.md](./RELEASE.md)

Automated full-stack e2e (web + Clerk + monitor lifecycle in CI) remains optional hardening, not a gate for public release.
