import { describe, expect, it } from "vitest";

import {
  ACCEPTED_RISKS,
  buildGoLiveApproval,
  classificationLabel,
  computeClassification,
  KNOWN_LIMITATIONS,
  LAUNCH_BLOCKERS,
  openCriticalBlockers,
  openHighBlockers,
  READINESS_GATES,
  scorecardSummary,
} from "@/lib/platform/readiness";

describe("Phase 18 readiness registry", () => {
  it("classifies Conditionally Ready for Stage 0 with accepted critical risks", () => {
    expect(computeClassification()).toBe("conditionally_ready");
    expect(classificationLabel("conditionally_ready")).toBe(
      "Conditionally Ready",
    );
    expect(openCriticalBlockers()).toHaveLength(0);
    expect(openHighBlockers().length).toBeGreaterThan(0);
  });

  it("keeps every gate with evidence text", () => {
    for (const gate of READINESS_GATES) {
      expect(gate.evidence.length).toBeGreaterThan(10);
      expect(gate.id).toMatch(/^[A-Z0-9]+-/);
    }
  });

  it("requires blocker IDs and scopes Stage-0 accepted critical risks", () => {
    for (const blocker of LAUNCH_BLOCKERS) {
      expect(blocker.id).toMatch(/^LB-\d+/);
      if (blocker.severity === "critical" && blocker.acceptedRisk) {
        expect(blocker.approval).toMatch(/Stage-0/);
      }
    }
  });

  it("records Stage 0 go-live with explicit confirmations", () => {
    const approval = buildGoLiveApproval();
    expect(approval.classification).toBe("conditionally_ready");
    expect(approval.launchStage).toBe("stage_0");
    expect(approval.productOwner).toBe("approved");
    expect(approval.confirmationNoHiddenFailures).toBe(true);
    expect(approval.confirmationNoUnsupportedClaims).toBe(true);
    expect(approval.conditions.some((c) => c.includes("checkout_paid"))).toBe(
      true,
    );
  });

  it("exposes known limitations without claiming Ready", () => {
    expect(KNOWN_LIMITATIONS.some((l) => l.publicSafe)).toBe(true);
    expect(ACCEPTED_RISKS.length).toBeGreaterThan(0);
    const summary = scorecardSummary();
    expect(summary.classification).toBe("conditionally_ready");
  });
});
