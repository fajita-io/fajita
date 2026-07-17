"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { useToast } from "@/components/app/toast";
import { PROVIDER_LABEL } from "@/components/app/alerts/alert-bits";
import { createRuleAction, updateRuleAction } from "@/lib/app/actions/alerts";
import { ALERT_EVENT_TYPES } from "@/lib/alerts/events";
import { DEFAULT_RULE_EVENT_TYPES } from "@/lib/alerts/events";
import { ROUTABLE_SEVERITIES, type AlertProvider, type ScopeKind } from "@/lib/alerts/constants";

interface Option {
  id: string;
  name: string;
}
interface ChannelOption extends Option {
  provider: AlertProvider;
  status: string;
}

type ChannelRole = "primary" | "recovery_only" | "fallback";

const CATEGORY_LABEL: Record<string, string> = {
  incident: "Incidents",
  maintenance: "Maintenance",
  ssl: "Certificates",
  heartbeat: "Heartbeats",
  monitor: "Monitor signals",
};

const SCOPE_LABEL: Record<ScopeKind, string> = {
  organization: "All monitors",
  monitor: "Specific monitors",
  group: "Monitor groups",
  tag: "Tags",
};

const RECOVERY_LABEL: Record<string, string> = {
  only_if_opened_delivered: "Only if the opening alert was delivered here (recommended)",
  same_channels: "Always send recovery to the same channels",
  never: "Never send recovery messages",
  selected_channels: "Only to channels marked recovery",
};

const QUIET_LABEL: Record<string, string> = {
  delay: "Hold non-critical alerts until quiet hours end (recommended)",
  suppress: "Drop non-critical alerts during quiet hours",
  ignore_quiet: "Ignore quiet hours for this rule",
};

const SEVERITY_LABEL: Record<string, string> = { minor: "Minor", major: "Major", critical: "Critical" };

export interface RuleInitial {
  ruleId?: string;
  name?: string;
  scopeKind?: ScopeKind;
  recoveryBehavior?: string;
  quietBehavior?: string;
  deduplicate?: boolean;
  eventTypes?: string[];
  severities?: string[];
  monitorIds?: string[];
  groupIds?: string[];
  tagIds?: string[];
  channels?: Array<{ channelId: string; role: ChannelRole }>;
}

