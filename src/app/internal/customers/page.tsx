import type { Metadata } from "next";
import Link from "next/link";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import { formatUsdCents } from "@/lib/billing/mrr";
import { listCustomerDirectory } from "@/lib/platform/customers/directory";
import { logPlatformAdminAction } from "@/lib/platform/logging";
import { getPlatformAccess } from "@/lib/platform/access";

export const metadata: Metadata = {
  title: "Organizations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { rows, completeness } = await listCustomerDirectory({
    q: sp.q,
    health: sp.health,
    plan: sp.plan,
  });
  const access = await getPlatformAccess();
  if (access && sp.q) {
    await logPlatformAdminAction({
      action: "platform.search.performed",
      actorUserId: access.profile.id,
      resourceType: "customers",
      metadata: { has_query: true, result_count: rows.length },
      summary: "Customer directory search",
    });
  }

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Organizations" },
        ]}
      />
      <OpsPageHeader
        title="Organizations"
        deck="Plan, billing, activation, health, and risk. Private monitor URLs stay hidden."
      />

      <OpsPanel
        title="Directory"
        actions={
          <span className={`fj-ops-completeness fj-ops-completeness--${completeness}`}>
            {completeness}
          </span>
        }
      >
        {rows.length === 0 ? (
          <OpsEmpty>
            {sp.q
              ? "No organizations match that search."
              : "No organizations yet."}
          </OpsEmpty>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Plan</th>
                <th>Billing</th>
                <th>Health</th>
                <th>Monitors</th>
                <th>Incidents</th>
                <th>MRR</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/internal/customers/${row.id}`}>
                      {row.name}
                    </Link>
                    <div className="fj-ops-card__meta">{row.slug}</div>
                  </td>
                  <td>{row.planKey ?? "—"}</td>
                  <td>{row.billingState ?? "—"}</td>
                  <td>{row.healthState ?? "—"}</td>
                  <td>{row.activeMonitors}</td>
                  <td>{row.openIncidents}</td>
                  <td>{formatUsdCents(row.mrrCents)}</td>
                  <td>{row.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>
    </>
  );
}
