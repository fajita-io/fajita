import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { DeferredProductHuntBanner } from "@/components/site/deferred-product-hunt-banner";
import { DeferredAskFajitaMount } from "@/components/support/deferred-ask-fajita-mount";

import "@/styles/site.css";

/** ISR for the public marketing shell. GitHub stars and nav state hydrate client-side. */
export const revalidate = 3600;

/** Public marketing shell: skip link, global nav, footer. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#main" className="fj-skip-link">
        Skip to content
      </a>
      <DeferredProductHuntBanner />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <DeferredAskFajitaMount
        mode="public"
        pageContext={{ route: "/", productArea: "marketing" }}
      />
    </>
  );
}
