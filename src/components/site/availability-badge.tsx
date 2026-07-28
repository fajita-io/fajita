/**
 * Above-the-fold live-product signal for launch surfaces. Intentionally quiet,
 * not a promotional pill.
 */
export function AvailabilityBadge() {
  return (
    <p className="fj-availability-badge">
      <span className="fj-availability-badge__dot" aria-hidden="true" />
      Live now · Open signup
    </p>
  );
}
