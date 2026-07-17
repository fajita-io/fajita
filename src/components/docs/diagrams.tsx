import type { ReactNode } from "react";

/**
 * Original Fajita documentation diagrams. Each is an inline SVG built from
 * theme tokens so it works in light and dark mode, scales responsively, and
 * carries an accessible description supplied by the content block. No external
 * assets, no copied competitor artwork.
 */

function Node({
  x,
  y,
  w,
  label,
  tone = "surface",
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  tone?: "surface" | "ember" | "down" | "ok";
}) {
  const fill =
    tone === "ember"
      ? "var(--color-brand-heat-soft)"
      : tone === "down"
        ? "var(--color-status-down-soft)"
        : tone === "ok"
          ? "var(--color-status-operational-soft)"
          : "var(--color-background-elevated)";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={40}
        rx={10}
        fill={fill}
        stroke="var(--color-border-strong)"
      />
      <text
        x={x + w / 2}
        y={y + 24}
        textAnchor="middle"
        fontSize="13"
        fill="var(--color-text-primary)"
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
    </g>
  );
}

function Arrow({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke="var(--color-brand-heat)"
      strokeWidth={2}
      markerEnd="url(#fj-arrow)"
    />
  );
}

function Defs() {
  return (
    <defs>
      <marker id="fj-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-brand-heat)" />
      </marker>
    </defs>
  );
}

function MonitoringFlow() {
  return (
    <svg viewBox="0 0 760 80" role="img" width="100%" preserveAspectRatio="xMidYMid meet">
      <Defs />
      <Node x={0} y={20} w={110} label="Check" />
      <Arrow x1={110} x2={140} y={40} />
      <Node x={140} y={20} w={110} label="Retry" tone="ember" />
      <Arrow x1={250} x2={280} y={40} />
      <Node x={280} y={20} w={140} label="Verification" tone="ember" />
      <Arrow x1={420} x2={450} y={40} />
      <Node x={450} y={20} w={140} label="Incident" tone="down" />
      <Arrow x1={590} x2={620} y={40} />
      <Node x={620} y={20} w={140} label="Recovery" tone="ok" />
    </svg>
  );
}

function RetryVsVerification() {
  return (
    <svg viewBox="0 0 620 130" role="img" width="100%" preserveAspectRatio="xMidYMid meet">
      <Defs />
      <Node x={0} y={10} w={150} label="Failed check" tone="down" />
      <Arrow x1={150} x2={185} y={30} />
      <Node x={185} y={10} w={120} label="Retry" tone="ember" />
      <Arrow x1={305} x2={340} y={30} />
      <Node x={340} y={10} w={160} label="Still failing?" tone="ember" />
      <Arrow x1={80} x2={80} y={50} />
      <Node x={0} y={80} w={260} label="Count consecutive failures" />
      <Arrow x1={260} x2={295} y={100} />
      <Node x={295} y={80} w={220} label="Threshold met opens incident" tone="down" />
    </svg>
  );
}

const DIAGRAMS: Record<string, () => ReactNode> = {
  "monitoring-flow": MonitoringFlow,
  "retry-vs-verification": RetryVsVerification,
};

export function DocsDiagram({
  id,
  caption,
  description,
}: {
  id: string;
  caption: string;
  description: string;
}) {
  const Component = DIAGRAMS[id];
  return (
    <figure className="fj-docs-diagram">
      <div className="fj-docs-diagram__canvas" role="group" aria-label={caption}>
        {Component ? <Component /> : null}
        <p className="fj-docs-diagram__desc">{description}</p>
      </div>
      <figcaption className="fj-docs-diagram__caption">{caption}</figcaption>
    </figure>
  );
}
