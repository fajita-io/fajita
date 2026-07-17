"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "@/components/app/toast";
import { AssertionBuilder, type AssertionDraft } from "./assertion-builder";
import { intervalLabel } from "@/lib/monitoring/entitlements";
import { updateMonitorAction, testMonitorConfigAction } from "@/lib/app/actions/monitors";

/** A plain object matching monitorConfigSchema input, built server-side. */
export interface EditableConfig {
  name: string;
  description: string;
  monitor_type: string;
  target_url: string | null;
  http_method: string;
  check_interval_seconds: number;
  timeout_ms: number;
  retry_count: number;
  retry_delay_ms: number;
  follow_redirects: boolean;
  max_redirects: number;
  expected_status_codes: number[];
  response_time_threshold_ms: number | null;
  body_size_limit_bytes: number;
  assertions: AssertionDraft[];
}

/**
 * Edit a monitor's configuration. Saving creates a new immutable version; the
 * previous version is never mutated. Changes to destination, method, timeout,
 * redirects, or assertions are flagged as critical and prompt a retest.
 */
export function MonitorEditForm({
  organizationId,
  monitorId,
  initial,
  intervals,
  maxAssertions,
}: {
  organizationId: string;
  monitorId: string;
  initial: EditableConfig;
  intervals: number[];
  maxAssertions: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  const [name, setName] = useState(initial.name);
  const [interval, setInterval] = useState(initial.check_interval_seconds);
  const [timeoutMs, setTimeoutMs] = useState(initial.timeout_ms);
  const [retryCount, setRetryCount] = useState(initial.retry_count);
  const [followRedirects, setFollowRedirects] = useState(initial.follow_redirects);
  const [thresholdMs, setThresholdMs] = useState<number | null>(initial.response_time_threshold_ms);
  const [assertions, setAssertions] = useState<AssertionDraft[]>(initial.assertions);
  const [retested, setRetested] = useState<null | "pass" | "fail">(null);

  const isHeartbeat = initial.monitor_type === "heartbeat";
  const supportsAssertions = initial.monitor_type === "api" || initial.monitor_type === "https" || initial.monitor_type === "http";

  function build(): EditableConfig {
    return {
      ...initial,
      name: name.trim(),
      check_interval_seconds: interval,
      timeout_ms: timeoutMs,
      retry_count: retryCount,
      follow_redirects: followRedirects,
      response_time_threshold_ms: thresholdMs,
      assertions: assertions.map((a, i) => ({ ...a, position: i })),
    };
  }

  function retest() {
    start(async () => {
      const res = await testMonitorConfigAction(organizationId, build(), monitorId);
      if (res.ok && res.data) {
        const pass = res.data.outcome === "validated";
        setRetested(pass ? "pass" : "fail");
        if (pass) toast.success("Configuration validated.");
        else toast.error(res.data.message);
      } else if (!res.ok) {
        setRetested("fail");
        toast.error(res.error);
      }
    });
  }

  function save() {
    start(async () => {
      const res = await updateMonitorAction(organizationId, monitorId, build(), "Configuration edited");
      if (res.ok && res.data) {
        toast.success(`Saved as version ${res.data.versionNumber}.`);
        router.push(`/app/monitors/${monitorId}`);
        router.refresh();
      } else {
        toast.error(res.ok ? "That did not save." : res.error);
      }
    });
  }

  return (
    <div className="fj-wiz__fields">
      <div className="fj-field">
        <label htmlFor="e-name">Monitor name</label>
        <input id="e-name" className="fj-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={160} />
      </div>

      {!isHeartbeat ? (
        <>
          <div className="fj-field">
            <label htmlFor="e-int">Check interval</label>
            <select id="e-int" className="fj-select" value={interval} onChange={(e) => setInterval(Number(e.target.value))}>
              {intervals.map((s) => (
                <option key={s} value={s}>{intervalLabel(s)}</option>
              ))}
            </select>
          </div>
          <div className="fj-wiz__grid2">
            <div className="fj-field">
              <label htmlFor="e-timeout">Timeout</label>
              <select id="e-timeout" className="fj-select" value={timeoutMs} onChange={(e) => setTimeoutMs(Number(e.target.value))}>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={20000}>20 seconds</option>
                <option value={30000}>30 seconds</option>
              </select>
            </div>
            <div className="fj-field">
              <label htmlFor="e-retry">Retries</label>
              <select id="e-retry" className="fj-select" value={retryCount} onChange={(e) => setRetryCount(Number(e.target.value))}>
                <option value={0}>No retry</option>
                <option value={1}>1 retry</option>
                <option value={2}>2 retries</option>
                <option value={3}>3 retries</option>
              </select>
            </div>
          </div>
          <div className="fj-field">
            <label htmlFor="e-threshold">Response time limit</label>
            <select
              id="e-threshold"
              className="fj-select"
              value={thresholdMs ?? "none"}
              onChange={(e) => setThresholdMs(e.target.value === "none" ? null : Number(e.target.value))}
            >
              <option value="none">No limit</option>
              <option value={1000}>1 second</option>
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
            </select>
          </div>
          <label className="fj-check">
            <input type="checkbox" checked={followRedirects} onChange={(e) => setFollowRedirects(e.target.checked)} />
            <span>Follow redirects (validated destinations only)</span>
          </label>

          {supportsAssertions ? (
            <div>
              <h3 className="fj-section-title">Assertions</h3>
              <AssertionBuilder value={assertions} onChange={setAssertions} max={maxAssertions} />
            </div>
          ) : null}
        </>
      ) : (
        <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
          Change the expected schedule and grace period on the Security tab, where the ping URL lives.
        </p>
      )}

      <p className="fj-wiz__hint">
        Saving creates a new version. The previous version stays in your history untouched. After critical
        changes, run a test first.
      </p>

      <div className="fj-wiz__foot">
        <BrandButton variant="secondary" onClick={retest} disabled={pending || isHeartbeat}>
          {pending ? "Working…" : "Test changes"}
        </BrandButton>
        <div className="fj-wiz__foot-spacer" />
        <BrandButton onClick={save} disabled={pending}>Save new version</BrandButton>
      </div>
      {retested === "pass" ? (
        <p className="fj-form-status fj-form-status--success" role="status">Validated. Safe to save.</p>
      ) : null}
    </div>
  );
}
