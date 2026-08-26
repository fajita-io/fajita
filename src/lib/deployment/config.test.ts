import { afterEach, describe, expect, it } from "vitest";

import {
  deploymentConfig,
  platformHosts,
  resetDeploymentConfigCache,
} from "./config";

describe("deploymentConfig", () => {
  afterEach(() => {
    delete process.env.FAJITA_DEPLOYMENT_MODE;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.FAJITA_ANALYTICS_ENABLED;
    resetDeploymentConfigCache();
  });

  it("defaults to cloud mode", () => {
    const cfg = deploymentConfig();
    expect(cfg.mode).toBe("cloud");
    expect(cfg.isCloud).toBe(true);
    expect(cfg.isSelfHosted).toBe(false);
    expect(cfg.billingEnabled).toBe(false);
    expect(cfg.analyticsEnabled).toBe(true);
  });

  it("self_hosted disables billing and analytics by default", () => {
    process.env.FAJITA_DEPLOYMENT_MODE = "self_hosted";
    resetDeploymentConfigCache();
    const cfg = deploymentConfig();
    expect(cfg.isSelfHosted).toBe(true);
    expect(cfg.billingEnabled).toBe(false);
    expect(cfg.analyticsEnabled).toBe(false);
    expect(cfg.telemetryOptIn).toBe(false);
  });

  it("platformHosts includes configured app host", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://monitor.example.com";
    resetDeploymentConfigCache();
    const hosts = platformHosts();
    expect(hosts.has("monitor.example.com")).toBe(true);
    expect(hosts.has("localhost")).toBe(true);
  });
});
