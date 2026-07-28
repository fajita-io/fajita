"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { useToast } from "@/components/app/toast";
import { AssertionBuilder, type AssertionDraft } from "./assertion-builder";
import { HeartbeatSetup } from "./heartbeat-setup";
import { intervalLabel } from "@/lib/monitoring/entitlements";
import type { WizardTypeSegment } from "@/lib/monitoring/display";
import {
  activateMonitorAction,
  createMonitorAction,
  moveMonitorToGroupAction,
  testMonitorConfigAction,
} from "@/lib/app/actions/monitors";

interface GroupOpt {
  id: string;
  name: string;
}

const STATUS_PRESETS: Record<string, { label: string; codes: number[] }> = {
  "2xx_3xx": { label: "Any success or redirect (2xx, 3xx)", codes: [200, 201, 202, 203, 204, 206, 301, 302, 303, 307, 308] },
  "2xx": { label: "Any success (2xx)", codes: [200, 201, 202, 203, 204, 206] },
  "200": { label: "Exactly 200 OK", codes: [200] },
  "201": { label: "Exactly 201 Created", codes: [201] },
  "204": { label: "Exactly 204 No Content", codes: [204] },
};

interface TestState {
  phase: "idle" | "running" | "done";
  outcome: "pass" | "warn" | "fail" | "blocked" | null;
  message: string;
}

