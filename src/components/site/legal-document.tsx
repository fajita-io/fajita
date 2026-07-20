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
        <div className="fj-container fj-legal-doc">
          <p className="fj-eyebrow fj-page-hero__eyebrow">{eyebrow}</p>
          <h1 className="fj-display-2">{title}</h1>
          <p className="fj-body-sm fj-page-hero__meta">{effectiveLabel}</p>
        </div>
      </section>

      <section className="fj-band--tight">
        <article className="fj-container fj-prose fj-legal-doc">
          <div className="fj-legal-doc__intro">
            <Blocks blocks={intro} />
          </div>
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="fj-legal-doc__section"
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
