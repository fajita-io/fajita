"use client";

import { useId, useState } from "react";

/**
 * Public subscribe form. Lightweight by design: a single fetch to the subscribe
 * endpoint, no email SDK, no third-party script. The response is always neutral
 * ("check your inbox"), so this component never reveals whether an address is
 * already subscribed. Component selection maps to public slugs only; internal
 * ids never touch the browser.
 */

interface ComponentOption {
  slug: string;
  name: string;
}

export function SubscribeForm({
  slug,
  components,
}: {
  slug: string;
  components: ComponentOption[];
}) {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [incidentUpdates, setIncidentUpdates] = useState(true);
  const [maintenanceUpdates, setMaintenanceUpdates] = useState(true);
  const [scope, setScope] = useState<"all" | "selected">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = email.trim().length > 3 && state !== "sending";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/status-subscriptions/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          email,
          website,
          allComponents: scope === "all",
          componentSlugs: scope === "selected" ? [...selected] : [],
          incidentUpdates,
          maintenanceUpdates,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        suggestion?: string;
      };
      if (res.ok && data.ok) {
        setState("done");
        setMessage(data.message ?? "Check your inbox for a confirmation link.");
      } else {
        setState("error");
        setMessage(
          data.suggestion
            ? `${data.message ?? "Enter a valid email address."} Did you mean ${data.suggestion}?`
            : data.message ?? "Something went wrong. Try again.",
        );
      }
    } catch {
      setState("error");
      setMessage("We could not reach the server. Try again in a moment.");
    }
  }

  if (state === "done") {
    return (
      <section className="sp-subscribe" aria-label="Subscribe to updates">
        <p className="sp-section__title">Subscribe to updates</p>
        <p className="sp-subscribe__note" role="status">
          {message} We only send operational incident and maintenance email, and
          you can unsubscribe from any message.
        </p>
      </section>
    );
  }

  return (
    <section className="sp-subscribe" aria-label="Subscribe to updates">
      <form onSubmit={submit} noValidate>
        <label className="sp-section__title" htmlFor={emailId}>
          Subscribe to updates
        </label>
        <p className="sp-subscribe__note" style={{ marginTop: "4px" }}>
          Receive email when this page publishes an incident, an update, a
          resolution, or scheduled maintenance.
        </p>

        <div
          style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}
        >
          <input
            id={emailId}
            className="sp-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={state === "error"}
            style={{ flex: "1 1 12rem" }}
          />
          <button
            type="submit"
            className="sp-btn"
            disabled={!canSubmit}
            aria-busy={state === "sending"}
          >
            {state === "sending" ? "Sending…" : "Subscribe"}
          </button>
        </div>

        {/* Honeypot: hidden from users and assistive tech, catches bots. */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
          <label>
            Website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        <fieldset
          style={{ border: 0, padding: 0, margin: "12px 0 0" }}
        >
          <legend className="sp-subscribe__note" style={{ marginBottom: "4px" }}>
            Which updates
          </legend>
          <label
            className="sp-subscribe__note"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <input
              type="checkbox"
              checked={incidentUpdates}
              onChange={(e) => setIncidentUpdates(e.target.checked)}
            />
            Incident updates
          </label>
          <label
            className="sp-subscribe__note"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <input
              type="checkbox"
              checked={maintenanceUpdates}
              onChange={(e) => setMaintenanceUpdates(e.target.checked)}
            />
            Maintenance updates
          </label>
        </fieldset>

        {components.length > 0 ? (
          <fieldset style={{ border: 0, padding: 0, margin: "12px 0 0" }}>
            <legend
              className="sp-subscribe__note"
              style={{ marginBottom: "4px" }}
            >
              Which components
            </legend>
            <label
              className="sp-subscribe__note"
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
            >
              <input
                type="radio"
                name="sp-scope"
                checked={scope === "all"}
                onChange={() => setScope("all")}
              />
              All components
            </label>
            <label
              className="sp-subscribe__note"
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
            >
              <input
                type="radio"
                name="sp-scope"
                checked={scope === "selected"}
                onChange={() => setScope("selected")}
              />
              Only the components I select
            </label>
            {scope === "selected" ? (
              <div style={{ paddingLeft: "24px", marginTop: "4px" }}>
                {components.map((c) => (
                  <label
                    key={c.slug}
                    className="sp-subscribe__note"
                    style={{ display: "flex", gap: "8px", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(c.slug)}
                      onChange={(e) => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(c.slug);
                          else next.delete(c.slug);
                          return next;
                        });
                      }}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            ) : null}
          </fieldset>
        ) : null}

        <p className="sp-subscribe__note" style={{ marginTop: "12px" }}>
          By subscribing, you agree to receive operational incident and
          maintenance email from this status page. Confirmation is required. You
          can update your preferences or unsubscribe at any time. This is not
          marketing email.
        </p>

        {state === "error" && message ? (
          <p className="sp-subscribe__note" role="alert" style={{ color: "#b42318" }}>
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
