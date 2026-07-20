"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { PoweredByWiki } from "@/components/site/powered-by-wiki";
import { shouldShowWikiAttributionOnSite } from "@/lib/site/wiki-attribution";

interface ReadingAttributionProps {
  /** When false, the shell collapses with a transition (route-gated surfaces). */
  active?: boolean;
  /** Route-gated mode: collapse when inactive. Off for docs, glossary, and legal. */
  gated?: boolean;
  className?: string;
}

function useScrollReveal(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!active) {
      setRevealed(false);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const reveal = () => setRevealed(true);

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return { ref, revealed };
}

/**
 * Post-content Wiki attribution. Reserves space, reveals on scroll, and
 * collapses smoothly when route gating turns it off.
 */
export function ReadingAttribution({
  active = true,
  gated = false,
  className,
}: ReadingAttributionProps) {
  const { ref, revealed } = useScrollReveal(active);

  const attribution = (
    <div
      ref={ref}
      className="fj-reading-attribution"
      data-revealed={revealed || undefined}
    >
      <PoweredByWiki />
    </div>
  );

  if (!gated) {
    return (
      <div
        className={["fj-reading-attribution-slot", className].filter(Boolean).join(" ")}
      >
        {attribution}
      </div>
    );
  }

  return (
    <div
      className={["fj-reading-attribution-shell", className].filter(Boolean).join(" ")}
      data-active={active || undefined}
      aria-hidden={!active}
    >
      <div className="fj-reading-attribution-shell__clip">{attribution}</div>
    </div>
  );
}

/** Site-shell attribution gated to public info routes. */
export function WikiAttributionMount() {
  const pathname = usePathname();
  const active = shouldShowWikiAttributionOnSite(pathname);

  return <ReadingAttribution active={active} gated className="fj-container" />;
}
