import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { DocsNav } from "@/components/docs/docs-nav";
import { DocsSearch } from "@/components/docs/search";
import { AskFajitaMount } from "@/components/support/ask-fajita-mount";
import { buildNavigation } from "@/lib/docs/registry";

/**
 * Documentation shell: the marketing header and footer wrap a persistent
 * sidebar and the page content. Search lives in the shell so the shortcut is
 * available on every docs page.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = buildNavigation();
  return (
    <>
      <a href="#docs-main" className="fj-skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <div className="fj-docs-shell fj-container">
        <div className="fj-docs-shell__aside">
          <div className="fj-docs-shell__search">
            <DocsSearch />
          </div>
          <DocsNav nav={nav} />
        </div>
        <main id="docs-main" className="fj-docs-shell__main">
          {children}
        </main>
      </div>
      <SiteFooter />
      <AskFajitaMount mode="public" pageContext={{ route: "/docs", productArea: "docs" }} />
    </>
  );
}
