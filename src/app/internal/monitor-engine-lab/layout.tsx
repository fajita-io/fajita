import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Monitor Engine Lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Monitor engine lab access guard. Available in development always; in
 * production only to platform admins. Middleware already requires authentication
 * for /internal. Excluded from indexing and customer navigation. This surface
 * operates the real engine against the caller's active organization and applies
 * the same security gates as scheduled checks; it is not a general URL fetcher.
 */
export default async function MonitorEngineLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();
  return children;
}
