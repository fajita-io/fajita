"use client";

import { useEffect, useState } from "react";

const TRUSTMRR_EMBED_URL = "https://trustmrr.com/embed/fajita";
const TRUSTMRR_PROFILE_URL = "https://trustmrr.com/startup/fajita";

type EmbedTheme = "light" | "dark";

/** Small, lazy-loaded TrustMRR proof point for public marketing pages. */
export function TrustMrrBadge() {
  const [theme, setTheme] = useState<EmbedTheme>("light");

  useEffect(() => {
    const syncTheme = () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fj-trustmrr">
      <div className="fj-trustmrr__frame">
        <iframe
          src={`${TRUSTMRR_EMBED_URL}?theme=${theme}`}
          title="Fajita verified revenue on TrustMRR"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="fj-trustmrr__iframe"
        />
      </div>
      <p className="fj-trustmrr__fallback">
        Prefer the public profile?{" "}
        <a href={TRUSTMRR_PROFILE_URL} target="_blank" rel="noopener noreferrer">
          View Fajita on TrustMRR
        </a>
      </p>
    </div>
  );
}
