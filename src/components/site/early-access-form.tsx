"use client";

import { useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";

/**
 * Early-access email capture. One field, honeypot, explicit success and
 * failure states. Never claims an account or monitor was created.
 */
export function EarlyAccessForm({ source = "signup" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent" }
    | { kind: "failed"; detail: string }
  >({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setStatus({ kind: "sending" });

    const honeypot =
      (e.currentTarget.elements.namedItem("company") as HTMLInputElement | null)
        ?.value ?? "";

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), company: honeypot, source }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setStatus({ kind: "sent" });
      } else {
        setStatus({
          kind: "failed",
          detail: data.error ?? "That did not save. Try again in a moment.",
        });
      }
    } catch {
      setStatus({
        kind: "failed",
        detail: "That did not save. Try again in a moment.",
      });
    }
  };

  if (status.kind === "sent") {
    return (
      <div className="fj-form-status fj-form-status--success" role="status">
        <strong>You are on the list.</strong> When accounts open, yours is
        one of the first invitations we send. No newsletter, no drip
        sequence; one email when it is ready.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: "var(--space-4)" }}>
      <div className="fj-field">
        <label htmlFor={`ea-email-${source}`}>Email</label>
        <input
          id={`ea-email-${source}`}
          className="fj-input"
          type="email"
          autoComplete="email"
          required
          placeholder="you@yourcompany.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `ea-email-error-${source}` : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error ? (
          <p id={`ea-email-error-${source}`} className="fj-field__error">
            {error}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from people and assistive tech. */}
      <div className="fj-hp" aria-hidden="true">
        <label htmlFor={`ea-company-${source}`}>Company</label>
        <input
          id={`ea-company-${source}`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status.kind === "failed" ? (
        <div className="fj-form-status fj-form-status--error" role="alert">
          {status.detail}
        </div>
      ) : null}

      <div>
        <BrandButton type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Saving…" : "Get early access"}
        </BrandButton>
      </div>

      <p className="fj-caption">
        Used once, to invite you when accounts open. Nothing else.
      </p>
    </form>
  );
}
