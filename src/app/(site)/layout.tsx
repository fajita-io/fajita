import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ProductHuntBanner } from "@/components/site/product-hunt-banner";
import { AskFajitaMount } from "@/components/support/ask-fajita-mount";

import "@/styles/site.css";

/** Public marketing shell: skip link, global nav, footer. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#main" className="fj-skip-link">
        Skip to content
      </a>
      <ProductHuntBanner />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <AskFajitaMount mode="public" pageContext={{ route: "/", productArea: "marketing" }} />
    </>
  );
}
