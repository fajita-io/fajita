# Phase 12 analytics events

Typed DataFast goals in `src/lib/analytics/goals.ts`. Affiliate program only.
Never send affiliate legal name or email, customer identity or email, Stripe
ids, tax or payout account numbers, full referral URLs, IP addresses, or fraud
evidence. Use affiliate ids, anon refs, coarse enums, and version numbers only.

## Goals

| Goal constant | Event name | When |
| --- | --- | --- |
| `affiliatePageViewed` | `affiliate_page_viewed` | Public program page view (when accessible) |
| `affiliateApplicationStarted` | `affiliate_application_started` | Apply form opened / started |
| `affiliateApplicationSubmitted` | `affiliate_application_submitted` | Application submitted |
| `affiliateApplicationApproved` | `affiliate_application_approved` | Admin approved |
| `affiliateApplicationRejected` | `affiliate_application_rejected` | Admin rejected |
| `affiliateDashboardViewed` | `affiliate_dashboard_viewed` | Affiliate shell / overview |
| `affiliateLinkCreated` | `affiliate_link_created` | New link created |
| `affiliateCampaignCreated` | `affiliate_campaign_created` | New campaign created |
| `affiliateCreativeDownloaded` | `affiliate_creative_downloaded` | Copy snippet / creative copy |
| `affiliateTermsAccepted` | `affiliate_terms_accepted` | Terms accepted with application |
| `affiliatePayoutSetupStarted` | `affiliate_payout_setup_started` | Connect onboarding started |
| `affiliatePayoutSetupCompleted` | `affiliate_payout_setup_completed` | Connected account enabled |
| `affiliateTaxSetupStarted` | `affiliate_tax_setup_started` | Reserved for explicit tax flow |
| `affiliateExportRequested` | `affiliate_export_requested` | CSV export |
| `affiliateAccountClosureRequested` | `affiliate_account_closure_requested` | Closure requested |

## Metadata rules

Allowed: plan key enums already used elsewhere, boolean flags, row counts,
coarse status strings, program version numbers.

Forbidden: emails, names, org names, codes that encode email, destination URLs
with query PII, Stripe ids, amounts that identify a single customer invoice.

## Funnel (internal)

Application submitted → approved → first link share (proxy: link created) →
first conversion (server ledger / conversion row, not analytics) → first
payout. Conversion and payout confirmation are server-side; do not rely on
client goals for money events.
