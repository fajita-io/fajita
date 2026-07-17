"use client";

import { useMemo, useState } from "react";

import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import {
  STATUS_CHECKLIST_ITEMS,
  checklistPlainText,
  summarizeChecklist,
  type ChecklistAnswers,
  type ChecklistState,
} from "@/lib/content/tools/engines/status-checklist";

const STATES: { id: ChecklistState; label: string }[] = [
  { id: "unset", label: "Unset" },
  { id: "yes", label: "Yes" },
  { id: "partial", label: "Partial" },
  { id: "no", label: "No" },
];

export function StatusChecklistTool() {
  const [answers, setAnswers] = useState<ChecklistAnswers>({});
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => summarizeChecklist(answers), [answers]);

  function setItem(id: string, state: ChecklistState) {
    trackGoal(DataFastGoals.toolStarted, { tool: "status-checklist" });
    setAnswers((prev) => ({ ...prev, [id]: state }));
  }

  function reset() {
    setAnswers({});
  }

  async function copy() {
    await navigator.clipboard.writeText(checklistPlainText(answers));
    setCopied(true);
    trackGoal(DataFastGoals.toolResultCopied, { tool: "status-checklist" });
    trackGoal(DataFastGoals.toolCompleted, { tool: "status-checklist" });
    setTimeout(() => setCopied(false), 2000);
  }

  const categories = [...new Set(STATUS_CHECKLIST_ITEMS.map((i) => i.category))];

  return (
    <div className="fj-tool">
      <p className="fj-body-sm fj-tool__privacy">
        Answers stay in your browser unless you copy them. No account required.
        This is not a certification.
      </p>
      {categories.map((category) => (
        <fieldset key={category} className="fj-tool__fieldset">
          <legend>{category}</legend>
          {STATUS_CHECKLIST_ITEMS.filter((i) => i.category === category).map(
            (item) => (
              <label key={item.id} className="fj-tool__check-row">
                <span>
                  {item.label}
                  {item.critical ? " (critical)" : ""}
                </span>
                <select
                  value={answers[item.id] ?? "unset"}
                  onChange={(e) =>
                    setItem(item.id, e.target.value as ChecklistState)
                  }
                >
                  {STATES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            ),
          )}
        </fieldset>
      ))}

      <div className="fj-tool__result" aria-live="polite">
        <p>
          Overall: <strong>{summary.overall}</strong>
        </p>
        <p className="fj-body-sm">
          Ready {summary.ready}. Needs review {summary.needsReview}. Missing
          critical {summary.missingCritical}. Unset {summary.unset}.
        </p>
        <div className="fj-tool__actions">
          <button type="button" className="fj-button fj-button--secondary" onClick={copy}>
            {copied ? "Copied" : "Copy summary"}
          </button>
          <button type="button" className="fj-button fj-button--secondary" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
