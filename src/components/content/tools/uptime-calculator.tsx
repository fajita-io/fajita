"use client";

import { useMemo, useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import {
  calculateUptime,
  commonUptimeTable,
  type UptimePeriodId,
} from "@/lib/content/tools/engines/uptime";

export function UptimeCalculatorTool() {
  const [percentage, setPercentage] = useState("99.9");
  const [period, setPeriod] = useState<UptimePeriodId>("30d");
  const [customValue, setCustomValue] = useState("24");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const n = Number(percentage);
    return calculateUptime({
      percentage: n,
      period,
      customValue:
        period === "custom-hours" || period === "custom-days"
          ? Number(customValue)
          : undefined,
    });
  }, [percentage, period, customValue]);

  const table = useMemo(() => commonUptimeTable("30d"), []);

  async function copyResult() {
    if (!result.ok) return;
    const text = [
      `Uptime target: ${percentage}%`,
      `Period: ${result.periodLabel}`,
      `Allowed downtime: ${result.humanDowntime}`,
      `Available time: ${result.humanAvailable}`,
      "",
      "Monitoring definitions vary. This is not contractual SLA compliance.",
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    trackGoal(DataFastGoals.toolResultCopied, { tool: "uptime-calculator" });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fj-tool">
      <div className="fj-tool__form">
        <label>
          Uptime percentage
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="any"
            value={percentage}
            onChange={(e) => {
              setPercentage(e.target.value);
              trackGoal(DataFastGoals.toolStarted, { tool: "uptime-calculator" });
            }}
          />
        </label>
        <label>
          Period
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as UptimePeriodId)}
          >
            <option value="24h">24 hours</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="365d">365 days</option>
            <option value="custom-hours">Custom hours</option>
            <option value="custom-days">Custom days</option>
          </select>
        </label>
        {(period === "custom-hours" || period === "custom-days") && (
          <label>
            Custom value
            <input
              type="number"
              min={0.0001}
              step="any"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="fj-tool__result" aria-live="polite">
        {result.ok ? (
          <>
            <p>
              Allowed downtime over {result.periodLabel}:{" "}
              <strong>{result.humanDowntime}</strong>
            </p>
            <p>
              Available time: <strong>{result.humanAvailable}</strong>
            </p>
            <p className="fj-body-sm">
              Calendar months vary in length. The 30-day option uses exactly 30
              days. Uptime percentage is not automatically contractual SLA
              compliance.
            </p>
            <button type="button" className="fj-button fj-button--secondary" onClick={copyResult}>
              {copied ? "Copied" : "Copy result"}
            </button>
          </>
        ) : (
          <p className="fj-form-error">{result.error}</p>
        )}
      </div>

      <table className="fj-tool__table">
        <caption>Common targets over 30 days</caption>
        <thead>
          <tr>
            <th scope="col">Target</th>
            <th scope="col">Allowed downtime</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.percentage}>
              <td>{row.percentage}%</td>
              <td>{row.humanDowntime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
