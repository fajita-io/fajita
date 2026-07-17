# Phase 9 subscriber data map

What subscriber data Fajita collects, why, where it lives, and how it is
deleted. Fajita is the service provider that delivers email on behalf of the
customer who controls the status page.

## Data collected

| Data | Purpose | Storage | Retention |
| --- | --- | --- | --- |
| Email address | Deliver confirmed operational updates | `encrypted_email` (AES-256-GCM); `email_normalized` (sensitive, admin/import path) | Until unsubscribe + deletion policy, or deletion request |
| Email hash | Duplicate detection, suppression lookup | `email_hash` (keyed HMAC) | Retained for suppression even after deletion, to prevent re-adding |
| Consent record | Evidence of lawful, versioned consent | `status_page_subscriber_consent_records` | Life of subscription + legally appropriate period |
| Preferences + components | Deliver only what was chosen | `status_page_subscriber_event_prefs`, `status_page_subscriber_components` | Life of subscription |
| Confirmation state | Double opt-in | subscriber row | Cleared on confirm |
| Delivery history | Operational troubleshooting, deliverability | intents / attempts | Plan-ready retention; anonymized on deletion |
| Bounce / complaint state | Suppression, deliverability health | subscriber row + provider events | Retained as needed to prevent unwanted email |
| Provider message id | Correlate callbacks | intents / provider events | Pruned after reconciliation |
| Consent IP hash, UA summary | Consent evidence (only when justified) | subscriber row | With consent record |

## Not collected

Phone number, name, company, job title, marketing profile, cross-site behavior,
device fingerprint. Open tracking is **not** implemented and is off by design.

## Access

- Anonymous public: none (RLS deny).
- Member: aggregate counts + masked list only.
- Admin: full addresses, management, suppression, import, export.
- Owner: all of the above plus deletion.
- Fajita platform admin: reconciliation and diagnostics without exposing raw
  secrets.

## Deletion

- **Subscriber request** (preference center): stops future delivery, moves to
  `pending_deletion`, rotates `link_token_version` (kills all links). Erasure /
  anonymization runs in the deletion sweep; a suppression hash is preserved so
  the address is not re-added by import.
- **Status-page deletion / org deletion**: cascades stop fan-out and delivery
  and revoke tokens; complaint / suppression evidence is preserved as required.

## Subprocessors

- Supabase (Postgres storage).
- Resend (email delivery + bounce/complaint callbacks).

The public-facing subscriber privacy notice must reflect this map. A customer's
own notice URL is configured per status page (`subscriber_privacy_url`).
