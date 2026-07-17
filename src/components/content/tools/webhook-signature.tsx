"use client";

import { useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import {
  generateWebhookSignature,
  verifyWebhookSignature,
} from "@/lib/content/tools/engines/webhook-signature";

export function WebhookSignatureTool() {
  const [mode, setMode] = useState<"generate" | "verify">("generate");
  const [secret, setSecret] = useState("");
  const [rawBody, setRawBody] = useState('{"ok":true}');
  const [timestamp, setTimestamp] = useState(() =>
    String(Math.floor(Date.now() / 1000)),
  );
  const [signature, setSignature] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function clearAll() {
    setSecret("");
    setRawBody("");
    setSignature("");
    setOutput(null);
    setError(null);
  }

  async function run() {
    setError(null);
    setOutput(null);
    trackGoal(DataFastGoals.toolStarted, { tool: "webhook-signature" });
    try {
      if (!secret) {
        setError("Enter a signing secret. Do not use a production secret on an untrusted device.");
        trackGoal(DataFastGoals.toolValidationFailed, { tool: "webhook-signature" });
        return;
      }
      if (mode === "generate") {
        const result = await generateWebhookSignature({
          secret,
          rawBody,
          timestamp,
        });
        setOutput(
          `Signed message: ${result.signedMessage}\nSignature (hex): ${result.signature}\nHeader form: sha256=${result.signature}`,
        );
      } else {
        if (!signature) {
          setError("Enter the signature to verify.");
          return;
        }
        const result = await verifyWebhookSignature({
          secret,
          rawBody,
          timestamp,
          signature,
        });
        setOutput(
          result.valid
            ? `Valid. Expected ${result.expected}`
            : `Invalid. Expected ${result.expected}`,
        );
      }
      trackGoal(DataFastGoals.toolCompleted, { tool: "webhook-signature" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not compute signature.");
    }
  }

  return (
    <div className="fj-tool">
      <p className="fj-body-sm fj-tool__privacy">
        Secrets and payloads stay in this browser. Nothing is sent to Fajita
        servers. Do not paste a production signing secret into a device you do
        not trust.
      </p>
      <div className="fj-tool__form">
        <fieldset>
          <legend>Mode</legend>
          <label>
            <input
              type="radio"
              checked={mode === "generate"}
              onChange={() => setMode("generate")}
            />{" "}
            Generate
          </label>
          <label>
            <input
              type="radio"
              checked={mode === "verify"}
              onChange={() => setMode("verify")}
            />{" "}
            Verify
          </label>
        </fieldset>
        <label>
          Signing secret
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </label>
        <label>
          Timestamp
          <input value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
        </label>
        <label>
          Raw body
          <textarea
            value={rawBody}
            onChange={(e) => setRawBody(e.target.value)}
            rows={5}
            spellCheck={false}
          />
        </label>
        {mode === "verify" ? (
          <label>
            Signature
            <input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              spellCheck={false}
            />
          </label>
        ) : null}
      </div>
      <div className="fj-tool__actions">
        <button type="button" className="fj-button fj-button--primary" onClick={run}>
          {mode === "generate" ? "Generate signature" : "Verify signature"}
        </button>
        <button type="button" className="fj-button fj-button--secondary" onClick={clearAll}>
          Clear
        </button>
      </div>
      {error ? <p className="fj-form-error">{error}</p> : null}
      {output ? (
        <pre className="fj-tool__output" tabIndex={0}>
          {output}
        </pre>
      ) : null}
    </div>
  );
}
