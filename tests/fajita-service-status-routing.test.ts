import { describe, expect, it } from "vitest";

import {
  fajitaServiceStatusBasePath,
  fajitaServiceStatusCanonicalUrl,
  isFajitaStatusApexHost,
  resolveStatusHostRewrite,
} from "@/lib/status-pages/fajita-service-status-routing";

describe("fajita service status routing", () => {
  it("detects the status zone apex host", () => {
    expect(isFajitaStatusApexHost("status.fajita.io")).toBe(true);
    expect(isFajitaStatusApexHost("platform.status.fajita.io")).toBe(false);
    expect(isFajitaStatusApexHost("fajita.io")).toBe(false);
  });

  it("uses empty base path on the status zone apex", () => {
    expect(fajitaServiceStatusBasePath("status.fajita.io")).toBe("");
    expect(fajitaServiceStatusBasePath("fajita.io")).toBe("/status");
  });

  it("builds canonical urls for apex and app hosts", () => {
    expect(fajitaServiceStatusCanonicalUrl("status.fajita.io")).toBe(
      "https://status.fajita.io/",
    );
    expect(fajitaServiceStatusCanonicalUrl("fajita.io")).toMatch(/\/status$/);
    expect(fajitaServiceStatusCanonicalUrl("status.fajita.io", "/history")).toBe(
      "https://status.fajita.io/history",
    );
  });

  it("rewrites status.fajita.io root to /status", () => {
    expect(resolveStatusHostRewrite("status.fajita.io", "/")).toBe("/status");
  });

  it("rewrites status.fajita.io incident paths to /status/incidents/*", () => {
    expect(resolveStatusHostRewrite("status.fajita.io", "/incidents/outage")).toBe(
      "/status/incidents/outage",
    );
    expect(resolveStatusHostRewrite("status.fajita.io", "/history")).toBe("/status/history");
  });

  it("passes through /status on the apex host", () => {
    expect(resolveStatusHostRewrite("status.fajita.io", "/status")).toBeNull();
    expect(resolveStatusHostRewrite("status.fajita.io", "/status/history")).toBeNull();
  });

  it("rewrites hosted subdomains to slug routes", () => {
    expect(resolveStatusHostRewrite("acme.status.fajita.io", "/")).toBe("/status/acme");
    expect(resolveStatusHostRewrite("acme.status.fajita.io", "/history")).toBe(
      "/status/acme/history",
    );
  });

  it("rewrites custom domains to the host resolver", () => {
    expect(resolveStatusHostRewrite("status.acme.com", "/")).toBe(
      "/_status-host/status.acme.com",
    );
  });
});
