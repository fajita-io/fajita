import type { Metadata } from "next";
import { revalidatePath } from "next/cache";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import {
  requirePlatformPermission,
  requireStepUpForAction,
} from "@/lib/platform/access";
import {
  beginApprovalExecution,
  decideApproval,
  listApprovals,
} from "@/lib/platform/approvals/service";

export const metadata: Metadata = {
  title: "Approvals",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function approveAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const access = await requirePlatformPermission("platform.approvals.approve");
  await requireStepUpForAction("roles.change", {
    resourceType: "platform_approval",
    resourceId: id,
  });
  await decideApproval(access, id, "approved", reason || "Approved");
  revalidatePath("/internal/approvals");
}

async function rejectAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const access = await requirePlatformPermission("platform.approvals.reject");
  await decideApproval(access, id, "rejected", reason || "Rejected");
  revalidatePath("/internal/approvals");
}

async function executeAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const access = await requirePlatformPermission("platform.approvals.approve");
  await requireStepUpForAction("roles.change", {
    resourceType: "platform_approval",
    resourceId: id,
  });
  await beginApprovalExecution(access, id);
  revalidatePath("/internal/approvals");
}

export default async function ApprovalsPage() {
  const rows = await listApprovals([
    "submitted",
    "under_review",
    "approved",
    "executing",
  ]);

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: "Approvals" },
        ]}
      />
      <OpsPageHeader
        title="Approvals"
        deck="Approval and execution are separate. Expired approvals cannot execute. High-risk actions need step-up."
      />

      <OpsPanel title="Queue">
        {rows.length === 0 ? (
          <OpsEmpty>No open approvals.</OpsEmpty>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Risk</th>
                <th>State</th>
                <th>Reason</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.approval_type}</td>
                  <td>
                    <span className={`fj-ops-pill fj-ops-pill--${row.risk_classification === "critical" ? "critical" : "high"}`}>
                      {row.risk_classification}
                    </span>
                  </td>
                  <td>{row.state}</td>
                  <td>{row.reason}</td>
                  <td>{row.created_at.slice(0, 16)}</td>
                  <td>
                    {["submitted", "under_review"].includes(row.state) ? (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <form action={approveAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="reason" value="Approved after review" />
                          <button type="submit" className="fj-ops-btn fj-ops-btn--primary">
                            Approve
                          </button>
                        </form>
                        <form action={rejectAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="reason" value="Rejected after review" />
                          <button type="submit" className="fj-ops-btn">
                            Reject
                          </button>
                        </form>
                      </div>
                    ) : null}
                    {row.state === "approved" ? (
                      <form action={executeAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="fj-ops-btn fj-ops-btn--primary">
                          Execute
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>
    </>
  );
}
