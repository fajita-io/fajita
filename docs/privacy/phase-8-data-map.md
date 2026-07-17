# Phase 8 privacy and data map

## Data collected

| Data | Storage | Public? | Retention |
| --- | --- | --- | --- |
| Page config (name, slug, theme, toggles) | `status_pages` | Public parts via snapshot | Life of page |
| Component names/descriptions | `status_page_components` | Yes (allowlisted) | Life of page |
| Public incident/maintenance/notice content | Phase 6 tables + attachments | Yes (sanitized) | Per customer incident-history setting |
| Uptime/response summaries | `status_page_uptime_summaries` + derived | Aggregated only | Plan-ready retention |
| Custom domains | `status_page_domains` | Hostname public via routing | Life of mapping + audit |
| DNS verification tokens | `status_page_domain_verifications` | No (hashed) | Expire after 7 days |
| Logos/favicons | `status_page_brand_assets` | Public derivative only | Life of page |
| Public analytics events | `status_page_analytics_events` | Aggregate | Bounded |
| Subscriber email (Phase 9 foundation) | `status_page_subscribers` | Never public | Not collected until Phase 9 |
| Private-page passwords / private-link tokens | `status_pages` (hashed) | Never | Never plaintext |

## Visitor data

Public pages do not place tracking cookies by default and do not load third-party trackers. Aggregate analytics carry no full visitor IP, no fingerprints, no cross-site tracking, no incident content, and no subscriber email.

## Deletion and export

Status-page deletion unpublishes immediately (removes the public snapshot), preserves audit, revokes private tokens, and processes background cleanup. Component deletion preserves historical incident references and the public-name snapshot. Domain deletion frees routing and preserves verification audit. Subscriber collection stays gated until Phase 9's full consent/verification/deletion flow exists.
