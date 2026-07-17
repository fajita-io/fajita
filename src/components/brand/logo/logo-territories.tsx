/**
 * Phase 1 logo territory explorations. Internal only: rendered in the
 * Brand Lab for provenance and governance. Territory 4 ("The held pulse")
 * was selected as the final mark; see /docs/brand/fajita-logo-system.md
 * for the full evaluation matrix.
 *
 * These are working sketches, intentionally preserved. Do not ship any of
 * them on customer-facing surfaces.
 */

export interface LogoTerritory {
  id: number;
  name: string;
  concept: string;
  verdict: "rejected" | "selected";
  reason: string;
  Sketch: (props: { size?: number }) => React.ReactElement;
}

const ink = "var(--color-text-primary)";
const ember = "var(--color-brand-ember)";

function T1({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      <path
        d="M6 40c4 0 5-6 8-6s4 10 8 10 5-26 9-26 4 18 8 18 4-8 8-8 5 6 11 6"
        stroke={ink}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="18" r="4" fill={ember} />
    </svg>
  );
}

function T2({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      <path d="M14 54V12h36" stroke={ink} strokeWidth="7" strokeLinecap="round" />
      <path d="M14 32h22" stroke={ink} strokeWidth="7" strokeLinecap="round" />
      <path
        d="M42 32c0-8 8-8 8-16"
        stroke={ember}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function T3({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      <circle cx="32" cy="32" r="24" stroke={ink} strokeWidth="5" />
      <circle
        cx="32"
        cy="32"
        r="13"
        stroke={ink}
        strokeWidth="4"
        strokeDasharray="6 7"
      />
      <circle cx="32" cy="32" r="4.5" fill={ember} />
    </svg>
  );
}

function T4({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      <rect x="4" y="4" width="56" height="56" rx="16" stroke={ink} strokeWidth="5" />
      <path
        d="M14 42h9.5L32 25.5 40.5 42H50"
        stroke={ink}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="15.5" r="4.5" fill={ember} />
    </svg>
  );
}

function T5({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      <circle cx="27" cy="36" r="18" stroke={ink} strokeWidth="5" />
      <path d="M43 27l14-10" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      <circle cx="21" cy="31" r="3" fill={ember} />
      <circle cx="33" cy="42" r="3" fill={ember} />
      <circle cx="30" cy="30" r="3" fill={ink} />
    </svg>
  );
}

function T6({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={8 + i * 10}
          y={40 - i * 6}
          width="6"
          height={12 + i * 6}
          rx="3"
          fill={i < 3 ? ink : ember}
          opacity={0.45 + i * 0.14}
        />
      ))}
    </svg>
  );
}

export const logoTerritories: LogoTerritory[] = [
  {
    id: 1,
    name: "Thermal trace",
    concept:
      "A continuous monitored waveform: response time drawn as a heat trace, with the ember dot marking the anomaly.",
    verdict: "rejected",
    reason:
      "Beautiful at hero scale, illegible at favicon size. The waveform reads as generic analytics at 16px and belongs to the illustration layer instead.",
    Sketch: T1,
  },
  {
    id: 2,
    name: "Signal F",
    concept:
      "An F built from monitoring lines, one arm bending upward into escaping heat.",
    verdict: "rejected",
    reason:
      "Strong monogram behavior but the letterform territory is crowded (many F marks in dev tools), and the bent arm reads as a chart callout, not heat. Weak story beyond the initial.",
    Sketch: T2,
  },
  {
    id: 3,
    name: "Monitored burner",
    concept:
      "Concentric burner rings with a live core: controlled heat under constant watch.",
    verdict: "rejected",
    reason:
      "Closest to kitchen hardware of all territories; one step from a stove pictogram. Also nearly identical to generic radar/target marks used across monitoring tools.",
    Sketch: T3,
  },
  {
    id: 4,
    name: "The held pulse",
    concept:
      "A heat spike held inside a controlled boundary. The ember dot lifts off the peak: the exact moment Fajita notices. The same dot dots the j in the wordmark.",
    verdict: "selected",
    reason:
      "One shape tells the whole story: heat, containment, detection. Survives 16px, works monochrome, has an obvious motion behavior (the dot is the heartbeat), and no restaurant reading. The boundary radius became the brand radius token.",
    Sketch: T4,
  },
  {
    id: 5,
    name: "Skillet topology",
    concept:
      "A skillet abstracted to a node graph: the pan as system boundary, contents as monitored services.",
    verdict: "rejected",
    reason:
      "The cleverest idea and the most dangerous: at small sizes it is unmistakably a frying pan, which violates the restaurant prohibition the moment context is missing.",
    Sketch: T5,
  },
  {
    id: 6,
    name: "Cool to hot",
    concept:
      "A stepped signal rising from cool neutrals into ember: temperature as a bar-series gradient.",
    verdict: "rejected",
    reason:
      "Honest data story but zero ownability: reads as a generic equalizer/chart icon. Fails the transfer test (would work for any analytics SaaS unchanged).",
    Sketch: T6,
  },
];
