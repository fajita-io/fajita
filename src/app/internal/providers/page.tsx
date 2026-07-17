import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsPageHeader,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import { platformDb } from "@/lib/platform/db";

export const metadata: Metadata = {
  title: "Provider health",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  let rows: Array<{
    provider_key: string;
    display_name: string;
    operational_state: string;
    mode: string;
    last_successful_at: string | null;
    owner: string | null;
    subprocessor: boolean;
  }> = [];
  let unavailable = false;

  try {
    const { data, error } = await platformDb()
      .from("platform_provider_health")
      .select(
        "provider_key, display_name, operational_state, mode, last_successful_at, owner, subprocessor",
      )
      .order("display_name");
    if (error) unavailable = true;
    else rows = (data ?? []) as typeof rows;
  } catch {
    unavailable = true;
  }

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Providers" },
        ]}
      />
      <OpsPageHeader
        title="Provider health"
        deck="Operational state for Stripe, Clerk, Supabase, Resend, Pamphlet, and related providers. Secrets never appear here."
      />

      <OpsPanel title="Providers">
        {unavailable ? (
          <OpsEmpty>Provider health store unavailable.</OpsEmpty>
        ) : rows.length === 0 ? (
          <OpsEmpty>No provider rows seeded.</OpsEmpty>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>State</th>
                <th>Mode</th>
                <th>Last success</th>
                <th>Owner</th>
                <th>Subprocessor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.provider_key}>
                  <td>{r.display_name}</td>
                  <td>
                    <OpsStatus state={r.operational_state} />
                  </td>
                  <td>{r.mode}</td>
                  <td>{r.last_successful_at?.slice(0, 16) ?? "—"}</td>
                  <td>{r.owner ?? "—"}</td>
                  <td>{r.subprocessor ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>
    </>
  );
}
