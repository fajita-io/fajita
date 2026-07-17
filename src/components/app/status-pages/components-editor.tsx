"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import {
  createComponentAction,
  createGroupAction,
  deleteComponentAction,
  reorderComponentsAction,
  updateComponentAction,
} from "@/lib/app/actions/status-pages";
import {
  COMPONENT_CALCULATION_MODES,
  COMPONENT_STATE_LABEL,
  PUBLIC_COMPONENT_STATES,
  type ComponentCalculationMode,
  type PublicComponentState,
} from "@/lib/status-pages/constants";
import type { ComponentGroupRecord, ComponentRecord } from "@/lib/status-pages/components";

interface MonitorOption {
  id: string;
  name: string;
}

const MODE_LABEL: Record<ComponentCalculationMode, string> = {
  any_critical: "Any critical monitor failing",
  majority: "Majority of monitors",
  primary: "Primary monitor only",
  manual: "Manual (operator controlled)",
};

export function ComponentsEditor({
  organizationId,
  statusPageId,
  components,
  groups,
  monitors,
  canManage,
}: {
  organizationId: string;
  statusPageId: string;
  components: ComponentRecord[];
  groups: ComponentGroupRecord[];
  monitors: MonitorOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  // New component form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");
  const [mode, setMode] = useState<ComponentCalculationMode>("any_critical");
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>([]);
  const [showUptime, setShowUptime] = useState(true);
  const [groupName, setGroupName] = useState("");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  function addComponent() {
    if (!name.trim()) return;
    run(async () => {
      const result = await createComponentAction(organizationId, statusPageId, {
        name: name.trim(),
        description: description.trim() || null,
        groupId: groupId || null,
        calculationMode: mode,
        monitorIds: selectedMonitors,
        showUptime,
      });
      if (result.ok) {
        setName("");
        setDescription("");
        setSelectedMonitors([]);
      }
      return result;
    });
  }

  function addGroup() {
    if (!groupName.trim()) return;
    run(async () => {
      const result = await createGroupAction(organizationId, statusPageId, { name: groupName.trim() });
      if (result.ok) setGroupName("");
      return result;
    });
  }

  function move(index: number, delta: number) {
    const next = [...components];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    run(() => reorderComponentsAction(organizationId, statusPageId, next.map((c) => c.id)));
  }

  const groupName_ = (id: string | null) => groups.find((g) => g.id === id)?.name ?? null;

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      {error ? (
        <div className="fj-sp-alert" data-tone="error" role="alert">
          {error}
        </div>
      ) : null}

      {canManage ? (
        <section className="fj-app-section">
          <div className="fj-app-section__head">
            <h2 className="fj-app-section__title">Add a component</h2>
            <p className="fj-app-section__desc">
              A component is what your customers recognize (Website, API, Checkout). Map it to one or
              more monitors, or keep it manual.
            </p>
          </div>
          <div className="fj-app-section__body">
            <div className="fj-sp-form">
              <div className="fj-sp-field">
                <label htmlFor="c-name">Public name</label>
                <input
                  id="c-name"
                  className="fj-sp-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Website"
                  maxLength={80}
                />
              </div>
              <div className="fj-sp-field">
                <label htmlFor="c-desc">Description (optional)</label>
                <input
                  id="c-desc"
                  className="fj-sp-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Marketing site and dashboard"
                  maxLength={2000}
                />
              </div>
              <div className="fj-sp-field">
                <label htmlFor="c-group">Group (optional)</label>
                <select
                  id="c-group"
                  className="fj-sp-select"
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
              <div className="fj-sp-field">
                <label htmlFor="c-mode">Status calculation</label>
                <select
                  id="c-mode"
                  className="fj-sp-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ComponentCalculationMode)}
                >
                  {COMPONENT_CALCULATION_MODES.map((m) => (
                    <option key={m} value={m}>
                      {MODE_LABEL[m]}
                    </option>
                  ))}
                </select>
              </div>
              {mode !== "manual" ? (
                <div className="fj-sp-field">
                  <label>Mapped monitors</label>
                  {monitors.length === 0 ? (
                    <span className="fj-sp-field__hint">
                      No monitors yet. Create a monitor first, or keep this component manual.
                    </span>
                  ) : (
                    <div className="fj-sp-monitor-pick">
                      {monitors.map((m) => (
                        <label key={m.id}>
                          <input
                            type="checkbox"
                            checked={selectedMonitors.includes(m.id)}
                            onChange={(e) =>
                              setSelectedMonitors((prev) =>
                                e.target.checked
                                  ? [...prev, m.id]
                                  : prev.filter((id) => id !== m.id),
                              )
                            }
                          />
                          {m.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
              <label className="fj-sp-toggle-row">
                <span className="fj-sp-toggle-row__label">Show uptime history</span>
                <input type="checkbox" checked={showUptime} onChange={(e) => setShowUptime(e.target.checked)} />
              </label>
              <div className="fj-sp-actions">
                <BrandButton type="button" onClick={addComponent} disabled={pending || !name.trim()}>
                  Add component
                </BrandButton>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {canManage ? (
        <section className="fj-app-section">
          <div className="fj-app-section__head">
            <h2 className="fj-app-section__title">Add a group</h2>
          </div>
          <div className="fj-app-section__body">
            <div className="fj-sp-actions">
              <input
                className="fj-sp-input"
                style={{ maxWidth: "18rem" }}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Core Services"
                maxLength={80}
              />
              <BrandButton type="button" variant="secondary" onClick={addGroup} disabled={pending || !groupName.trim()}>
                Add group
              </BrandButton>
            </div>
          </div>
        </section>
      ) : null}

      <section className="fj-app-section">
        <div className="fj-app-section__head">
          <h2 className="fj-app-section__title">Components</h2>
        </div>
        <div className="fj-app-section__body">
          {components.length === 0 ? (
            <p className="fj-sp-field__hint">No components yet. Add one above.</p>
          ) : (
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              {components.map((component, index) => (
                <div key={component.id} className="fj-sp-comp">
                  <div className="fj-sp-comp__head">
                    <div>
                      <span className="fj-sp-comp__name">{component.name}</span>
                      {groupName_(component.groupId) ? (
                        <span className="fj-sp-comp__meta"> · {groupName_(component.groupId)}</span>
                      ) : null}
                      <div className="fj-sp-comp__meta">
                        {MODE_LABEL[component.calculationMode]}
                        {component.calculationMode !== "manual"
                          ? ` · ${component.monitors.length} monitor${component.monitors.length === 1 ? "" : "s"}`
                          : ""}
                        {component.visibility === "hidden" ? " · hidden" : ""}
                      </div>
                      {component.calculationMode !== "manual" && component.monitors.length === 0 ? (
                        <div className="fj-sp-comp__warn">
                          No monitor mapped. This component will always read Operational.
                        </div>
                      ) : null}
                    </div>
                    {canManage ? (
                      <div className="fj-sp-comp__actions">
                        <BrandButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => move(index, -1)}
                          disabled={pending || index === 0}
                          aria-label={`Move ${component.name} up`}
                        >
                          <BrandIcon name="chevron-down" size={14} />
                          <span aria-hidden style={{ transform: "rotate(180deg)", display: "inline-block" }} />
                        </BrandButton>
                        <BrandButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => move(index, 1)}
                          disabled={pending || index === components.length - 1}
                          aria-label={`Move ${component.name} down`}
                        >
                          <BrandIcon name="chevron-down" size={14} />
                        </BrandButton>
                        <BrandButton
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditing(editing === component.id ? null : component.id)}
                        >
                          {editing === component.id ? "Close" : "Edit"}
                        </BrandButton>
                        <BrandButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Remove "${component.name}"? Historical incidents keep their references.`)) {
                              run(() => deleteComponentAction(organizationId, statusPageId, component.id));
                            }
                          }}
                          disabled={pending}
                          aria-label={`Delete ${component.name}`}
                        >
                          <BrandIcon name="trash" size={14} />
                        </BrandButton>
                      </div>
                    ) : null}
                  </div>

                  {editing === component.id ? (
                    <ComponentEditRow
                      organizationId={organizationId}
                      statusPageId={statusPageId}
                      component={component}
                      monitors={monitors}
                      onSaved={() => {
                        setEditing(null);
                        router.refresh();
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ComponentEditRow({
  organizationId,
  statusPageId,
  component,
  monitors,
  onSaved,
}: {
  organizationId: string;
  statusPageId: string;
  component: ComponentRecord;
  monitors: MonitorOption[];
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(component.name);
  const [description, setDescription] = useState(component.description ?? "");
  const [mode, setMode] = useState<ComponentCalculationMode>(component.calculationMode);
  const [visibility, setVisibility] = useState(component.visibility);
  const [selected, setSelected] = useState<string[]>(component.monitors.map((m) => m.monitorId));
  const [manualStatus, setManualStatus] = useState<PublicComponentState | "">(
    component.manualStatus ?? "",
  );

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateComponentAction(organizationId, statusPageId, component.id, {
        name: name.trim(),
        description: description.trim() || null,
        calculationMode: mode,
        visibility,
        monitorIds: selected,
        manualStatus: manualStatus === "" ? null : manualStatus,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="fj-sp-form" style={{ marginTop: "var(--space-2)" }}>
      {error ? (
        <div className="fj-sp-alert" data-tone="error" role="alert">
          {error}
        </div>
      ) : null}
      <div className="fj-sp-field">
        <label>Name</label>
        <input className="fj-sp-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
      </div>
      <div className="fj-sp-field">
        <label>Description</label>
        <input
          className="fj-sp-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
      </div>
      <div className="fj-sp-field">
        <label>Status calculation</label>
        <select className="fj-sp-select" value={mode} onChange={(e) => setMode(e.target.value as ComponentCalculationMode)}>
          {COMPONENT_CALCULATION_MODES.map((m) => (
            <option key={m} value={m}>
              {MODE_LABEL[m]}
            </option>
          ))}
        </select>
      </div>
      {mode !== "manual" ? (
        <div className="fj-sp-field">
          <label>Mapped monitors</label>
          <div className="fj-sp-monitor-pick">
            {monitors.map((m) => (
              <label key={m.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={(e) =>
                    setSelected((prev) =>
                      e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id),
                    )
                  }
                />
                {m.name}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="fj-sp-field">
          <label>Manual status</label>
          <select
            className="fj-sp-select"
            value={manualStatus}
            onChange={(e) => setManualStatus(e.target.value as PublicComponentState | "")}
          >
            <option value="">Operational (default)</option>
            {PUBLIC_COMPONENT_STATES.map((s) => (
              <option key={s} value={s}>
                {COMPONENT_STATE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      )}
      <label className="fj-sp-toggle-row">
        <span className="fj-sp-toggle-row__label">Visible on the page</span>
        <input
          type="checkbox"
          checked={visibility === "visible"}
          onChange={(e) => setVisibility(e.target.checked ? "visible" : "hidden")}
        />
      </label>
      <div className="fj-sp-actions">
        <BrandButton type="button" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </BrandButton>
      </div>
    </div>
  );
}
