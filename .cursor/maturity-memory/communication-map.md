# Communication map

Registry of every Fajita communication. Governed by `lifecycle-communications.mdc`. Update via `lifecycle-communication-director`. Every entry must tie to a real, observable system event.

**No sending provider is wired yet.** Resend is available as an MCP integration but is not a project dependency; sender domain and templates are `[UNRESOLVED]`. Entries below are planned communications, not shipped ones. Sender identity: Fajita, Kalispell (`company.mdc`).

**Category:** transactional · security · billing · product · onboarding · lifecycle · marketing · operational · support
**Implementation status:** Pending = not built · Partial · Done
**Testing status:** Pending · Done

---

## Registry

| Name | Category | Trigger | Audience | Channel | Purpose | Primary CTA | Required data | Sensitive-data restrictions | Suppression | Frequency limit | Retry behavior | Preference behavior | Analytics | Impl | Testing |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Welcome | onboarding | Account created | New user | Email | Confirm account, point to first monitor | Create first monitor | Name/email, app URL | No secrets | None (essential) | Once | Idempotent resend on failure | Not suppressible as marketing | `signup` context | Pending | Pending |
| Email verification | security | Signup / email change | User | Email | Verify address | Verify | One-time link (short-lived) | Link is sensitive; not in subject | Never suppress | Per request + rate limit | Retry send | Essential | none/PII-safe | Pending (Clerk may own) | Pending |
| Password / auth reset | security | Recovery requested | User | Email | Recover access | Reset | One-time link | Link sensitive; no credentials | Never suppress | Rate-limited | Retry send | Essential | none | Pending (Clerk may own) | Pending |
| New-device / suspicious sign-in | security | New device or risky login | User | Email | Alert to possible compromise | Review activity | Device/location (coarse) | No secrets | Never suppress | Debounced | Retry send | Essential | none | Pending | Pending |
| Team invite | transactional | Invite sent | Invitee | Email | Join workspace | Accept invite | Inviter, workspace, one-time link | Link sensitive | Essential to flow | Per invite | Retry send | Essential | `invite_sent` | Pending | Pending |
| First-monitor activation nudge | lifecycle | No monitor created after signup | New user (opted-in) | Email | Drive activation | Create a monitor | Account state | No secrets | Opt-out honored | Capped (e.g. 1) | No retry if suppressed | Optional | `first_monitor` funnel | Pending | Pending |
| Incident alert | product | Verified monitor failure | On-call user via alert channel | `[UNRESOLVED]` (email + others) | Notify before customers report | View incident | Monitor, incident, timestamp | No secrets; scope to recipient | Never suppress (essential) | Debounce/escalation `[UNRESOLVED]` | Retry with backoff | Essential | incident goals `[UNRESOLVED]` | Pending | Pending |
| Recovery / resolved | product | Incident resolved | On-call user | Alert channel | Confirm recovery | View incident | Incident, duration | No secrets | Never suppress | Once per incident | Retry | Essential | `[UNRESOLVED]` | Pending | Pending |
| Receipt / invoice | billing | Invoice paid | Customer | Email | Payment record | View invoice | Amount, plan, period | No full card data | Essential | Per invoice | Idempotent | Essential | none | Pending | Pending |
| Failed-payment dunning | billing | Invoice payment failed | Customer | Email | Recover payment | Update payment | Amount, retry date, portal link | No card data | Essential | Sequence-capped | Idempotent per attempt | Essential | none | Pending | Pending |
| Trial ending | billing/lifecycle | Trial near end | Trialing user | Email | Convert to paid | Choose a plan | Days left, plan | No secrets | Opt-out for non-essential | Capped | Idempotent | Mostly essential | `initiate_checkout` funnel | Pending | Pending |
| Upgrade / downgrade confirmation | billing | Plan change | Customer | Email | Confirm change and effect | View billing | New plan, effect, date | No card data | Essential | Per change | Idempotent | Essential | none | Pending | Pending |
| Cancellation confirmation | billing | Cancellation scheduled/completed | Customer | Email | Confirm, state access end + data fate | Reactivate | End date, data retention | No secrets | Essential | Per event | Idempotent | Essential | none | Pending | Pending |
| Product digest | product/lifecycle | Scheduled summary | Opted-in users | Email | Summarize uptime/incidents | View dashboard | Aggregated stats | No secrets; scope per recipient | Opt-out honored | Digest cadence | No duplicate | Optional | `[UNRESOLVED]` | Pending | Pending |
| Re-engagement | marketing/lifecycle | Inactivity | Opted-in users | Email | Bring user back | Return | Account state | No secrets | Opt-out honored | Strict cap | No duplicate | Optional | `[UNRESOLVED]` | Pending | Pending |
| Support reply | support | User contacts support | Requester | Email | Resolve request | Continue thread | Ticket context | No secrets; no cross-user data | N/A | N/A | Retry | N/A | none | Pending | Pending |
| In-app notification center | product | Various product events | Authenticated user | In-app | Surface events without email spam | Deep link to item | Event data | Scope to user | Per policy | Bundled/digest | N/A | Per `notification-policy.md` | `[UNRESOLVED]` | Pending | Pending |

## Rules

- Product notifications and emails must not repeat the same information unnecessarily; choose the channel per `notification-policy.md`.
- Essential (security, account, billing) communications are never suppressed as marketing.
- No message claims success before the underlying operation succeeds; use idempotent send keys to prevent duplicate sends from retried jobs.
- Voice per `draper-honeycopy.mdc`; no em dashes; no fake urgency or invented activity.

## Status

Installation baseline recorded 2026-07-16. All communications Pending; provider/domain `[UNRESOLVED]`. Resolve triggers, suppression, and preferences via `lifecycle-communication-director` at Gate 4.
