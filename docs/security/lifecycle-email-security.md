# Lifecycle email security

Phase 11. Controls on every lifecycle send.

## Recipient controls

- Eligibility is checked at intent creation and re-checked at send time:
  active organization membership, verified email, message-class preference,
  and the suppression ledger (`checkRecipientEligibility`).
- Removed members and suppressed users are silenced automatically; the
  intent is marked `suppressed` with a reason, never silently dropped.
- Hard bounces and complaints suppress all optional classes immediately
  (`lifecycle_suppressions`); required security and legal notices follow
  policy and the account email is never altered silently.

## Content controls

- Templates are code (versioned renderers), not editable HTML. There is no
  customer-supplied template path, so no template injection surface.
- All interpolated customer content passes through `escapeHtml`; a unit
  test injects hostile markup and asserts it renders escaped.
- No monitor secrets, full sensitive URLs, subscriber data, internal
  incident notes, raw response bodies, or billing card details appear in
  any template. Payload readers are defensive (`str`, `num`, `bool`).
- No JavaScript, no forms, no external trackers; `List-Unsubscribe` on
  optional classes only.

## Link controls

Deep links are constructed from fixed route constants against the
application origin. No authenticated session tokens appear in URLs; email
links land on authenticated surfaces. Redirects are not used.

## Delivery controls

- The sender identity is the verified transactional address from
  `ALERT_EMAIL_FROM` with class-appropriate display names ("Fajita",
  "Fajita Reports"); customer domains are never spoofed.
- Delivery workers run with the restricted worker token and service-role
  RPCs; provider API keys never reach the client bundle.
- Attempts store safe summaries only (bounded `safe_summary`, error
  category, HTTP status); raw provider responses are not persisted.
