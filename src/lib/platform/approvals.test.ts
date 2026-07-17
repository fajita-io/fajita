import { describe, expect, it } from "vitest";

import { EXPORT_TYPES, columnsForExport } from "@/lib/platform/exports/service";
import { OPERATIONAL_EVENT_REGISTRY } from "@/lib/platform/events/registry";
import { OPS_LAB_FIXTURES } from "@/lib/platform/fixtures";
import { COMMAND_PALETTE_ITEMS, INTERNAL_NAV } from "@/lib/platform/navigation";

describe("approvals and exports foundations", () => {
  it("exports use allowlists only", () => {
    for (const type of EXPORT_TYPES) {
      const cols = columnsForExport(type);
      expect(cols.length).toBeGreaterThan(0);
      expect(cols.join(" ")).not.toMatch(/secret|password|card|tax_id/i);
    }
  });

  it("registers operational events with bounded metadata keys", () => {
    const def = OPERATIONAL_EVENT_REGISTRY["billing.payment.succeeded"];
    expect(def.allowedMetadataKeys).toContain("amount_cents");
    expect(def.allowedMetadataKeys.join(" ")).not.toMatch(/pan|cvv|secret/i);
  });

  it("keeps fixtures deterministic and fake", () => {
    expect(OPS_LAB_FIXTURES.healthyOrganization.id).toMatch(/^11111111-/);
    expect(OPS_LAB_FIXTURES.alertDeadLetter.failureCategory).toBe(
      "invalid_credentials",
    );
  });

  it("wires command palette without destructive one-steps", () => {
    for (const item of COMMAND_PALETTE_ITEMS) {
      expect(item.href.startsWith("/internal")).toBe(true);
      expect(item.label.toLowerCase()).not.toContain("delete all");
      expect(item.label.toLowerCase()).not.toContain("refund now");
    }
  });

  it("includes required nav destinations", () => {
    const hrefs = INTERNAL_NAV.flatMap((s) => s.items.map((i) => i.href));
    expect(hrefs).toContain("/internal/command-center");
    expect(hrefs).toContain("/internal/revenue");
    expect(hrefs).toContain("/internal/approvals");
    expect(hrefs).toContain("/internal/security");
    expect(hrefs).toContain("/internal/operations-lab");
    expect(hrefs).toContain("/internal/post-launch/overview");
  });
});
