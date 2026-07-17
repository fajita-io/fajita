import type { ContentBlock } from "@/lib/docs/blocks";
import { headingId } from "@/lib/docs/blocks";

import { DocsCallout } from "./callout";
import { DocsCodeBlock } from "./code-block";
import { DocsDiagram } from "./diagrams";
import { Inline } from "./inline";
import { DocsTabs } from "./tabs";

function renderBlock(block: ContentBlock, key: number) {
  switch (block.kind) {
    case "heading": {
      const id = headingId(block);
      const Tag = block.level === 2 ? "h2" : "h3";
      return (
        <Tag key={key} id={id} className={`fj-docs-h${block.level}`}>
          <a className="fj-docs-anchor" href={`#${id}`} aria-label={`Link to ${block.text}`}>
            <Inline text={block.text} />
          </a>
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={key} className="fj-docs-p">
          <Inline text={block.text} />
        </p>
      );
    case "code":
      return (
        <DocsCodeBlock key={key} code={block.code} language={block.language} title={block.title} />
      );
    case "list": {
      const items = block.items.map((item, i) => (
        <li key={i}>
          <Inline text={item} />
        </li>
      ));
      return block.ordered ? (
        <ol key={key} className="fj-docs-list fj-docs-list--ordered">
          {items}
        </ol>
      ) : (
        <ul key={key} className="fj-docs-list">
          {items}
        </ul>
      );
    }
    case "callout":
      return (
        <DocsCallout key={key} variant={block.variant} title={block.title}>
          {block.body.map((b, i) => renderBlock(b, i))}
        </DocsCallout>
      );
    case "steps":
      return (
        <ol key={key} className="fj-docs-steps">
          {block.items.map((step, i) => (
            <li key={i} className="fj-docs-step">
              <p className="fj-docs-step__title">{step.title}</p>
              <div className="fj-docs-step__body">
                {step.body.map((b, j) => renderBlock(b, j))}
              </div>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div key={key} className="fj-docs-table-wrap">
          <table className="fj-docs-table">
            {block.caption ? <caption>{block.caption}</caption> : null}
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} scope="col">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "tabs":
      return (
        <DocsTabs
          key={key}
          items={block.items.map((tab) => ({
            label: tab.label,
            content: <>{tab.body.map((b, i) => renderBlock(b, i))}</>,
          }))}
        />
      );
    case "diagram":
      return (
        <DocsDiagram key={key} id={block.id} caption={block.caption} description={block.description} />
      );
    case "screenshot":
      return (
        <figure key={key} className="fj-docs-screenshot">
          {block.src ? (
            <img src={block.src} alt={block.alt} loading="lazy" />
          ) : (
            <div className="fj-docs-screenshot__placeholder" role="img" aria-label={block.alt}>
              <span>{block.alt}</span>
            </div>
          )}
          <figcaption>{block.caption}</figcaption>
        </figure>
      );
  }
}

export function DocsBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return <>{blocks.map((block, i) => renderBlock(block, i))}</>;
}
