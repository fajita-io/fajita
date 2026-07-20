"use client";

/**
 * Fajita-branded floating feedback trigger. Sits bottom-left so Ask Fajita
 * can stay bottom-right without overlap.
 */
export function GeniusFloatingTrigger() {
  return (
    <div className="fj-genius-anchor" data-testid="genius-floating-trigger">
      <button
        type="button"
        className="fj-genius-launcher"
        data-genius-open
        data-genius-source="floating"
        aria-haspopup="dialog"
        aria-label="Share product feedback"
      >
        <span className="fj-genius-launcher__mark" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
            <path
              d="M10 2.5 11.8 7.2 16.5 9 11.8 10.8 10 15.5 8.2 10.8 3.5 9 8.2 7.2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M4.5 14.5h11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="fj-genius-launcher__label">Got a genius idea?</span>
      </button>
    </div>
  );
}
