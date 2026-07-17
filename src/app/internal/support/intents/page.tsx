import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { isPlatformAdmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Support intents",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const admin = await isPlatformAdmin();
  if (!admin) redirect("/app");
  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1>Support intents</h1>
      <p>
        Phase 16 operations stub. Aggregate metrics and queues expand as
        conversation volume arrives. No fabricated service levels.
      </p>
      <p>
        <Link href="/internal/support">Back to support overview</Link>
      </p>
      <PoweredByPamphlet />
    </main>
  );
}
