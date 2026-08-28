import Link from "next/link";
import dynamic from "next/dynamic";

import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { LinkedInIcon } from "@/components/design-system/linkedin-icon";
import { XIcon } from "@/components/design-system/x-icon";
import { featureOrder, features } from "@/lib/site/features";
import {
  OSS_GITHUB_CHANGELOG_URL,
  OSS_GITHUB_CONTRIBUTING_URL,
  OSS_GITHUB_LICENSE_URL,
  OSS_GITHUB_ROADMAP_URL,
  OSS_GITHUB_SECURITY_URL,
  OSS_GITHUB_URL,
  OSS_LICENSE,
  OSS_ROUTES,
  ossPublicVisible,
} from "@/lib/site/oss-config";
import { social } from "@/lib/site/site-config";

import { FooterCta } from "./footer-cta";
import { FooterFinale } from "./footer-finale";

const FooterMoment = dynamic(
  () => import("./footer-moment").then((m) => m.FooterMoment),
  {
    loading: () => (
      <div
        className="fj-deferred-slot fj-deferred-slot--footer-moment"
        aria-hidden="true"
      />
    ),
  },
);

const ThemeToggle = dynamic(
  () =>
    import("@/components/design-system/theme-toggle").then(
      (m) => m.ThemeToggle,
    ),
  {
    loading: () => (
      <div
        className="fj-deferred-slot"
        style={{ minHeight: "2.25rem", maxWidth: "12rem" }}
        aria-hidden="true"
      />
    ),
  },
);

/**
 * Global footer: the final act of the page. Opens with the reduced Thermal
 * Stack moment and the closing CTA, then the structured link columns.
 *
 * Integration mount points (documented, intentionally not rendered):
 *  - Pamphlet chat ("Powered by Pamphlet") mounts after the base row once
 *    the chatbot phase ships. See /docs/website/public-component-library.md.
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

        <div
          className={`fj-footer__grid${ossPublicVisible() ? " fj-footer__grid--oss" : ""}`}
        >
          <div className="fj-footer__brand">
            <Link href="/" aria-label="Fajita home" style={{ display: "inline-flex" }}>
              <FajitaLogo orientation="horizontal" size={28} />
            </Link>
            <p className="fj-body-sm">
              Open-source uptime monitoring for websites, APIs, certificates, and
              cron jobs. Self-host or use Fajita Cloud.
            </p>
            <ThemeToggle />
            <div className="fj-footer__socials">
              <a
                href={social.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="fj-footer__social fj-interactive"
                aria-label="Fajita on LinkedIn (opens in a new tab)"
              >
                <LinkedInIcon size={20} />
              </a>
              <a
                href={social.x}
                target="_blank"
                rel="noopener noreferrer"
                className="fj-footer__social fj-interactive"
                aria-label="Fajita on X (opens in a new tab)"
              >
                <XIcon size={20} />
              </a>
            </div>
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

          {ossPublicVisible() ? (
            <nav className="fj-footer__col" aria-labelledby="footer-oss">
              <h2 id="footer-oss">Open Source</h2>
              <ul className="fj-footer__links">
                <li>
                  <Link href={OSS_ROUTES.openSource}>Open source</Link>
                </li>
                <li>
                  <Link href={OSS_ROUTES.selfHost}>Self-host</Link>
                </li>
                <li>
                  <a href={OSS_GITHUB_URL} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </li>
                <li>
                  <Link href="/roadmap">Roadmap</Link>
                </li>
                <li>
                  <Link href="/changelog">Changelog</Link>
                </li>
                <li>
                  <a href={OSS_GITHUB_CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer">
                    Contributing
                  </a>
                </li>
                <li>
                  <a href={OSS_GITHUB_SECURITY_URL} target="_blank" rel="noopener noreferrer">
                    Security
                  </a>
                </li>
                <li>
                  <a href={OSS_GITHUB_LICENSE_URL} target="_blank" rel="noopener noreferrer">
                    {OSS_LICENSE}
                  </a>
                </li>
              </ul>
            </nav>
          ) : null}

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
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/security">Security</Link>
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
      </div>

      <FooterFinale year={new Date().getFullYear()} />

      <div className="fj-footer__mobile-close fj-container">
        <p className="fj-caption">
          © {new Date().getFullYear()} Fajita
        </p>
      </div>
    </footer>
  );
}
