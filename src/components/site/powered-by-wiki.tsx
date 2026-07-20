import { WikiMark } from "@/components/brand/wiki/wiki-mark";
import { WIKI_URL } from "@/lib/site/wiki-attribution";

/**
 * Attribution badge for knowledge surfaces published with Wiki.
 * Neobrutalist lockup with the official wiki.co header mark.
 */
export function PoweredByWiki() {
  return (
    <a
      href={WIKI_URL}
      className="fj-powered-by-wiki"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered by Wiki. Opens wiki.co in a new tab."
    >
      <WikiMark size={24} label="" className="fj-powered-by-wiki__mark" />
      <span className="fj-powered-by-wiki__text">
        <span className="fj-powered-by-wiki__prefix">Powered by </span>
        <span className="fj-powered-by-wiki__brand">Wiki</span>
      </span>
    </a>
  );
}
