"use client";

import { useEffect, useState } from "react";

import { useTheme } from "@/lib/theme/use-theme";
import type { ThemePreference } from "@/lib/theme/theme-script";

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

/**
 * Three-state theme control: light, system, dark. Persists to localStorage
 * and applies without a flash (init script runs pre-paint). Rendered as a
 * radio group for correct keyboard and screen-reader semantics.
 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <fieldset
      style={{
        display: "inline-flex",
        gap: "2px",
        border: "1.5px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-pill)",
        padding: "3px",
        margin: 0,
      }}
    >
      <legend
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        Color theme
      </legend>
      {options.map((o) => {
        const active = mounted ? preference === o.value : o.value === "system";
        return (
          <label
            key={o.value}
            className="fj-interactive"
            style={{
              fontSize: "var(--text-label)",
              fontWeight: 500,
              padding: "var(--space-1) var(--space-3)",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              background: active ? "var(--color-background-inset)" : "transparent",
              color: active
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
            }}
          >
            <input
              type="radio"
              name="fajita-theme"
              value={o.value}
              checked={mounted ? preference === o.value : o.value === "system"}
              onChange={() => setPreference(o.value)}
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
              }}
            />
            {o.label}
          </label>
        );
      })}
    </fieldset>
  );
}
