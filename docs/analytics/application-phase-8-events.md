# Phase 8 application analytics events

Goals are defined in `src/lib/analytics/goals.ts` (`DataFastGoals`) and tracked with `trackGoal` (client) or `trackServerGoal` (server). Metadata is bounded and non-sensitive.

## Never send

Custom domains, incident titles, public-message content, customer logo URLs, subscriber emails, private-link tokens, page passwords, internal monitor names, or component descriptions. Metadata is limited to enumerated values (theme key, coarse status) and ids where safe.

## Status-page events

| Goal | Constant | Trigger |
| --- | --- | --- |
| `status_page_creation_started` | `statusPageCreationStarted` | Create flow begun (name typed). |
| `status_page_subdomain_selected` | `statusPageSubdomainSelected` | Subdomain checked available. |
| `status_page_created` | `statusPageCreated` | Page created (server). |
| `status_page_component_created` | `statusPageComponentCreated` | Component added (server). |
| `status_page_monitor_mapped` | `statusPageMonitorMapped` | Component mapped to ≥1 monitor (server). |
| `status_page_theme_selected` | `statusPageThemeSelected` | Appearance saved; metadata `theme` (server). |
| `status_page_logo_uploaded` | `statusPageLogoUploaded` | Logo uploaded. |
| `status_page_custom_domain_started` | `statusPageCustomDomainStarted` | Custom domain add begun (server). |
| `status_page_domain_verified` | `statusPageDomainVerified` | DNS ownership verified (server). |
| `status_page_tls_active` | `statusPageTlsActive` | TLS active for a custom domain. |
| `status_page_preview_opened` | `statusPagePreviewOpened` | Preview opened. |
| `status_page_publish_attempted` | `statusPagePublishAttempted` | Publish attempted (server). |
| `status_page_publish_succeeded` | `statusPagePublishSucceeded` | Publish succeeded (server). |
| `status_page_publish_failed` | `statusPagePublishFailed` | Publish validation failed (server). |
| `status_page_incident_published` | `statusPageIncidentPublished` | Incident published (server). |
| `status_page_incident_update_published` | `statusPageIncidentUpdatePublished` | Public update published. |
| `status_page_maintenance_published` | `statusPageMaintenancePublished` | Maintenance published (server). |
| `status_page_powered_by_previewed` | `statusPagePoweredByPreviewed` | Powered-by lockup previewed. |
| `status_page_seo_setting_changed` | `statusPageSeoSettingChanged` | SEO setting saved (server). |
| `status_page_version_rollback_started` | `statusPageVersionRollbackStarted` | Rollback started (server). |
| `status_page_version_rollback_completed` | `statusPageVersionRollbackCompleted` | Rollback completed (server). |
| `status_page_badge_created` | `statusPageBadgeCreated` | Badge embed created. |
| `status_page_unpublished` | `statusPageUnpublished` | Page unpublished (server). |

## Public analytics

Public-page view analytics are aggregate and privacy-conscious (no full visitor IP, no fingerprints, no cross-site tracking, no incident content, no subscriber email). The public renderer does not load third-party tracking scripts that would reduce reliability. Customer-facing opt-out is planned with the subscriber/notification work.

## Reserved names

Never reuse reserved payment goal names (`payment`, `subscription_*`). None of the Phase 8 goals collide.
