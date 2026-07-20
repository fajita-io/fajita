/**
 * Canonical public marketing routes linked from navigation, footer, sitemap,
 * and smoke checks. Used to prevent shipping dead links or missing pages.
 */

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

import { publicComparisons, publicResearch, publicTools } from "@/lib/content/registry";
import { publicDocs } from "@/lib/docs/registry";
import { publicTerms } from "@/lib/glossary/registry";
import { featureOrder } from "@/lib/site/features";
import { INTEGRATION_DIRECTORY } from "@/lib/site/integration-directory";
import { legalDocs } from "@/lib/site/legal";

const APP_ROOT = join(process.cwd(), "src/app");

/** Static paths that must resolve to a page.tsx (no dynamic segment). */
export const publicStaticPaths = [
  "/",
  "/pricing",
  "/features",
  "/integrations",
  "/security",
  "/about",
  "/contact",
  "/support",
  "/changelog",
  "/roadmap",
  "/status",
  "/early-access",
  "/affiliates",
  "/affiliates/apply",
  "/docs",
  "/glossary",
  "/blog",
  "/compare",
  "/tools",
  "/research",
  "/legal",
  "/legal/terms",
  "/legal/privacy",
  "/legal/acceptable-use",
  "/legal/cookies",
  "/legal/refunds",
  "/legal/disclosure",
  "/legal/affiliate-agreement",
  "/legal/affiliate-privacy",
  "/legal/dpa",
  "/legal/subprocessors",
  "/login",
  "/signup",
] as const;

/** Sample dynamic paths (one slug each) that must resolve. */
export function publicDynamicSamplePaths(): string[] {
  return [
    ...featureOrder.map((slug) => `/features/${slug}`),
    ...INTEGRATION_DIRECTORY.map((e) => `/integrations/${e.slug}`),
    ...publicDocs()
      .filter((p) => !p.meta.deprecated && !p.meta.noindex)
      .slice(0, 1)
      .map((p) => `/docs/${p.meta.slug}`),
    ...publicTerms()
      .filter((t) => !t.meta.deprecated && !t.meta.noindex)
      .slice(0, 1)
      .map((t) => `/glossary/${t.meta.slug}`),
    ...publicComparisons()
      .filter((c) => c.meta.status === "published")
      .slice(0, 1)
      .map((c) => `/compare/${c.meta.slug}`),
    ...publicTools()
      .filter((t) => t.meta.status === "published")
      .slice(0, 1)
      .map((t) => `/tools/${t.meta.slug}`),
    ...publicResearch()
      .filter((r) => r.meta.status === "published")
      .slice(0, 1)
      .map((r) => `/research/${r.meta.slug}`),
  ];
}

/** Every in-force legal document with a published href. */
export function legalPublicPaths(): string[] {
  return legalDocs
    .filter((d) => d.status === "in-force" && d.href)
    .map((d) => d.href!);
}

/** Paths that must return 200 in public smoke checks. */
export function publicSmokePaths(): string[] {
  return [
    ...publicStaticPaths,
    ...publicDynamicSamplePaths(),
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/api/health",
  ];
}

/**
 * Resolve a URL path to an app router page.tsx file, traversing route groups
 * like (site) and dynamic segments like [slug].
 */
export function resolveAppPageFile(urlPath: string): string | null {
  const segments = urlPath === "/" ? [] : urlPath.split("/").filter(Boolean);
  return walkAppDir(APP_ROOT, segments, 0);
}

function walkAppDir(dir: string, segments: string[], index: number): string | null {
  if (!existsSync(dir)) return null;

  if (index === segments.length) {
    const page = join(dir, "page.tsx");
    if (existsSync(page)) return page;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      if (name.startsWith("[[") && name.includes("...")) {
        const optionalCatchAll = join(dir, name, "page.tsx");
        if (existsSync(optionalCatchAll)) return optionalCatchAll;
      }
      if (name.startsWith("(") && name.endsWith(")")) {
        const found = walkAppDir(join(dir, name), segments, index);
        if (found) return found;
      }
    }
    return null;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name.startsWith("(") && name.endsWith(")")) {
      const found = walkAppDir(join(dir, name), segments, index);
      if (found) return found;
    }
  }

  const segment = segments[index];

  const exact = join(dir, segment);
  if (existsSync(exact)) {
    const found = walkAppDir(exact, segments, index + 1);
    if (found) return found;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name.startsWith("[") && name.endsWith("]")) {
      const inner = name.slice(1, -1);
      if (inner.startsWith("...")) {
        const page = join(dir, name, "page.tsx");
        return existsSync(page) ? page : null;
      }
      const found = walkAppDir(join(dir, name), segments, index + 1);
      if (found) return found;
    }
  }

  return null;
}
