import { authorSchema, type ContentAuthor } from "./schema";

/**
 * Editorial authors. Organization authors are used transparently.
 * No fake individual experts.
 */
const rawAuthors = [
  {
    slug: "fajita-editorial",
    name: "Fajita Editorial",
    role: "Editorial",
    bio: "Fajita Editorial writes practical reliability guides for founders and small software teams. Pieces are reviewed by product and engineering before publication.",
    expertise: [
      "uptime monitoring",
      "incident communication",
      "status pages",
      "founder operations",
    ],
    organizationAuthor: true,
  },
  {
    slug: "fajita-engineering",
    name: "Fajita Engineering",
    role: "Engineering",
    bio: "Fajita Engineering documents monitoring behavior, health endpoints, webhooks, and operational patterns that match how the product actually works.",
    expertise: [
      "API monitoring",
      "heartbeat monitoring",
      "webhook signatures",
      "SSL and DNS",
    ],
    organizationAuthor: true,
  },
  {
    slug: "fajita-research",
    name: "Fajita Research",
    role: "Research",
    bio: "Fajita Research publishes privacy-safe, methodologically documented findings only when enough aggregated data exists. Data-insufficient studies stay unpublished.",
    expertise: [
      "reliability metrics",
      "benchmark methodology",
      "aggregated operational data",
    ],
    organizationAuthor: true,
  },
] as const;

export const AUTHORS: ContentAuthor[] = rawAuthors.map((a) =>
  authorSchema.parse(a),
);

const BY_SLUG = new Map(AUTHORS.map((a) => [a.slug, a]));

export function getAuthor(slug: string): ContentAuthor | undefined {
  return BY_SLUG.get(slug);
}

export function requireAuthor(slug: string): ContentAuthor {
  const author = BY_SLUG.get(slug);
  if (!author) throw new Error(`Unknown content author: ${slug}`);
  return author;
}
