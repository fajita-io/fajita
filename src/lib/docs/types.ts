import type { ContentBlock } from "./blocks";
import { frontmatterSchema, type DocFrontmatter } from "./frontmatter";

/** A fully-parsed documentation page: validated metadata plus content blocks. */
export interface DocPage {
  meta: DocFrontmatter;
  body: ContentBlock[];
}

/** Raw authoring input: frontmatter before defaults are applied. */
export type DocInput = {
  meta: Parameters<typeof frontmatterSchema.parse>[0];
  body: ContentBlock[];
};

/**
 * Validate and normalize a page at author time. Throws with the page slug in
 * the message if frontmatter is invalid, so a bad page fails the build loudly
 * rather than shipping broken.
 */
export function defineDoc(input: DocInput): DocPage {
  const result = frontmatterSchema.safeParse(input.meta);
  if (!result.success) {
    const slug =
      typeof (input.meta as { slug?: unknown })?.slug === "string"
        ? (input.meta as { slug: string }).slug
        : "<unknown>";
    throw new Error(
      `Invalid docs frontmatter for "${slug}": ${result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }
  return { meta: result.data, body: input.body };
}
