import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Incident Lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Incident lab access guard. Available in development always; in production only
 * to platform admins. Middleware already requires authentication for /internal.
 * Excluded from indexing and customer navigation. Every simulation here runs the
 * pure TypeScript mirror of the SQL evaluator against synthetic fixtures. No
 * real customer data is read or written.
 */
export default async function IncidentLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();
  return children;
}
