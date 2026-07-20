import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/status-pages/projection", () => ({
  getPublicSnapshotBySlug: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  appUrl: "https://fajita.io",
}));

describe("loadFajitaServiceStatus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.FAJITA_SERVICE_STATUS_SLUG;
    vi.resetModules();
  });

  it("returns fallback with platform components when no slug is configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      }),
    );

    const { loadFajitaServiceStatus } = await import("@/lib/platform/service-status");
    const status = await loadFajitaServiceStatus();

    expect(status.source).toBe("fallback");
    expect(status.data.page.name).toBe("Fajita");
    expect(status.data.groups[0]?.components.length).toBe(7);
    expect(status.data.display.showUptimeHistory).toBe(false);
    expect(status.data.display.poweredByVisible).toBe(false);
    expect(status.overallStatus).toBe("operational");
  });

  it("uses a published snapshot when FAJITA_SERVICE_STATUS_SLUG resolves", async () => {
    process.env.FAJITA_SERVICE_STATUS_SLUG = "platform";
    const snapshot = {
      statusPageId: "sp_1",
      organizationId: "org_1",
      slug: "platform",
      visibility: "public",
      overallStatus: "operational",
      generatedAt: "2026-07-20T12:00:00.000Z",
      publishedAt: "2026-07-20T12:00:00.000Z",
      data: {
        page: { name: "Fajita", title: "Fajita Status" },
        display: { showSubscriberForm: true },
      },
    };

    const { getPublicSnapshotBySlug } = await import("@/lib/status-pages/projection");
    vi.mocked(getPublicSnapshotBySlug).mockResolvedValue(snapshot as never);

    const { loadFajitaServiceStatus } = await import("@/lib/platform/service-status");
    const status = await loadFajitaServiceStatus();

    expect(status.source).toBe("snapshot");
    expect(status.subscribeSlug).toBe("platform");
    expect(status.statusPageId).toBe("sp_1");
  });
});
