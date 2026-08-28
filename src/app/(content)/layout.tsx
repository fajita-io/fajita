import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ContentSearch } from "@/components/content/content-search";
import { DeferredAskFajitaMount } from "@/components/support/deferred-ask-fajita-mount";

import "@/styles/site.css";
import "@/styles/content.css";
import "@/styles/reading.css";

export const revalidate = 3600;

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#content-main" className="fj-skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <div className="fj-content-shell fj-container">
        <div className="fj-content-shell__tools">
          <ContentSearch />
        </div>
        <main id="content-main">{children}</main>
      </div>
      <SiteFooter />
      <DeferredAskFajitaMount
        mode="public"
        pageContext={{ route: "/blog", productArea: "content" }}
      />
    </>
  );
}
