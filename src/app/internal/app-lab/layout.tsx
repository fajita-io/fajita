import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "App Lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * App Lab access guard. Available in development always; in production only to
 * platform admins. Middleware already requires authentication for /internal.
 * Excluded from indexing and from ordinary navigation. Uses simulated fixtures
 * only, never real customer data.
 */
export default async function AppLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();
  return children;
}
