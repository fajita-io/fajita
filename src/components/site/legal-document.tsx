import type { LegalBlock, LegalSection } from "@/lib/legal/types";

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className="fj-body">
              {block.text}
            </p>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="fj-body">
              {block.items.map((item) => (
                <li key={item.slice(0, 48)}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <ol key={i} className="fj-body">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ol>
        );
      })}
    </>
  );
}

/**
 * Shared renderer for in-force legal documents. Semantic article layout;
 * marketing voice stays off these pages.
 */
export function LegalDocument({
  eyebrow,
  title,
  effectiveLabel,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  effectiveLabel: string;
  intro: LegalBlock[];
  sections: LegalSection[];
}) {
  return (
    <>
      <section className="fj-page-hero">
        <div className="fj-container" style={{ maxWidth: "44rem" }}>
          <p className="fj-eyebrow" style={{ marginBottom: "var(--space-3)" }}>
            {eyebrow}
          </p>
          <h1 className="fj-display-2">{title}</h1>
          <p className="fj-body-sm" style={{ marginTop: "var(--space-3)" }}>
            {effectiveLabel}
          </p>
        </div>
      </section>

      <section className="fj-band--tight">
        <article
          className="fj-container fj-prose"
          style={{ maxWidth: "44rem", display: "grid", gap: "var(--space-6)" }}
        >
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <Blocks blocks={intro} />
          </div>
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              style={{ display: "grid", gap: "var(--space-3)" }}
            >
              <h2 className="fj-heading-3">{section.heading}</h2>
              <Blocks blocks={section.blocks} />
            </section>
          ))}
        </article>
      </section>
    </>
  );
}
