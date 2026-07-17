import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Onboarding lab",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Internal onboarding lab guard. Development always; production only for
 * platform admins. Fixture data only; nothing here reads customer records
 * and no previewed email is ever sent.
 */
export default async function OnboardingLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();
  return children;
}
