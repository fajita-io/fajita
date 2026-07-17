# Phase 7 handoff

## What shipped

An independently authored alerting system: secure, versioned alert channels
(Email, Slack, Discord, generic signed webhooks); test-before-use; a pure,
tested routing engine with scope specificity, severity filters, recovery
control, and quiet hours; a two-stage delivery pipeline (outbox → intents →
attempts) that is transactional, idempotent, retry- and backoff-aware, with
dead-letter handling and fallback channels; envelope-encrypted secrets with
rotation; RLS on every new table; full delivery observability; CSV export; and
the complete application surface under `/app/integrations`.

Out of scope by instruction and not built: public status pages, status-page
subscriber delivery, SMS/phone escalation, on-call scheduling, Stripe billing,
affiliates, the Pamphlet chatbot.

## Key locations

| Concern | Path |
| --- | --- |
| Schema | `supabase/migrations/20260721000000_phase7_alert_schema.sql` |
| Engine (SQL) | `supabase/migrations/20260721000100_phase7_alert_engine.sql` |
| RLS | `supabase/migrations/20260721000200_phase7_alert_rls.sql` |
| Event emission patch | `supabase/migrations/20260721000300_phase7_event_emission.sql` |
| Domain (pure) | `src/lib/alerts/{events,constants,errors,signing,quiet-hours,messages}.ts` |
| Routing engine (pure) | `src/lib/alerts/routing/engine.ts` |
| Channels + rules write | `src/lib/alerts/channels.ts`, `src/lib/alerts/rules-write.ts` |
| Delivery runtime | `src/lib/alerts/delivery/{consumer,worker,test,context,rules,secrets}.ts` |
| SSRF sender + adapters | `src/lib/alerts/providers/{http,index}.ts` |
| Read layer | `src/lib/alerts/queries.ts` |
| Server actions | `src/lib/app/actions/alerts.ts` |
| Worker entry points | `scripts/alert-worker.ts`, `src/app/api/internal/alerts/run/route.ts` |
| UI | `src/app/(app)/app/integrations/**`, `src/components/app/alerts/**` |
| Tests | `tests/alerts-{routing,signing,domain,ssrf}.test.ts` |
| Docs | `../engineering/alert-delivery-architecture.md`, `.../alert-routing.md`, `../security/alert-delivery-review.md` |

## Environment variables

Server only (validated in `src/lib/env.ts`):

- `RESEND_API_KEY`, `ALERT_EMAIL_FROM`: email sending.
- `ALERT_WORKER_TOKEN`: bearer token for `POST /api/internal/alerts/run`.

Secret encryption keys reuse the Phase 4 setup. No new infrastructure or
dependencies were added.

## How to operate

- **Run delivery**: run `scripts/alert-worker.ts` as a long-lived process, or
  call `POST /api/internal/alerts/run` (with `ALERT_WORKER_TOKEN`) on a schedule.
  Both run one `consumeOutbox` + `runDeliveryPass`.
- **Recover a stuck worker**: leases expire via `app.expire_stale_alert_leases`;
  the next pass reclaims them.
- **Investigate a failure**: delivery log (`/app/integrations/deliveries`) →
  attempt detail; or the dead-letter tab for exhausted deliveries with a
  suggested action and a retry/dismiss path.
- **Rotate a credential**: channel page → rotate (chat/webhook URL) or rotate
  signing key (shown once).
- **Change routing**: `/app/integrations/rules`. Most specific scope wins.

## Feature flag

`integrations` is at `private_beta`. Platform admins and opted-in orgs see the
surface; everyone else 404s on the routes and sees the pending notice on
incidents. Flip to available in `src/lib/app/feature-flags.ts` to launch.

## Phase 6 contract consumed

The consumer reads `incident_delivery_outbox` (`pending`, respects
`suppressed`) and treats the allowlisted payload as source of truth. The event
emission patch additively ensures maintenance lifecycle and public incident
updates reach the outbox. See `../engineering/incident-outbox.md`.

## Verification

- `npx tsc --noEmit` clean.
- `npx next lint` clean (only pre-existing warnings).
- `npx vitest run`: 177 passing, including alert routing, signing, domain, SSRF.
- `npm run build` succeeds; `/app/integrations/**` routes present.

## Known limitations / deferred

- Email delivery requires `RESEND_API_KEY` + `ALERT_EMAIL_FROM` in production;
  unset in this environment.
- Recipient verification and email-suppression ingestion (bounce/complaint
  webhooks) are modeled and enforced but the inbound provider webhook that flips
  a recipient to verified/suppressed is not wired (no email provider configured).
- No scheduled runner is provisioned; wire `scripts/alert-worker.ts` or the
  internal route to your scheduler at deploy.
- Retention/pruning of old delivery attempts is deferred; export exists.
- Empirical throughput/latency numbers under load are not measured yet.
