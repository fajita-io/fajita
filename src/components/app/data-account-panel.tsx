"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { AppSection, EmptyState } from "./ui";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast";
import {
  cancelDeletionRequestAction,
  requestAccountDeletionAction,
  requestExportAction,
  requestOrganizationDeletionAction,
} from "@/lib/app/actions/account";
import { relativeTime } from "@/lib/app/format";

export interface RequestRow {
  id: string;
  kind: "export" | "deletion";
  label: string;
  status: string;
  when: string;
  scheduledFor: string | null;
}

export function DataAccountPanel({
  organizationId,
  organizationName,
  canDeleteOrg,
  canRequestOrgExport,
  accountDeletable,
  ownedOrganizations,
  requests,
}: {
  organizationId: string;
  organizationName: string;
  canDeleteOrg: boolean;
  canRequestOrgExport: boolean;
  accountDeletable: boolean;
  ownedOrganizations: { id: string; name: string; memberCount: number }[];
  requests: RequestRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    if (busy) return;
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "That did not work.");
      return;
    }
    toast.success(success);
    router.refresh();
  }

  return (
    <>
      <AppSection
        title="Export your data"
        description="Request a copy of your data. Exports are prepared server-side and delivered through a short-lived private link when ready."
      >
        <p className="fj-app-section__desc" style={{ marginBottom: "var(--space-4)" }}>
          An export includes your profile, organizations, memberships, preferences,
          audit history, and monitoring records for this account. After you
          request one, it stays queued until our export processor prepares the
          file. Contact support if you need data urgently.
        </p>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <BrandButton
            variant="secondary"
            disabled={busy}
            onClick={() => run(() => requestExportAction("user"), "Export requested.")}
          >
            Export my account data
          </BrandButton>
          {canRequestOrgExport ? (
            <BrandButton
              variant="secondary"
              disabled={busy}
              onClick={() =>
                run(() => requestExportAction("organization", organizationId), "Export requested.")
              }
            >
              Export {organizationName} data
            </BrandButton>
          ) : null}
        </div>
      </AppSection>

      <AppSection title="Requests">
        {requests.length === 0 ? (
          <EmptyState
            icon="check"
            title="No open requests"
            description="Export and deletion requests you make will appear here with their status."
          />
        ) : (
          <ul className="fj-request-list">
            {requests.map((req) => (
              <li key={req.id} className="fj-request-item">
                <div>
                  <div className="fj-member-cell__name">{req.label}</div>
                  <div className="fj-member-cell__email">
                    {req.kind === "export" && req.status === "pending"
                      ? `Queued · requested ${relativeTime(req.when)}`
                      : [
                          req.status,
                          req.scheduledFor
                            ? `scheduled ${relativeTime(req.scheduledFor)}`
                            : `requested ${relativeTime(req.when)}`,
                        ].join(" · ")}
                  </div>
                </div>
                {req.kind === "deletion" && (req.status === "pending" || req.status === "scheduled") ? (
                  <BrandButton
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => run(() => cancelDeletionRequestAction(req.id), "Request canceled.")}
                  >
                    Cancel
                  </BrandButton>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </AppSection>

      {canDeleteOrg ? (
        <AppSection title="Delete organization">
          <p className="fj-app-section__desc" style={{ marginBottom: "var(--space-4)" }}>
            Deleting {organizationName} schedules removal of its team, settings,
            and monitoring data after a {7}-day cooling-off period. You can cancel
            during that window. Deletion is scheduled for the end of that period.
          </p>
          <BrandButton
            className="fj-button--danger"
            disabled={busy}
            onClick={() => setDeleteOrgOpen(true)}
          >
            Delete {organizationName}
          </BrandButton>
        </AppSection>
      ) : null}

      <AppSection title="Delete your account">
        {accountDeletable ? (
          <>
            <p className="fj-app-section__desc" style={{ marginBottom: "var(--space-4)" }}>
              This schedules your account for deletion after a {7}-day
              cooling-off period. You can cancel during that time. This cannot be
              undone once it completes.
            </p>
            <BrandButton
              className="fj-button--danger"
              disabled={busy}
              onClick={() => setDeleteAccountOpen(true)}
            >
              Delete my account
            </BrandButton>
          </>
        ) : (
          <div className="fj-notice fj-notice--warning">
            <p style={{ margin: "0 0 var(--space-2)" }}>
              You own organizations that other people depend on. Delete those
              organizations first, or ask another owner to remove you, before
              deleting your account.
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
              {ownedOrganizations.map((org) => (
                <li key={org.id}>
                  {org.name} ({org.memberCount} {org.memberCount === 1 ? "member" : "members"})
                </li>
              ))}
            </ul>
          </div>
        )}
      </AppSection>

      <ConfirmDialog
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        title="Delete your account?"
        description="Your account will be scheduled for deletion. You can cancel during the cooling-off period."
        confirmLabel="Schedule deletion"
        destructive
        requireTyped="delete my account"
        onConfirm={async () => {
          const result = await requestAccountDeletionAction();
          if (!result.ok) throw new Error(result.error);
          toast.success("Account deletion scheduled. You can cancel anytime this week.");
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={deleteOrgOpen}
        onClose={() => setDeleteOrgOpen(false)}
        title={`Delete ${organizationName}?`}
        description="The organization will be scheduled for deletion. You can cancel during the cooling-off period."
        confirmLabel="Schedule deletion"
        destructive
        requireTyped={organizationName}
        onConfirm={async () => {
          const result = await requestOrganizationDeletionAction(organizationId);
          if (!result.ok) throw new Error(result.error);
          toast.success("Organization deletion scheduled.");
          router.refresh();
        }}
      />
    </>
  );
}
