"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { Dialog } from "@/components/app/dialog";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useToast } from "@/components/app/toast";
import { LifecyclePill, ResultBadge, TagChips, TypeGlyph } from "./monitor-bits";
import { formatResponseTime, formatUptime } from "@/lib/monitoring/uptime";
import { intervalLabel } from "@/lib/monitoring/entitlements";
import { relativeTime } from "@/lib/monitoring/display";
import type { MonitorListItem } from "@/lib/monitoring/queries";
import {
  archiveMonitorAction,
  bulkMonitorAction,
  duplicateMonitorAction,
  moveMonitorToGroupAction,
  pauseMonitorAction,
  restoreMonitorAction,
  resumeMonitorAction,
  runManualCheckAction,
  deleteMonitorAction,
} from "@/lib/app/actions/monitors";

interface GroupOpt {
  id: string;
  name: string;
}
interface TagOpt {
  id: string;
  name: string;
  colorToken: string;
}

export function MonitorsList({
  items,
  organizationId,
  canManage,
  groups,
  tags,
}: {
  items: MonitorListItem[];
  organizationId: string;
  canManage: boolean;
  groups: GroupOpt[];
  tags: TagOpt[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, startBulk] = useTransition();

  // Dialog state
  const [deleteTarget, setDeleteTarget] = useState<MonitorListItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<MonitorListItem | null>(null);
  const [moveTarget, setMoveTarget] = useState<MonitorListItem | null>(null);

  function refresh() {
    router.refresh();
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((m) => m.id)),
    );
  }

  async function runBulk(action: string, extra: Record<string, unknown> = {}) {
    const monitorIds = [...selected];
    if (monitorIds.length === 0) return;
    startBulk(async () => {
      const res = await bulkMonitorAction(organizationId, {
        action,
        monitorIds,
        ...extra,
      });
      if (res.ok && res.data) {
        toast.success(
          `${res.data.succeeded} updated${res.data.failed ? `, ${res.data.failed} skipped` : ""}.`,
        );
        setSelected(new Set());
        refresh();
      } else if (!res.ok) {
        toast.error(res.error);
      }
    });
  }

  const allSelected = items.length > 0 && selected.size === items.length;

  return (
    <div>
      {canManage && selected.size > 0 ? (
        <div className="fj-mon-selectionbar" role="region" aria-label="Bulk actions">
          <span className="fj-mon-selectionbar__count">{selected.size} selected</span>
          <div className="fj-mon-selectionbar__actions">
            <BrandButton size="sm" variant="secondary" disabled={bulkPending} onClick={() => runBulk("pause")}>
              Pause
            </BrandButton>
            <BrandButton size="sm" variant="secondary" disabled={bulkPending} onClick={() => runBulk("resume")}>
              Resume
            </BrandButton>
            <BrandButton size="sm" variant="secondary" disabled={bulkPending} onClick={() => runBulk("archive")}>
              Archive
            </BrandButton>
            {tags.length > 0 ? (
              <select
                className="fj-select"
                aria-label="Add tag to selected"
                defaultValue=""
                disabled={bulkPending}
                onChange={(e) => {
                  if (e.target.value) {
                    runBulk("add_tag", { tagId: e.target.value });
                    e.target.value = "";
                  }
                }}
              >
                <option value="">Add tag…</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : null}
            <select
              className="fj-select"
              aria-label="Move selected to group"
              defaultValue=""
              disabled={bulkPending}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                runBulk("move_group", { groupId: v === "__ungrouped__" ? null : v });
                e.target.value = "";
              }}
            >
              <option value="">Move to group…</option>
              <option value="__ungrouped__">Ungrouped</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <BrandButton size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </BrandButton>
          </div>
        </div>
      ) : null}

      {/* Desktop table */}
      <div className="fj-mon-tablewrap">
        <table className="fj-mon-table">
          <thead>
            <tr>
              {canManage ? (
                <th style={{ width: "2.5rem" }}>
                  <input
                    type="checkbox"
                    aria-label="Select all monitors"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
              ) : null}
              <th>Monitor</th>
              <th>Status</th>
              <th>Latest check</th>
              <th className="fj-mon-cell-num">Response</th>
              <th className="fj-mon-cell-num">Uptime 24h</th>
              <th>Interval</th>
              <th>Last checked</th>
              {canManage ? <th aria-label="Actions" /> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} data-archived={m.archivedAt ? "" : undefined}>
                {canManage ? (
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${m.name}`}
                      checked={selected.has(m.id)}
                      onChange={() => toggle(m.id)}
                    />
                  </td>
                ) : null}
                <td>
                  <div className="fj-mon-row__name">
                    <TypeGlyph monitorType={m.monitorType} />
                    <div className="fj-mon-row__namecol">
                      <Link href={`/app/monitors/${m.id}`} className="fj-mon-row__title">
                        {m.name}
                      </Link>
                      <div className="fj-mon-row__dest">{m.safeDestination}</div>
                      {m.tags.length > 0 ? (
                        <div style={{ marginTop: 4 }}>
                          <TagChips tags={m.tags} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td>
                  <LifecyclePill status={m.status} />
                </td>
                <td>
                  <ResultBadge result={m.lastResultStatus} />
                </td>
                <td className="fj-mon-cell-num">{formatResponseTime(m.lastResponseTimeMs)}</td>
                <td className="fj-mon-cell-num">{formatUptime(m.stats24h)}</td>
                <td>{intervalLabel(m.checkIntervalSeconds)}</td>
                <td>{relativeTime(m.lastCheckAt)}</td>
                {canManage ? (
                  <td>
                    <RowMenu
                      monitor={m}
                      organizationId={organizationId}
                      onRefresh={refresh}
                      onDelete={() => setDeleteTarget(m)}
                      onArchive={() => setArchiveTarget(m)}
                      onMove={() => setMoveTarget(m)}
                      toastSuccess={toast.success}
                      toastError={toast.error}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="fj-mon-cards">
        {items.map((m) => (
          <div key={m.id} className="fj-mon-card" data-archived={m.archivedAt ? "" : undefined}>
            <div className="fj-mon-card__top">
              <TypeGlyph monitorType={m.monitorType} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/app/monitors/${m.id}`} className="fj-mon-row__title">
                  {m.name}
                </Link>
                <div className="fj-mon-row__dest">{m.safeDestination}</div>
              </div>
              {canManage ? (
                <RowMenu
                  monitor={m}
                  organizationId={organizationId}
                  onRefresh={refresh}
                  onDelete={() => setDeleteTarget(m)}
                  onArchive={() => setArchiveTarget(m)}
                  onMove={() => setMoveTarget(m)}
                  toastSuccess={toast.success}
                  toastError={toast.error}
                />
              ) : null}
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)", flexWrap: "wrap" }}>
              <LifecyclePill status={m.status} />
              <ResultBadge result={m.lastResultStatus} />
            </div>
            <div className="fj-mon-card__meta">
              <span>Response <b>{formatResponseTime(m.lastResponseTimeMs)}</b></span>
              <span>Uptime 24h <b>{formatUptime(m.stats24h)}</b></span>
              <span>{intervalLabel(m.checkIntervalSeconds)}</span>
              <span>Checked <b>{relativeTime(m.lastCheckAt)}</b></span>
            </div>
            {m.tags.length > 0 ? (
              <div style={{ marginTop: "var(--space-2)" }}>
                <TagChips tags={m.tags} />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Delete */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this monitor?"
        description="Fajita stops all checks and begins removing this monitor. History is retained only as long as your data policy requires. This cannot be undone."
        confirmLabel="Delete monitor"
        destructive
        requireTyped={deleteTarget?.name}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteMonitorAction(organizationId, deleteTarget.id);
          if (res.ok) {
            toast.success("Monitor deleted.");
            refresh();
          } else {
            throw new Error(res.error);
          }
        }}
      />

      {/* Archive */}
      <ConfirmDialog
        open={archiveTarget !== null}
        onClose={() => setArchiveTarget(null)}
        title="Archive this monitor?"
        description="Fajita stops scheduling checks and hides the monitor from active views. History stays available and you can restore it later."
        confirmLabel="Archive"
        onConfirm={async () => {
          if (!archiveTarget) return;
          const res = await archiveMonitorAction(organizationId, archiveTarget.id);
          if (res.ok) {
            toast.success("Monitor archived.");
            refresh();
          } else {
            throw new Error(res.error);
          }
        }}
      />

      {/* Move to group */}
      {moveTarget ? (
        <MoveDialog
          monitor={moveTarget}
          groups={groups}
          organizationId={organizationId}
          onClose={() => setMoveTarget(null)}
          onDone={() => {
            toast.success("Monitor moved.");
            refresh();
          }}
          onError={toast.error}
        />
      ) : null}
    </div>
  );
}

