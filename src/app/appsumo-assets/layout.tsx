import type { Metadata } from "next";
import { notFound } from "next/navigation";

import "@/styles/appsumo-export.css";
import "@/styles/app.css";

export const metadata: Metadata = {
  title: "AppSumo assets",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Dev-only render targets for scripts/export-appsumo-assets.ts */
export default function AppsumoAssetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed =
    process.env.NODE_ENV !== "production" ||
    process.env.APPSUMO_EXPORT_ENABLED === "true";

  if (!allowed) notFound();

  return children;
}
