/**
 * Public-site route loading state: three thermal dots, reduced-motion
 * safe (the animation is CSS and disabled by the media query).
 */
export default function SiteLoading() {
  return (
    <div className="fj-page-loading" role="status" aria-label="Loading page">
      <span className="fj-page-loading__dot" />
      <span className="fj-page-loading__dot" />
      <span className="fj-page-loading__dot" />
    </div>
  );
}
