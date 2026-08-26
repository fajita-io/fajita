"use server";

import { revalidatePath } from "next/cache";

import { type ActionResult, toActionError } from "@/lib/app/actions/shared";
import { recordAuditEvent } from "@/lib/app/audit";
import { requirePlatformAdmin } from "@/lib/auth/context";
import { markWorkerDraining } from "@/lib/monitoring/workers";

/**
 * Platform-admin-only worker operations. The only safe mutation is requesting a
 * drain. No command execution, shell, secret access, or query surface.
 */
export async function markWorkerDrainingAction(
  workerId: string,
): Promise<ActionResult> {
  try {
    const admin = await requirePlatformAdmin();
    await markWorkerDraining(workerId);
    await recordAuditEvent({
      organizationId: null,
      actorUserId: admin.id,
      actorType: "platform_admin",
      action: "worker.marked_draining",
      targetType: "monitor_worker",
      targetId: workerId,
      summary: "Requested worker drain",
    });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
