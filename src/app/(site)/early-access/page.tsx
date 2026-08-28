import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { buildMetadata } from "@/lib/site/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Create your account",
  description:
    "Create a Fajita account to monitor websites, APIs, SSL certificates, and cron jobs.",
  path: "/early-access",
  noindex: true,
});

/** Legacy URL. Always send visitors to signup. */
export default function EarlyAccessPage() {
  permanentRedirect("/signup");
}
