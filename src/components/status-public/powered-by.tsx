import { POWERED_BY_URL } from "@/lib/status-pages/config";

/**
 * The Powered by Fajita lockup. Deliberately quiet: it supports the customer's
 * page without competing with their brand. Rendered only when the page opts to
 * show it (or the plan requires it).
 */
export function PoweredBy() {
  return (
    <a className="sp-powered" href={POWERED_BY_URL} rel="noopener">
      <span className="sp-powered__mark" aria-hidden="true" />
      Powered by Fajita
    </a>
  );
}
