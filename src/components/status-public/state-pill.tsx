import {
  COMPONENT_STATE_LABEL,
  type PublicComponentState,
} from "@/lib/status-pages/constants";

/**
 * A component state pill. State is communicated three ways at once: label text,
 * a shape glyph, and color. Never color alone, so it stays readable for
 * color-blind visitors and in high-contrast modes.
 */
export function StatePill({ state }: { state: PublicComponentState }) {
  return (
    <span className="sp-pill" data-state={state}>
      <span className="sp-pill__glyph" aria-hidden="true" />
      {COMPONENT_STATE_LABEL[state]}
    </span>
  );
}