function RowMenu({
  monitor,
  organizationId,
  onRefresh,
  onDelete,
  onArchive,
  onMove,
  toastSuccess,
  toastError,
}: {
  monitor: MonitorListItem;
  organizationId: string;
  onRefresh: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onMove: () => void;
  toastSuccess: (m: string) => void;
  toastError: (m: string) => void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [pending, start] = useTransition();

  function close() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  function act(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    close();
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toastSuccess(success);
        onRefresh();
      } else {
        toastError(res.error ?? "That did not work.");
      }
    });
  }

  const isActive = monitor.status === "active";
  const isArchived = monitor.status === "archived";

  return (
    <details className="fj-rowmenu" ref={detailsRef}>
      <summary aria-label={`Actions for ${monitor.name}`} aria-busy={pending}>
        <BrandIcon name="menu" size={16} />
      </summary>
      <div className="fj-rowmenu__panel" role="menu">
        <Link href={`/app/monitors/${monitor.id}`} className="fj-menu-item" role="menuitem">
          <BrandIcon name="external" size={16} /> Open
        </Link>
        {!isArchived && monitor.monitorType !== "heartbeat" && isActive ? (
          <button
            type="button"
            className="fj-menu-item"
            role="menuitem"
            onClick={() =>
              act(() => runManualCheckAction(organizationId, monitor.id), "Check ran. This test did not open an incident.")
            }
          >
            <BrandIcon name="response-time" size={16} /> Run check
          </button>
        ) : null}
        {isActive ? (
          <button
            type="button"
            className="fj-menu-item"
            role="menuitem"
            onClick={() => act(() => pauseMonitorAction(organizationId, monitor.id), "Monitor paused.")}
          >
            <BrandIcon name="maintenance" size={16} /> Pause
          </button>
        ) : monitor.status === "paused" ? (
          <button
            type="button"
            className="fj-menu-item"
            role="menuitem"
            onClick={() => act(() => resumeMonitorAction(organizationId, monitor.id), "Monitor resumed.")}
          >
            <BrandIcon name="recovery" size={16} /> Resume
          </button>
        ) : null}
        <button
          type="button"
          className="fj-menu-item"
          role="menuitem"
          onClick={() =>
            act(async () => {
              const res = await duplicateMonitorAction(organizationId, monitor.id);
              return res;
            }, "Duplicated as a draft.")
          }
        >
          <BrandIcon name="overview" size={16} /> Duplicate
        </button>
        <button
          type="button"
          className="fj-menu-item"
          role="menuitem"
          onClick={() => {
            close();
            onMove();
          }}
        >
          <BrandIcon name="region" size={16} /> Move to group
        </button>
        {isArchived ? (
          <button
            type="button"
            className="fj-menu-item"
            role="menuitem"
            onClick={() => act(() => restoreMonitorAction(organizationId, monitor.id), "Monitor restored.")}
          >
            <BrandIcon name="recovery" size={16} /> Restore
          </button>
        ) : (
          <button
            type="button"
            className="fj-menu-item"
            role="menuitem"
            onClick={() => {
              close();
              onArchive();
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
            close();
            onDelete();
          }}
        >
          <BrandIcon name="trash" size={16} /> Delete
        </button>
      </div>
    </details>
  );
}

function MoveDialog({
  monitor,
  groups,
  organizationId,
  onClose,
  onDone,
  onError,
}: {
  monitor: MonitorListItem;
  groups: GroupOpt[];
  organizationId: string;
  onClose: () => void;
  onDone: () => void;
  onError: (m: string) => void;
}) {
  const [groupId, setGroupId] = useState<string>(monitor.groupId ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await moveMonitorToGroupAction(organizationId, monitor.id, groupId || null);
    setBusy(false);
    if (res.ok) {
      onClose();
      onDone();
    } else {
      onError(res.error);
    }
  }

  return (
    <Dialog open onClose={onClose} title="Move monitor" description={`Choose a group for "${monitor.name}".`} size="sm">
      <div className="fj-field">
        <label htmlFor="move-group">Group</label>
        <select
          id="move-group"
          className="fj-select"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        >
          <option value="">Ungrouped</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div className="fj-dialog__actions">
        <BrandButton variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </BrandButton>
        <BrandButton onClick={save} disabled={busy}>
          {busy ? "Moving…" : "Move"}
        </BrandButton>
      </div>
    </Dialog>
  );
}
