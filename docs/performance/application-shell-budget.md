# Application shell performance budget

Measured from `npm run build` (Next.js 15.5, production). Numbers are first-load JS per route.

## Measured (Phase 3)

| Route | Route JS | First load JS |
| --- | --- | --- |
| Shared baseline | | 102 kB |
| `/app` (overview) | small | ~103 kB |
| `/app/team` | 2.61 kB | 110 kB |
| `/app/settings/profile` | 2.21 kB | 107 kB |
| `/app/settings/organization` | 2.72 kB | 107 kB |
| `/app/settings/security` | 1.87 kB | 145 kB (Clerk profile surface) |
| `/app/settings/preferences` | 1.72 kB | 106 kB |
| `/login`, `/signup` | 0.35 kB | 150 kB (Clerk widget) |
| `/internal/app-lab` | 7.91 kB | 116 kB (excluded from customer nav) |
| Middleware | | 93.8 kB |

## Discipline applied

- Profile, memberships, active org, feature map, and unread count load once server-side in the app layout. No client refetch of profile/membership.
- Tenant-sensitive data is never cached across users; the layout runs per request.
- App Lab and Brand Lab are internal-only routes and are not linked from customer navigation; their code does not ship in customer route bundles.
- Marketing animation systems are not imported into the app shell.
- Avatars/org logos use explicit width/height to prevent layout shift.
- Command palette search and notification history load on demand.

## Query counts (per app route render)

App layout: profile (1), memberships (1), active org resolve (1), feature overrides (1), unread notifications count (1). Page-specific reads add a small bounded number (for example, team page: members + pending invitations). No N+1 loops except the bounded owned-org check in deletion readiness.

## Known bottlenecks / follow-ups

- Clerk-heavy routes (`/login`, `/signup`, `/app/settings/security`) carry the Clerk client bundle (~150 kB first load). Acceptable for auth-critical surfaces; revisit if it affects LCP.
- No route-level performance telemetry yet; add with the observability follow-up.
- Audit list on the overview is limited (50) and indexed (`audit_events_org_created_idx`).

## Targets (align with pixel-perfect-quality.mdc)

LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 on the shell and settings routes (mobile). Measure with Lighthouse after deploy; record results here.
