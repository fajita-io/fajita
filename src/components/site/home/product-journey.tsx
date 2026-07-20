"use client";

import { useMemo, useState } from "react";

import { BrandButton, BrandButtonLink, ChannelChip } from "@/components/design-system/primitives";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { StatusDot } from "@/components/design-system/status/status-badge";
import { UptimeChart, type UptimeDay } from "@/components/design-system/uptime-chart";
import { trackGoalOnce } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import { cta } from "@/lib/site/site-config";

/* ------------------------------------------------------------------ */
/* Fixture data: no user-supplied URLs, no network requests, ever.     */
/* ------------------------------------------------------------------ */

const endpoints = [
  { id: "site", label: "mesa-labs.dev", meta: "marketing site", kind: "Website" },
  { id: "api", label: "api.mesa-labs.dev/v1/health", meta: "API endpoint", kind: "API" },
  { id: "cron", label: "nightly-backup", meta: "heartbeat · every 24h", kind: "Cron" },
] as const;

const frequencies = [
  { id: "30s", label: "Every 30 seconds", meta: "fastest detection" },
  { id: "1m", label: "Every minute", meta: "the usual choice" },
  { id: "5m", label: "Every 5 minutes", meta: "for quiet services" },
] as const;

const channels = [
  { id: "slack", label: "Slack", meta: "#ops-alerts" },
  { id: "email", label: "Email", meta: "team@mesa-labs.dev" },
  { id: "discord", label: "Discord", meta: "#alerts" },
  { id: "webhook", label: "Webhook", meta: "signed JSON POST" },
] as const;

type EndpointId = (typeof endpoints)[number]["id"];
type FrequencyId = (typeof frequencies)[number]["id"];
type ChannelId = (typeof channels)[number]["id"];

const stepTitles = [
  "Add a monitor",
  "Set the schedule",
  "Test the check",
  "Choose alerts",
  "Publish a status page",
  "A failure happens",
  "The team hears first",
  "Resolve and recover",
  "The record remains",
] as const;

function journeyDays(): UptimeDay[] {
  const days: UptimeDay[] = [];
  const start = new Date("2026-07-16T00:00:00Z");
  for (let i = 89; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      status: i === 0 ? "down" : "operational",
    });
  }
  return days;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * The signature interactive section: the complete future Fajita journey,
 * simulated locally. No account, no backend writes, no network requests,
 * no user-supplied URLs. Deterministic fixtures only. The demo never
 * claims a real monitor was created; the closing step hands off to signup.
 */
