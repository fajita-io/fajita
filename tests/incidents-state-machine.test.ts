import { describe, expect, it } from "vitest";

import {
  ALLOWED_TRANSITIONS,
  evaluate,
  failureFamily,
  incidentSeverity,
  initialSnapshot,
  isValidTransition,
  operationalFromFailure,
  resultEligibility,
  type CheckInput,
  type EngineConfig,
  type OperationalSnapshot,
} from "@/lib/incidents/state-machine";

const config: EngineConfig = {
  failureThreshold: 2,
  recoveryThreshold: 2,
  reopenWindowSeconds: 300,
  criticality: "normal",
  incidentSuppressed: false,
};

function fail(at: number, category = "unexpected_status", httpStatus = 500): CheckInput {
  return { status: "failure", category, httpStatus, at };
}
function ok(at: number): CheckInput {
  return { status: "success", category: null, at };
}

/** Run a deterministic sequence and return the final snapshot + last action. */
function run(seq: CheckInput[], cfg = config, start?: OperationalSnapshot) {
  let snap = start ?? initialSnapshot();
  let action = "";
  for (const input of seq) {
    const out = evaluate(snap, input, cfg);
    snap = out.next;
    action = out.action;
  }
  return { snap, action };
}

describe("transition table", () => {
  it("rejects invalid transitions and accepts documented ones", () => {
    expect(isValidTransition("operational", "verifying_failure")).toBe(true);
    expect(isValidTransition("verifying_failure", "down")).toBe(true);
    expect(isValidTransition("down", "recovering")).toBe(true);
    expect(isValidTransition("recovering", "operational")).toBe(true);
    // down cannot jump straight to operational without recovering.
    expect(isValidTransition("down", "operational")).toBe(false);
    // operational cannot jump straight to down.
    expect(isValidTransition("operational", "down")).toBe(false);
  });

  it("every target is itself a known state", () => {
    for (const [, targets] of Object.entries(ALLOWED_TRANSITIONS)) {
      for (const t of targets) {
        expect(ALLOWED_TRANSITIONS[t]).toBeDefined();
      }
    }
  });
});

describe("failure eligibility", () => {
  it("classifies customer service failures as eligible", () => {
    expect(resultEligibility("failure", "unexpected_status")).toBe("eligible");
    expect(resultEligibility("failure", "tls_expired")).toBe("eligible");
    expect(resultEligibility("failure", "heartbeat_missed")).toBe("eligible");
    expect(resultEligibility("timed_out", "response_timeout")).toBe("eligible");
  });
  it("classifies configuration failures as config (never an outage)", () => {
    expect(resultEligibility("error", "invalid_configuration")).toBe("config");
    expect(resultEligibility("blocked", "blocked_destination")).toBe("config");
    expect(resultEligibility("failure", "unsupported_scheme")).toBe("config");
  });
  it("classifies platform faults as platform uncertainty", () => {
    expect(resultEligibility("error", "worker_error")).toBe("platform");
  });
  it("ignores canceled results", () => {
    expect(resultEligibility("canceled", "canceled")).toBe("ignore");
  });
  it("treats success as success", () => {
    expect(resultEligibility("success", null)).toBe("success");
  });
});

describe("degraded vs down and severity", () => {
  it("a responding endpoint with a soft failure is degraded", () => {
    expect(operationalFromFailure("assertion_failed", 200)).toBe("degraded");
    expect(operationalFromFailure("response_timeout", 200)).toBe("degraded");
  });
  it("an unreachable or hard failure is down", () => {
    expect(operationalFromFailure("connection_refused", null)).toBe("down");
    expect(operationalFromFailure("unexpected_status", 500)).toBe("down");
  });
  it("severity derives from criticality, state, and blast radius", () => {
    expect(incidentSeverity("normal", "down", 1)).toBe("major");
    expect(incidentSeverity("critical", "down", 1)).toBe("critical");
    expect(incidentSeverity("normal", "degraded", 1)).toBe("minor");
    expect(incidentSeverity("normal", "down", 5)).toBe("critical");
  });
  it("groups failures into families for correlation", () => {
    expect(failureFamily("failure", "tls_expired")).toBe("tls");
    expect(failureFamily("failure", "response_timeout")).toBe("timeout");
    expect(failureFamily("failure", "assertion_failed")).toBe("assertion");
    expect(failureFamily("failure", "connection_refused")).toBe("availability");
  });
});

