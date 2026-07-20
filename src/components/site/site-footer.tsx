import Link from "next/link";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { LinkedInIcon } from "@/components/design-system/linkedin-icon";
import { ThemeToggle } from "@/components/design-system/theme-toggle";
import { featureOrder, features } from "@/lib/site/features";
import { company, social } from "@/lib/site/site-config";

import { FooterCta } from "./footer-cta";
import { FooterMoment } from "./footer-moment";

/**
 * Global footer: the final act of the page. Opens with the reduced Thermal
 * Stack moment and the closing CTA, then the structured link columns.
 *
 * Integration mount points (documented, intentionally not rendered):
 *  - Pamphlet chat ("Powered by Pamphlet") mounts after the base row once
 *    the chatbot phase ships. See /docs/website/public-component-library.md.
 *  - Accomplish portfolio attribution has no approval in project docs yet;
 *    add to the base row only when documented.
 */
export function SiteFooter() {
  return (
    <footer className="fj-footer">
      <div className="fj-container">
        <div className="fj-footer__moment fj-split">
          <div>
            <h2 className="fj-heading-1" style={{ maxWidth: "16ch" }}>
              Keep the stack sizzling. Stop it from burning.
            </h2>
            <p
              className="fj-body-lg"
              style={{ marginTop: "var(--space-4)", maxWidth: "30rem" }}
            >
              Add your first monitor, connect an alert channel, and know when
              your software needs attention.
            </p>
            <FooterCta />
          </div>
          <div style={{ justifySelf: "end", width: "100%", maxWidth: "30rem" }}>
            <FooterMoment />
          </div>
        </div>

        <div className="fj-footer__grid">
          <div className="fj-footer__brand">
            <Link href="/" aria-label="Fajita home" style={{ display: "inline-flex" }}>
              <FajitaLogo orientation="horizontal" size={28} />
            </Link>
            <p className="fj-body-sm" style={{ maxWidth: "20rem" }}>
              Uptime monitoring for websites, APIs, certificates, and cron
              jobs. Your team hears about it before your customers do.
            </p>
            <ThemeToggle />
            <a
              href={social.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="fj-footer__social fj-interactive"
              aria-label="Fajita on LinkedIn (opens in a new tab)"
            >
              <LinkedInIcon size={20} />
            </a>
          </div>

          <nav className="fj-footer__col" aria-labelledby="footer-product">
            <h2 id="footer-product">Product</h2>
            <ul className="fj-footer__links">
              {featureOrder.map((slug) => (
                <li key={slug}>
                  <Link href={`/features/${slug}`}>{features[slug].name}</Link>
                </li>
              ))}
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/integrations">Integrations</Link>
              </li>
            </ul>
          </nav>

          <nav className="fj-footer__col" aria-labelledby="footer-company">
            <h2 id="footer-company">Company</h2>
            <ul className="fj-footer__links">
              <li>
                <Link href="/docs">Docs</Link>
              </li>
              <li>
                <Link href="/glossary">Glossary</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/compare">Compare</Link>
              </li>
              <li>
                <Link href="/tools">Tools</Link>
              </li>
              <li>
                <Link href="/research">Research</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/security">Security</Link>
              </li>
              <li>
                <Link href="/changelog">Changelog</Link>
              </li>
              <li>
                <Link href="/roadmap">Roadmap</Link>
              </li>
              <li>
                <Link href="/status">Service status</Link>
              </li>
            </ul>
          </nav>

          <nav className="fj-footer__col" aria-labelledby="footer-legal">
            <h2 id="footer-legal">Legal</h2>
            <ul className="fj-footer__links">
              <li>
                <Link href="/legal">Legal hub</Link>
              </li>
              <li>
                <Link href="/legal/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/legal/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/legal/acceptable-use">Acceptable Use</Link>
              </li>
              <li>
                <Link href="/legal/cookies">Cookie Notice</Link>
              </li>
              <li>
                <Link href="/legal/disclosure">Responsible disclosure</Link>
              </li>
              <li>
                <Link href="/legal/affiliate-agreement">Affiliate agreement</Link>
              </li>
              <li>
                <Link href="/legal/affiliate-privacy">Affiliate privacy</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="fj-footer__base">
          <p className="fj-caption">
            © {new Date().getFullYear()} {company.name}
          </p>
          <p className="fj-caption">{company.addressSingleLine}</p>
          <div className="fj-footer__base-right">
            <p className="fj-caption">Made in Montana</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
