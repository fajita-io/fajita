import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Affiliate lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AffiliateLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();
  return children;
}
