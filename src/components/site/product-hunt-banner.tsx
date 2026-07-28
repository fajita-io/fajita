"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "fajita-ph-banner-dismissed";

function productHuntUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_PRODUCT_HUNT_URL?.trim();
  return raw || null;
}

/**
 * Dismissible Product Hunt launch banner. Renders only when
 * NEXT_PUBLIC_PRODUCT_HUNT_URL is set.
 */
export function ProductHuntBanner() {
  const url = productHuntUrl();
  const [dismissed, setDismissed] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    if (!url) return;
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    } finally {
      setCheckedStorage(true);
    }
  }, [url]);

  if (!url) return null;
  if (checkedStorage && dismissed) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true);
  };

  return (
    <div className="fj-ph-banner" role="region" aria-label="Product Hunt launch">
      <div className="fj-container fj-ph-banner__inner">
        <p className="fj-ph-banner__copy">
          Fajita is live on Product Hunt today.
        </p>
        <div className="fj-ph-banner__actions">
          <a
            href={url}
            className="fj-ph-banner__cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the launch
          </a>
          <button
            type="button"
            className="fj-ph-banner__dismiss"
            onClick={dismiss}
            aria-label="Dismiss Product Hunt banner"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
