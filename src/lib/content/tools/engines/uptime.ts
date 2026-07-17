/**
 * Precise uptime calculator. Browser-safe, no network, no storage.
 * Allowed downtime = (1 - uptimeFraction) * periodSeconds.
 */

export type UptimePeriodId =
  | "24h"
  | "7d"
  | "30d"
  | "365d"
  | "custom-hours"
  | "custom-days";

export interface UptimeInput {
  /** Percentage from 0 to 100 inclusive. */
  percentage: number;
  period: UptimePeriodId;
  customValue?: number;
}

export interface UptimeResult {
  ok: true;
  uptimeFraction: number;
  periodSeconds: number;
  periodLabel: string;
  allowedDowntimeSeconds: number;
  availableSeconds: number;
  humanDowntime: string;
  humanAvailable: string;
}

export interface UptimeError {
  ok: false;
  error: string;
}

export type UptimeCalculation = UptimeResult | UptimeError;

const SECOND = 1;
const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

export function periodSeconds(
  period: UptimePeriodId,
  customValue?: number,
): { seconds: number; label: string } | { error: string } {
  switch (period) {
    case "24h":
      return { seconds: DAY, label: "24 hours" };
    case "7d":
      return { seconds: 7 * DAY, label: "7 days" };
    case "30d":
      return { seconds: 30 * DAY, label: "30 days" };
    case "365d":
      return { seconds: 365 * DAY, label: "365 days" };
    case "custom-hours": {
      if (customValue === undefined || !Number.isFinite(customValue) || customValue <= 0) {
        return { error: "Enter a positive number of hours." };
      }
      if (customValue > 24 * 365 * 10) {
        return { error: "Custom hours are too large." };
      }
      return {
        seconds: customValue * HOUR,
        label: `${customValue} hour${customValue === 1 ? "" : "s"}`,
      };
    }
    case "custom-days": {
      if (customValue === undefined || !Number.isFinite(customValue) || customValue <= 0) {
        return { error: "Enter a positive number of days." };
      }
      if (customValue > 3650) {
        return { error: "Custom days are too large." };
      }
      return {
        seconds: customValue * DAY,
        label: `${customValue} day${customValue === 1 ? "" : "s"}`,
      };
    }
  }
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  // Keep sub-second precision for high nines over short windows.
  const whole = Math.floor(totalSeconds + 1e-9);
  const frac = totalSeconds - whole;
  const days = Math.floor(whole / DAY);
  const hours = Math.floor((whole % DAY) / HOUR);
  const minutes = Math.floor((whole % HOUR) / MINUTE);
  const seconds = whole % MINUTE;
  const parts: string[] = [];
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (seconds || parts.length === 0) {
    const secDisplay =
      frac > 1e-6 && parts.length === 0
        ? (totalSeconds).toFixed(3).replace(/\.?0+$/, "")
        : String(seconds);
    parts.push(`${secDisplay} second${seconds === 1 && frac < 1e-6 ? "" : "s"}`);
  }
  return parts.join(" ");
}

export function calculateUptime(input: UptimeInput): UptimeCalculation {
  const { percentage, period, customValue } = input;
  if (!Number.isFinite(percentage)) {
    return { ok: false, error: "Enter a numeric uptime percentage." };
  }
  if (percentage < 0 || percentage > 100) {
    return { ok: false, error: "Uptime percentage must be between 0 and 100." };
  }

  const periodInfo = periodSeconds(period, customValue);
  if ("error" in periodInfo) {
    return { ok: false, error: periodInfo.error };
  }

  const uptimeFraction = percentage / 100;
  const allowedDowntimeSeconds =
    (1 - uptimeFraction) * periodInfo.seconds;
  const availableSeconds = uptimeFraction * periodInfo.seconds;

  return {
    ok: true,
    uptimeFraction,
    periodSeconds: periodInfo.seconds,
    periodLabel: periodInfo.label,
    allowedDowntimeSeconds,
    availableSeconds,
    humanDowntime: formatDuration(allowedDowntimeSeconds),
    humanAvailable: formatDuration(availableSeconds),
  };
}

/** Common reference table for docs and UI. */
export function commonUptimeTable(period: UptimePeriodId = "30d") {
  const targets = [99, 99.9, 99.99, 99.999];
  return targets.map((percentage) => {
    const result = calculateUptime({ percentage, period });
    if (!result.ok) throw new Error(result.error);
    return {
      percentage,
      humanDowntime: result.humanDowntime,
      allowedDowntimeSeconds: result.allowedDowntimeSeconds,
    };
  });
}

// Keep SECOND referenced for clarity in audits.
void SECOND;
