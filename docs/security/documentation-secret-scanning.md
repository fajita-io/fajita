# Documentation secret scanning

Internal. What the documentation pipeline scans for and blocks.

**Date:** 2026-07-17

## Scope

The generated public corpus (all LLM-eligible pages serialized to text) is
scanned during `npm run docs:validate`. A match fails the build.

## Patterns

| Category | Pattern intent |
| --- | --- |
| Em dash | `\u2014` anywhere in customer-facing text |
| Phase number | `phase <n>` |
| Internal terms | `cursor`, `supabase`, `clerk` |
| Stripe secret | `sk_live_` / `sk_test_` style |
| Webhook signing secret | `whsec_` followed by key material |
| Service role | `SERVICE_ROLE` strings |
| Private IP | `10.x`, `127.x`, `192.168.x` |
| Localhost URL | `http(s)://localhost` |

## Placeholder policy

Examples use explicit placeholders (`YOUR_API_TOKEN`,
`YOUR_WEBHOOK_SIGNING_SECRET`, `YOUR_HEARTBEAT_TOKEN`) that do not resemble real
secrets, so the scanner does not false-positive and readers cannot mistake a
placeholder for a live value.

## Not sent onward

Detected secrets are never forwarded to analytics. Search queries are separately
redacted before any logging (`redactQuery`).

## Extension

When screenshot capture is enabled, image assets must be scanned for embedded
secrets, emails, and real domains before they can be referenced. The block model
already records the source route to support that check.
