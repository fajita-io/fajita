import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CookieConsentBanner } from "@/components/site/cookie-consent-banner";
import { AskFajitaMount } from "@/components/support/ask-fajita-mount";

/** Public marketing shell: skip link, global nav, footer, cookie consent. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#main" className="fj-skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <CookieConsentBanner />
      <AskFajitaMount mode="public" pageContext={{ route: "/", productArea: "marketing" }} />
    </>
  );
}
