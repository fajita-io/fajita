const marqueePrimary = [
  "verified before alert",
  "recovery on the same paths",
  "checkout API · re-checked",
  "status page stays honest",
  "cron went quiet · you hear it",
  "ssl expiry · reminder lands early",
  "slack · discord · webhook · email",
  "held pulse · always watching",
];

const marqueeSecondary = [
  "FAJITA.IO",
  "know when it gets too hot",
  "the watch before the fire",
  "FAJITA.IO",
  "your team hears it first",
  "FAJITA.IO",
  "signal inside the boundary",
];

const mosaicTiles = [
  {
    label: "Monitoring layer",
    title: "Know when your software gets too hot.",
    span: "wide" as const,
  },
  {
    label: "Verification",
    title: "Re-checked before anyone panics.",
    span: "default" as const,
  },
  {
    label: "Alert rail",
    title: "One incident. Every channel.",
    span: "default" as const,
  },
  {
    label: "Recovery",
    title: "All-clear on the same paths.",
    span: "default" as const,
  },
  {
    label: "Status",
    title: "Public proof when it counts.",
    span: "wide" as const,
  },
];

function MarqueeTrack({
  items,
  variant,
  reverse,
}: {
  items: string[];
  variant: "primary" | "secondary";
  reverse?: boolean;
}) {
  const renderItems = (keyPrefix: string) =>
    items.map((item) => (
      <span key={`${keyPrefix}-${item}`} className="fj-footer-finale__marquee-item">
        {variant === "secondary" && item === "FAJITA.IO" ? (
          <strong className="fj-footer-finale__marquee-mark">{item}</strong>
        ) : (
          item
        )}
        <span className="fj-footer-finale__marquee-dot" aria-hidden="true" />
      </span>
    ));

  return (
    <div
      className={`fj-footer-finale__marquee fj-footer-finale__marquee--${variant}${reverse ? " fj-footer-finale__marquee--reverse" : ""}`}
      aria-hidden="true"
    >
      <div className="fj-footer-finale__marquee-track">
        <div className="fj-footer-finale__marquee-group">{renderItems("a")}</div>
        <div className="fj-footer-finale__marquee-group" aria-hidden="true">
          {renderItems("b")}
        </div>
      </div>
    </div>
  );
}

function HeldPulseRule() {
  return (
    <svg
      className="fj-footer-finale__pulse"
      viewBox="0 0 1200 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        x="0"
        y="0"
        width="1200"
        height="28"
        rx="14"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1"
      />
      <path
        d="M24 14 H180 L204 6 L228 22 L252 14 H420 L444 8 L468 20 L492 14 H720 L744 10 L768 18 L792 14 H960 L984 4 L1008 24 L1032 14 H1176"
        fill="none"
        stroke="var(--color-brand-heat)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        className="fj-footer-finale__pulse-line"
      />
      <circle cx="1032" cy="14" r="4" fill="var(--color-brand-heat)" />
    </svg>
  );
}

/**
 * Full-bleed footer finale: kinetic manifesto bands and a thermal mosaic
 * inspired by editorial closing rhythms (wiki.co logic, Fajita art direction).
 * Decorative motion collapses under prefers-reduced-motion.
 */
export function FooterFinale({ year }: { year: number }) {
  return (
    <div className="fj-footer-finale">
      <MarqueeTrack items={marqueePrimary} variant="primary" />
      <MarqueeTrack items={marqueeSecondary} variant="secondary" reverse />

      <div className="fj-container fj-footer-finale__body">
        <div className="fj-footer-finale__mosaic">
          {mosaicTiles.map((tile) => (
            <article
              key={tile.label}
              className={`fj-footer-finale__tile${tile.span === "wide" ? " fj-footer-finale__tile--wide" : ""}`}
            >
              <p className="fj-footer-finale__tile-label">{tile.label}</p>
              <p className="fj-footer-finale__tile-title">{tile.title}</p>
            </article>
          ))}
        </div>

        <div className="fj-footer-finale__lockup">
          <p className="fj-footer-finale__domain" aria-hidden="true">
            FAJITA.IO
          </p>
          <p className="fj-footer-finale__tagline">
            The watch before the fire.
          </p>
        </div>

        <HeldPulseRule />

        <div className="fj-footer-finale__base">
          <p className="fj-footer-finale__copyright">
            © {year} Fajita
          </p>
        </div>
      </div>
    </div>
  );
}