describe("automatic incident opening", () => {
  it("one failed check does not open an incident", () => {
    const { snap, action } = run([fail(1000)]);
    expect(action).toBe("verifying");
    expect(snap.state).toBe("verifying_failure");
    expect(snap.activeIncident).toBe(false);
  });

  it("opens an incident after the confirmation threshold", () => {
    const { snap, action } = run([fail(1000), fail(2000)]);
    expect(action).toBe("incident_opened");
    expect(snap.state).toBe("down");
    expect(snap.activeIncident).toBe(true);
  });

  it("a success before the threshold clears verification", () => {
    const { snap, action } = run([fail(1000), ok(2000)]);
    expect(action).toBe("operational");
    expect(snap.state).toBe("operational");
    expect(snap.activeIncident).toBe(false);
    expect(snap.consecutiveFailures).toBe(0);
  });

  it("critical monitors confirm one step faster", () => {
    const critical = { ...config, criticality: "critical" as const };
    const { action } = run([fail(1000)], critical);
    expect(action).toBe("incident_opened");
  });

  it("a manually suppressed monitor never opens an incident", () => {
    const suppressed = { ...config, incidentSuppressed: true };
    const { snap, action } = run([fail(1000), fail(2000), fail(3000)], suppressed);
    expect(action).toBe("monitor_suppressed");
    expect(snap.activeIncident).toBe(false);
  });

  it("platform uncertainty does not open a customer incident", () => {
    const { snap, action } = run([
      { status: "error", category: "worker_error", at: 1000 },
      { status: "error", category: "worker_error", at: 2000 },
    ]);
    expect(action).toBe("platform_uncertainty");
    expect(snap.state).toBe("unknown");
    expect(snap.activeIncident).toBe(false);
  });

  it("configuration failures never become an outage", () => {
    const { snap, action } = run([
      { status: "error", category: "invalid_configuration", at: 1000 },
      { status: "error", category: "invalid_configuration", at: 2000 },
    ]);
    expect(action).toBe("config_ignored");
    expect(snap.activeIncident).toBe(false);
  });

  it("maintenance suppresses opening while checks continue", () => {
    const { snap, action } = run([
      { ...fail(1000), maintenanceSuppress: true },
      { ...fail(2000), maintenanceSuppress: true },
    ]);
    expect(action).toBe("maintenance_suppressed");
    expect(snap.state).toBe("maintenance");
    expect(snap.activeIncident).toBe(false);
  });
});

describe("recovery confirmation", () => {
  it("one success enters recovery, two consecutive resolve", () => {
    const opened = run([fail(1000), fail(2000)]).snap;
    const step1 = evaluate(opened, ok(3000), config);
    expect(step1.action).toBe("recovery_started");
    expect(step1.next.state).toBe("recovering");
    const step2 = evaluate(step1.next, ok(4000), config);
    expect(step2.action).toBe("resolved");
    expect(step2.next.state).toBe("operational");
    expect(step2.next.activeIncident).toBe(false);
  });

  it("a failure during recovery returns to down and keeps the incident", () => {
    const opened = run([fail(1000), fail(2000)]).snap;
    const rec = evaluate(opened, ok(3000), config);
    const back = evaluate(rec.next, fail(4000), config);
    expect(back.next.state).toBe("down");
    expect(back.next.activeIncident).toBe(true);
  });

  it("a single success does not resolve when policy needs two", () => {
    const opened = run([fail(1000), fail(2000)]).snap;
    const rec = evaluate(opened, ok(3000), config);
    expect(rec.next.activeIncident).toBe(true);
  });
});

describe("reopening", () => {
  it("a confirmed failure inside the reopen window reopens the incident", () => {
    // open, resolve, then fail twice within 300s.
    let snap = run([fail(1000), fail(2000), ok(3000), ok(4000)]).snap;
    expect(snap.activeIncident).toBe(false);
    expect(snap.lastResolvedAt).toBe(4000);
    const r1 = evaluate(snap, fail(5000), config); // verifying
    const r2 = evaluate(r1.next, fail(6000), config);
    expect(r2.action).toBe("incident_reopened");
  });

  it("a confirmed failure outside the reopen window opens a new incident", () => {
    const resolved = run([fail(1000), fail(2000), ok(3000), ok(4000)]).snap;
    const far = 4000 + 301 * 1000;
    const r1 = evaluate(resolved, fail(far), config);
    const r2 = evaluate(r1.next, fail(far + 1000), config);
    expect(r2.action).toBe("incident_opened");
  });
});

describe("flapping", () => {
  it("repeated recovery interruptions mark the monitor as flapping", () => {
    let snap = run([fail(1000), fail(2000)]).snap; // open, down
    let t = 3000;
    // Oscillate ok/fail while in an incident to accrue transitions.
    for (let i = 0; i < 5; i += 1) {
      snap = evaluate(snap, ok(t), config).next; // recovering
      t += 1000;
      snap = evaluate(snap, fail(t), config).next; // back to down (transition++)
      t += 1000;
    }
    expect(snap.flapping).toBe(true);
    expect(snap.activeIncident).toBe(true);
  });
});
