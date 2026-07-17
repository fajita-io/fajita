import type { CSSProperties } from "react";

import { thermalStates, type ThermalStackState } from "./types";

export interface ThermalStackProps {
  state?: ThermalStackState;
  /**
   * Enables signal travel and pulse animation. Reduced-motion users get the
   * static rendering regardless (CSS media query). Default true.
   */
  animated?: boolean;
  /**
   * Simplified composition for small viewports: two nodes, no alert rail.
   * Use at container widths under ~480px.
   */
  simplified?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Precomputed surface waveforms spanning the heat surface (96 to 384). Crossfaded by opacity. */
const waveforms = {
  calm: "M96 208Q108 198 120 208T144 208T168 208T192 208T216 208T240 208T264 208T288 208T312 208T336 208T360 208T384 208",
  tense:
    "M96 206Q110 190 124 204Q138 216 152 202Q166 190 180 210Q194 222 208 196Q222 184 236 208Q250 220 264 198Q278 186 292 210Q306 222 320 198Q334 186 348 206Q366 216 384 202",
  spike: "M96 210h96l24-56 22 56h20l16-32 14 32h96",
};

const nodes = [
  { x: 120, label: "HTTP" },
  { x: 208, label: "API" },
  { x: 296, label: "SSL" },
  { x: 384, label: "CRON" },
];

/**
 * The Thermal Stack: Fajita's signature animated brand object. An abstract
 * monitored system: service nodes feeding signals into a controlled heat
 * surface. State drives color, rhythm, and the surface waveform.
 *
 * Server-renderable. Animation is pure CSS (stroke-dash travel, scale/opacity
 * pulse, opacity crossfade); no JS timers, no canvas, no WebGL. Static
 * fallback = animated:false or prefers-reduced-motion.
 *
 * Docs: src/components/brand/thermal-stack/README.md
 */
export function ThermalStack({
  state = "operational",
  animated = true,
  simplified = false,
  className,
  style,
}: ThermalStackProps) {
  const spec = thermalStates[state];
  const shownNodes = simplified ? nodes.slice(1, 3) : nodes;
  const alertVisible = state === "down" && !simplified;

  const vars = {
    "--ts-signal": spec.signalColor,
    "--ts-soft": spec.softColor,
    "--ts-heat": String(spec.heatLevel),
    "--ts-cycle": `${spec.pulseSeconds}s`,
  } as CSSProperties;

  return (
    <figure
      className={`fj-thermal-stack${className ? ` ${className}` : ""}`}
      style={{ margin: 0, ...vars, ...style }}
      data-state={state}
      data-animated={animated || undefined}
    >
      <svg
        viewBox="0 0 480 300"
        role="img"
        aria-label={`Monitored system, ${spec.label.toLowerCase()}: ${spec.description}`}
        style={{ display: "block", width: "100%", height: "auto" }}
        fill="none"
      >
        <defs>
          <radialGradient id="ts-heat-glow" cx="50%" cy="100%" r="75%">
            <stop offset="0%" stopColor="var(--fj-ember-500)" stopOpacity="0.55" />
            <stop offset="55%" stopColor="var(--fj-ember-400)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--fj-ember-400)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Service nodes */}
        {shownNodes.map((n) => (
          <g key={n.label}>
            <line
              x1={n.x}
              y1={64}
              x2={n.x}
              y2={148}
              stroke="var(--ts-signal)"
              strokeWidth="2"
              strokeDasharray="3 9"
              className="ts-signal-line fj-thermal-transition"
            />
            <rect
              x={n.x - 30}
              y={22}
              width="60"
              height="34"
              rx="10"
              fill="var(--color-background-elevated)"
              stroke="var(--color-border-subtle)"
              strokeWidth="1.5"
            />
            <circle
              cx={n.x - 17}
              cy={39}
              r="3.5"
              fill="var(--ts-signal)"
              className="ts-node-dot fj-thermal-transition"
            />
            <text
              x={n.x + 6}
              y={43.5}
              textAnchor="middle"
              fontFamily="var(--font-mono, monospace)"
              fontSize="11"
              letterSpacing="0.06em"
              fill="var(--color-text-secondary)"
            >
              {n.label}
            </text>
          </g>
        ))}

        {/* Heat glow under the surface */}
        <ellipse
          cx="240"
          cy="252"
          rx="200"
          ry="72"
          fill="url(#ts-heat-glow)"
          opacity="var(--ts-heat)"
          className="fj-thermal-transition"
        />

        {/* Controlled heat surface: the brand boundary at scene scale */}
        <rect
          x="72"
          y="148"
          width="336"
          height="104"
          rx="24"
          fill="var(--color-background-elevated)"
          stroke="var(--color-border-strong)"
          strokeWidth="2"
        />
        <rect
          x="72"
          y="148"
          width="336"
          height="104"
          rx="24"
          fill="var(--ts-soft)"
          opacity="0.5"
          className="fj-thermal-transition"
        />

        {/* Surface waveforms, crossfaded by state */}
        {(Object.keys(waveforms) as Array<keyof typeof waveforms>).map((w) => (
          <path
            key={w}
            d={waveforms[w]}
            stroke="var(--ts-signal)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={spec.waveform === w ? 1 : 0}
            className="fj-thermal-transition"
          />
        ))}

        {/* The observer: ember dot above the surface, the mark's dot at scene scale */}
        <circle
          cx="240"
          cy="128"
          r="6"
          fill="var(--color-brand-ember)"
          className="ts-observer"
        />

        {/* Alert leaving the system on confirmed outage */}
        {alertVisible ? (
          <g className="ts-alert fj-animate-rise">
            <line
              x1="408"
              y1="200"
              x2="440"
              y2="200"
              stroke="var(--ts-signal)"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="ts-signal-line"
            />
            <rect
              x="426"
              y="178"
              width="46"
              height="26"
              rx="8"
              fill="var(--color-status-down-soft)"
              stroke="var(--color-status-down-bold)"
              strokeWidth="1.5"
            />
            <text
              x="449"
              y="195"
              textAnchor="middle"
              fontFamily="var(--font-mono, monospace)"
              fontSize="10"
              fill="var(--color-status-down)"
            >
              alert
            </text>
          </g>
        ) : null}
      </svg>

      <figcaption className="fj-caption" style={{ marginTop: "var(--space-2)" }}>
        {spec.label}: {spec.description}
      </figcaption>

      {/* Scoped animation. Runs only when data-animated; reduced motion turns it off. */}
      <style>{`
        .fj-thermal-stack[data-animated] .ts-signal-line {
          animation: fj-signal-travel var(--ts-cycle) linear infinite;
        }
        .fj-thermal-stack[data-animated] .ts-observer {
          transform-origin: 240px 128px;
          transform-box: view-box;
          animation: fj-pulse var(--ts-cycle) var(--ease-thermal) infinite;
        }
        .fj-thermal-stack[data-animated][data-state="verifying"] .ts-observer,
        .fj-thermal-stack[data-animated][data-state="down"] .ts-observer {
          animation-name: fj-pulse-fast;
        }
        @media (prefers-reduced-motion: reduce) {
          .fj-thermal-stack .ts-signal-line,
          .fj-thermal-stack .ts-observer {
            animation: none !important;
          }
        }
      `}</style>
    </figure>
  );
}

/** Static fallback: identical scene, no motion. Safe anywhere, including emails rendered to HTML. */
export function ThermalStackStatic(props: Omit<ThermalStackProps, "animated">) {
  return <ThermalStack {...props} animated={false} />;
}
