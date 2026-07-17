import type { CSSProperties, ReactNode } from "react";

export function LabSection({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      style={{
        paddingBlock: "var(--space-12)",
        borderTop: "1px solid var(--color-border-subtle)",
      }}
    >
      <h2 id={`${id}-h`} className="fj-heading-2" style={{ marginBottom: "var(--space-2)" }}>
        {title}
      </h2>
      {note ? (
        <p className="fj-body-sm" style={{ maxWidth: "52rem", marginBottom: "var(--space-6)" }}>
          {note}
        </p>
      ) : null}
      {children}
    </section>
  );
}

export function LabGrid({
  min = "14rem",
  children,
  style,
}: {
  min?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}, 100%), 1fr))`,
        gap: "var(--space-4)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function LabSpecimen({
  label,
  dark = false,
  children,
  style,
}: {
  label: string;
  dark?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <figure style={{ margin: 0 }}>
      <div
        data-theme={dark ? "dark" : undefined}
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "7rem",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-subtle)",
          background: dark ? "var(--fj-carbon-950)" : "var(--color-background-elevated)",
          ...style,
        }}
      >
        {children}
      </div>
      <figcaption className="fj-caption" style={{ marginTop: "var(--space-2)" }}>
        {label}
      </figcaption>
    </figure>
  );
}