export function RuleForm({
  organizationId,
  channels,
  monitors,
  groups,
  tags,
  initial,
}: {
  organizationId: string;
  channels: ChannelOption[];
  monitors: Option[];
  groups: Option[];
  tags: Option[];
  initial?: RuleInitial;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const isEdit = Boolean(initial?.ruleId);

  const [name, setName] = useState(initial?.name ?? "");
  const [scopeKind, setScopeKind] = useState<ScopeKind>(initial?.scopeKind ?? "organization");
  const [eventTypes, setEventTypes] = useState<string[]>(initial?.eventTypes ?? [...DEFAULT_RULE_EVENT_TYPES]);
  const [severities, setSeverities] = useState<string[]>(initial?.severities ?? []);
  const [monitorIds, setMonitorIds] = useState<string[]>(initial?.monitorIds ?? []);
  const [groupIds, setGroupIds] = useState<string[]>(initial?.groupIds ?? []);
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [channelRoles, setChannelRoles] = useState<Map<string, ChannelRole>>(
    () => new Map((initial?.channels ?? []).map((c) => [c.channelId, c.role])),
  );
  const [recoveryBehavior, setRecoveryBehavior] = useState(initial?.recoveryBehavior ?? "only_if_opened_delivered");
  const [quietBehavior, setQuietBehavior] = useState(initial?.quietBehavior ?? "delay");
  const [deduplicate, setDeduplicate] = useState(initial?.deduplicate ?? true);

  function toggle(list: string[], set: (v: string[]) => void, id: string) {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function toggleChannel(id: string) {
    setChannelRoles((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, "primary");
      return next;
    });
  }

  function setRole(id: string, role: ChannelRole) {
    setChannelRoles((prev) => new Map(prev).set(id, role));
  }

  function submit() {
    if (name.trim().length < 1) return toast.error("Name this rule.");
    if (eventTypes.length === 0) return toast.error("Choose at least one event to route.");
    if (channelRoles.size === 0) return toast.error("Send to at least one channel.");
    if (scopeKind === "monitor" && monitorIds.length === 0) return toast.error("Pick the monitors this rule covers.");
    if (scopeKind === "group" && groupIds.length === 0) return toast.error("Pick the groups this rule covers.");
    if (scopeKind === "tag" && tagIds.length === 0) return toast.error("Pick the tags this rule covers.");

    const payload = {
      name: name.trim(),
      scopeKind,
      recoveryBehavior,
      quietBehavior,
      deduplicate,
      eventTypes,
      severities,
      monitorIds: scopeKind === "monitor" ? monitorIds : [],
      groupIds: scopeKind === "group" ? groupIds : [],
      tagIds: scopeKind === "tag" ? tagIds : [],
      channels: [...channelRoles.entries()].map(([channelId, role]) => ({ channelId, role })),
    };

    start(async () => {
      const res = isEdit
        ? await updateRuleAction(organizationId, initial!.ruleId!, payload)
        : await createRuleAction(organizationId, payload);
      if (res.ok) {
        toast.success(isEdit ? "Rule saved." : "Rule created.");
        router.push("/app/integrations/rules");
        router.refresh();
      } else {
        toast.error(res.error ?? "That did not work.");
      }
    });
  }

  const grouped = groupBy(ALERT_EVENT_TYPES.filter((e) => e.emitted), (e) => e.category);
  const scopeOptions: Option[] = scopeKind === "monitor" ? monitors : scopeKind === "group" ? groups : scopeKind === "tag" ? tags : [];
  const scopeSelected = scopeKind === "monitor" ? monitorIds : scopeKind === "group" ? groupIds : tagIds;
  const setScopeSelected = scopeKind === "monitor" ? setMonitorIds : scopeKind === "group" ? setGroupIds : setTagIds;

  return (
    <div className="fj-inc-form">
      <div className="fj-field">
        <label htmlFor="rule-name">Name</label>
        <input
          id="rule-name"
          className="fj-input"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          placeholder="Page on-call for outages"
        />
      </div>

      <fieldset className="fj-field fj-rule-fieldset">
        <legend className="fj-field__label">When these events happen</legend>
        {Object.entries(grouped).map(([category, events]) => (
          <div key={category} className="fj-event-group">
            <span className="fj-event-group__label">{CATEGORY_LABEL[category] ?? category}</span>
            <div className="fj-check-grid">
              {events.map((e) => (
                <label key={e.type} className="fj-check-chip">
                  <input type="checkbox" checked={eventTypes.includes(e.type)} onChange={() => toggle(eventTypes, setEventTypes, e.type)} />
                  {e.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <fieldset className="fj-field fj-rule-fieldset">
        <legend className="fj-field__label">For which monitors</legend>
        <div className="fj-radio-row">
          {(Object.keys(SCOPE_LABEL) as ScopeKind[]).map((s) => (
            <label key={s} className="fj-radio-chip">
              <input type="radio" name="scope" checked={scopeKind === s} onChange={() => setScopeKind(s)} />
              {SCOPE_LABEL[s]}
            </label>
          ))}
        </div>
        {scopeKind !== "organization" ? (
          scopeOptions.length === 0 ? (
            <p className="fj-field__hint">No {SCOPE_LABEL[scopeKind].toLowerCase()} to choose from yet.</p>
          ) : (
            <div className="fj-check-grid" style={{ marginTop: "var(--space-3)" }}>
              {scopeOptions.map((o) => (
                <label key={o.id} className="fj-check-chip">
                  <input type="checkbox" checked={scopeSelected.includes(o.id)} onChange={() => toggle(scopeSelected, setScopeSelected, o.id)} />
                  {o.name}
                </label>
              ))}
            </div>
          )
        ) : null}
      </fieldset>

      <fieldset className="fj-field fj-rule-fieldset">
        <legend className="fj-field__label">Severity (optional)</legend>
        <p className="fj-field__hint">Leave empty to match every severity. Otherwise only these severities route through this rule.</p>
        <div className="fj-radio-row">
          {ROUTABLE_SEVERITIES.map((s) => (
            <label key={s} className="fj-check-chip">
              <input type="checkbox" checked={severities.includes(s)} onChange={() => toggle(severities, setSeverities, s)} />
              {SEVERITY_LABEL[s]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="fj-field fj-rule-fieldset">
        <legend className="fj-field__label">Send to</legend>
        {channels.length === 0 ? (
          <p className="fj-field__hint">No channels yet. Add one first.</p>
        ) : (
          <div className="fj-channel-picker">
            {channels.map((c) => {
              const selected = channelRoles.has(c.id);
              return (
                <div key={c.id} className="fj-channel-pick" data-selected={selected || undefined}>
                  <label className="fj-check-chip fj-check-chip--wide">
                    <input type="checkbox" checked={selected} onChange={() => toggleChannel(c.id)} />
                    <span className="fj-channel-pick__name">{c.name}</span>
                    <span className="fj-channel-pick__provider">{PROVIDER_LABEL[c.provider]}</span>
                  </label>
                  {selected ? (
                    <select
                      className="fj-input fj-input--sm"
                      value={channelRoles.get(c.id)}
                      onChange={(e) => setRole(c.id, e.target.value as ChannelRole)}
                      aria-label={`Role for ${c.name}`}
                    >
                      <option value="primary">Primary</option>
                      <option value="fallback">Fallback</option>
                      <option value="recovery_only">Recovery only</option>
                    </select>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </fieldset>

      <div className="fj-field">
        <label htmlFor="rule-recovery">Recovery messages</label>
        <select id="rule-recovery" className="fj-input" value={recoveryBehavior} onChange={(e) => setRecoveryBehavior(e.target.value)}>
          {Object.entries(RECOVERY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="fj-field">
        <label htmlFor="rule-quiet">Quiet hours</label>
        <select id="rule-quiet" className="fj-input" value={quietBehavior} onChange={(e) => setQuietBehavior(e.target.value)}>
          {Object.entries(QUIET_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <label className="fj-check-chip fj-check-chip--wide">
        <input type="checkbox" checked={deduplicate} onChange={(e) => setDeduplicate(e.target.checked)} />
        Collapse repeated events for the same incident (recommended)
      </label>

      <div className="fj-inc-composer__actions">
        <BrandButton disabled={pending} onClick={submit}>
          {pending ? "Saving…" : isEdit ? "Save rule" : "Create rule"}
        </BrandButton>
      </div>
    </div>
  );
}

function groupBy<T>(items: readonly T[], key: (t: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    (out[k] ??= []).push(item);
  }
  return out;
}
