# Known limitations

**Date:** 2026-07-17  
**Owner:** product

Public-safe limitations may appear in customer docs. Internal-only rows stay internal.

| ID | Limitation | Area | Priority | Public-safe | Disclosure |
| --- | --- | --- | --- | --- | --- |
| LIM-001 | No SMS or phone alerts | alerts | p2 | yes | Alert channels are email, Slack, Discord, and HTTPS webhooks. |
| LIM-002 | No private-network or agent-based monitoring | monitoring | p2 | yes | Fajita monitors publicly reachable HTTP(S) endpoints, certificates, and heartbeats. |
| LIM-003 | No browser / RUM / mobile apps | monitoring | p3 | yes | Fajita is server-side uptime monitoring, not real-user monitoring. |
| LIM-004 | No public API or SDKs | platform | p2 | yes | Management is through the Fajita web app. |
| LIM-005 | No SAML / SCIM / enterprise contract tooling | auth | p3 | yes | Team access uses organization invitations. |
| LIM-006 | No guaranteed uptime or alert delivery SLA | legal | p1 | yes | Service is provided as available. Monitoring and alerts can fail; see Terms and status page. |
| LIM-007 | Networked free HTTP status checker deferred | tools | p1 | yes | Some free tools are calculators only; networked checks require an account. |
| LIM-008 | No 24/7 staffed support | support | p1 | yes | Support is not live chat staffing. Response times are not guaranteed. |

### LIM-001

- Impact: Teams that require SMS paging must use email/Slack/Discord/webhook bridges.
- Workaround: Route webhooks to an external paging tool.
- Owner: product
- Planned review: 2026-10-01

### LIM-002

- Impact: Internal services behind NAT cannot be checked directly.
- Workaround: Expose a public health endpoint or use heartbeats.
- Owner: product
- Planned review: 2026-10-01

### LIM-003

- Impact: Client-side failures are out of scope.
- Workaround: Monitor critical API and page endpoints from the server side.
- Owner: product
- Planned review: 2026-12-01

### LIM-004

- Impact: Programmatic account management is unavailable.
- Workaround: Use the web application.
- Owner: product
- Planned review: 2026-12-01

### LIM-005

- Impact: Enterprise IdP provisioning is unavailable.
- Workaround: Use Clerk-supported sign-in methods and org invites.
- Owner: product
- Planned review: 2027-01-01

### LIM-006

- Impact: Customers cannot rely on contractual uptime guarantees.
- Workaround: Status page + best-effort multi-channel alerts.
- Owner: legal
- Planned review: 2026-09-01

### LIM-007

- Impact: Public free tool does not fetch arbitrary URLs.
- Workaround: Use paid monitors after signup.
- Owner: security
- Planned review: 2026-09-01

### LIM-008

- Impact: Human response is best-effort during founder coverage windows.
- Workaround: Pamphlet chatbot + email handoff; status page during incidents.
- Owner: operations
- Planned review: 2026-09-01


