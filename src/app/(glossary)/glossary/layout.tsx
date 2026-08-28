import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { GlossarySearch } from "@/components/glossary/search";
import { DeferredAskFajitaMount } from "@/components/support/deferred-ask-fajita-mount";

import "@/styles/site.css";
import "@/styles/glossary.css";
import "@/styles/reading.css";

export const revalidate = 3600;

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
      <DeferredAskFajitaMount
        mode="public"
        pageContext={{ route: "/glossary", productArea: "glossary" }}
      />
    </>
  );
}
