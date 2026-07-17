# Phase 11 handoff

Onboarding, first-five-minute activation, lifecycle email, weekly
reliability reports, incident recaps, retention, and cancellation
intelligence.

## What shipped

- Activation checklist derived from real product state, first-session
  experience with use-case and role selection, monitor recommendations,
  skip/dismiss/reopen, product-tour state, and funnel events. Onboarding
  version 2 with structured step records.
- Evidence-based lifecycle state model with append-only transitions, a
  typed rule engine (welcome, setup reminders at 24h/72h, draft reminder,
  first-monitor confirmation, first-failure education, alert reminders at
  3d/7d, status-page reminder, activation complete, usage notices at
  80%/100%, cancellation confirmation, mid-retention reactivation
  reminder, pre-deletion reminders at 7d/1d).
- Lifecycle delivery on the intent/attempt/retry/dead-letter pattern with
  database-unique dedup keys, send-time eligibility re-checks, preference
  and suppression enforcement, and versioned templates with a shared email
  design system and fixtures.
- Weekly reliability reports: timezone-correct periods, centralized metric
  definitions, immutable snapshots, honest partial-data handling,
  application views at `/app/reports`, owner-managed recipients.
- Incident recaps: eligibility gates, immutable snapshots, versioned
  root-cause corrections, follow-up actions, recap email.
- Cancellation feedback (optional, unobstructed), enriched confirmation,
  pre-deletion reminders, reactivation checklist.
- Customer email center (preferences plus delivery history), internal
  operations view `/internal/lifecycle`, internal lab
  `/internal/onboarding-lab`, reconciliation jobs, audit coverage,
  count-only analytics goals.

## Known limitations and deferred items

- **Sample monitor**: not shipped. A Fajita-owned fixture endpoint does not
  exist yet; building one that honestly demonstrates degraded and failed
  states is deferred rather than faked.
- **Maintenance recaps**: deferred; incident recaps cover the meaningful
  cases and the maintenance data model supports adding them later.
- **Command palette**: the application does not yet have a command
  palette, so palette integration has no host surface.
- **Experimentation framework**: not implemented; the phase requires no
  running experiments, and the versioned definitions provide the variant
  foundation when one is approved.
- **Report export and resend controls**: report data is fully visible
  in-app; file export and user-initiated resend are deferred.
- **Provider callbacks**: Resend webhook ingestion (bounce and complaint
  events into `lifecycle_suppressions`) needs the webhook endpoint wired
  when the sending domain is verified; the suppression ledger and
  enforcement are ready.
- **Load tests and staging passes**: not executed
  (`docs/testing/phase-11-load-results.md`, `phase-11-test-matrix.md`).
- **Monthly reports**: deferred by design; weekly or disabled.

## Confirmations

No affiliate system, attribution, commissions, or payouts. No promotional
broadcasts, portfolio cross-promotions, newsletters, SMS, phone calls, or
push notifications. No AI-generated lifecycle copy, reports, summaries, or
health scores. No Pamphlet chatbot, blog, glossary, comparison pages, or
free tools. No fake activation, retention, or report metrics: every metric
in the product is computed from server timestamps and real check data or
is absent.

## Phase 12 readiness

The affiliate system (Phase 12) has clean boundaries: lifecycle messaging
carries no promotional slots, sender identities are transactional only,
and analytics goals are append-only, so affiliate attribution can be added
without touching Phase 11 tables. Cancellation and reactivation records
give Phase 12 accurate revenue-context data through Phase 10's MRR
reporting.
