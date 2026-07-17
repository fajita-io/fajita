"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Accessible tabs. Panels are pre-rendered on the server and passed as
 * children so the client component only manages selection and focus.
 */
export function DocsTabs({ items }: { items: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const base = useId();

  return (
    <div className="fj-docs-tabs">
      <div className="fj-docs-tabs__list" role="tablist" aria-label="Examples">
        {items.map((item, i) => (
          <button
            key={item.label}
            id={`${base}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={active === i}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            className="fj-docs-tabs__tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setActive((a) => (a + 1) % items.length);
              if (e.key === "ArrowLeft") setActive((a) => (a - 1 + items.length) % items.length);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={item.label}
          id={`${base}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${i}`}
          hidden={active !== i}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
