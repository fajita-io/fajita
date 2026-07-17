# staged launch plan

**Date:** 2026-07-17  
**Owner:** operations

## Stage 0: Internal production verification
Founder only, fixture org, real infra, signup public off.

## Stage 1: Trusted pilot
Small approved group, monitor caps, daily review.

## Stage 2: Controlled public launch
Signup on with flags, command center staffed.

## Stage 3: Normal operations
After observation period and blocker closure.

Feature flags:
- `signup_public` default false (owner operations)
- `checkout_paid` default false (owner billing)
- `generic_webhooks` default true (owner engineering)
- `custom_domains` default false (owner operations)
- `affiliate_applications` default false (owner billing)
- `pamphlet_account_tools` default true (owner support)

Configuration freeze: pricing, entitlements, intervals, retention, affiliate terms, critical flags. Changes need reason, approval, test, docs, rollback.

