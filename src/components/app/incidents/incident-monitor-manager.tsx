"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { useToast } from "@/components/app/toast";
import { attachMonitorAction, removeMonitorAction } from "@/lib/app/actions/incidents";

interface AttachedMonitor {
  monitorId: string;
  monitorName: string | null;
  relationship: string;
}

interface MonitorOption {
  id: string;
  name: string;
}

export function IncidentMonitorManager({
  organizationId,
  incidentId,
  attached,
  options,
}: {
  organizationId: string;
  incidentId: string;
  attached: AttachedMonitor[];
  options: MonitorOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState("");

  const attachedIds = new Set(attached.map((m) => m.monitorId));
  const available = options.filter((o) => !attachedIds.has(o.id));

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

  return (
    <div className="fj-inc-monmgr">
      {attached.length === 0 ? (
        <p className="fj-inc-empty-line">No monitors attached.</p>
      ) : (
        <ul className="fj-inc-monitors" role="list">
          {attached.map((m) => (
            <li key={m.monitorId} className="fj-inc-monitor">
              <span className="fj-inc-monitor__name">
                <BrandIcon name="monitor-http" size={14} />
                {m.monitorName ?? "Monitor"}
                {m.relationship === "primary" ? <span className="fj-tag-pill">Primary</span> : null}
              </span>
              <BrandButton
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  run(
                    () => removeMonitorAction(organizationId, incidentId, m.monitorId),
                    "Monitor removed from incident.",
                  )
                }
              >
                Remove
              </BrandButton>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 ? (
        <div className="fj-inc-composer__row" style={{ marginTop: "var(--space-4)" }}>
          <div className="fj-field" style={{ flex: 1 }}>
            <label htmlFor="attach-monitor">Attach a monitor</label>
            <select
              id="attach-monitor"
              className="fj-input"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Select a monitor</option>
              {available.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <BrandButton
            disabled={pending || !selected}
            onClick={() =>
              run(() => attachMonitorAction(organizationId, incidentId, selected), "Monitor attached.")
            }
            style={{ alignSelf: "end" }}
          >
            Attach
          </BrandButton>
        </div>
      ) : null}
    </div>
  );
}
