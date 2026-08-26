/**
 * Preconnect to third-party origins used on public pages. Keeps connection
 * setup off the critical path for first-party HTML, CSS, and fonts.
 */
export function ResourceHints() {
  return (
    <>
      <link rel="preconnect" href="https://datafa.st" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    </>
  );
}
