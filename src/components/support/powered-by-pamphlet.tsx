import { DataFastGoals } from "@/lib/analytics/goals";
import { PAMPHLET_ATTRIBUTION_URL } from "@/lib/pamphlet/capabilities";

/**
 * Required attribution on every Ask Fajita surface.
 * Link target is exactly https://pamphlet.io with no tracking parameters.
 */
export function PoweredByPamphlet({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <p
      className={
        compact
          ? "fj-support-pamphlet fj-support-pamphlet--compact"
          : "fj-support-pamphlet"
      }
      data-testid="powered-by-pamphlet"
    >
      <a
        href={PAMPHLET_ATTRIBUTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fj-support-pamphlet__link"
        aria-label="Powered by Pamphlet (opens in a new tab)"
        data-fast-goal={DataFastGoals.supportPamphletClicked}
      >
        Powered by Pamphlet
      </a>
    </p>
  );
}