export function MonitorWizard({
  organizationId,
  segment,
  intervals,
  groups,
  maxAssertions,
  retentionDays,
}: {
  organizationId: string;
  segment: WizardTypeSegment;
  intervals: number[];
  groups: GroupOpt[];
  maxAssertions: number;
  retentionDays: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const liveRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [test, setTest] = useState<TestState>({ phase: "idle", outcome: null, message: "" });
  const [createdMonitorId, setCreatedMonitorId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<"GET" | "HEAD" | "POST">("GET");
  const [interval, setInterval] = useState(intervals.includes(300) ? 300 : intervals[0]);
  const [timeoutMs, setTimeoutMs] = useState(10000);
  const [retryCount, setRetryCount] = useState(1);
  const [followRedirects, setFollowRedirects] = useState(true);
  const [statusPreset, setStatusPreset] = useState("2xx_3xx");
  const [thresholdMs, setThresholdMs] = useState<number | null>(2000);
  const [bodyKeyword, setBodyKeyword] = useState("");
  const [assertions, setAssertions] = useState<AssertionDraft[]>([]);
  const [groupId, setGroupId] = useState("");
  // SSL
  const [warnDays, setWarnDays] = useState(30);
  const [critDays, setCritDays] = useState(7);
  // Heartbeat
  const [hbInterval, setHbInterval] = useState(3600);
  const [hbGrace, setHbGrace] = useState(300);
  const [description, setDescription] = useState("");

  const steps = stepLabels(segment);

  function announce(msg: string) {
    if (liveRef.current) liveRef.current.textContent = msg;
  }

  function buildConfig() {
    const monitorType =
      segment === "website" ? "https" : segment === "api" ? "api" : segment === "ssl" ? "ssl" : "heartbeat";

    if (segment === "heartbeat") {
      return {
        name: name.trim(),
        description: description.trim(),
        monitor_type: "heartbeat" as const,
        // Heartbeat monitors run no outbound check; a valid interval satisfies
        // the schema while the token holds the real expected schedule.
        check_interval_seconds: 3600,
        assertions: [],
      };
    }

    const cfgAssertions: AssertionDraft[] = [...assertions];
    if (segment === "website" && bodyKeyword.trim()) {
      cfgAssertions.push({
        assertion_type: "body_contains",
        field_path: null,
        operator: null,
        expected_value: bodyKeyword.trim(),
        expected_value_type: "string",
        case_sensitive: false,
        position: cfgAssertions.length,
      });
    }
    if (segment === "ssl") {
      cfgAssertions.push(
        { assertion_type: "tls_valid", field_path: null, operator: null, expected_value: null, expected_value_type: "none", case_sensitive: false, position: 0 },
        { assertion_type: "tls_hostname_matches", field_path: null, operator: null, expected_value: null, expected_value_type: "none", case_sensitive: false, position: 1 },
        { assertion_type: "tls_expires_after_days", field_path: null, operator: null, expected_value: String(critDays), expected_value_type: "number", case_sensitive: false, position: 2 },
      );
    }

    return {
      name: name.trim(),
      monitor_type: monitorType,
      target_url: url.trim(),
      http_method: segment === "ssl" ? "GET" : method,
      check_interval_seconds: interval,
      timeout_ms: timeoutMs,
      retry_count: retryCount,
      follow_redirects: followRedirects,
      expected_status_codes: segment === "ssl" ? [200] : STATUS_PRESETS[statusPreset].codes,
      response_time_threshold_ms: segment === "website" || segment === "api" ? thresholdMs : null,
      assertions: cfgAssertions.map((a, i) => ({ ...a, position: i })),
    };
  }

  async function runTest() {
    setTest({ phase: "running", outcome: null, message: "" });
    announce("Testing configuration.");
    // Staged perceived progress while the server preflight runs.
    const config = buildConfig();
    const [res] = await Promise.all([
      testMonitorConfigAction(organizationId, config),
      new Promise((r) => window.setTimeout(r, 900)),
    ]);
    if (res.ok && res.data) {
      const pass = res.data.outcome === "validated";
      setTest({
        phase: "done",
        outcome: pass ? "pass" : "blocked",
        message: res.data.message,
      });
      announce(pass ? "Test passed. Configuration validated." : `Test blocked. ${res.data.message}`);
    } else if (!res.ok) {
      setTest({ phase: "done", outcome: "fail", message: res.error });
      announce(`Test failed. ${res.error}`);
    }
  }

  function validateStep(current: number): string | null {
    const label = steps[current];
    if (label === "Details") {
      if (!name.trim()) return "Give the monitor a name.";
      if (segment !== "heartbeat" && !url.trim()) return "Enter a URL to watch.";
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
    announce(`Step ${step + 2}: ${steps[step + 1]}`);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function ensureDraft(): Promise<string | null> {
    if (createdMonitorId) return createdMonitorId;
    const res = await createMonitorAction(organizationId, buildConfig());
    if (res.ok && res.data) {
      setCreatedMonitorId(res.data.monitorId);
      if (groupId) {
        await moveMonitorToGroupAction(organizationId, res.data.monitorId, groupId);
      }
      return res.data.monitorId;
    }
    if (!res.ok) toast.error(res.error);
    return null;
  }

  function saveDraft() {
    start(async () => {
      const id = await ensureDraft();
      if (id) {
        toast.success("Draft saved.");
        router.push(`/app/monitors/${id}`);
      }
    });
  }

  function activate() {
    start(async () => {
      const id = await ensureDraft();
      if (!id) return;
      const res = await activateMonitorAction(organizationId, id);
      if (res.ok) {
        toast.success(`Your monitor is active. Fajita will check it ${intervalLabel(interval).toLowerCase()}.`);
        router.push(`/app/monitors/${id}`);
      } else {
        toast.error(res.error);
      }
    });
  }

  const canTest = Boolean(name.trim() && url.trim());

  return (
    <>
      <div aria-live="polite" className="fj-visually-hidden" ref={liveRef} />
      <div className="fj-wiz">
        <ol className="fj-wiz__steps" aria-label="Setup steps">
          {steps.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                className="fj-wiz__step"
                data-active={i === step ? "" : undefined}
                data-done={i < step ? "" : undefined}
                disabled={i > step}
                onClick={() => i <= step && setStep(i)}
                aria-current={i === step ? "step" : undefined}
              >
                <span className="fj-wiz__stepnum">{i < step ? "✓" : i + 1}</span>
                <span className="fj-wiz__steplabel">{label}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="fj-wiz__panel">
          {renderStep()}
        </div>
      </div>
    </>
  );

  function renderStep() {
    const label = steps[step];
    switch (label) {
      case "Details":
        return detailsStep();
      case "Success":
        return successStep();
      case "Thresholds":
        return thresholdsStep();
      case "Timing":
        return timingStep();
      case "Ping setup":
        return pingStep();
      case "Test":
        return testStep();
      case "Review":
        return reviewStep();
      case "Done":
        return doneStep();
      default:
        return null;
    }
  }

  function foot(children: React.ReactNode) {
    return <div className="fj-wiz__foot">{children}</div>;
  }

  function detailsStep() {
    return (
      <div>
        <PanelHead
          title="The basics"
          desc={
            segment === "heartbeat"
              ? "Name the job and tell Fajita how often it should hear from it."
              : "Name the monitor and point it at what you want watched."
          }
        />
        <div className="fj-wiz__fields">
          <Field label="Monitor name" htmlFor="w-name" hint="Something you will recognize on a busy list.">
            <input
              id="w-name"
              className="fj-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={segment === "ssl" ? "Marketing site certificate" : segment === "heartbeat" ? "Nightly database backup" : "Marketing homepage"}
              maxLength={160}
            />
          </Field>

          {segment !== "heartbeat" ? (
            <Field
              label={segment === "ssl" ? "Hostname or HTTPS URL" : "URL to watch"}
              htmlFor="w-url"
              hint="Fajita checks the destination is public and safe before connecting. Keep secrets out of the URL."
            >
              <input
                id="w-url"
                className="fj-input"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
          ) : (
            <>
              <Field label="Expected schedule" htmlFor="w-hbint" hint="How often Fajita should expect a ping.">
                <select id="w-hbint" className="fj-select" value={hbInterval} onChange={(e) => setHbInterval(Number(e.target.value))}>
                  <option value={300}>Every 5 minutes</option>
                  <option value={900}>Every 15 minutes</option>
                  <option value={3600}>Every hour</option>
                  <option value={86400}>Every day</option>
                  <option value={604800}>Every week</option>
                </select>
              </Field>
              <Field label="Grace period" htmlFor="w-hbgrace" hint="How long to wait past the schedule before a ping counts as late.">
                <select id="w-hbgrace" className="fj-select" value={hbGrace} onChange={(e) => setHbGrace(Number(e.target.value))}>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={900}>15 minutes</option>
                  <option value={3600}>1 hour</option>
                </select>
              </Field>
              <Field label="Description (optional)" htmlFor="w-desc">
                <textarea
                  id="w-desc"
                  className="fj-textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                />
              </Field>
            </>
          )}

          {segment === "api" ? (
            <Field label="Request method" htmlFor="w-method">
              <select id="w-method" className="fj-select" value={method} onChange={(e) => setMethod(e.target.value as "GET" | "HEAD" | "POST")}>
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
                <option value="POST">POST</option>
              </select>
              {method === "POST" ? (
                <p className="fj-wiz__hint">
                  Scheduled POST checks can trigger actions on the destination. Point this at a dedicated
                  health endpoint whenever possible.
                </p>
              ) : null}
            </Field>
          ) : null}

          {groups.length > 0 ? (
            <Field label="Group (optional)" htmlFor="w-group">
              <select id="w-group" className="fj-select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                <option value="">Ungrouped</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>
        {foot(
          <>
            <div className="fj-wiz__foot-spacer" />
            <BrandButton onClick={next}>Continue</BrandButton>
          </>,
        )}
      </div>
    );
  }

  function successStep() {
    return (
      <div>
        <PanelHead title="Decide what a healthy response looks like" desc="Fajita marks a check as passed only when your rules are met." />
        <div className="fj-wiz__fields">
          <Field label="Expected status" htmlFor="w-status">
            <select id="w-status" className="fj-select" value={statusPreset} onChange={(e) => setStatusPreset(e.target.value)}>
              {Object.entries(STATUS_PRESETS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>

          <Field
            label="Response time limit"
            htmlFor="w-threshold"
            hint="Fail the check if the endpoint answers but takes longer than this. Different from the timeout, which stops waiting entirely."
          >
            <select
              id="w-threshold"
              className="fj-select"
              value={thresholdMs ?? "none"}
              onChange={(e) => setThresholdMs(e.target.value === "none" ? null : Number(e.target.value))}
            >
              <option value="none">No limit</option>
              <option value={1000}>1 second</option>
              <option value={2000}>2 seconds (recommended)</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
            </select>
          </Field>

          {segment === "website" ? (
            <Field label="Body keyword (optional)" htmlFor="w-keyword" hint="Fajita can also confirm a word or phrase appears in the response.">
              <input id="w-keyword" className="fj-input" value={bodyKeyword} onChange={(e) => setBodyKeyword(e.target.value)} placeholder="Welcome" maxLength={512} />
            </Field>
          ) : (
            <div>
              <h3 style={{ fontSize: "0.95rem", margin: "0 0 var(--space-2)" }}>Assertions</h3>
              <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
                Add checks against the body, headers, or JSON values. Test them against a live response in the next step.
              </p>
              <AssertionBuilder value={assertions} onChange={setAssertions} max={maxAssertions} />
            </div>
          )}
        </div>
        {foot(
          <>
            <BrandButton variant="ghost" onClick={back}>Back</BrandButton>
            <div className="fj-wiz__foot-spacer" />
            <BrandButton onClick={next}>Continue</BrandButton>
          </>,
        )}
      </div>
    );
  }

  function thresholdsStep() {
    return (
      <div>
        <PanelHead title="Expiry thresholds" desc="Fajita warns you before the certificate lapses. It reports on certificates. It does not renew them." />
        <div className="fj-wiz__fields">
          <div className="fj-wiz__grid2">
            <Field label="Warn at (days left)" htmlFor="w-warn">
              <input id="w-warn" className="fj-input" type="number" min={1} max={365} value={warnDays} onChange={(e) => setWarnDays(Number(e.target.value))} />
            </Field>
            <Field label="Critical at (days left)" htmlFor="w-crit" hint="Below this, the check fails.">
              <input id="w-crit" className="fj-input" type="number" min={1} max={90} value={critDays} onChange={(e) => setCritDays(Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Check interval" htmlFor="w-int-ssl">
            <select id="w-int-ssl" className="fj-select" value={interval} onChange={(e) => setInterval(Number(e.target.value))}>
              {intervals.map((s) => (
                <option key={s} value={s}>{intervalLabel(s)}</option>
              ))}
            </select>
          </Field>
        </div>
        {foot(
          <>
            <BrandButton variant="ghost" onClick={back}>Back</BrandButton>
            <div className="fj-wiz__foot-spacer" />
            <BrandButton onClick={next}>Continue</BrandButton>
          </>,
        )}
      </div>
    );
  }

  function timingStep() {
    return (
      <div>
        <PanelHead title="Timing" desc="How often Fajita checks, and how patient it is each time." />
        <div className="fj-wiz__fields">
          <Field label="Check interval" htmlFor="w-int">
            <div className="fj-choice-grid">
              {intervals.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="fj-choice"
                  data-selected={interval === s ? "" : undefined}
                  onClick={() => setInterval(s)}
                >
                  {intervalLabel(s)}
                </button>
              ))}
            </div>
          </Field>

          <button type="button" className="fj-wiz__advtoggle" onClick={() => setAdvanced((v) => !v)} aria-expanded={advanced}>
            <BrandIcon name={advanced ? "chevron-down" : "chevron-right"} size={16} />
            {advanced ? "Hide advanced timing" : "Show advanced timing"}
          </button>

          {advanced ? (
            <>
              <div className="fj-wiz__grid2">
                <Field label="Timeout" htmlFor="w-timeout" hint="Stop waiting after this long.">
                  <select id="w-timeout" className="fj-select" value={timeoutMs} onChange={(e) => setTimeoutMs(Number(e.target.value))}>
                    <option value={5000}>5 seconds</option>
                    <option value={10000}>10 seconds</option>
                    <option value={20000}>20 seconds</option>
                    <option value={30000}>30 seconds</option>
                  </select>
                </Field>
                <Field label="Retries" htmlFor="w-retry" hint="A retry ignores a brief network hiccup. It is not multi-location outage confirmation.">
                  <select id="w-retry" className="fj-select" value={retryCount} onChange={(e) => setRetryCount(Number(e.target.value))}>
                    <option value={0}>No retry</option>
                    <option value={1}>1 retry</option>
                    <option value={2}>2 retries</option>
                    <option value={3}>3 retries</option>
                  </select>
                </Field>
              </div>
              <label className="fj-check">
                <input type="checkbox" checked={followRedirects} onChange={(e) => setFollowRedirects(e.target.checked)} />
                <span>
                  Follow redirects
                  <br />
                  <span className="fj-wiz__hint">Fajita validates every redirect destination. Redirects to private or blocked networks are always rejected.</span>
                </span>
              </label>
            </>
          ) : null}
        </div>
        {foot(
          <>
            <BrandButton variant="ghost" onClick={back}>Back</BrandButton>
            <div className="fj-wiz__foot-spacer" />
            <BrandButton onClick={next}>Continue</BrandButton>
          </>,
        )}
      </div>
    );
  }

  function pingStep() {
    return (
      <div>
        <PanelHead title="Connect your job" desc="Create a private ping URL and call it when your job finishes." />
        {!createdMonitorId ? (
          <div>
            <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
              First, save this heartbeat so Fajita has somewhere to send pings.
            </p>
            <BrandButton
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const id = await ensureDraft();
                  if (id) announce("Heartbeat saved. Generate your ping URL.");
                })
              }
            >
              {pending ? "Saving…" : "Save heartbeat"}
            </BrandButton>
          </div>
        ) : (
          <HeartbeatSetup
            organizationId={organizationId}
            monitorId={createdMonitorId}
            token={null}
            defaultIntervalSeconds={hbInterval}
            defaultGraceSeconds={hbGrace}
          />
        )}
        {foot(
          <>
            <BrandButton variant="ghost" onClick={back}>Back</BrandButton>
            <div className="fj-wiz__foot-spacer" />
            {createdMonitorId ? <BrandButton onClick={next}>Continue</BrandButton> : null}
          </>,
        )}
      </div>
    );
  }

  function testStep() {
    return (
      <div>
        <PanelHead title="Run a safe test" desc="Fajita validates the destination and your rules before anything goes live." />
        {test.phase === "idle" ? (
          <div className="fj-test-panel">
            <p style={{ margin: 0 }}>Ready when you are. This runs through Fajita, never your browser.</p>
            <div style={{ marginTop: "var(--space-4)" }}>
              <BrandButton onClick={runTest} disabled={!canTest || pending}>
                <BrandIcon name="response-time" size={16} /> Run test
              </BrandButton>
            </div>
          </div>
        ) : test.phase === "running" ? (
          <div className="fj-test-panel">
            <ul className="fj-test-stages">
              {["Validating configuration", "Checking destination safety", "Confirming reachability", "Preparing result"].map((s, i) => (
                <li key={s} className="fj-test-stage" data-state={i < 3 ? "active" : "idle"}>
                  <span className="fj-test-stage__dot" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <TestResult
            outcome={test.outcome!}
            message={test.message}
            onRetry={() => setTest({ phase: "idle", outcome: null, message: "" })}
          />
        )}
        {foot(
          <>
            <BrandButton variant="ghost" onClick={back}>Back</BrandButton>
            <div className="fj-wiz__foot-spacer" />
            <BrandButton onClick={next} disabled={test.outcome !== "pass"}>Continue</BrandButton>
          </>,
        )}
      </div>
    );
  }

  function reviewStep() {
    const cfg = buildConfig();
    return (
      <div>
        <PanelHead title="Review and activate" desc="One last look before Fajita starts watching." />
        <dl className="fj-review-list">
          <dt>Name</dt><dd>{name}</dd>
          <dt>Type</dt><dd>{segment === "website" ? "Website" : segment === "api" ? "API" : "SSL certificate"}</dd>
          {"target_url" in cfg ? (<><dt>Destination</dt><dd>{url}</dd></>) : null}
          {segment === "api" ? (<><dt>Method</dt><dd>{method}</dd></>) : null}
          <dt>Interval</dt><dd>{intervalLabel(interval)}</dd>
          {segment !== "ssl" ? (<><dt>Success</dt><dd>{STATUS_PRESETS[statusPreset].label}</dd></>) : null}
          {thresholdMs && segment !== "ssl" ? (<><dt>Response limit</dt><dd>{thresholdMs / 1000} seconds</dd></>) : null}
          {segment === "ssl" ? (<><dt>Thresholds</dt><dd>Warn at {warnDays} days, fail below {critDays} days</dd></>) : null}
          {assertions.length > 0 ? (<><dt>Assertions</dt><dd>{assertions.length}</dd></>) : null}
          <dt>Region</dt><dd>US East</dd>
          <dt>History</dt><dd>Detailed results kept for {retentionDays} days</dd>
          {test.outcome ? (<><dt>Last test</dt><dd>{test.outcome === "pass" ? "Passed" : test.outcome}</dd></>) : null}
        </dl>
        {segment === "api" ? (
          <p className="fj-wiz__hint">
            Need credentials? Activate first, then add a bearer token, basic auth, or a secret header on the
            Security tab. Secrets are encrypted and never shown again.
          </p>
        ) : null}
        {foot(
          <>
            <BrandButton variant="ghost" onClick={back}>Back</BrandButton>
            <BrandButton variant="secondary" onClick={saveDraft} disabled={pending}>Save as draft</BrandButton>
            <div className="fj-wiz__foot-spacer" />
            <BrandButton onClick={activate} disabled={pending}>
              {pending ? "Activating…" : "Activate monitor"}
            </BrandButton>
          </>,
        )}
      </div>
    );
  }

  function doneStep() {
    return (
      <div>
        <PanelHead title="Heartbeat ready" desc="Activate to start watching for pings." />
        <p style={{ margin: 0 }}>
          Fajita is set up to listen for <strong>{name || "your job"}</strong> {intervalLabel(hbInterval).toLowerCase()}.
          Once your job pings the URL, its status turns healthy.
        </p>
        {foot(
          <>
            <BrandButton variant="ghost" onClick={back}>Back</BrandButton>
            <div className="fj-wiz__foot-spacer" />
            <BrandButton onClick={activate} disabled={pending}>
              {pending ? "Activating…" : "Activate heartbeat"}
            </BrandButton>
          </>,
        )}
      </div>
    );
  }
}

function stepLabels(segment: WizardTypeSegment): string[] {
  switch (segment) {
    case "website":
      return ["Details", "Success", "Timing", "Test", "Review"];
    case "api":
      return ["Details", "Success", "Timing", "Test", "Review"];
    case "ssl":
      return ["Details", "Thresholds", "Test", "Review"];
    case "heartbeat":
      return ["Details", "Ping setup", "Done"];
  }
}

function PanelHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="fj-wiz__panelhead">
      <h2 className="fj-wiz__paneltitle">{title}</h2>
      <p className="fj-wiz__paneldesc">{desc}</p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fj-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className="fj-wiz__hint">{hint}</p> : null}
    </div>
  );
}

function TestResult({
  outcome,
  message,
  onRetry,
}: {
  outcome: "pass" | "warn" | "fail" | "blocked";
  message: string;
  onRetry: () => void;
}) {
  const title =
    outcome === "pass"
      ? "Configuration validated"
      : outcome === "blocked"
        ? "Destination blocked"
        : outcome === "warn"
          ? "Passed with a warning"
          : "Test failed";
  return (
    <div className="fj-test-result" data-outcome={outcome} role="status">
      <div className="fj-test-result__head">
        {outcome === "pass" ? <span className="fj-test-result__pulse" aria-hidden /> : <BrandIcon name={outcome === "blocked" ? "shield" : "warning"} size={20} />}
        <h3 className="fj-test-result__title">{title}</h3>
      </div>
      <p style={{ margin: "var(--space-3) 0 0" }}>{message}</p>
      {outcome === "pass" ? (
        <p className="fj-wiz__hint">Fajita runs the first live check the moment you activate.</p>
      ) : (
        <div style={{ marginTop: "var(--space-4)" }}>
          <BrandButton variant="secondary" size="sm" onClick={onRetry}>Adjust and test again</BrandButton>
        </div>
      )}
    </div>
  );
}
