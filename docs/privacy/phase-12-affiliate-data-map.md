# Phase 12 affiliate privacy data map

What the affiliate program collects, why, where it lives, who can see it, and
how it leaves. Complements `docs/legal/affiliate-privacy-notice-draft.md`
(in force at `/legal/affiliate-privacy`). Program terms are published.

## Collected data

| Data | Storage | Purpose | Affiliate visibility | Retention notes |
| --- | --- | --- | --- | --- |
| Application fields (email, country, website, methods, answers) | `affiliate_applications` | Review enrollment | Own application status only | Life of applicant / compliance |
| Terms acceptance (versions, timestamp, coarse context) | `affiliate_terms_acceptances` | Proof of acceptance | Indirect (enrollment) | Compliance retention |
| Membership + fraud/tax/payout states | `affiliates` | Operate account | Own states | Life of affiliate |
| Profile (display name, contact email, website, channels) | `affiliate_profiles` | Contact and display | Own profile | Life of affiliate |
| Email preferences | `affiliate_email_preferences` | Consent for optional mail | Own prefs | Life of affiliate |
| Codes, campaigns, links | `affiliate_codes`, `_campaigns`, `_links` | Referral tooling | Own rows | Until retired / closed |
| Sessions + clicks (opaque, bot class, destination) | `affiliate_sessions`, `affiliate_clicks` | Attribution | Aggregates only (counts) | Prune policy TBD; not exposed with customer ids |
| Org attribution | `affiliate_attributions` | Bind referral to org | None (service-role) | Life of org / program |
| Conversions (anon_ref, plan, state) | `affiliate_conversions` | Commission root | Counts / anon refs only | Life of conversion |
| Commissions + ledger | `affiliate_commissions`, `_ledger` | Money truth | Own amounts/states | Tax/compliance retention |
| Refund/dispute events | `affiliate_refund_events`, `_dispute_events` | Reversal source | None | Compliance retention |
| Fraud flags (coarse evidence) | `affiliate_fraud_flags`, `_reviews` | Integrity | None (admin) | Compliance retention |
| Payout + tax profiles | `affiliate_payout_profiles`, `_tax_profiles` | Pay readiness | Own status enums | Life of affiliate |
| Payout batches/items/statements | `affiliate_payout_*` | Pay and record | Own statements/items | Tax retention |
| Notifications + exports | `affiliate_notifications`, `_exports` | Delivery and audit | Own exports | Delivery history / export log |
| Admin actions | `affiliate_admin_actions` | Operator audit | None | Compliance retention |
| First-party cookie `fj_ref` | Browser + session id | Attribution window | N/A | Cookie TTL = attribution window |

## Minimization

- No device fingerprinting for attribution.
- No third-party ad pixels for referral tracking.
- No standing IP address warehouse for affiliate clicks (bot class / UA category only).
- Affiliates never see Referred Customer email, name, org name, or Stripe ids.
- Analytics goals carry affiliate ids / coarse enums only (see
  `docs/analytics/application-phase-12-events.md`).
- Fraud evidence JSON must stay coarse (counts, rates, booleans).

## Access

| Actor | Access |
| --- | --- |
| Affiliate (RLS + server projections) | Own non-identity Program data; earnings and performance aggregates |
| Org member | No affiliate tables via org roles |
| Platform admin | Applications, directory, fraud, payouts, reconciliation (no bank/tax numbers) |
| Service role | Conversion engine, webhooks, worker jobs |

## Processors

- Supabase (database)
- Stripe / Stripe Connect (billing confirmation and payouts; tax/identity collection on Connect)
- Resend (affiliate email when configured)
- DataFast (non-PII goals)
- Clerk (identity link via user profile)

## Deletion and export

- Affiliate can request account closure; membership moves to `closed`; cleared
  payable balances may still pay out per Agreement.
- CSV export of own commissions and statements via `/affiliate/export`.
- Full account deletion follows the broader account-deletion path; affiliate
  rows cascade or restrict per FK rules. Exact purge SLA for ledger history
  remains subject to tax retention requirements (`[UNRESOLVED]` counsel).

## Consent notes

- Application requires acceptance of Agreement + Privacy Notice versions.
- Optional email categories are preference-gated; required account messages
  still send.
- Referral cookie consent gate for jurisdictions that require it is a known
  follow-up before public launch (`programPublished`).
