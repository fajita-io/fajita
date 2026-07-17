"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/app/toast";
import {
  moveMonitorToGroupAction,
} from "@/lib/app/actions/monitors";
import { assignTagAction, unassignTagAction } from "@/lib/app/actions/monitor-tags";

interface Opt {
  id: string;
  name: string;
}
interface TagOpt extends Opt {
  colorToken: string;
}

export function MonitorSettingsForm({
  organizationId,
  monitorId,
  currentGroupId,
  groups,
  allTags,
  assignedTagIds,
}: {
  organizationId: string;
  monitorId: string;
  currentGroupId: string | null;
  groups: Opt[];
  allTags: TagOpt[];
  assignedTagIds: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [group, setGroup] = useState(currentGroupId ?? "");
  const [assigned, setAssigned] = useState<Set<string>>(new Set(assignedTagIds));

  function changeGroup(value: string) {
    setGroup(value);
    start(async () => {
      const res = await moveMonitorToGroupAction(organizationId, monitorId, value || null);
      if (res.ok) {
        toast.success(value ? "Moved to group." : "Removed from group.");
        router.refresh();
      } else {
        toast.error(res.error);
        setGroup(currentGroupId ?? "");
      }
    });
  }

  function toggleTag(tagId: string) {
    const has = assigned.has(tagId);
    const nextSet = new Set(assigned);
    if (has) nextSet.delete(tagId);
    else nextSet.add(tagId);
    setAssigned(nextSet);
    start(async () => {
      const res = has
        ? await unassignTagAction(organizationId, monitorId, tagId)
        : await assignTagAction(organizationId, monitorId, tagId);
      if (res.ok) {
        router.refresh();
      } else {
        toast.error(res.error);
        setAssigned(assigned);
      }
    });
  }

  return (
    <div className="fj-wiz__fields">
      <div className="fj-field">
        <label htmlFor="s-group">Group</label>
        <select id="s-group" className="fj-select" value={group} onChange={(e) => changeGroup(e.target.value)} disabled={pending}>
          <option value="">Ungrouped</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="fj-field">
        <label>Tags</label>
        {allTags.length === 0 ? (
          <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
            No tags yet. Create tags on the monitor groups page, then apply them here.
          </p>
        ) : (
          <div className="fj-taglist" style={{ flexWrap: "wrap" }}>
            {allTags.map((t) => {
              const on = assigned.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className="fj-tag"
                  data-color={t.colorToken}
                  data-selected={on ? "" : undefined}
                  aria-pressed={on}
                  onClick={() => toggleTag(t.id)}
                  disabled={pending}
                  style={{ cursor: "pointer", opacity: on ? 1 : 0.55 }}
                >
                  {on ? "✓ " : ""}{t.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
