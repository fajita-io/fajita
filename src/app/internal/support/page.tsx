import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { isPlatformAdmin } from "@/lib/auth/context";
import { getPamphletHealth } from "@/lib/pamphlet/health";
import { listKnowledgeSources } from "@/lib/support/knowledge/registry";
import { SUPPORT_MACROS } from "@/lib/support/macros";

export const metadata: Metadata = {
  title: "Support operations",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/internal/support/quality", label: "Answer quality" },
  { href: "/internal/support/knowledge", label: "Knowledge" },
  { href: "/internal/support/gaps", label: "Documentation gaps" },
  { href: "/internal/support/provider", label: "Provider health" },
  { href: "/internal/support/safety", label: "Safety" },
  { href: "/internal/support/reconciliation", label: "Reconciliation" },
  { href: "/internal/support-lab", label: "Support lab" },
];

export default async function InternalSupportOverviewPage() {
  const admin = await isPlatformAdmin();
  if (!admin) redirect("/app");

  const health = getPamphletHealth();
  const sources = listKnowledgeSources();

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1>Support operations</h1>
      <p>
        Limited Phase 16 operations view. Pamphlet remains the approved
        conversation provider. Provider APIs are disabled until a verified
        contract exists.
      </p>
      <section>
        <h2>Overview</h2>
        <ul>
          <li>Knowledge sources indexed: {sources.length}</li>
          <li>Support macros: {SUPPORT_MACROS.length}</li>
          <li>
            Pamphlet status: {health.status} ({health.configured ? "env set" : "env unset"})
          </li>
        </ul>
      </section>
      <section>
        <h2>Queues</h2>
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </section>
      <PoweredByPamphlet />
    </main>
  );
}
