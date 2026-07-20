import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/site/metadata";
import { legalDocs } from "@/lib/site/legal";
import { company } from "@/lib/site/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Legal",
  description:
    "Fajita legal hub: terms, privacy, acceptable use, and related policies. Each document publishes here the day it takes effect.",
  path: "/legal",
});

/**
 * Legal hub. Documents are listed with honest status. In-force documents
 * link to published routes. Documents still in preparation do not link.
 */
export default function LegalPage() {
  const inForceCount = legalDocs.filter((d) => d.status === "in-force").length;

  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container">
          <p className="fj-eyebrow fj-page-hero__eyebrow">
            Legal
          </p>
          <h1 className="fj-display-2">The paperwork, kept in order.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Every policy that governs Fajita lives on this page. Each document
            publishes the day it takes effect, written to be read rather than
            skimmed past.
            {inForceCount > 0
              ? ` ${inForceCount === 1 ? "One document is" : `${inForceCount} documents are`} in force today.`
              : ""}
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <ul className="fj-legal-hub__list">
            {legalDocs.map((doc) => (
              <li key={doc.id} id={doc.id} className="fj-legal-hub__item">
                <div className="fj-legal-hub__row">
                  <h2 className="fj-heading-3 fj-legal-hub__title">
                    {doc.status === "in-force" && doc.href ? (
                      <Link href={doc.href}>{doc.name}</Link>
                    ) : (
                      doc.name
                    )}
                  </h2>
                  <span className="fj-tag">
                    {doc.status === "in-force" ? "In force" : "In preparation"}
                  </span>
                </div>
                <p className="fj-body-sm fj-legal-hub__summary">
                  {doc.summary}
                </p>
              </li>
            ))}
          </ul>

          <div className="fj-legal-hub__contact">
            <h2 className="fj-heading-3">Questions in the meantime</h2>
            <p className="fj-body-sm">
              If you need a legal or privacy answer before a document publishes,{" "}
              <Link href="/contact?topic=product">ask us directly</Link> and a
              person will respond.
            </p>
            <address className="fj-body-sm fj-legal-hub__address">
              {company.addressLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
