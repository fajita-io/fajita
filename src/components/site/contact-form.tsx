"use client";

import { useState } from "react";

import { BrandButton } from "@/components/design-system/primitives";
import { trackGoalOnce } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import { contactTopics, type ContactTopicId } from "@/lib/site/site-config";

interface FieldErrors {
  email?: string;
  message?: string;
}

/**
 * Contact form: accessible labels, inline validation, honeypot, explicit
 * success and failure states that never erase input.
 */
export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const validInitial = contactTopics.some((t) => t.id === initialTopic)
    ? (initialTopic as ContactTopicId)
    : "product";

  const [topic, setTopic] = useState<ContactTopicId>(validInitial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; detail: string }
  >({ kind: "idle" });

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      next.email = "Enter a valid email address so we can reply.";
    }
    if (message.trim().length < 10) {
      next.message = "Say a little more. At least 10 characters.";
    }
    return next;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus({ kind: "sending" });
    const form = e.currentTarget;
    const honeypot =
      (form.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          company: honeypot,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setStatus({ kind: "sent" });
      } else {
        setStatus({
          kind: "failed",
          detail: data.error ?? "That did not send. Your message is still here; try again.",
        });
      }
    } catch {
      setStatus({
        kind: "failed",
        detail: "That did not send. Your message is still here; try again.",
      });
    }
  };

  if (status.kind === "sent") {
    return (
      <div className="fj-form-status fj-form-status--success" role="status">
        <strong>Message sent.</strong> A person reads every one. We aim to
        reply within a few business days; security reports get priority.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      style={{ display: "grid", gap: "var(--space-5)", maxWidth: "34rem" }}
      onFocusCapture={() => trackGoalOnce(DataFastGoals.contactStarted)}
    >
      <div className="fj-field">
        <label htmlFor="contact-topic">Topic</label>
        <select
          id="contact-topic"
          className="fj-select"
          value={topic}
          onChange={(e) => setTopic(e.target.value as ContactTopicId)}
        >
          {contactTopics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="fj-field">
        <label htmlFor="contact-name">Name (optional)</label>
        <input
          id="contact-name"
          className="fj-input"
          type="text"
          autoComplete="name"
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="fj-field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          className="fj-input"
          type="email"
          autoComplete="email"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email ? (
          <p id="contact-email-error" className="fj-field__error">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="fj-field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          className="fj-textarea"
          required
          maxLength={5000}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {errors.message ? (
          <p id="contact-message-error" className="fj-field__error">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from people and assistive tech. */}
      <div className="fj-hp" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
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

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <BrandButton type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : "Send message"}
        </BrandButton>
        <span className="fj-caption" style={{ maxWidth: "18rem" }}>
          Used only to read and answer your message. No mailing lists.
        </span>
      </div>
    </form>
  );
}
