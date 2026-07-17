# Platform operations architecture

Phase 17 consolidates Fajita's internal operating surfaces into one command center under `/internal`.

## Principles

- PostgreSQL read models and bounded aggregates (no warehouse by default)
- Platform roles separate from organization roles
- Step-up + approvals for high-risk actions
- No customer impersonation by default
- No autonomous infra, billing, or content changes

## Layers

1. **Access** — `src/lib/platform/access.ts`, `permissions.ts`
2. **Events** — `platform_operational_events` + typed registry
3. **Read models** — `platform_daily_health`, `platform_org_health_snapshots`, metric snapshots
4. **Command center** — `loadCommandCenter`
5. **Domain ops** — monitoring, incidents, alerts, revenue, affiliates, support, content (existing + integrated)
6. **Control plane** — approvals, feature flags, reconciliation, reports, exports

## Data flow

Domain tables → analytics jobs (`/api/internal/platform/run`) → read models → internal UI. Customer requests never run expensive aggregations.
