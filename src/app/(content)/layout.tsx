import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ContentSearch } from "@/components/content/content-search";
import { AskFajitaMount } from "@/components/support/ask-fajita-mount";

import "@/styles/site.css";
import "@/styles/content.css";
import "@/styles/reading.css";

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
      <AskFajitaMount
        mode="public"
        pageContext={{ route: "/blog", productArea: "content" }}
      />
    </>
  );
}
