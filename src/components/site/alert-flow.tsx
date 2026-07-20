/**
 * Alert-flow visualization: a confirmed incident routing from the monitor
 * through verification to the configured channels, then the recovery
 * all-clear. Server-renderable SVG; the traveling-dash animation is pure
 * CSS and collapses under prefers-reduced-motion. A text alternative
 * carries the same story for screen readers.
 */
import { demoBrand } from "@/lib/site/demo-brand";

const channels = [
  { y: 40, label: "Email", detail: demoBrand.alertEmail },
  { y: 100, label: "Slack", detail: "#ops-alerts" },
  { y: 160, label: "Discord", detail: "#alerts" },
  { y: 220, label: "Webhook", detail: "signed JSON POST" },
];

export function AlertFlow({ animated = true }: { animated?: boolean }) {
  return (
    <figure
      className="fj-alert-flow-figure"
      data-flow-animated={animated || undefined}
    >
      <svg
        viewBox="0 0 640 284"
        preserveAspectRatio="xMidYMid meet"
        className="fj-alert-flow"
        role="img"
        aria-label="A confirmed incident routes from the monitor through verification to email, Slack, Discord, and webhook channels. Delivery is confirmed per channel, and a recovery message follows the same paths when checks pass again."
        fill="none"
      >
        {/* Monitor node */}
        <rect
          x="8"
          y="100"
          width="132"
          height="60"
          rx="12"
          fill="var(--color-background-elevated)"
          stroke="var(--color-border-strong)"
          strokeWidth="1.5"
        />
        <circle cx="30" cy="122" r="4" fill="var(--color-status-down-bold)" />
        <text
          x="42"
          y="126"
          fontFamily="var(--font-mono, monospace)"
          fontSize="12"
          fill="var(--color-text-primary)"
        >
          checkout API
        </text>
        <text
          x="30"
          y="146"
          fontFamily="var(--font-sans, sans-serif)"
          fontSize="11"
          fill="var(--color-text-muted)"
        >
          outage confirmed
        </text>

        {/* Verification node */}
        <line
          x1="140"
          y1="130"
          x2="230"
          y2="130"
          stroke="var(--color-status-down-bold)"
          strokeWidth="2"
          className="flow-line"
        />
        <rect
          x="230"
          y="100"
          width="132"
          height="60"
          rx="12"
          fill="var(--color-background-elevated)"
          stroke="var(--color-border-strong)"
          strokeWidth="1.5"
        />
        <circle cx="252" cy="122" r="4" fill="var(--color-brand-ember)" />
        <text
          x="264"
          y="126"
          fontFamily="var(--font-sans, sans-serif)"
          fontSize="12"
          fontWeight="600"
          fill="var(--color-text-primary)"
        >
          verified
        </text>
        <text
          x="252"
          y="146"
          fontFamily="var(--font-sans, sans-serif)"
          fontSize="11"
          fill="var(--color-text-muted)"
        >
          re-checked, agreed
        </text>

        {/* Channel fan-out */}
        {channels.map((c) => (
          <g key={c.label}>
            <path
              d={`M362 130 C 412 130, 422 ${c.y + 22}, 452 ${c.y + 22}`}
              stroke="var(--color-brand-ember)"
              strokeWidth="1.75"
              className="flow-line"
            />
            <rect
              x="452"
              y={c.y}
              width="180"
              height="44"
              rx="10"
              fill="var(--color-background-elevated)"
              stroke="var(--color-border-subtle)"
              strokeWidth="1.5"
            />
            <text
              x="468"
              y={c.y + 19}
              fontFamily="var(--font-sans, sans-serif)"
              fontSize="12"
              fontWeight="600"
              fill="var(--color-text-primary)"
            >
              {c.label}
            </text>
            <text
              x="468"
              y={c.y + 35}
              fontFamily="var(--font-mono, monospace)"
              fontSize="10"
              fill="var(--color-text-muted)"
            >
              {c.detail}
            </text>
            {/* Delivery confirmation */}
            <path
              d={`M609 ${c.y + 18} l4.5 4.5 8-9`}
              stroke="var(--color-status-operational-bold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
      <figcaption className="fj-alert-flow-figure__caption fj-caption">
        One verified incident, four channels, delivery confirmed. Recovery
        sends one clear all-clear along the same paths.
      </figcaption>
    </figure>
  );
}
