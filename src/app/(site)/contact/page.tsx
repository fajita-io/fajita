import type { Metadata } from "next";

import { ContactForm } from "@/components/site/contact-form";
import { buildMetadata } from "@/lib/site/metadata";
import { siteUrl } from "@/lib/site/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Reach the Fajita team: product questions, support, security reports, partnerships, and acquisition inquiries. A person reads every message.",
  path: "/contact",
});

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Fajita",
  url: `${siteUrl}/contact`,
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
            Contact
          </p>
          <h1 className="fj-display-2">Talk to a person.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Product questions, support, security reports, partnerships, or
            acquisition inquiries: one form, routed by topic, read by a
            human. Security reports get priority handling.
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <div className="fj-split--reverse fj-split">
            <ContactForm initialTopic={topic} />
            <aside className="fj-rail" style={{ maxWidth: "26rem" }}>
              <h2 className="fj-heading-3" style={{ margin: 0 }}>
                What to expect
              </h2>
              <ul
                style={{
                  listStyle: "none",
                  margin: "var(--space-4) 0 0",
                  padding: 0,
                  display: "grid",
                  gap: "var(--space-3)",
                }}
              >
                <li className="fj-body-sm">
                  Replies come from a person, usually within a few business
                  days.
                </li>
                <li className="fj-body-sm">
                  Security reports: include steps to reproduce if you can.
                  We acknowledge every report.
                </li>
                <li className="fj-body-sm">
                  Your message and address are stored securely, used only to
                  respond, and never added to a mailing list.
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
