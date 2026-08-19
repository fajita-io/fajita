"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useToast } from "@/components/app/toast";
import {
  activateMonitorAction,
  archiveMonitorAction,
  deleteMonitorAction,
  duplicateMonitorAction,
  pauseMonitorAction,
  restoreMonitorAction,
  resumeMonitorAction,
  runManualCheckAction,
} from "@/lib/app/actions/monitors";

export function MonitorHeaderActions({
  organizationId,
  monitorId,
  monitorName,
  status,
  monitorType,
}: {
  organizationId: string;
  monitorId: string;
  monitorName: string;
  status: string;
  monitorType: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }
  function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(ok);
        router.refresh();
      } else {
        toast.error(res.error ?? "That did not work.");
      }
    });
  }

  const isActive = status === "active";
  const isPaused = status === "paused";
  const isDraft = status === "draft";
  const isArchived = status === "archived";
  const isHeartbeat = monitorType === "heartbeat";

  return (
    <div className="fj-mon-detailhead__actions">
      {isActive && !isHeartbeat ? (
        <BrandButton
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await runManualCheckAction(organizationId, monitorId);
              if (res.ok && res.data?.queued) {
                toast.success(res.data.summary ?? "Check ran. This test did not open an incident.");
                router.refresh();
              } else if (res.ok) {
                toast.error(res.data?.reason ?? "Fajita could not run a check right now.");
              } else {
                toast.error(res.error);
              }
            })
          }
        >
          <BrandIcon name="response-time" size={16} /> Run check
        </BrandButton>
      ) : null}

      {isDraft ? (
        <BrandButton
          disabled={pending}
          onClick={() => run(() => activateMonitorAction(organizationId, monitorId), "Monitor activated.")}
        >
          Activate
        </BrandButton>
      ) : isActive ? (
        <BrandButton
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => pauseMonitorAction(organizationId, monitorId), "Monitor paused.")}
        >
          <BrandIcon name="maintenance" size={16} /> Pause
        </BrandButton>
      ) : isPaused ? (
        <BrandButton
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => resumeMonitorAction(organizationId, monitorId), "Monitor resumed.")}
        >
          <BrandIcon name="recovery" size={16} /> Resume
        </BrandButton>
      ) : null}

      <Link className="fj-button fj-button--secondary" href={`/app/monitors/${monitorId}/configuration`}>
        Edit
      </Link>

      <details className="fj-rowmenu" ref={menuRef}>
        <summary aria-label="More actions">
          <BrandIcon name="menu" size={16} />
        </summary>
        <div className="fj-rowmenu__panel" role="menu">
          <button
            type="button"
            className="fj-menu-item"
            role="menuitem"
            onClick={() => {
              closeMenu();
              run(() => duplicateMonitorAction(organizationId, monitorId), "Duplicated as a draft.");
            }}
          >
            <BrandIcon name="overview" size={16} /> Duplicate
          </button>
          {isArchived ? (
            <button
              type="button"
              className="fj-menu-item"
              role="menuitem"
              onClick={() => {
                closeMenu();
                run(() => restoreMonitorAction(organizationId, monitorId), "Monitor restored.");
              }}
            >
              <BrandIcon name="recovery" size={16} /> Restore
            </button>
          ) : (
            <button
              type="button"
              className="fj-menu-item"
              role="menuitem"
              onClick={() => {
                closeMenu();
                setConfirmArchive(true);
              }}
            >
              <BrandIcon name="maintenance" size={16} /> Archive
            </button>
          )}
          <button
            type="button"
            className="fj-menu-item fj-menu-item--danger"
            role="menuitem"
            onClick={() => {
              closeMenu();
              setConfirmDelete(true);
            }}
          >
            <BrandIcon name="trash" size={16} /> Delete
          </button>
        </div>
      </details>

      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        title="Archive this monitor?"
        description="Fajita stops scheduling checks and hides the monitor from active views. History stays available and you can restore it later."
        confirmLabel="Archive"
        onConfirm={async () => {
          const res = await archiveMonitorAction(organizationId, monitorId);
          if (res.ok) {
            toast.success("Monitor archived.");
            router.refresh();
          } else throw new Error(res.error);
        }}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this monitor?"
        description="Fajita stops all checks and begins removing this monitor. This cannot be undone."
        confirmLabel="Delete monitor"
        destructive
        requireTyped={monitorName}
        onConfirm={async () => {
          const res = await deleteMonitorAction(organizationId, monitorId);
          if (res.ok) {
            toast.success("Monitor deleted.");
            router.push("/app/monitors");
          } else throw new Error(res.error);
        }}
      />
    </div>
  );
}
