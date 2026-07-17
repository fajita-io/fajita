# Affiliate attribution and cookie security review

Scope: Phase 12 referral capture, first-party cookie, attribution binding,
commission engine integration, payout Connect path, and admin fraud controls.
Complements `docs/engineering/affiliate-cookie-model.md` and
`docs/engineering/affiliate-attribution.md`.

## Threat model (summary)

| Threat | Control | Residual risk |
| --- | --- | --- |
| Open redirect via `?to=` | Destination allowlist (`destinations.ts`) | New public paths must be added deliberately |
| Cookie stuffing / forced sets | Middleware requires document navigation (`Sec-Fetch-Dest: document`); `/api/ref` rate limit | Per-instance rate limit; durable edge limiter is a follow-up |
| Cookie tampering | HMAC-SHA256 signed opaque payload; reject bad signatures | Production must set `AFFILIATE_COOKIE_SECRET` |
| Self-referral | Blocked at org attribution bind and conversion eligibility | Sophisticated multi-account abuse still needs fraud review |
| Bot traffic inflation | UA classification; ineligible clicks do not attribute | Heuristic, not perfect |
| Commission double-pay | Unique commission keys; ledger idempotency keys; payout transfer idempotency | Operator error on manual settle still possible; step-up + confirm |
| Affiliate sees customer PII | RLS: identity tables service-role only; dashboards project aggregates | Miswritten future query could leak; review required |
| Org-admin privilege escalation into affiliate ops | Affiliate permissions separate from org roles; platform allowlist | Allowlist misconfiguration |
| Webhook forgery | Existing Stripe signature verification + billing inbox idempotency | Affiliate side effects ride the same verified path |
| Payout theft | Connect Express destination from stored profile; admin process + step-up | Compromised admin account |

## Cookie (`fj_ref`)

- First-party only. No third-party tracking domain.
- Payload: opaque session id, version, expiry. Signed when secret configured.
- HttpOnly, Secure in production, SameSite=Lax (see cookie module).
- Lifetime matches attribution window days from centralized config.
- Never stores affiliate code in cleartext in the cookie (session id only).

## Referral entry points

1. Public `?ref=` on allowlisted marketing paths → middleware rewrite to
   `/api/ref`.
2. `/api/ref` records click/session, sets cookie, redirects to resolved
   destination only.

Rejected: external absolute URLs, protocol-relative URLs, unknown paths.

## Attribution moments

- User attach: best-effort when session user is known.
- Org bind: on organization creation via `bindReferralOnOrgCreation` (does not
  block org create on failure).
- Lock: first paid Qualifying Subscription locks attribution; last-touch
  replacement stops.

Existing paid customers do not get a new eligible attribution for the same
organization.

## Authorization

- Affiliate dashboard: authenticated affiliate record required; membership
  state gates writes.
- Public program pages: gated by `programPublished` + feature stage; otherwise
  platform-admin preview or 404.
- Admin ops: `requirePlatformAdmin`; destructive fraud/payout/adjust actions
  also `requireStepUpAuthentication` when enforcement is enabled.
- Worker: bearer `AFFILIATE_WORKER_TOKEN`; disabled when unset (404).

## Money integrity

- Integer cents and basis points only.
- Ledger append-only with unique idempotency keys.
- Payout reservation (`payable` → `scheduled`) prevents double batching.
- Stripe transfers keyed `payout_item:{id}`.
- Failures revert reservation to `payable`.

## Logging and analytics

Never log or send to analytics: affiliate legal name/email as free text in
goals, customer identity, Stripe secrets, tax ids, bank numbers, full referral
URLs with PII, raw fraud evidence, IP addresses.

## Pre-launch checklist

- [ ] Set `AFFILIATE_COOKIE_SECRET` in production
- [ ] Set `AFFILIATE_WORKER_TOKEN` and schedule worker
- [ ] Configure Stripe Connect (`STRIPE_CONNECT_CLIENT_ID`) or accept manual
  payout ops
- [ ] Counsel review of Agreement + Privacy Notice drafts
- [x] Flip `programPublished` only after claims registry allows marketable
  program statements
- [ ] Durable rate limiter for `/api/ref`
- [ ] Consent gate for referral cookie where required
- [ ] RLS isolation tests against a test database

## Review status

Internal engineering review of implemented controls: 2026-07-17. Not a
penetration test or formal audit. No security certification is claimed.
