import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Docs operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Internal documentation operations. Available in development, and in
 * production only to platform admins. Middleware already requires
 * authentication for /internal. Never customer-facing.
 */
export default async function InternalDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed = process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();
  return children;
}
