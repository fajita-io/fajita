"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton, BrandCard } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { Dialog } from "@/components/app/dialog";
import { useToast } from "@/components/app/toast";
import {
  createGroupAction,
  deleteGroupAction,
  renameGroupAction,
  reorderGroupsAction,
} from "@/lib/app/actions/monitor-groups";
import {
  createTagAction,
  deleteTagAction,
  renameTagAction,
} from "@/lib/app/actions/monitor-tags";

export interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  monitorCount: number;
}
export interface TagRow {
  id: string;
  name: string;
  colorToken: string;
  monitorCount: number;
}

const TAG_COLORS = ["ember", "lime", "amber", "sky", "violet", "slate"] as const;

export function OrganizeManager({
  organizationId,
  groups,
  tags,
}: {
  organizationId: string;
  groups: GroupRow[];
  tags: TagRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  const [newGroup, setNewGroup] = useState("");
  const [newTag, setNewTag] = useState("");
  const [tagColor, setTagColor] = useState<string>("ember");
  const [renameGroup, setRenameGroup] = useState<GroupRow | null>(null);
  const [renameGroupName, setRenameGroupName] = useState("");
  const [deleteGroup, setDeleteGroup] = useState<GroupRow | null>(null);
  const [renameTag, setRenameTag] = useState<TagRow | null>(null);
  const [renameTagName, setRenameTagName] = useState("");
  const [deleteTag, setDeleteTag] = useState<TagRow | null>(null);

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

  function moveGroup(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= groups.length) return;
    const ids = groups.map((g) => g.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderGroupsAction(organizationId, ids), "Order updated.");
  }

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <BrandCard>
        <h2 className="fj-section-title">Groups</h2>
        <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
          Group monitors by environment, product area, or team. Deleting a group keeps its monitors and moves
          them to ungrouped.
        </p>

        <form
          className="fj-inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newGroup.trim()) return;
            run(() => createGroupAction(organizationId, newGroup.trim()), "Group created.");
            setNewGroup("");
          }}
        >
          <input className="fj-input" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Production" maxLength={60} aria-label="New group name" />
          <BrandButton type="submit" size="sm" disabled={pending || !newGroup.trim()}>Add group</BrandButton>
        </form>

        <div style={{ marginTop: "var(--space-4)" }}>
          {groups.length === 0 ? (
            <p className="fj-wiz__hint">No groups yet.</p>
          ) : (
            groups.map((g, i) => (
              <div className="fj-grouprow" key={g.id}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ display: "flex", flexDirection: "column" }}>
                    <button type="button" className="fj-icon-button" aria-label="Move up" disabled={i === 0 || pending} onClick={() => moveGroup(i, -1)}>
                      <BrandIcon name="chevron-down" size={12} className="fj-flip-up" />
                    </button>
                    <button type="button" className="fj-icon-button" aria-label="Move down" disabled={i === groups.length - 1 || pending} onClick={() => moveGroup(i, 1)}>
                      <BrandIcon name="chevron-down" size={12} />
                    </button>
                  </span>
                  <div>
                    <strong>{g.name}</strong>
                    <span className="fj-grouprow__count"> · {g.monitorCount} monitor{g.monitorCount === 1 ? "" : "s"}</span>
                    {g.description ? <div className="fj-wiz__hint" style={{ margin: 0 }}>{g.description}</div> : null}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <BrandButton size="sm" variant="ghost" onClick={() => { setRenameGroup(g); setRenameGroupName(g.name); }}>Rename</BrandButton>
                  <BrandButton size="sm" variant="ghost" className="fj-button--danger" onClick={() => setDeleteGroup(g)}>Delete</BrandButton>
                </div>
              </div>
            ))
          )}
        </div>
      </BrandCard>

      <BrandCard>
        <h2 className="fj-section-title">Tags</h2>
        <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
          Tags cut across groups. Apply them to monitors from the monitor settings tab.
        </p>

        <form
          className="fj-inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTag.trim()) return;
            run(() => createTagAction(organizationId, newTag.trim(), tagColor), "Tag created.");
            setNewTag("");
          }}
        >
          <input className="fj-input" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="customer-facing" maxLength={40} aria-label="New tag name" />
          <select className="fj-select" value={tagColor} onChange={(e) => setTagColor(e.target.value)} aria-label="Tag color" style={{ maxWidth: "8rem" }}>
            {TAG_COLORS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <BrandButton type="submit" size="sm" disabled={pending || !newTag.trim()}>Add tag</BrandButton>
        </form>

        <div className="fj-taglist" style={{ flexWrap: "wrap", marginTop: "var(--space-4)" }}>
          {tags.length === 0 ? (
            <p className="fj-wiz__hint">No tags yet.</p>
          ) : (
            tags.map((t) => (
              <span key={t.id} className="fj-tag" data-color={t.colorToken} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {t.name}
                <span style={{ opacity: 0.7 }}>({t.monitorCount})</span>
                <button type="button" className="fj-tag__x" aria-label={`Rename ${t.name}`} onClick={() => { setRenameTag(t); setRenameTagName(t.name); }}>
                  <BrandIcon name="settings" size={11} />
                </button>
                <button type="button" className="fj-tag__x" aria-label={`Delete ${t.name}`} onClick={() => setDeleteTag(t)}>
                  <BrandIcon name="close" size={11} />
                </button>
              </span>
            ))
          )}
        </div>
      </BrandCard>

      {renameGroup ? (
        <Dialog open onClose={() => setRenameGroup(null)} title="Rename group" size="sm">
          <div className="fj-field" style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="rg-name">Name</label>
            <input id="rg-name" className="fj-input" value={renameGroupName} onChange={(e) => setRenameGroupName(e.target.value)} maxLength={60} />
          </div>
          <div className="fj-dialog__actions">
            <BrandButton variant="ghost" onClick={() => setRenameGroup(null)}>Cancel</BrandButton>
            <BrandButton
              onClick={() => {
                const g = renameGroup;
                setRenameGroup(null);
                run(() => renameGroupAction(organizationId, g.id, renameGroupName.trim()), "Group renamed.");
              }}
              disabled={!renameGroupName.trim()}
            >
              Save
            </BrandButton>
          </div>
        </Dialog>
      ) : null}

      {renameTag ? (
        <Dialog open onClose={() => setRenameTag(null)} title="Rename tag" size="sm">
          <div className="fj-field" style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="rt-name">Name</label>
            <input id="rt-name" className="fj-input" value={renameTagName} onChange={(e) => setRenameTagName(e.target.value)} maxLength={40} />
          </div>
          <div className="fj-dialog__actions">
            <BrandButton variant="ghost" onClick={() => setRenameTag(null)}>Cancel</BrandButton>
            <BrandButton
              onClick={() => {
                const t = renameTag;
                setRenameTag(null);
                run(() => renameTagAction(organizationId, t.id, renameTagName.trim()), "Tag renamed.");
              }}
              disabled={!renameTagName.trim()}
            >
              Save
            </BrandButton>
          </div>
        </Dialog>
      ) : null}

      <ConfirmDialog
        open={deleteGroup !== null}
        onClose={() => setDeleteGroup(null)}
        title="Delete this group?"
        description="Monitors in this group are kept and moved to ungrouped. This does not delete any monitors."
        confirmLabel="Delete group"
        destructive
        onConfirm={async () => {
          if (!deleteGroup) return;
          const res = await deleteGroupAction(organizationId, deleteGroup.id);
          if (res.ok) { toast.success("Group deleted."); router.refresh(); }
          else throw new Error(res.error);
        }}
      />
      <ConfirmDialog
        open={deleteTag !== null}
        onClose={() => setDeleteTag(null)}
        title="Delete this tag?"
        description="The tag is removed from every monitor it is on. The monitors themselves are untouched."
        confirmLabel="Delete tag"
        destructive
        onConfirm={async () => {
          if (!deleteTag) return;
          const res = await deleteTagAction(organizationId, deleteTag.id);
          if (res.ok) { toast.success("Tag deleted."); router.refresh(); }
          else throw new Error(res.error);
        }}
      />
    </div>
  );
}
