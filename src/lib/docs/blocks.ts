/**
 * Documentation content block model.
 *
 * Docs pages are authored as typed content, not raw MDX. This keeps the
 * content tree fully typed, validated at build time, and serializable to
 * three targets from one source: rendered React, plain-text (raw routes and
 * llms-full.txt), and a search index. There is no runtime MDX compilation and
 * no arbitrary imports, which closes the MDX injection surface entirely.
 *
 * Inline text uses a tiny, safe markup subset parsed at render time:
 *   `code`        -> inline code
 *   [label](href) -> link (internal or https only)
 * No raw HTML is ever interpreted.
 */

export type CalloutKind =
  | "note"
  | "tip"
  | "warning"
  | "security"
  | "plan"
  | "beta"
  | "deprecated";

export interface HeadingBlock {
  kind: "heading";
  level: 2 | 3;
  text: string;
  /** Stable anchor id. Auto-derived from text when omitted. */
  id?: string;
}

export interface ParagraphBlock {
  kind: "paragraph";
  /** Inline markup: `code` and [label](href). */
  text: string;
}

export interface CodeBlockContent {
  kind: "code";
  language: string;
  /** Optional file name or short description shown above the block. */
  title?: string;
  code: string;
}

export interface ListBlock {
  kind: "list";
  ordered?: boolean;
  /** Each item supports inline markup. */
  items: string[];
}

export interface CalloutBlock {
  kind: "callout";
  variant: CalloutKind;
  /** Optional heading; a sensible default is used per variant. */
  title?: string;
  body: ContentBlock[];
}

export interface StepItem {
  title: string;
  body: ContentBlock[];
}

export interface StepsBlock {
  kind: "steps";
  items: StepItem[];
}

export interface TableBlock {
  kind: "table";
  headers: string[];
  /** Cells support inline markup. */
  rows: string[][];
  caption?: string;
}

export interface TabItem {
  label: string;
  body: ContentBlock[];
}

export interface TabsBlock {
  kind: "tabs";
  items: TabItem[];
}

/** References a registered diagram component by id (see components/docs/diagrams). */
export interface DiagramBlock {
  kind: "diagram";
  id: string;
  caption: string;
  /** Accessible long description; also used in plain-text output. */
  description: string;
}

export interface ScreenshotBlock {
  kind: "screenshot";
  /** Source route the screenshot depicts; used by freshness checks. */
  sourceRoute: string;
  alt: string;
  caption: string;
  /** Optional asset path once captured from the fixture environment. */
  src?: string;
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | CodeBlockContent
  | ListBlock
  | CalloutBlock
  | StepsBlock
  | TableBlock
  | TabsBlock
  | DiagramBlock
  | ScreenshotBlock;

/* ------------------------------------------------------------------ */
/* Authoring helpers                                                   */
/* ------------------------------------------------------------------ */

export const h2 = (text: string, id?: string): HeadingBlock => ({
  kind: "heading",
  level: 2,
  text,
  id,
});

export const h3 = (text: string, id?: string): HeadingBlock => ({
  kind: "heading",
  level: 3,
  text,
  id,
});

export const p = (text: string): ParagraphBlock => ({ kind: "paragraph", text });

export const code = (
  language: string,
  codeStr: string,
  title?: string,
): CodeBlockContent => ({ kind: "code", language, code: codeStr, title });

export const ul = (items: string[]): ListBlock => ({ kind: "list", items });

export const ol = (items: string[]): ListBlock => ({
  kind: "list",
  ordered: true,
  items,
});

export const callout = (
  variant: CalloutKind,
  body: ContentBlock[],
  title?: string,
): CalloutBlock => ({ kind: "callout", variant, body, title });

export const steps = (items: StepItem[]): StepsBlock => ({
  kind: "steps",
  items,
});

export const table = (
  headers: string[],
  rows: string[][],
  caption?: string,
): TableBlock => ({ kind: "table", headers, rows, caption });

export const tabs = (items: TabItem[]): TabsBlock => ({ kind: "tabs", items });

export const diagram = (
  id: string,
  caption: string,
  description: string,
): DiagramBlock => ({ kind: "diagram", id, caption, description });

export const screenshot = (
  sourceRoute: string,
  alt: string,
  caption: string,
  src?: string,
): ScreenshotBlock => ({ kind: "screenshot", sourceRoute, alt, caption, src });

/* ------------------------------------------------------------------ */
/* Anchors and headings                                                */
/* ------------------------------------------------------------------ */

/** URL-safe kebab-case anchor from heading text. Stable across builds. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function headingId(block: HeadingBlock): string {
  return block.id ?? slugifyHeading(block.text);
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Table-of-contents entries from the top-level heading blocks of a page. */
export function tableOfContents(blocks: ContentBlock[]): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const block of blocks) {
    if (block.kind === "heading") {
      entries.push({ id: headingId(block), text: block.text, level: block.level });
    }
  }
  return entries;
}
