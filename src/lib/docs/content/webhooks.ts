import { WEBHOOK_SCHEMA_VERSION } from "@/lib/alerts/constants";

import { callout, code, h2, h3, ol, p, table, tabs, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const base = {
  category: "webhooks" as const,
  lastReviewedAt: "2026-07-17",
  owner: "docs-webhooks",
  reviewers: ["engineering", "security"],
  productVersion: "2026.07",
};

const NODE_EXAMPLE = `import crypto from "node:crypto";

// Header: Fajita-Signature: t=<timestamp>,kid=<key_id>,v1=<hex>
function parseSignature(header) {
  return Object.fromEntries(
    header.split(",").map((part) => {
      const [k, v] = part.split("=");
      return [k, v];
    }),
  );
}

// Call with the RAW request body string, not a re-serialized object.
export function verify(rawBody, headers, secret, { toleranceSeconds = 300 } = {}) {
  const sig = parseSignature(headers["fajita-signature"]);
  const eventId = headers["fajita-event-id"];
  const timestamp = Number(sig.t);

  // 1. Reject requests outside the allowed time window.
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > toleranceSeconds) {
    return false;
  }

  // 2. Recompute over the exact signed input.
  const signedInput = \`\${sig.kid}.\${timestamp}.\${eventId}.\${rawBody}\`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedInput)
    .digest("hex");

  // 3. Constant-time comparison.
  const a = Buffer.from(expected);
  const b = Buffer.from(sig.v1 ?? "");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}`;

const PYTHON_EXAMPLE = `import hashlib
import hmac
import time


def parse_signature(header: str) -> dict[str, str]:
    return dict(part.split("=", 1) for part in header.split(","))


# Pass the RAW request body bytes, not a re-serialized dict.
def verify(raw_body: bytes, headers: dict, secret: str, tolerance_seconds: int = 300) -> bool:
    sig = parse_signature(headers["fajita-signature"])
    event_id = headers["fajita-event-id"]
    timestamp = int(sig["t"])

    # 1. Reject requests outside the allowed time window.
    if abs(int(time.time()) - timestamp) > tolerance_seconds:
        return False

    # 2. Recompute over the exact signed input.
    signed_input = f"{sig['kid']}.{timestamp}.{event_id}.{raw_body.decode()}".encode()
    expected = hmac.new(secret.encode(), signed_input, hashlib.sha256).hexdigest()

    # 3. Constant-time comparison.
    return hmac.compare_digest(expected, sig.get("v1", ""))`;

const GO_EXAMPLE = `package fajita

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

func parseSignature(header string) map[string]string {
	out := map[string]string{}
	for _, part := range strings.Split(header, ",") {
		kv := strings.SplitN(part, "=", 2)
		if len(kv) == 2 {
			out[kv[0]] = kv[1]
		}
	}
	return out
}

// rawBody must be the exact bytes received, not re-marshaled JSON.
func Verify(rawBody []byte, headers map[string]string, secret string, tolerance time.Duration) bool {
	sig := parseSignature(headers["fajita-signature"])
	eventID := headers["fajita-event-id"]
	ts, err := strconv.ParseInt(sig["t"], 10, 64)
	if err != nil {
		return false
	}

	// 1. Reject requests outside the allowed time window.
	if d := time.Since(time.Unix(ts, 0)); d > tolerance || d < -tolerance {
		return false
	}

	// 2. Recompute over the exact signed input.
	signedInput := fmt.Sprintf("%s.%d.%s.%s", sig["kid"], ts, eventID, string(rawBody))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signedInput))
	expected := hex.EncodeToString(mac.Sum(nil))

	// 3. Constant-time comparison.
	return hmac.Equal([]byte(expected), []byte(sig["v1"]))
}`;

export const webhooksPages: DocPage[] = [
  defineDoc({
    meta: {
      ...base,
      slug: "webhooks/overview",
      title: "Webhooks overview",
      description:
        "How Fajita delivers signed event payloads to your endpoint, the envelope shape, and the current schema version.",
      model: "reference",
      pageType: "overview",
      order: 0,
      productArea: ["webhooks", "alerts"],
      keywords: ["webhook", "events", "payload", "signature", "schema version", "integration"],
      relatedPages: ["webhooks/event-types", "webhooks/payload", "webhooks/signatures"],
      searchBoost: 2,
    },
    body: [
      p("A generic webhook channel delivers event payloads to your HTTPS endpoint as things happen: incidents, maintenance, and monitor signals."),
      h2("What you receive"),
      ul([
        "A JSON envelope with a stable shape and a `schema_version`.",
        "Signature headers so you can verify the request came from Fajita.",
        "At-least-once delivery, so design your endpoint to be idempotent.",
      ]),
      h2("Schema version"),
      table(
        ["Field", "Value"],
        [
          ["Current schema version", `\`${WEBHOOK_SCHEMA_VERSION}\``],
          ["Signature algorithm", "HMAC-SHA256"],
          ["Content type", "`application/json`"],
        ],
      ),
      callout("note", [
        p("Set up the channel first: [Generic webhooks](/docs/alerts/generic-webhooks). Then verify signatures: [Verify webhook signatures](/docs/webhooks/signatures)."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "webhooks/event-types",
      title: "Webhook event types",
      description: "The event types Fajita can deliver, grouped by incidents, maintenance, and monitor signals.",
      model: "reference",
      pageType: "reference",
      order: 1,
      productArea: ["webhooks"],
      keywords: ["event types", "incident.opened", "maintenance", "ssl", "heartbeat", "flapping"],
      relatedPages: ["webhooks/payload"],
      searchBoost: 1,
    },
    body: [
      p("Each delivery carries a `type`. The event type is also sent in the `Fajita-Event-Type` header."),
      h3("Incident events"),
      table(
        ["Type", "Fires when"],
        [
          ["`incident.opened`", "A failure is confirmed and an incident opens"],
          ["`incident.updated`", "An operator posts an update or changes severity"],
          ["`incident.reopened`", "Failures return within the reopen window"],
          ["`incident.recovery_started`", "Checks begin passing and recovery is confirming"],
          ["`incident.resolved`", "Recovery is confirmed and the incident closes"],
        ],
      ),
      h3("Maintenance events"),
      table(
        ["Type", "Fires when"],
        [
          ["`maintenance.scheduled`", "A maintenance window is created"],
          ["`maintenance.started`", "A window begins"],
          ["`maintenance.updated`", "A window is edited"],
          ["`maintenance.completed`", "A window ends"],
          ["`maintenance.canceled`", "A window is canceled"],
        ],
      ),
      h3("Monitor signal events"),
      table(
        ["Type", "Fires when"],
        [
          ["`monitor.ssl_critical`", "A certificate crosses the critical expiry threshold"],
          ["`monitor.ssl_restored`", "A certificate returns to valid"],
          ["`monitor.heartbeat_missed`", "An expected heartbeat does not arrive"],
          ["`monitor.heartbeat_restored`", "Heartbeats resume"],
          ["`monitor.flapping`", "A monitor is detected flapping"],
        ],
      ),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "webhooks/payload",
      title: "Webhook payload",
      description: "The versioned event envelope, its stable fields, timestamp format, and unknown-field policy.",
      model: "reference",
      pageType: "reference",
      order: 2,
      productArea: ["webhooks"],
      keywords: ["payload", "envelope", "json", "fields", "schema", "example"],
      relatedPages: ["webhooks/event-types", "webhooks/signatures"],
    },
    body: [
      h2("Envelope"),
      p("Every event uses the same outer shape. The `data` object varies by event type."),
      code(
        "json",
        `{
  "id": "evt_01JEXAMPLE",
  "type": "incident.opened",
  "created_at": "2026-07-15T22:15:00Z",
  "schema_version": "${WEBHOOK_SCHEMA_VERSION}",
  "organization": {
    "id": "org_public_reference",
    "name": "Example Org"
  },
  "data": {
    "incident": {
      "id": "inc_public_reference",
      "title": "Checkout API is unavailable",
      "severity": "major",
      "status": "down",
      "opened_at": "2026-07-15T22:14:00Z"
    }
  }
}`,
        "incident.opened (fixture identifiers)",
      ),
      h2("Fields"),
      table(
        ["Field", "Type", "Notes"],
        [
          ["`id`", "string", "Unique event id. Use as your idempotency key."],
          ["`type`", "string", "One of the documented event types."],
          ["`created_at`", "string", "ISO 8601 UTC timestamp."],
          ["`schema_version`", "string", "Date-based version of the envelope."],
          ["`organization`", "object", "Public organization reference."],
          ["`data`", "object", "Event-specific payload."],
        ],
      ),
      h2("Compatibility"),
      ul([
        "Timestamps are ISO 8601 in UTC.",
        "New fields may be added without a version bump. Ignore unknown fields.",
        "A field is only removed with a schema version change and advance notice.",
      ]),
      callout("security", [
        p("Payloads never contain secrets, tokens, or internal identifiers. Identifiers shown are stable public references."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "webhooks/signatures",
      title: "Verify webhook signatures",
      description:
        "Verify that a webhook came from Fajita using HMAC-SHA256, a timestamp window, and constant-time comparison.",
      model: "reference",
      pageType: "reference",
      order: 3,
      productArea: ["webhooks", "security"],
      keywords: ["signature", "verify", "hmac", "sha256", "constant time", "replay", "raw body"],
      relatedPages: ["webhooks/retries", "security/webhook-security"],
      searchBoost: 3,
    },
    body: [
      p("Every generic webhook can be signed. Verify the signature before you trust a payload."),
      h2("Signature headers"),
      table(
        ["Header", "Contains"],
        [
          ["`Fajita-Signature`", "`t=<timestamp>,kid=<key_id>,v1=<hex signature>`"],
          ["`Fajita-Event-ID`", "The event id, used in the signed input and for idempotency"],
          ["`Fajita-Event-Type`", "The event type"],
          ["`Fajita-Timestamp`", "The signing timestamp (also in the signature header)"],
          ["`Fajita-Schema-Version`", "The payload schema version"],
        ],
      ),
      h2("The signed input"),
      p("The signature is computed over a single string built from the key id, timestamp, event id, and the raw request body:"),
      code("text", "<key_id>.<timestamp>.<event_id>.<raw_body>", "Signed input"),
      code("text", "signature = hex( HMAC_SHA256(signing_secret, signed_input) )", "Signature"),
      callout("warning", [
        p("Sign over the raw request body exactly as received. Do not parse and re-serialize the JSON first, or the bytes will differ and verification will fail."),
      ]),
      h2("Verification steps"),
      ol([
        "Read the raw request body.",
        "Parse the `Fajita-Signature` header into `t`, `kid`, and `v1`.",
        "Reject the request if the timestamp is outside your allowed window (for example, five minutes).",
        "Build the signed input string.",
        "Compute the HMAC-SHA256 with the signing secret for the given `kid`.",
        "Compare your value to `v1` using a constant-time comparison.",
        "Record the event id and process each event only once.",
      ]),
      h2("Key rotation"),
      p("The `kid` in the header tells you which signing key produced the signature. During rotation, keep the previous secret active until you stop receiving its `kid`."),
      callout("security", [
        p("Do not log the signing secret. `YOUR_WEBHOOK_SIGNING_SECRET` in examples is a placeholder, never a real key."),
      ]),
      h2("Examples"),
      p("Each example uses the raw body, validates the timestamp, and compares in constant time."),
      tabs([
        { label: "Node.js", body: [code("javascript", NODE_EXAMPLE, "verify.js")] },
        { label: "Python", body: [code("python", PYTHON_EXAMPLE, "verify.py")] },
        { label: "Go", body: [code("go", GO_EXAMPLE, "verify.go")] },
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "webhooks/retries",
      title: "Webhook retries and idempotency",
      description: "Which responses are retried, the backoff schedule, dead letters, and handling duplicate events.",
      model: "reference",
      pageType: "reference",
      order: 4,
      productArea: ["webhooks"],
      keywords: ["retry", "idempotency", "duplicate", "dead letter", "backoff", "ordering"],
      relatedPages: ["alerts/retries-and-dead-letters", "webhooks/signatures"],
    },
    body: [
      h2("Responses"),
      table(
        ["Response", "Behavior"],
        [
          ["2xx", "Treated as delivered"],
          ["Timeout or 5xx", "Retried with backoff"],
          ["408 or 429", "Retried with backoff"],
          ["Other 4xx", "Treated as a permanent failure (not retried)"],
        ],
      ),
      h2("Backoff and dead letters"),
      ul([
        "Fajita retries with increasing delays up to a maximum number of attempts.",
        "After the final attempt, the delivery moves to a dead-letter state.",
        "You can inspect and manually retry a dead-lettered delivery.",
      ]),
      h2("Idempotency and ordering"),
      callout("warning", [
        p("Your endpoint may receive the same event more than once. Use the event id as an idempotency key and process each event once."),
      ]),
      p("Delivery is at-least-once and Fajita does not guarantee strict global ordering. Use timestamps and event ids to reconcile state."),
    ],
  }),
];
