"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { Dialog } from "@/components/app/dialog";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useToast } from "@/components/app/toast";
import { secretTypeLabel } from "@/lib/monitoring/display";
import {
  addSecretAction,
  deleteSecretAction,
  rotateSecretAction,
} from "@/lib/app/actions/monitors";

export interface SecretRow {
  id: string;
  secretType: string;
  headerName: string | null;
  maskedLabel: string;
  rotatedAt: string | null;
}

/**
 * Encrypted credential manager. Values are entered masked, encrypted server
 * side, and never returned. After save only a masked label (e.g. "…7F2A")
 * appears. Replacement and deletion are explicit; there is no secret recovery.
 */
export function SecretManager({
  organizationId,
  monitorId,
  secrets,
}: {
  organizationId: string;
  monitorId: string;
  secrets: SecretRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [rotateTarget, setRotateTarget] = useState<SecretRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SecretRow | null>(null);

  return (
    <div>
      {secrets.length === 0 ? (
        <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
          No credentials on this monitor. Add one only if the endpoint needs authentication. Use a scoped,
          read-only credential and keep it out of the URL.
        </p>
      ) : (
        <ul className="fj-security-list">
          {secrets.map((s) => (
            <li className="fj-secret-row" key={s.id}>
              <BrandIcon name="secret-lock" size={18} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fj-secret-row__label">
                  {secretTypeLabel(s.secretType)}
                  {s.headerName ? ` · ${s.headerName}` : ""} ending in {s.maskedLabel}
                </div>
                <div className="fj-secret-row__type">
                  {s.rotatedAt ? `Rotated ${new Date(s.rotatedAt).toLocaleDateString()}` : "Encrypted and stored"}
                </div>
              </div>
              <BrandButton size="sm" variant="secondary" onClick={() => setRotateTarget(s)}>
                Replace
              </BrandButton>
              <BrandButton size="sm" variant="ghost" className="fj-button--danger" onClick={() => setDeleteTarget(s)}>
                Delete
              </BrandButton>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "var(--space-4)" }}>
        <BrandButton variant="secondary" size="sm" onClick={() => setAdding(true)}>
          <BrandIcon name="plus" size={14} /> Add credential
        </BrandButton>
      </div>

      {adding ? (
        <AddSecretDialog
          organizationId={organizationId}
          monitorId={monitorId}
          onClose={() => setAdding(false)}
          onDone={() => {
            toast.success("Credential encrypted and saved.");
            router.refresh();
          }}
          onError={toast.error}
        />
      ) : null}

      {rotateTarget ? (
        <RotateSecretDialog
          organizationId={organizationId}
          secret={rotateTarget}
          onClose={() => setRotateTarget(null)}
          onDone={() => {
            toast.success("Credential replaced.");
            router.refresh();
          }}
          onError={toast.error}
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this credential?"
        description="The monitor will no longer send it. If the endpoint requires it, checks may start failing until you add a new one."
        confirmLabel="Delete credential"
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteSecretAction(organizationId, deleteTarget.id);
          if (res.ok) {
            toast.success("Credential deleted.");
            router.refresh();
          } else throw new Error(res.error);
        }}
      />
    </div>
  );
}

const SECRET_TYPES = [
  { value: "bearer_token", label: "Bearer token" },
  { value: "basic_auth", label: "Basic authentication" },
  { value: "custom_header", label: "Custom secret header" },
] as const;

function AddSecretDialog({
  organizationId,
  monitorId,
  onClose,
  onDone,
  onError,
}: {
  organizationId: string;
  monitorId: string;
  onClose: () => void;
  onDone: () => void;
  onError: (m: string) => void;
}) {
  const [secretType, setSecretType] = useState<string>("bearer_token");
  const [headerName, setHeaderName] = useState("");
  const [value, setValue] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!value) return;
    setBusy(true);
    const res = await addSecretAction(organizationId, monitorId, {
      secretType,
      headerName: secretType === "custom_header" ? headerName.trim() : undefined,
      value,
    });
    setBusy(false);
    if (res.ok) {
      setValue("");
      onClose();
      onDone();
    } else {
      onError(res.error);
    }
  }

  return (
    <Dialog open onClose={onClose} title="Add credential" description="Encrypted before it is stored. Fajita never shows it again." size="sm">
      <div className="fj-field" style={{ marginBottom: "var(--space-4)" }}>
        <label htmlFor="sec-type">Type</label>
        <select id="sec-type" className="fj-select" value={secretType} onChange={(e) => setSecretType(e.target.value)}>
          {SECRET_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      {secretType === "custom_header" ? (
        <div className="fj-field" style={{ marginBottom: "var(--space-4)" }}>
          <label htmlFor="sec-header">Header name</label>
          <input id="sec-header" className="fj-input" value={headerName} onChange={(e) => setHeaderName(e.target.value)} placeholder="X-Api-Key" autoComplete="off" />
        </div>
      ) : null}
      <div className="fj-field" style={{ marginBottom: "var(--space-4)" }}>
        <label htmlFor="sec-value">
          {secretType === "basic_auth" ? "username:password" : "Value"}
        </label>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <input
            id="sec-value"
            className="fj-input"
            type={reveal ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <BrandButton size="sm" variant="ghost" onClick={() => setReveal((v) => !v)}>
            {reveal ? "Hide" : "Show"}
          </BrandButton>
        </div>
      </div>
      <div className="fj-dialog__actions">
        <BrandButton variant="ghost" onClick={onClose} disabled={busy}>Cancel</BrandButton>
        <BrandButton onClick={save} disabled={busy || !value}>{busy ? "Saving…" : "Save credential"}</BrandButton>
      </div>
    </Dialog>
  );
}

function RotateSecretDialog({
  organizationId,
  secret,
  onClose,
  onDone,
  onError,
}: {
  organizationId: string;
  secret: SecretRow;
  onClose: () => void;
  onDone: () => void;
  onError: (m: string) => void;
}) {
  const [value, setValue] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!value) return;
    setBusy(true);
    const res = await rotateSecretAction(organizationId, secret.id, value);
    setBusy(false);
    if (res.ok) {
      onClose();
      onDone();
    } else {
      onError(res.error);
    }
  }

  return (
    <Dialog open onClose={onClose} title="Replace credential" description="Enter the new value. The old one is retired immediately." size="sm">
      <div className="fj-field" style={{ marginBottom: "var(--space-4)" }}>
        <label htmlFor="rot-value">New value</label>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <input
            id="rot-value"
            className="fj-input"
            type={reveal ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <BrandButton size="sm" variant="ghost" onClick={() => setReveal((v) => !v)}>
            {reveal ? "Hide" : "Show"}
          </BrandButton>
        </div>
      </div>
      <div className="fj-dialog__actions">
        <BrandButton variant="ghost" onClick={onClose} disabled={busy}>Cancel</BrandButton>
        <BrandButton onClick={save} disabled={busy || !value}>{busy ? "Saving…" : "Replace"}</BrandButton>
      </div>
    </Dialog>
  );
}
