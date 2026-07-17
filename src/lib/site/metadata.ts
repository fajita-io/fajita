import type { Metadata } from "next";

import { siteUrl } from "./site-config";

/**
 * Per-route metadata builder. Guarantees unique titles and descriptions,
 * canonical URLs, and consistent Open Graph and Twitter cards. The root
 * layout supplies the title template ("%s · Fajita") and the default
 * Open Graph image.
 */
export function buildMetadata(options: {
  title: string;
  description: string;
  /** Route path beginning with "/", e.g. "/pricing". */
  path: string;
  noindex?: boolean;
}): Metadata {
  const { title, description, path, noindex } = options;
  const url = `${siteUrl}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · Fajita`,
      description,
      url,
      siteName: "Fajita",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Fajita`,
      description,
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
