"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandButton } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { useToast } from "@/components/app/toast";
import { addNoteAction, addUpdateAction } from "@/lib/app/actions/incidents";
import { UPDATE_TYPES, UPDATE_VISIBILITY } from "@/lib/incidents/constants";
import { PUBLIC_UPDATE_SAVED_NOTICE, UPDATE_TYPE_LABEL } from "@/lib/incidents/copy";

type Mode = "update" | "note";

export function IncidentUpdateComposer({
  organizationId,
  incidentId,
}: {
  organizationId: string;
  incidentId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<Mode>("update");

  const [updateType, setUpdateType] = useState<(typeof UPDATE_TYPES)[number]>("investigating");
  const [visibility, setVisibility] = useState<(typeof UPDATE_VISIBILITY)[number]>("internal");
  const [body, setBody] = useState("");

  function submit() {
    if (body.trim().length === 0) {
      toast.error("Write something first.");
      return;
    }
    start(async () => {
      const res =
        mode === "update"
          ? await addUpdateAction(organizationId, incidentId, {
              updateType,
              visibility,
              body: body.trim(),
            })
          : await addNoteAction(organizationId, incidentId, body.trim());
      if (res.ok) {
        toast.success(
          mode === "note"
            ? "Internal note saved."
            : visibility === "public_ready"
              ? "Public-ready update saved."
              : "Internal update saved.",
        );
        setBody("");
        router.refresh();
      } else {
        toast.error(res.error ?? "That did not save.");
      }
    });
  }

  return (
    <div className="fj-inc-composer">
      <div className="fj-seg" role="tablist" aria-label="Compose">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "update"}
          className="fj-seg__btn"
          onClick={() => setMode("update")}
        >
          Update
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "note"}
          className="fj-seg__btn"
          onClick={() => setMode("note")}
        >
          Internal note
        </button>
      </div>

      {mode === "update" ? (
        <div className="fj-inc-composer__row">
          <div className="fj-field">
            <label htmlFor="upd-type">Status</label>
            <select
              id="upd-type"
              className="fj-input"
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value as (typeof UPDATE_TYPES)[number])}
            >
              {UPDATE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {UPDATE_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="fj-field">
            <label htmlFor="upd-vis">Visibility</label>
            <select
              id="upd-vis"
              className="fj-input"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as (typeof UPDATE_VISIBILITY)[number])}
            >
              <option value="internal">Internal only</option>
              <option value="public_ready">Public-ready</option>
            </select>
          </div>
        </div>
      ) : null}

      <div className="fj-field">
        <label htmlFor="upd-body">{mode === "note" ? "Note" : "Message"}</label>
        <textarea
          id="upd-body"
          className="fj-input"
          rows={4}
          maxLength={4000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            mode === "note"
              ? "Private context for your team. Never included in any public projection."
              : "Plain language for your team, or a customer-safe message for a future status page."
          }
        />
        <p className="fj-field__hint">
          Do not paste passwords, API keys, or private customer data into incident content.
        </p>
      </div>

      {mode === "update" && visibility === "public_ready" ? (
        <p className="fj-inc-notice">
          <BrandIcon name="status-page" size={13} /> {PUBLIC_UPDATE_SAVED_NOTICE}
        </p>
      ) : mode === "note" ? (
        <p className="fj-inc-notice">
          <BrandIcon name="shield" size={13} /> Internal only. Never shown on a status page or sent to
          subscribers.
        </p>
      ) : null}

      <div className="fj-inc-composer__actions">
        <BrandButton disabled={pending} onClick={submit}>
          {mode === "note" ? "Save note" : "Save update"}
        </BrandButton>
      </div>
    </div>
  );
}
