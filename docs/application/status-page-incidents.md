# Status page incidents

Route: `/app/status-pages/[id]/incidents` (`IncidentsManager`).

## Publication

Publishing uses the Phase 6 public-safe projection. Only allowlisted fields cross the boundary: public title, public summary, public status, severity, affected public components, start time, published updates, resolved time.

Never exposed: internal notes, internal incident title, assignee, acknowledgment, monitor ids, secret URLs, evidence, internal error taxonomy, worker details, audit events, alert-delivery history.

## Manual publication

The operator reviews and publishes with a required public title (so no internal title leaks). The UI states clearly: "This update will be visible to anyone who can access the status page." Requires `status_pages:publish`. Each publish is audited, refreshes the snapshot, and invalidates cache.

## Update lifecycle

Update types: Investigating, Identified, Monitoring, Resolved, Informational. Corrections preserve historical integrity; public outage history is not silently rewritten.

## Automatic publication

Opt-in only. Default is create-a-draft / manual-publish. Automatic publication is never enabled silently.

## Notices

`createNoticeAction` posts a general message unrelated to a monitored incident (third-party issue, service note). Notices are clearly distinct from incidents and maintenance and never forge monitor state.

## Public detail and archive

Public incident detail: `/status/[slug]/incidents/[incidentSlug]`. Archive: `/status/[slug]/history` (paginated, bounded). Individual incidents are noindex by default; archive indexing is configurable.
