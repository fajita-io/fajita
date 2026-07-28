"use client";

import { useEffect } from "react";

/** Sets `data-scrolled` on the marketing header after the first paint. */
export function SiteHeaderScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".fj-header");
    if (!header) return;

    const onScroll = () => {
      header.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
