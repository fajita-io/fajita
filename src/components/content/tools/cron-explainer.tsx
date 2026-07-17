"use client";

import { useMemo, useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import { explainCron } from "@/lib/content/tools/engines/cron";

export function CronExplainerTool() {
  const [expression, setExpression] = useState("0 */6 * * *");
  const [timezone, setTimezone] = useState("UTC");

  const result = useMemo(
    () => explainCron(expression, timezone, 5),
    [expression, timezone],
  );

  return (
    <div className="fj-tool">
      <p className="fj-body-sm fj-tool__privacy">
        The expression stays in your browser. No server request. Analytics never
        receive the expression text.
      </p>
      <div className="fj-tool__form">
        <label>
          Cron expression (5 fields)
          <input
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value);
              trackGoal(DataFastGoals.toolStarted, { tool: "cron-explainer" });
            }}
            spellCheck={false}
            aria-describedby="cron-syntax-help"
          />
        </label>
        <p id="cron-syntax-help" className="fj-body-sm">
          Format: minute hour day-of-month month day-of-week
        </p>
        <label>
          Timezone note
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="UTC">UTC (recommended for next runs)</option>
            <option value="America/Denver">America/Denver</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </label>
      </div>
      <div className="fj-tool__result" aria-live="polite">
        {result.ok ? (
          <>
            <p>
              <strong>Meaning:</strong> {result.human}
            </p>
            <p className="fj-body-sm">{result.syntaxNote}</p>
            {result.warnings.map((w) => (
              <p key={w} className="fj-body-sm">
                {w}
              </p>
            ))}
            <h3 className="fj-heading-3">Next runs (UTC)</h3>
            <ol>
              {result.nextRuns.map((r) => (
                <li key={r}>
                  <code>{r}</code>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="fj-form-error">{result.error}</p>
        )}
      </div>
    </div>
  );
}