export function ProductJourney() {
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [endpoint, setEndpoint] = useState<EndpointId>("api");
  const [frequency, setFrequency] = useState<FrequencyId>("1m");
  const [channel, setChannel] = useState<ChannelId>("slack");
  const [tested, setTested] = useState(false);
  const [published, setPublished] = useState(false);
  const [failed, setFailed] = useState(false);
  const [resolved, setResolved] = useState(false);

  const chosenEndpoint = endpoints.find((e) => e.id === endpoint)!;
  const chosenFrequency = frequencies.find((f) => f.id === frequency)!;
  const chosenChannel = channels.find((c) => c.id === channel)!;

  const go = (next: number) => {
    if (next === step) return;
    trackGoalOnce(DataFastGoals.demoStarted, { demo: "journey" });
    if (next === stepTitles.length - 1) {
      trackGoalOnce(DataFastGoals.demoCompleted, { demo: "journey" });
    }
    setStep(next);
    setMaxVisited((m) => Math.max(m, next));
  };

  const reset = () => {
    setStep(0);
    setMaxVisited(0);
    setEndpoint("api");
    setFrequency("1m");
    setChannel("slack");
    setTested(false);
    setPublished(false);
    setFailed(false);
    setResolved(false);
  };

  const canContinue = useMemo(() => {
    if (step === 2) return tested;
    if (step === 4) return published;
    if (step === 5) return failed;
    if (step === 7) return resolved;
    return step < stepTitles.length - 1;
  }, [step, tested, published, failed, resolved]);

  return (
    <div className="fj-journey">
      <div className="fj-journey__inner">
        <div role="group" aria-label="Journey steps" className="fj-journey__nav">
          {stepTitles.map((title, i) => (
            <button
              key={title}
              type="button"
              className="fj-journey__step"
              aria-current={i === step ? "step" : undefined}
              data-done={i < step || undefined}
              disabled={i > maxVisited}
              onClick={() => go(i)}
            >
              <span className="fj-journey__step-index" aria-hidden>
                {i < step ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              {title}
            </button>
          ))}
        </div>

        <div>
          <div className="fj-journey__stage" aria-live="polite">
            {step === 0 ? (
              <>
                <StageHead
                  title="Add something worth watching."
                  body="Pick a service. In the product this is a URL and a name; here, three ready-made examples."
                />
                <div className="fj-choice-grid">
                  {endpoints.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="fj-choice"
                      aria-pressed={endpoint === e.id}
                      onClick={() => setEndpoint(e.id)}
                    >
                      <span className="fj-choice__name">{e.label}</span>
                      <span className="fj-choice__meta">
                        {e.kind} · {e.meta}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <StageHead
                  title="Decide how often Fajita knocks."
                  body="Faster checks mean earlier detection. The right answer depends on how quickly you need to know."
                />
                <div className="fj-choice-grid">
                  {frequencies.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="fj-choice"
                      aria-pressed={frequency === f.id}
                      onClick={() => setFrequency(f.id)}
                    >
                      <span className="fj-choice__name">{f.label}</span>
                      <span className="fj-choice__meta">{f.meta}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <StageHead
                  title="Prove the check works before trusting it."
                  body="One test request, run on demand. In the product this hits your real endpoint; here it is a simulation."
                />
                {tested ? (
                  <pre className="fj-console" aria-label="Test check result">
                    <span className="fj-console__line">
                      test check · {chosenEndpoint.label}
                    </span>
                    <span className="fj-console__line fj-console__line--ok">
                      → 200 OK · 184 ms
                    </span>
                    <span className="fj-console__line fj-console__line--ok">
                      assertions passed · monitor ready
                    </span>
                  </pre>
                ) : (
                  <div>
                    <BrandButton variant="secondary" onClick={() => setTested(true)}>
                      Run a test check
                    </BrandButton>
                  </div>
                )}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <StageHead
                  title="Choose who hears about it."
                  body="Verified incidents route to the channels your team already watches. Pick one for this run; the product allows several at once."
                />
                <div className="fj-choice-grid">
                  {channels.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="fj-choice"
                      aria-pressed={channel === c.id}
                      onClick={() => setChannel(c.id)}
                    >
                      <span className="fj-choice__name">{c.label}</span>
                      <span className="fj-choice__meta">{c.meta}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <StageHead
                  title="Give customers somewhere to look."
                  body="One click publishes a status page with your components on it. Custom domain and branding come with it."
                />
                {published ? (
                  <div className="fj-card fj-journey-card">
                    <div className="fj-journey-card__row">
                      <span className="fj-mono">
                        status.mesa-labs.dev
                      </span>
                      <StatusBadge status="operational" label="Live" />
                    </div>
                    <div className="fj-journey-card__status">
                      <StatusDot status="operational" />
                      <span className="fj-body-sm">{chosenEndpoint.label} · Operational</span>
                    </div>
                    <p className="fj-caption">
                      Published. Subscribers can now follow incidents and recoveries.
                    </p>
                  </div>
                ) : (
                  <div>
                    <BrandButton variant="secondary" onClick={() => setPublished(true)}>
                      Publish the status page
                    </BrandButton>
                  </div>
                )}
              </>
            ) : null}

            {step === 5 ? (
              <>
                <StageHead
                  title="Now break it."
                  body="Somewhere, a deploy goes wrong. Trigger the failure and watch what Fajita does instead of panicking."
                />
                {failed ? (
                  <pre className="fj-console" aria-label="Failure detection log">
                    <span className="fj-console__line fj-console__line--bad">
                      check failed · {chosenEndpoint.label} · timeout after 10s
                    </span>
                    <span className="fj-console__line">
                      verifying · re-checking before alerting…
                    </span>
                    <span className="fj-console__line fj-console__line--bad">
                      second check agrees · outage confirmed
                    </span>
                    <span className="fj-console__line">
                      incident opened · #482 · 09:18 MST
                    </span>
                  </pre>
                ) : (
                  <div>
                    <BrandButton variant="secondary" onClick={() => setFailed(true)}>
                      Simulate a failure
                    </BrandButton>
                  </div>
                )}
              </>
            ) : null}

            {step === 6 ? (
              <>
                <StageHead
                  title="The alert beats the support ticket."
                  body={`The verified incident lands in ${chosenChannel.label} (${chosenChannel.meta}). Plain, factual, and first.`}
                />
                <div className="fj-card fj-journey-card fj-journey-card--compact">
                  <div className="fj-journey-card__status">
                    <StatusDot status="down" />
                    <strong className="fj-journey-card__title">
                      Incident #482 · {chosenEndpoint.label} is down
                    </strong>
                  </div>
                  <p className="fj-body-sm fj-journey-card__body">
                    Confirmed at 09:18 MST after verification. Checks were
                    passing until 09:17. Status page updated.
                  </p>
                  <span className="fj-caption">via Fajita → {chosenChannel.meta}</span>
                </div>
              </>
            ) : null}

            {step === 7 ? (
              <>
                <StageHead
                  title="Fix deployed. Fajita confirms it."
                  body="Recovery is verified the same way failure was. One all-clear, to the same channels, and the status page closes the loop."
                />
                {resolved ? (
                  <pre className="fj-console" aria-label="Recovery log">
                    <span className="fj-console__line fj-console__line--ok">
                      check passing · {chosenEndpoint.label} · 191 ms
                    </span>
                    <span className="fj-console__line fj-console__line--ok">
                      recovery confirmed · incident #482 resolved
                    </span>
                    <span className="fj-console__line">
                      all-clear sent to {chosenChannel.label.toLowerCase()} · duration 45 min
                    </span>
                  </pre>
                ) : (
                  <div>
                    <BrandButton variant="secondary" onClick={() => setResolved(true)}>
                      Deploy the fix
                    </BrandButton>
                  </div>
                )}
              </>
            ) : null}

            {step === 8 ? (
              <>
                <StageHead
                  title="Every minute of it is on the record."
                  body="Uptime history, response-time trends, and the incident timeline: proof of reliability you can show customers."
                />
                <UptimeChart
                  days={journeyDays()}
                  label={`${chosenEndpoint.label} · last 90 days`}
                />
                <div className="fj-journey-chips">
                  <ChannelChip>1 incident · 45 min total</ChannelChip>
                  <ChannelChip>Checked {chosenFrequency.label.toLowerCase()}</ChannelChip>
                  <ChannelChip>Alerts via {chosenChannel.label}</ChannelChip>
                </div>
                <div className="fj-journey-actions">
                  <BrandButtonLink
                    href={cta.primary.href}
                    data-fast-goal={DataFastGoals.heroCta}
                    data-fast-goal-source="journey"
                  >
                    {cta.primary.label}
                  </BrandButtonLink>
                  <BrandButton variant="ghost" onClick={reset}>
                    Run it again
                  </BrandButton>
                </div>
              </>
            ) : null}
          </div>

          <div className="fj-journey__foot">
            {step > 0 ? (
              <BrandButton variant="ghost" size="sm" onClick={() => go(step - 1)}>
                Back
              </BrandButton>
            ) : null}
            {step < stepTitles.length - 1 ? (
              <BrandButton size="sm" onClick={() => go(step + 1)} disabled={!canContinue}>
                Continue
              </BrandButton>
            ) : null}
            {!canContinue && step < stepTitles.length - 1 ? (
              <span className="fj-body-sm fj-journey-hint">
                {step === 2 && "Run the test check to continue."}
                {step === 4 && "Publish the page to continue."}
                {step === 5 && "Trigger the failure to continue."}
                {step === 7 && "Deploy the fix to continue."}
              </span>
            ) : null}
            <span className="fj-caption">
              Simulation. No account, no requests leave this page.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageHead({ title, body }: { title: string; body: string }) {
  return (
    <header>
      <h3 className="fj-heading-2 fj-journey-stage__title">
        {title}
      </h3>
      <p className="fj-body fj-journey-stage__body">
        {body}
      </p>
    </header>
  );
}
