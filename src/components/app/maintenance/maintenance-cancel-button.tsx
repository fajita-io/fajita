"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useToast } from "@/components/app/toast";
import { cancelMaintenanceWindowAction } from "@/lib/app/actions/maintenance";

export function MaintenanceCancelButton({
  organizationId,
  windowId,
}: {
  organizationId: string;
  windowId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  return (
    <>
      <BrandButton variant="secondary" className="fj-button--danger" onClick={() => setOpen(true)}>
        <BrandIcon name="close" size={16} /> Cancel maintenance
      </BrandButton>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel this maintenance window?"
        description="Fajita resumes normal incident evaluation for the affected monitors. Any window history is kept."
        confirmLabel="Cancel maintenance"
        destructive
        onConfirm={async () => {
          const res = await cancelMaintenanceWindowAction(organizationId, windowId);
          if (res.ok) {
            toast.success("Maintenance canceled.");
            router.refresh();
          } else throw new Error(res.error);
        }}
      />
    </>
  );
}
