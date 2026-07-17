import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Brand Lab",
  robots: { index: false, follow: false },
};

// Render at request time so the access guard reads the deployment's real
// environment instead of being baked to 404 during the production build.
export const dynamic = "force-dynamic";

/**
 * Brand Lab access guard. Available in development always; in production
 * only when BRAND_LAB_ENABLED=true is set for an authorized deployment.
 * Also excluded from indexing via metadata robots and /internal/ disallow
 * in robots.txt.
 */
export default function BrandLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" ||
    process.env.BRAND_LAB_ENABLED === "true";

  if (!allowed) {
    notFound();
  }

  return children;
}
