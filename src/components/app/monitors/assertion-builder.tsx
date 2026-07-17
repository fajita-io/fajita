"use client";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { assertionLabel } from "@/lib/monitoring/display";

export interface AssertionDraft {
  assertion_type: string;
  field_path: string | null;
  operator: string | null;
  expected_value: string | null;
  expected_value_type: "string" | "number" | "boolean" | "duration" | "none";
  case_sensitive: boolean;
  position: number;
}

/** Assertion types offered in the visual builder. No condition language, no eval. */
const OFFERED = [
  "body_contains",
  "body_not_contains",
  "header_equals",
  "json_path_exists",
  "json_path_not_exists",
  "json_path_equals",
  "json_number_gte",
  "json_number_lte",
] as const;

function needsFieldPath(type: string): boolean {
  return type.startsWith("json_") || type === "header_equals";
}
function needsValue(type: string): boolean {
  return type !== "json_path_exists" && type !== "json_path_not_exists";
}
function valueType(type: string): AssertionDraft["expected_value_type"] {
  if (type.startsWith("json_number")) return "number";
  return "string";
}
function fieldPlaceholder(type: string): string {
  if (type === "header_equals") return "content-type";
  return "data.health";
}

/**
 * Visual assertion builder. Add, remove, and reorder assertions with keyboard
 * controls (never drag-only). Each row explains itself. Server-side validation
 * is the source of truth; this is a typed convenience over the same rules.
 */
export function AssertionBuilder({
  value,
  onChange,
  max = 50,
}: {
  value: AssertionDraft[];
  onChange: (next: AssertionDraft[]) => void;
  max?: number;
}) {
  function update(index: number, patch: Partial<AssertionDraft>) {
    onChange(value.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }
  function add() {
    if (value.length >= max) return;
    onChange([
      ...value,
      {
        assertion_type: "body_contains",
        field_path: null,
        operator: null,
        expected_value: "",
        expected_value_type: "string",
        case_sensitive: false,
        position: value.length,
      },
    ]);
  }
  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index).map((a, i) => ({ ...a, position: i })));
  }
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((a, i) => ({ ...a, position: i })));
  }

  return (
    <div>
      <div className="fj-assert-list">
        {value.map((a, i) => (
          <div className="fj-assert-row" key={i}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button
                type="button"
                className="fj-icon-button"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <BrandIcon name="chevron-down" size={14} className="fj-flip-up" />
              </button>
              <button
                type="button"
                className="fj-icon-button"
                aria-label="Move down"
                disabled={i === value.length - 1}
                onClick={() => move(i, 1)}
              >
                <BrandIcon name="chevron-down" size={14} />
              </button>
            </div>
            <div className="fj-assert-row__body">
              <select
                className="fj-select"
                aria-label="Assertion type"
                value={a.assertion_type}
                onChange={(e) => {
                  const t = e.target.value;
                  update(i, {
                    assertion_type: t,
                    field_path: needsFieldPath(t) ? (a.field_path ?? "") : null,
                    expected_value: needsValue(t) ? (a.expected_value ?? "") : null,
                    expected_value_type: valueType(t),
                  });
                }}
              >
                {OFFERED.map((t) => (
                  <option key={t} value={t}>{assertionLabel(t)}</option>
                ))}
              </select>
              {needsFieldPath(a.assertion_type) ? (
                <input
                  className="fj-input"
                  aria-label={a.assertion_type === "header_equals" ? "Header name" : "JSON path"}
                  placeholder={fieldPlaceholder(a.assertion_type)}
                  value={a.field_path ?? ""}
                  onChange={(e) => update(i, { field_path: e.target.value })}
                  style={{ maxWidth: "10rem" }}
                />
              ) : null}
              {needsValue(a.assertion_type) ? (
                <input
                  className="fj-input"
                  aria-label="Expected value"
                  type={a.expected_value_type === "number" ? "number" : "text"}
                  placeholder={a.expected_value_type === "number" ? "0" : "healthy"}
                  value={a.expected_value ?? ""}
                  onChange={(e) => update(i, { expected_value: e.target.value })}
                  style={{ maxWidth: "10rem" }}
                />
              ) : null}
              {a.assertion_type === "body_contains" || a.assertion_type === "body_not_contains" ? (
                <label className="fj-check" style={{ padding: 0, fontSize: "0.8rem" }}>
                  <input
                    type="checkbox"
                    checked={a.case_sensitive}
                    onChange={(e) => update(i, { case_sensitive: e.target.checked })}
                  />
                  <span>Match case</span>
                </label>
              ) : null}
            </div>
            <button type="button" className="fj-icon-button" aria-label="Remove assertion" onClick={() => remove(i)}>
              <BrandIcon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
      {value.length < max ? (
        <div style={{ marginTop: "var(--space-3)" }}>
          <BrandButton variant="secondary" size="sm" onClick={add}>
            <BrandIcon name="plus" size={14} /> Add assertion
          </BrandButton>
        </div>
      ) : (
        <p className="fj-wiz__hint">You have reached the assertion limit for this monitor.</p>
      )}
    </div>
  );
}
