import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Affiliate operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Affiliate operations guard. Development always; production only for platform
 * admins. Middleware already requires authentication for /internal. These pages
 * project customer-adjacent data server-side; they never expose customer
 * identity, tax ids, bank data, or raw fraud evidence.
 */
export default async function AffiliateOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();
  return children;
}
