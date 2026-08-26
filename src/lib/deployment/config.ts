/**
 * Central deployment configuration for Fajita.
 *
 * Fajita runs in one of two modes:
 * - cloud: Fajita Cloud (managed hosting, billing, analytics defaults)
 * - self_hosted: operator-run deployment without Fajita-owned credentials
 *
 * Set FAJITA_DEPLOYMENT_MODE explicitly. When unset, cloud is assumed so
 * production behavior is unchanged.
 */

import { z } from "zod";

export type DeploymentMode = "cloud" | "self_hosted";

const modeSchema = z.enum(["cloud", "self_hosted"]);

function parseMode(raw: string | undefined): DeploymentMode {
  const normalized = raw?.trim().toLowerCase().replace(/-/g, "_");
  if (!normalized) return "cloud";
  const parsed = modeSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(
      `Invalid FAJITA_DEPLOYMENT_MODE "${raw}". Expected "cloud" or "self_hosted".`,
    );
  }
  return parsed.data;
}

function envFlag(name: string, defaultValue = false): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return defaultValue;
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

export interface DeploymentConfig {
  mode: DeploymentMode;
  isCloud: boolean;
  isSelfHosted: boolean;
  /** Stripe subscription billing is active only in cloud mode. */
  billingEnabled: boolean;
  /** Product analytics (DataFast, GA) default off in self-hosted mode. */
  analyticsEnabled: boolean;
  /** Error reporting (Sentry) default off in self-hosted unless configured. */
  telemetryOptIn: boolean;
  /** Allow monitor checks against private/link-local addresses. */
  allowPrivateNetworks: boolean;
  /** Optional comma-separated CIDR allowlist when private monitoring is enabled. */
  allowedPrivateCidrs: string[];
  publicAppUrl: string;
  workerConcurrency: number;
  schedulerLeaseBatch: number;
  version: string;
}

let cached: DeploymentConfig | null = null;

function readVersion(): string {
  return (
    process.env.FAJITA_VERSION?.trim() ||
    process.env.npm_package_version?.trim() ||
    "0.0.0-dev"
  );
}

/**
 * Resolved deployment configuration. Safe to import anywhere; does not expose
 * secrets. Validates mode on first access.
 */
export function deploymentConfig(): DeploymentConfig {
  if (cached) return cached;

  const mode = parseMode(process.env.FAJITA_DEPLOYMENT_MODE);
  const isSelfHosted = mode === "self_hosted";

  const analyticsExplicit = process.env.FAJITA_ANALYTICS_ENABLED?.trim();
  const telemetryExplicit = process.env.FAJITA_TELEMETRY_ENABLED?.trim();

  cached = {
    mode,
    isCloud: mode === "cloud",
    isSelfHosted,
    billingEnabled: mode === "cloud" && envFlag("BILLING_ENFORCEMENT_ENABLED"),
    analyticsEnabled: analyticsExplicit
      ? envFlag("FAJITA_ANALYTICS_ENABLED")
      : !isSelfHosted,
    telemetryOptIn: telemetryExplicit
      ? envFlag("FAJITA_TELEMETRY_ENABLED")
      : !isSelfHosted,
    allowPrivateNetworks: envFlag("FAJITA_ALLOW_PRIVATE_NETWORKS"),
    allowedPrivateCidrs: (process.env.FAJITA_ALLOWED_PRIVATE_CIDRS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    publicAppUrl: (
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ).replace(/\/$/, ""),
    workerConcurrency: Math.max(
      1,
      Number.parseInt(process.env.MONITOR_WORKER_CONCURRENCY ?? "16", 10) || 16,
    ),
    schedulerLeaseBatch: Math.max(
      1,
      Number.parseInt(process.env.MONITOR_WORKER_LEASE_BATCH ?? "20", 10) || 20,
    ),
    version: readVersion(),
  };

  return cached;
}

/** Reset cached config (tests only). */
export function resetDeploymentConfigCache(): void {
  cached = null;
}

/** Primary hostname derived from the configured public app URL. */
export function primaryAppHost(): string {
  try {
    return new URL(deploymentConfig().publicAppUrl).hostname.toLowerCase();
  } catch {
    return "localhost";
  }
}

/** Hostnames that serve the marketing/app shell (never status-page rewrites). */
export function platformHosts(): ReadonlySet<string> {
  const host = primaryAppHost();
  const hosts = new Set([
    "localhost",
    "127.0.0.1",
    host,
    `www.${host}`,
  ]);
  if (deploymentConfig().isCloud) {
    hosts.add("fajita.io");
    hosts.add("www.fajita.io");
  }
  return hosts;
}
