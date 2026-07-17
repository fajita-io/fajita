"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { updateAppearanceAction } from "@/lib/app/actions/status-pages";
import { STATUS_PAGE_THEMES, type StatusPageTheme } from "@/lib/status-pages/constants";
import type { Appearance } from "@/lib/status-pages/appearance";

const THEME_LABEL: Record<StatusPageTheme, string> = {
  signal: "Signal (minimal, technical)",
  ember: "Ember (warm, premium)",
  paper: "Paper (light editorial)",
  midnight: "Midnight (dark operational)",
};

const ACCENT_PRESETS = ["#c2410c", "#b42318", "#2b5b8c", "#3f7d2e", "#6d28d9", "#0f766e", "#1f2937"];

export function AppearanceEditor({
  organizationId,
  statusPageId,
  themeKey,
  appearance,
  canManage,
}: {
  organizationId: string;
  statusPageId: string;
  themeKey: StatusPageTheme;
  appearance: Appearance;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [theme, setTheme] = useState<StatusPageTheme>(themeKey);
  const [accent, setAccent] = useState(appearance.accentColor);
  const [density, setDensity] = useState(appearance.density);
  const [radius, setRadius] = useState(appearance.radius);
  const [headerStyle, setHeaderStyle] = useState(appearance.headerStyle);

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateAppearanceAction(organizationId, statusPageId, {
        themeKey: theme,
        accentColor: accent,
        density,
        radius,
        headerStyle,
      });
      if (!result.ok) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: "Appearance saved. Republish to update the live page." });
      router.refresh();
    });
  }

  return (
    <div className="fj-sp-form">
      {message ? (
        <div className="fj-sp-alert" data-tone={message.tone} role="status">
          {message.text}
        </div>
      ) : null}

      <div className="fj-sp-field">
        <label htmlFor="a-theme">Theme</label>
        <select
          id="a-theme"
          className="fj-sp-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value as StatusPageTheme)}
          disabled={!canManage}
        >
          {STATUS_PAGE_THEMES.map((t) => (
            <option key={t} value={t}>
              {THEME_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="fj-sp-field">
        <label htmlFor="a-accent">Accent color</label>
        <div className="fj-sp-swatches">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className="fj-sp-swatch"
              style={{ background: c }}
              aria-pressed={accent.toLowerCase() === c.toLowerCase()}
              aria-label={`Use accent ${c}`}
              onClick={() => setAccent(c)}
              disabled={!canManage}
            />
          ))}
        </div>
        <input
          id="a-accent"
          className="fj-sp-input"
          style={{ maxWidth: "10rem" }}
          value={accent}
          onChange={(e) => setAccent(e.target.value)}
          maxLength={9}
          disabled={!canManage}
        />
        <span className="fj-sp-field__hint">
          Contrast is checked automatically. Low-contrast colors are rejected so status text stays readable.
        </span>
      </div>

      <div className="fj-sp-field">
        <label htmlFor="a-density">Density</label>
        <select id="a-density" className="fj-sp-select" value={density} onChange={(e) => setDensity(e.target.value as Appearance["density"])} disabled={!canManage}>
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </div>

      <div className="fj-sp-field">
        <label htmlFor="a-radius">Corner radius</label>
        <select id="a-radius" className="fj-sp-select" value={radius} onChange={(e) => setRadius(e.target.value as Appearance["radius"])} disabled={!canManage}>
          <option value="sharp">Sharp</option>
          <option value="soft">Soft</option>
          <option value="round">Round</option>
        </select>
      </div>

      <div className="fj-sp-field">
        <label htmlFor="a-header">Header style</label>
        <select id="a-header" className="fj-sp-select" value={headerStyle} onChange={(e) => setHeaderStyle(e.target.value as Appearance["headerStyle"])} disabled={!canManage}>
          <option value="minimal">Minimal</option>
          <option value="bordered">Bordered</option>
        </select>
      </div>

      {canManage ? (
        <div className="fj-sp-actions">
          <BrandButton type="button" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save appearance"}
          </BrandButton>
        </div>
      ) : null}
    </div>
  );
}
