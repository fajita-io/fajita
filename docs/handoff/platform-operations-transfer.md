# Platform operations transfer

## Provision admin

1. Add Clerk user id to `PLATFORM_ADMIN_USER_IDS` (bootstrap owner), or
2. Insert `platform_operator_roles` row for graded roles

## Remove admin

Revoke role row (`status=revoked`) and remove from env allowlist.

## Buyer checklist

- Review command center, revenue, cohorts, incidents, workers, providers, security, privacy, approvals, audit, flags, infra, releases, costs
- Generate diligence export
- Rotate tokens: `PLATFORM_ANALYTICS_WORKER_TOKEN`, worker tokens, Clerk/Stripe/Supabase
- Transfer GitHub read App if installed (least privilege, Fajita repo only)
- Rebuild analytics: `daily_health`, `org_health`

No unrelated Accomplish portfolio administration.
