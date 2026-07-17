import type { ContentBlock } from "./blocks";
import { inlineToPlainText } from "./inline";
import type { DocPage } from "./types";

/**
 * Serialize content blocks to Markdown-flavored plain text. Used for the raw
 * content routes and llms-full.txt. No navigation chrome, no scripts, no
 * private frontmatter fields.
 */
function blockToText(block: ContentBlock): string {
  switch (block.kind) {
    case "heading":
      return `${block.level === 2 ? "##" : "###"} ${inlineToPlainText(block.text)}`;
    case "paragraph":
      return inlineToPlainText(block.text);
    case "code":
      return `\`\`\`${block.language}${block.title ? ` ${block.title}` : ""}\n${block.code}\n\`\`\``;
    case "list":
      return block.items
        .map((item, i) => `${block.ordered ? `${i + 1}.` : "-"} ${inlineToPlainText(item)}`)
        .join("\n");
    case "callout": {
      const label = block.title ?? block.variant.toUpperCase();
      const inner = block.body.map(blockToText).join("\n\n");
      return `> ${label}: ${inner.replace(/\n/g, "\n> ")}`;
    }
    case "steps":
      return block.items
        .map((step, i) => {
          const inner = step.body.map(blockToText).join("\n\n");
          return `${i + 1}. ${step.title}\n\n${inner}`;
        })
        .join("\n\n");
    case "table": {
      const head = `| ${block.headers.join(" | ")} |`;
      const sep = `| ${block.headers.map(() => "---").join(" | ")} |`;
      const rows = block.rows.map(
        (r) => `| ${r.map((c) => inlineToPlainText(c)).join(" | ")} |`,
      );
      return [head, sep, ...rows].join("\n");
    }
    case "tabs":
      return block.items
        .map((tab) => `**${tab.label}**\n\n${tab.body.map(blockToText).join("\n\n")}`)
        .join("\n\n");
    case "diagram":
      return `[Diagram: ${block.caption}]\n${block.description}`;
    case "screenshot":
      return `[Screenshot: ${block.alt}]\n${block.caption}`;
  }
}

export function blocksToMarkdown(blocks: ContentBlock[]): string {
  return blocks.map(blockToText).join("\n\n");
}

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

/** A single page as a self-contained plain-text document. */
export function pageToPlainText(page: DocPage): string {
  const { meta } = page;
  const header = [
    `# ${meta.title}`,
    "",
    meta.description,
    "",
    `Canonical: ${siteUrl}/docs/${meta.slug}`,
    `Docs version: ${meta.docsVersion}`,
    `Product version: ${meta.productVersion}`,
    `Last reviewed: ${meta.lastReviewedAt}`,
  ].join("\n");
  return `${header}\n\n${blocksToMarkdown(page.body)}\n`;
}

/** Concatenate every LLM-eligible page for llms-full.txt. */
export function pagesToFullText(pages: DocPage[]): string {
  return pages.map(pageToPlainText).join("\n\n---\n\n");
}
