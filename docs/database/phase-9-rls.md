# Phase 9 row-level security

Migration `20260723000200_phase9_subscriber_rls.sql` enables RLS on every Phase
9 table.

## Principles

- **PII tables are service-role only.** `status_page_subscribers` and
  `status_page_subscriber_consent_records` hold addresses and consent evidence;
  no authenticated customer policy grants direct read. The app reads them
  through permissioned server code using the service client, which masks by
  default and only reveals full addresses to `subscribers:read_sensitive`.
- **Operational tables are readable by org members.** Events, intents,
  attempts, dead letters, suppressions, and provider events carry no raw
  address, so authenticated members of the owning org may `SELECT` them (via
  `app.is_org_member`). Writes remain service-role only, so a customer cannot
  forge a delivery outcome, a confirmation, or a suppression removal.
- **Anonymous public users read nothing.** The public subscribe/confirm/
  preference/unsubscribe flows never query these tables from the browser; they
  post to server endpoints that use the service role after validating a token
  or page state.

## Defense in depth

Workers use the service role and bypass RLS by design; RLS is the second line,
not the only gate. Every server query is also explicitly scoped by
`organization_id` and `status_page_id`. An automated RLS regression suite is
listed as deferred in the Phase 9 handoff.
