# Subscriber system security review (Phase 9)

Status of each control required by the Phase 9 brief. "Implemented" means code
exists and is exercised; "Partial" and "Deferred" are called out honestly.

## Data protection

| Control | Status | Notes |
| --- | --- | --- |
| Email addresses encrypted at rest | Implemented | AES-256-GCM envelope via the platform keyring (`email-crypto.ts`). Plaintext column `email_normalized` retained for the current admin/import path and treated as sensitive; a later migration can drop it once encrypted-search is the sole path. |
| Duplicate detection uses a safe hash | Implemented | Keyed HMAC-SHA256 (`emailHash`), not a plain digest. Unit-tested. |
| Confirmation tokens hashed | Implemented | Only `confirmation_token_hash` stored; single use; 48h expiry. |
| Preference/unsubscribe tokens safe | Implemented | Stateless HMAC, no raw token stored, revocable via `link_token_version`. |
| Tokens excluded from logs/analytics/referrer | Implemented | Never logged; public token pages set `referrer: no-referrer` and `noindex`. |

## Access control

| Control | Status | Notes |
| --- | --- | --- |
| Anonymous users cannot read subscriber records | Implemented | RLS denies; public writes only through server endpoints using the service role. |
| Cross-tenant / cross-status-page access blocked | Implemented | Every query scoped by `organization_id` + `status_page_id`; RLS policies bind to org membership. |
| Members do not see full addresses | Implemented | `subscribers:read_summary` (member) returns counts + masked list; `subscribers:read_sensitive` (admin) required for full display. |
| Customers cannot forge confirmation / consent / delivery outcomes | Implemented | Confirmation and delivery outcome tables are service-role write only; RLS blocks customer writes. Operator actions never create consent. |
| Complaint / hard-bounce suppression cannot be bypassed | Implemented | `operatorUnsubscribe` refuses terminal states; suppression overrides preferences, resubscribe, and manual send in the SQL. |

## Provider callbacks

| Control | Status | Notes |
| --- | --- | --- |
| Signature verified | Implemented | Svix HMAC over `id.timestamp.body` (`verifyResendSignature`), unit-tested. |
| Timestamp / replay protection | Implemented | 300s tolerance window. |
| Idempotency | Implemented | Unique `(provider, provider_event_id)`; duplicate callback is a no-op. |
| Fail closed | Implemented | No secret configured or bad signature -> 404 / 401, no action. |
| Full payload not retained | Implemented | Only a mapped classification + bounded safe summary stored. |

## Content boundary

| Control | Status | Notes |
| --- | --- | --- |
| Internal notes / private evidence never emailed | Implemented | `emitSubscriberEvent` accepts only an allowlisted public payload. |
| Arbitrary customer HTML/CSS/JS blocked | Implemented | Templates are code; branding is bounded (name, logo, accent hex validated, links). No tracking pixel. |
| Marketing content excluded | Implemented | Templates carry only operational content + restrained "delivered by Fajita" footer. |
| No em dashes in customer copy | Implemented | Templates and public copy reviewed. |

## Import / export

| Control | Status | Notes |
| --- | --- | --- |
| Import file security, formula-injection guard, background processing | **Deferred** | Import/export job tables and RLS exist; the upload UI, parser, consent attestation, and CSV-safety encoder are not built in this pass. See handoff "Items deferred". |

## RLS

Enabled on all Phase 9 tables (`20260723000200_phase9_subscriber_rls.sql`). PII
tables (subscribers, consent records) are service-role only; non-PII operational
tables allow authenticated org members to read. Automated RLS test suite is
**deferred** (documented in the handoff); policies were reviewed by hand.
