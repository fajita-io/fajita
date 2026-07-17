import type { Metadata } from "next";

import {
  DataAccountPanel,
  type RequestRow,
} from "@/components/app/data-account-panel";
import { requireActiveContext } from "@/lib/app/page-context";
import { getUserDeletionReadiness } from "@/lib/app/account-data";
import { serviceClient } from "@/lib/supabase/service";
import { can } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Data & account",
  robots: { index: false, follow: false },
};

export default async function DataSettingsPage() {
  const { profile, membership } = await requireActiveContext();
  const orgId = membership.organization.id;
  const db = serviceClient();

  const [readiness, exports, deletions] = await Promise.all([
    getUserDeletionReadiness(profile.id),
    db
      .from("export_requests")
      .select("id, scope, status, requested_at")
      .eq("requested_by_user_id", profile.id)
      .order("requested_at", { ascending: false })
      .limit(10),
    db
      .from("deletion_requests")
      .select("id, subject_type, status, created_at, scheduled_for, organization_id, subject_user_id")
      .or(`subject_user_id.eq.${profile.id},organization_id.eq.${orgId}`)
      .in("status", ["pending", "scheduled", "canceled"])
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const requests: RequestRow[] = [
    ...(exports.data ?? []).map((r) => ({
      id: r.id,
      kind: "export" as const,
      label: r.scope === "user" ? "Account data export" : "Organization data export",
      status: r.status,
      when: r.requested_at,
      scheduledFor: null,
    })),
    ...(deletions.data ?? []).map((r) => ({
      id: r.id,
      kind: "deletion" as const,
      label: r.subject_type === "user" ? "Account deletion" : "Organization deletion",
      status: r.status,
      when: r.created_at,
      scheduledFor: r.scheduled_for,
    })),
  ];

  return (
    <DataAccountPanel
      organizationId={orgId}
      organizationName={membership.organization.name}
      canDeleteOrg={can(membership.role, "org:delete")}
      canRequestOrgExport={can(membership.role, "export:request")}
      accountDeletable={readiness.canDelete}
      ownedOrganizations={readiness.ownedOrganizations}
      requests={requests}
    />
  );
}
