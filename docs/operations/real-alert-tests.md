# real alert tests

**Date:** 2026-07-27  
**Owner:** operations

## Status: PASSED (2026-07-27)

Run: `npm run launch:alert-fixture`

| Channel | Result | Notes |
| --- | --- | --- |
| Email (Resend) | delivered | Production `alerts@fajita.io` sender |
| Slack | delivered | Slack Block Kit payload to receiver |
| Discord | delivered | Embed payload to receiver |
| Signed webhook | delivered | HMAC-signed JSON body |

When env URLs are unset, the fixture provisions temporary webhook.site receivers and confirms delivery.

Production alert worker: `POST /api/internal/alerts/run` returns HTTP 200.
