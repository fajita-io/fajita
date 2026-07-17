import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Lifecycle operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Internal lifecycle operations guard. Development always; production only
 * for platform admins. Middleware already requires authentication for
 * /internal. Read-mostly: the only mutations are audited reconciliation runs.
 * Never exposes monitor secrets, subscriber lists, incident notes, or card
 * data.
 */
export default async function LifecycleOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" || (await isPlatformAdmin());
  if (!allowed) notFound();
  return children;
}
