# Outbound network isolation

Phase 4. The worker runs in an isolated network. Application-level filtering
(SSRF defense) is mandatory regardless of network controls.

## The worker should reach

- Public HTTP and HTTPS targets (ports 80/443)
- The approved DNS resolver
- Supabase/PostgreSQL over the approved connection
- The approved telemetry destination
- The approved secret-management service (if used)
- Required deployment-health endpoints

## The worker must not reach

- Production databases except through the approved connection
- Internal administration services
- Vercel private interfaces
- Supabase management endpoints
- Cloud and container metadata services
- Other internal Accomplish services and unrelated portfolio applications
- Secret-management control planes beyond required access

## Controls

- Egress restrictions at the container platform where supported
- Application-level IP blocking that always applies at dial time (see
  `docs/security/monitoring-ssrf-defense.md`)
- Port allowlist (80/443)

## Limitations

Network egress policy is enforced by the container platform and is documented as
infrastructure. Where the platform cannot enforce a specific egress rule, the
application-level SSRF defense remains the guarantee. Record any platform
limitation in `docs/handoff/monitor-worker-transfer.md` during deployment.
