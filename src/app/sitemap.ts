import type { MetadataRoute } from "next";

import { featureOrder } from "@/lib/site/features";
import { OSS_ROUTES, ossPublicVisible } from "@/lib/site/oss-config";
import { publicDocs } from "@/lib/docs/registry";
import { BLOG_CATEGORY_META } from "@/lib/content/categories";
import {
  articlesInCategory,
  publicArticles,
  publicComparisons,
  publicResearch,
  publicTools,
} from "@/lib/content/registry";
import { GLOSSARY_CATEGORIES } from "@/lib/glossary/frontmatter";
import { publicTerms } from "@/lib/glossary/registry";
import { legalDocs } from "@/lib/site/legal";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

const lastModified = new Date("2026-07-20");

/**
 * All indexable public routes. Excluded on purpose: /login and /signup (real
 * auth, noindex), /app/* (authenticated), /api/*.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
    ...(ossPublicVisible()
      ? [
          { path: OSS_ROUTES.openSource, priority: 0.85, changeFrequency: "weekly" as const },
          { path: OSS_ROUTES.selfHost, priority: 0.8, changeFrequency: "monthly" as const },
        ]
      : []),
    { path: "/features", priority: 0.9, changeFrequency: "monthly" },
    { path: "/integrations", priority: 0.7, changeFrequency: "monthly" },
    { path: "/support", priority: 0.7, changeFrequency: "monthly" },
    { path: "/security", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/changelog", priority: 0.6, changeFrequency: "weekly" },
    { path: "/roadmap", priority: 0.6, changeFrequency: "monthly" },
    { path: "/status", priority: 0.5, changeFrequency: "monthly" },
    { path: "/affiliates", priority: 0.7, changeFrequency: "monthly" },
    { path: "/affiliates/apply", priority: 0.5, changeFrequency: "monthly" },
    { path: "/legal", priority: 0.4, changeFrequency: "monthly" },
    ...legalDocs
      .filter(
        (doc) =>
          doc.status === "in-force" &&
          doc.href &&
          doc.href !== "/legal" &&
          !doc.noindex,
      )
      .map((doc) => ({
        path: doc.href!,
        priority: 0.3,
        changeFrequency: "monthly" as const,
      })),
  ];

  const featureRoutes = featureOrder.map((slug) => ({
    path: `/features/${slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  // Documentation hub and every published, indexable page. Deprecated and
  // noindex pages are excluded so the sitemap only advertises canonical docs.
  const docsHub = { path: "/docs", priority: 0.8, changeFrequency: "weekly" as const };
  const docsRoutes = publicDocs()
    .filter((page) => !page.meta.deprecated && !page.meta.noindex)
    .map((page) => ({
      path: `/docs/${page.meta.slug}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
    }));

  const glossaryHub = {
    path: "/glossary",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  };
  const glossaryUpdates = {
    path: "/glossary/updates",
    priority: 0.4,
    changeFrequency: "weekly" as const,
  };
  const glossaryCategories = GLOSSARY_CATEGORIES.map((category) => ({
    path: `/glossary/category/${category}`,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));
  const glossaryTerms = publicTerms()
    .filter((term) => !term.meta.deprecated && !term.meta.noindex)
    .map((term) => ({
      path: `/glossary/${term.meta.slug}`,
      priority: 0.55,
      changeFrequency: "monthly" as const,
      lastModified: new Date(`${term.meta.lastReviewedAt}T00:00:00Z`),
    }));

  const blogHub = { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const };
  const blogUpdates = {
    path: "/blog/updates",
    priority: 0.4,
    changeFrequency: "weekly" as const,
  };
  const blogCategories = Object.values(BLOG_CATEGORY_META)
    .filter((cat) => articlesInCategory(cat.id).length > 0)
    .map((cat) => ({
      path: `/blog/category/${cat.slug}`,
      priority: 0.55,
      changeFrequency: "monthly" as const,
    }));
  const blogArticles = publicArticles().map((article) => ({
    path: `/blog/${article.meta.slug}`,
    priority: 0.65,
    changeFrequency: "monthly" as const,
    lastModified: new Date(`${article.meta.updatedAt}T00:00:00Z`),
  }));

  const compareHub = {
    path: "/compare",
    priority: 0.75,
    changeFrequency: "weekly" as const,
  };
  const comparePages = publicComparisons().map((page) => ({
    path: `/compare/${page.meta.slug}`,
    priority: 0.6,
    changeFrequency: "monthly" as const,
    lastModified: new Date(`${page.meta.updatedAt}T00:00:00Z`),
  }));

  const toolsHub = {
    path: "/tools",
    priority: 0.75,
    changeFrequency: "monthly" as const,
  };
  const toolPages = publicTools().map((tool) => ({
    path: `/tools/${tool.meta.slug}`,
    priority: 0.65,
    changeFrequency: "monthly" as const,
    lastModified: new Date(`${tool.meta.updatedAt}T00:00:00Z`),
  }));

  const researchPages = publicResearch().map((item) => ({
    path: `/research/${item.meta.slug}`,
    priority: 0.55,
    changeFrequency: "monthly" as const,
    lastModified: new Date(`${item.meta.updatedAt}T00:00:00Z`),
  }));

  return [
    ...staticRoutes,
    docsHub,
    ...featureRoutes,
    ...docsRoutes,
    glossaryHub,
    glossaryUpdates,
    ...glossaryCategories,
    ...glossaryTerms,
    blogHub,
    blogUpdates,
    ...blogCategories,
    ...blogArticles,
    compareHub,
    ...comparePages,
    toolsHub,
    ...toolPages,
    ...researchPages,
  ].map((route) => ({
    url: `${siteUrl}${route.path === "/" ? "/" : route.path}`,
    lastModified:
      "lastModified" in route && route.lastModified instanceof Date
        ? route.lastModified
        : lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
