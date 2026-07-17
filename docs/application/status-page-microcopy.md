# Status page microcopy

Voice: calm, specific, confident. No em dashes. No AI slop. During an outage, clarity is the brand. Fajita supports the customer's page without overpowering it.

## Public terminology (approved)

All Systems Operational · Partial System Disruption · Degraded Performance · Major Service Disruption · Under Maintenance · Investigating · Identified · Monitoring · Resolved · Scheduled Maintenance · Incident History · Uptime · Response Time · Subscribe to Updates.

Internal terms are never shown publicly (verification counters, worker/lease state, internal state machine, assertion names, internal monitor names, secret URLs, internal notes, assignments, acknowledgment, delivery outbox, security events).

## Management copy examples

- Empty state: "Keep customers informed when production gets complicated." with "Publish live component status, incident updates, scheduled maintenance, and historical uptime from a page that looks like it belongs to your company."
- Publish warning: "This update will be visible to anyone who can access the status page."
- DNS: "DNS changes may take time to appear depending on your provider and existing TTL."
- Response-time context: "Response time reflects Fajita's external checks and may differ from individual customer experience."
- Onboarding success: "Your status page is live. Customers now have one place to see what is working and what is not."

## Rules

- No food jokes in outage communication.
- No fake "all systems operational".
- State is never color-only; labels accompany every state.
