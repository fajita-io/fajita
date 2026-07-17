# Incident microcopy

Centralized in `src/lib/incidents/copy.ts`. Customer-facing incident text is
specific, calm, technically accurate, free of raw implementation detail, free of
blame, free of jokes in serious states, and free of em dashes.

## State copy

- Verifying: Fajita is checking whether this failure is temporary or persistent.
- Degraded: The service is responding, but one or more required checks are
  failing.
- Down: Fajita confirmed that the service is unavailable or failing critical
  checks.
- Recovering: The service is responding again. Fajita is confirming that the
  recovery is stable.
- Resolved: The service passed the required recovery checks and is operational
  again.
- Maintenance: Monitoring continues during this maintenance window, but expected
  failures will not open a new incident.

## Delivery and publication notices

- Public-ready update saved: "Saved for future status-page publication. No
  external message has been sent."
- Alert delivery: a neutral notice that external alert delivery arrives in a
  later build.

These notices only appear where the projection/outbox foundation is used and
never imply a customer was notified or a status page was updated. No internal
phase numbers appear in customer-facing copy.
