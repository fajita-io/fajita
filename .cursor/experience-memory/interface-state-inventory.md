# Interface state inventory

State matrix per surface. Update via `interface-state-director`. Mark Implementation and Testing status as work progresses.

**Legend:** N/A = not applicable · Pending = not built · Done = implemented and tested

---

## Route: `/` (homepage)

| State | Priority | Implementation | Testing |
| --- | --- | --- | --- |
| Default (populated marketing) | P0 | Done (Phase 2) | Done (unit + screenshot QA) |
| Loading | P1 | Done (`(site)/loading.tsx` thermal dots) | Done (visual) |
| Error (runtime) | P2 | Done (root `error.tsx` with retry) | Done (visual) |
| Mobile | P0 | Done (recomposed; simplified Thermal Stack) | Done (7-breakpoint sweep) |
| Reduced motion | P1 | Done (CSS media query, static demo states) | Done (manual + Lighthouse) |

**Data dependency:** Static content from `src/lib/site/`
**Permission dependency:** Public

---

## Route: `/` (Phase 0 placeholder)

**Notes:** Superseded by the Phase 2 homepage. Retired 2026-07-16.

---

## Feature: Public forms (early access + contact)

| State | Priority | Implementation | Testing |
| --- | --- | --- | --- |
| Default | P0 | Done | Done (`tests/site-forms.test.tsx`) |
| Validation error (input preserved) | P0 | Done (inline `role="alert"`) | Done |
| Submitting | P0 | Done (disabled + label change) | Done |
| Success | P0 | Done (confirmation replaces form) | Done |
| System error (input preserved) | P0 | Done | Done |
| Rate limited | P1 | Done (429 message, retry guidance) | Done (API-level) |
| Mobile | P0 | Done | Done (screenshot sweep) |

**Data dependency:** `/api/early-access`, `/api/contact` (Supabase)
**Permission dependency:** Public

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
| Default interactive | P0 | Done (nine-step product journey) | Done (`tests/site-demo.test.tsx`) |
| Processing | P0 | Done (simulated check/verify states) | Done |
| Success outcome | P0 | Done (resolution + uptime review) | Done |
| Demo error + fallback | P0 | Done (simulated failure step; no network, no real errors possible) | Done |
| Reduced motion | P1 | Done (static stage renders) | Done (manual) |
| Mobile simplified | P0 | Done (step list recomposition, touch targets) | Done (screenshot sweep) |

**Notes:** Entirely local state; reset supported; keyboard operable with `aria-live` announcements.

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
