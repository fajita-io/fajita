/**
 * Required attribution on every public glossary surface.
 * Link target is exactly https://wiki.co with no tracking parameters.
 */
export function PoweredByWiki({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <p
      className={
        compact
          ? "fj-glossary-wiki fj-glossary-wiki--compact"
          : "fj-glossary-wiki"
      }
    >
      <a
        href="https://wiki.co"
        target="_blank"
        rel="noopener noreferrer"
        className="fj-glossary-wiki__link"
        aria-label="Powered by Wiki (opens in a new tab)"
        data-fast-goal="glossary_wiki_clicked"
      >
        Powered by Wiki
      </a>
    </p>
  );
}
