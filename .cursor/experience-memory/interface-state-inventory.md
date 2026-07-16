# Interface state inventory

State matrix per surface. Update via `interface-state-director`. Mark Implementation and Testing status as work progresses.

**Legend:** N/A = not applicable · Pending = not built · Done = implemented and tested

---

## Route: `/` (homepage)

| State | Priority | Implementation | Testing |
| --- | --- | --- | --- |
| Default (populated marketing) | P0 | Pending | Pending |
| Loading | P1 | Pending | Pending |
| Error (runtime) | P2 | Pending | Pending |
| Mobile | P0 | Pending | Pending |
| Reduced motion | P1 | Pending | Pending |

**Data dependency:** Static content
**Permission dependency:** Public

---

## Route: `/` (current placeholder)

| State | Priority | Implementation | Testing |
| --- | --- | --- | --- |
| Default | P0 | Done (minimal h1) | Pending |
| Empty | N/A | — | — |

**Notes:** Placeholder only. Replace when marketing ships.

---

## Feature: Authentication

| State | Priority | Implementation | Testing |
| --- | --- | --- | --- |
| Default sign-in | P0 | Pending | Pending |
| Default sign-up | P0 | Pending | Pending |
| Loading | P0 | Pending | Pending |
| Validation error | P0 | Pending | Pending |
| System error | P0 | Pending | Pending |
| Success redirect | P0 | Pending | Pending |
| Session expired | P1 | Pending | Pending |
| Mobile | P0 | Pending | Pending |

**Data dependency:** Supabase auth (configured, not wired in UI)
**Permission dependency:** Public routes

---

## Feature: Monitors (core)

| State | Priority | Implementation | Testing |
| --- | --- | --- | --- |
| Empty (no monitors) | P0 | Pending | Pending |
| Loading list | P0 | Pending | Pending |
| Populated (healthy, degraded, down, maintenance, paused, unknown) | P0 | Pending | Pending |
| Creating / first check running | P0 | Pending | Pending |
| Success (first check result) | P0 | Pending | Pending |
| Error (invalid or unreachable target; preserve input) | P0 | Pending | Pending |
| Permission denied | P1 | Pending | Pending |
| Plan restricted | P1 | Pending | Pending |
| Offline | P2 | Pending | Pending |

**Data dependency:** `[UNRESOLVED]` monitors API
**Permission dependency:** Authenticated user

---

## Feature: Interactive demo (marketing)

| State | Priority | Implementation | Testing |
| --- | --- | --- | --- |
| Default interactive | P0 | Pending | Pending |
| Processing | P0 | Pending | Pending |
| Success outcome | P0 | Pending | Pending |
| Demo error + fallback | P0 | Pending | Pending |
| Reduced motion | P1 | Pending | Pending |
| Mobile simplified | P0 | Pending | Pending |

---

## Component: Global shell (future app)

| State | Priority | Implementation | Testing |
| --- | --- | --- | --- |
| Loading shell | P0 | Pending | Pending |
| Authenticated | P0 | Pending | Pending |
| Unauthenticated redirect | P0 | Pending | Pending |
| Plan restricted nav | P1 | Pending | Pending |

---

*Expand rows as features ship. Every P0 state must reach Done before feature complete per `state-completeness.mdc`.*
