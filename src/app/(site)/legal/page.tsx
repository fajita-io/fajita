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
          <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
            Legal
          </p>
          <h1 className="fj-display-2">The paperwork, kept in order.</h1>
          <p className="fj-body-lg fj-page-hero__lede">
            Every policy that governs Fajita lives on this page. Each document
            publishes the day it takes effect, written to be read rather than
            skimmed past.
            {inForceCount > 0
              ? ` ${inForceCount === 1 ? "One document is" : `${inForceCount} documents are`} in force today; the rest publish as accounts and policies open.`
              : " None are in force yet because accounts are not open yet."}
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <div className="fj-container">
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: "var(--space-1)",
              maxWidth: "44rem",
            }}
          >
            {legalDocs.map((doc) => (
              <li
                key={doc.id}
                id={doc.id}
                style={{
                  display: "grid",
                  gap: "var(--space-1)",
                  padding: "var(--space-5) 0",
                  borderBottom: "1px solid var(--color-border-subtle)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "var(--space-4)",
                    flexWrap: "wrap",
                  }}
                >
                  <h2 className="fj-heading-3" style={{ margin: 0 }}>
                    {doc.status === "in-force" && doc.href ? (
                      <Link href={doc.href}>{doc.name}</Link>
                    ) : (
                      doc.name
                    )}
                  </h2>
                  <span className="fj-tag">
                    {doc.status === "in-force" ? "In force" : "Publishes at launch"}
                  </span>
                </div>
                <p className="fj-body-sm" style={{ margin: 0 }}>
                  {doc.summary}
                </p>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "var(--space-10)", maxWidth: "44rem" }}>
            <h2 className="fj-heading-3">Questions in the meantime</h2>
            <p className="fj-body-sm">
              If you need a legal or privacy answer before a document publishes,{" "}
              <Link href="/contact?topic=product">ask us directly</Link> and a
              person will respond.
            </p>
            <address
              className="fj-body-sm"
              style={{ fontStyle: "normal", marginTop: "var(--space-4)" }}
            >
              {company.addressLines.map((line) => (
                <span key={line} style={{ display: "block" }}>
                  {line}
                </span>
              ))}
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
