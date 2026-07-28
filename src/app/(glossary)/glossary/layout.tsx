import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { GlossarySearch } from "@/components/glossary/search";
import { AskFajitaMount } from "@/components/support/ask-fajita-mount";

import "@/styles/site.css";
import "@/styles/glossary.css";
import "@/styles/reading.css";

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#glossary-main" className="fj-skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <div className="fj-glossary-shell fj-container">
        <div className="fj-glossary-shell__tools">
          <GlossarySearch />
        </div>
        <main id="glossary-main" className="fj-glossary-shell__main">
          {children}
        </main>
      </div>
      <SiteFooter />
      <AskFajitaMount
        mode="public"
        pageContext={{ route: "/glossary", productArea: "glossary" }}
      />
    </>
  );
}
