# Monitoring engine architecture

Phase 4. This document describes the architecture of Fajita's independently
authored monitoring engine: the components, how they communicate, and the trust
boundaries between them.

## Components

| Component | Location | Runtime | Responsibility |
| --- | --- | --- | --- |
| Web application | `src/` (Next.js) | Vercel | Monitor management server actions, heartbeat ingestion route, internal engine lab, platform-admin worker view |
| Shared contracts | `packages/monitor-contracts` | TS + Go | Versioned enums and payload shapes, single source of truth mirrored in both languages |
| Monitor worker | `services/monitor-worker` (Go) | Container platform | Leases due checks, executes them securely, finalizes results |
| PostgreSQL | Supabase (`olvnjsqspvywvwfchtuc`) | Managed | Source of truth for monitors, schedules, leases, executions, results |
| Test-target fixture | `services/monitor-worker/internal/testfixture` + `cmd/testfixture` | Local/CI | Deterministic HTTP endpoints for tests, no third-party dependencies |

## Data flow

```text
Operator (internal lab / server action)
   │  create / test / activate / pause / delete
   ▼
Web application (server actions)  ── writes ──►  PostgreSQL
   │                                              ▲   │
   │ (test-before-save preflight, no schedule)    │   │ SECURITY DEFINER app.* functions
   ▼                                              │   ▼
DNS + SSRF preflight (TS mirror)          Monitor worker (Go)
                                             lease → execute → finalize
                                                       │
                                                       ▼
                                             Public HTTP/HTTPS target
```

The web application and the worker never call each other directly. They
communicate only through PostgreSQL rows and the shared contract version. This
keeps the worker independently deployable and lets either side restart without
coordination.

## Trust boundaries

1. **Browser → web application.** Clerk authentication, organization membership
   authorization, Zod validation, and rate limiting on every server action.
2. **Web application → database.** The app uses the Supabase service client for
   monitoring tables (RLS still applies to customer reads; writes are performed
   by trusted server code that scopes every query by `organization_id`).
3. **Worker → database.** The worker authenticates as a dedicated NOLOGIN role
   (`fajita_monitor_worker`) that has `EXECUTE` on a small set of
   `SECURITY DEFINER` functions in the `app` schema and nothing else. It cannot
   read or write monitoring tables directly.
4. **Worker → target.** Every outbound request passes URL validation, DNS
   resolution, IP allow/block classification, and a rebinding-safe dialer before
   a socket is opened. See `docs/security/monitoring-ssrf-defense.md`.

## Why this shape

- **PostgreSQL as the queue.** The product does not yet need Kafka, RabbitMQ, or
  Redis. Lease-based scheduling with `FOR UPDATE SKIP LOCKED` is sufficient,
  operationally simple, and transactional with the result write.
- **A separate Go worker.** Long-running scheduled network execution does not
  belong in Vercel request functions. Go gives precise control over the HTTP
  transport, DNS, timeouts, and concurrency that the security model requires.
- **Versioned contracts.** A worker whose `ContractVersion` does not match the
  application's `CONTRACT_VERSION` fails readiness rather than writing data with
  a stale schema understanding.

## What this phase does not include

No incident engine, no customer-facing alerts, no public status pages, no
billing, no affiliate system, no chatbot, and no customer monitor wizard. The
engine is internal. See `docs/handoff/phase-4-handoff.md`.
