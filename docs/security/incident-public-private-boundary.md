# Incident public and private boundary

Phase 6 keeps three content tiers strictly separated.

## Tiers

| Tier | Fields | Visibility in Phase 6 |
| --- | --- | --- |
| Internal | internal summary, internal notes, evidence detail, worker context, correlation ids, audit | Authorized org members only. Never leaves the app. |
| Public-ready | public title, public summary, public-ready updates, public status, severity | Stored in `incident_public_projections`. Saved, not published. No public route exists. |
| Delivery | outbox payloads (allowlisted) | `incident_delivery_outbox`, `pending`/`suppressed`. Delivered by nobody in Phase 6. |

## Enforcement

- Separate columns and tables per tier; internal content is never copied into the
  projection or outbox payload.
- `incident_public_projections` and `incident_delivery_outbox` have no customer
  read policy and no public route.
- The updates UI labels visibility persistently (Internal, Public-ready) and
  shows "Saved for future status-page publication. No external message has been
  sent." when a public-ready update is created. It never claims a customer was
  notified.

## Product warning

The composer reminds operators not to place passwords, API keys, private
customer information, or sensitive security detail in incident updates. Analytics
never receives incident titles, note or update content, monitor URLs, response
bodies, or assignee email (see `../analytics/application-phase-6-events.md`).
