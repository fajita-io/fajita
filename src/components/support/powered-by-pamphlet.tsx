import { DataFastGoals } from "@/lib/analytics/goals";
import { PAMPHLET_ATTRIBUTION_URL } from "@/lib/pamphlet/capabilities";

/**
 * Required attribution on every Ask Fajita surface.
 * Link target is exactly https://pamphlet.io with no tracking parameters.
 */
export function PoweredByPamphlet({
  compact = false,
  inline = false,
}: {
  compact?: boolean;
  inline?: boolean;
}) {
  const className = compact
    ? "fj-support-pamphlet fj-support-pamphlet--compact"
    : "fj-support-pamphlet";

  if (inline) {
    return (
      <p className={className} data-testid="powered-by-pamphlet">
        Powered by{" "}
        <a
          href={PAMPHLET_ATTRIBUTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="fj-support-pamphlet__link"
          aria-label="Pamphlet (opens in a new tab)"
          data-fast-goal={DataFastGoals.supportPamphletClicked}
        >
          Pamphlet
        </a>
      </p>
    );
  }

  return (
    <p className={className} data-testid="powered-by-pamphlet">
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
