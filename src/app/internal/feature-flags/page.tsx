import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import { FEATURE_KEYS, FEATURE_REGISTRY } from "@/lib/app/feature-flags";
import { serviceClient } from "@/lib/supabase/service";
import { platformDb } from "@/lib/platform/db";

export const metadata: Metadata = {
  title: "Feature flags",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FeatureFlagsPage() {
  const db = serviceClient();
  const { data: overrides } = await db
    .from("feature_flag_overrides")
    .select("flag_key, organization_id, enabled, created_at")
    .limit(200);

  let changes: Array<{
    id: string;
    flag_key: string;
    change_type: string;
    created_at: string;
    risk_classification: string;
  }> = [];
  try {
    const { data } = await platformDb()
      .from("platform_feature_flag_changes")
      .select("id, flag_key, change_type, created_at, risk_classification")
      .order("created_at", { ascending: false })
      .limit(50);
    changes = (data ?? []) as typeof changes;
  } catch {
    changes = [];
  }

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Feature flags" },
        ]}
      />
      <OpsPageHeader
        title="Feature flags"
        deck="Code registry is source of truth. Overrides are org-scoped private beta. Production rollouts require approval and step-up."
      />

      <OpsPanel title="Registry">
        <table className="fj-ops-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Stage</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_KEYS.map((key) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{FEATURE_REGISTRY[key].stage}</td>
                <td>{FEATURE_REGISTRY[key].description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </OpsPanel>

      <OpsPanel title="Organization overrides">
        {(overrides ?? []).length === 0 ? (
          <OpsEmpty>No org overrides.</OpsEmpty>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Flag</th>
                <th>Organization</th>
                <th>Enabled</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {(overrides ?? []).map((o) => (
                <tr key={`${o.flag_key}-${o.organization_id}`}>
                  <td>{o.flag_key}</td>
                  <td>{o.organization_id ?? "—"}</td>
                  <td>{o.enabled ? "yes" : "no"}</td>
                  <td>{o.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>

      <OpsPanel title="Change history">
        {changes.length === 0 ? (
          <OpsEmpty>No recorded flag changes yet.</OpsEmpty>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Flag</th>
                <th>Change</th>
                <th>Risk</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((c) => (
                <tr key={c.id}>
                  <td>{c.flag_key}</td>
                  <td>{c.change_type}</td>
                  <td>{c.risk_classification}</td>
                  <td>{c.created_at.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>
    </>
  );
}
