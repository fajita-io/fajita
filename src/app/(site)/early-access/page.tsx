import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Create your account",
  description:
    "Create a Fajita account to monitor websites, APIs, SSL certificates, and cron jobs.",
  path: "/early-access",
});

/** Legacy URL. Always send visitors to signup. */
export default function EarlyAccessPage() {
  redirect("/signup");
}
