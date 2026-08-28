# Signed webhook verification walkthrough

Generic webhook alert channels can sign each delivery with HMAC-SHA256. Verify signatures on your endpoint before you act on a payload.

Full reference (including language examples): [Verify webhook signatures](https://fajita.io/docs/webhooks/signatures) on the product docs site.

## Sample request

Fictional endpoint only:

```http
POST /alerts/fajita HTTP/1.1
Host: example.com
Content-Type: application/json
Fajita-Signature: t=1760000000,kid=whsk_a1b2c3,v1=8f4e2c1b9d0a7e6f5c4b3a2918070605040302010f0e0d0c0b0a09080706
Fajita-Event-ID: evt_sample_01
Fajita-Event-Type: incident.opened
Fajita-Timestamp: 1760000000
Fajita-Schema-Version: 2026-08

{"id":"evt_sample_01","type":"incident.opened","organization_id":"org_sample","incident_id":"inc_sample","monitor_id":"mon_sample","severity":"critical","summary":"API returning 503"}
```

Signing secret (shown once when you enable signing on the channel):

```text
whsec_SAMPLE_ONLY_NOT_A_REAL_SECRET
```

## Verification steps

1. Read the **raw** request body as bytes or a string. Do not parse JSON first.
2. Parse `Fajita-Signature` into `t` (timestamp), `kid` (key id), and `v1` (hex signature).
3. Reject requests whose timestamp is outside your tolerance (for example, five minutes).
4. Build the signed input:

   ```text
   <kid>.<timestamp>.<event_id>.<raw_body>
   ```

   Example with the sample above (body truncated):

   ```text
   whsk_a1b2c3.1760000000.evt_sample_01.{"id":"evt_sample_01","type":"incident.opened",...}
   ```

   Use the exact `Fajita-Event-ID` header value as `event_id`.

5. Compute `hex(HMAC_SHA256(signing_secret, signed_input))`.
6. Compare your digest to `v1` with a constant-time comparison.
7. Process each `Fajita-Event-ID` at most once (retries reuse the same id).

## Node.js sketch

```javascript
import { createHmac, timingSafeEqual } from "node:crypto";

function verifyFajitaWebhook({ rawBody, headers, secret, toleranceSec = 300 }) {
  const sigHeader = headers["fajita-signature"] ?? "";
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const timestamp = Number(parts.t);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > toleranceSec) return false;

  const eventId = headers["fajita-event-id"];
  const signedInput = `${parts.kid}.${timestamp}.${eventId}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(signedInput).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1 ?? "");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
```

## Key rotation

The `kid` in the header identifies which signing secret produced the signature. During rotation, keep the previous secret active until deliveries stop using its `kid`.

## Related

- [Configuration](./CONFIGURATION.md)
- [Troubleshooting (webhooks)](./TROUBLESHOOTING.md#webhook-failing)
- [Product docs: Generic webhooks](https://fajita.io/docs/alerts/generic-webhooks)
