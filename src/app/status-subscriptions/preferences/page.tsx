import { loadPreferenceView } from "@/lib/subscribers/preferences";
import { appUrl } from "@/lib/env";
import {
  savePreferencesAction,
  unsubscribeAction,
  requestDeletionAction,
} from "./actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    token?: string;
    saved?: string;
    unsubscribed?: string;
    deleted?: string;
  }>;
}

export default async function PreferencesPage({ searchParams }: Props) {
  const { token, saved, unsubscribed, deleted } = await searchParams;

  if (deleted === "1") {
    return (
      <section className="sub-card" aria-labelledby="pref-title">
        <span className="sub-badge">Deletion requested</span>
        <h1 id="pref-title">Your request was received</h1>
        <p>
          We stopped future email to this address and scheduled your subscriber
          record for deletion. A suppression record is kept so the address is
          not re-added by an import.
        </p>
      </section>
    );
  }

  const view = token ? await loadPreferenceView(token) : null;

  if (!view) {
    return (
      <section className="sub-card" aria-labelledby="pref-title">
        <h1 id="pref-title">This link is not valid</h1>
        <p>
          The preference link is invalid, expired, or has been replaced. Open
          the most recent status email, or subscribe again from the status page.
        </p>
      </section>
    );
  }

  if (view.status === "unsubscribed" || unsubscribed === "1") {
    return (
      <section className="sub-card" aria-labelledby="pref-title">
        <span className="sub-badge">Unsubscribed</span>
        <h1 id="pref-title">You are unsubscribed</h1>
        <p>
          You will not receive further updates from {view.statusPageName}. To
          receive updates again, subscribe from the status page and confirm the
          new request.
        </p>
        <a
          className="sub-btn sub-btn--primary"
          href={`${appUrl}/status/${view.statusPageSlug}`}
        >
          Return to status page
        </a>
      </section>
    );
  }

  return (
    <section className="sub-card" aria-labelledby="pref-title">
      <h1 id="pref-title">Update preferences</h1>
      <p className="sub-meta">
        {view.statusPageName} · {view.maskedEmail}
      </p>
      {saved === "1" ? <p className="sub-meta">Preferences saved.</p> : null}
      {saved === "0" ? (
        <p className="sub-meta">We could not save that change. Try again.</p>
      ) : null}

      <form action={savePreferencesAction}>
        <input type="hidden" name="token" value={token} />

        <fieldset className="sub-fieldset">
          <legend>Which updates</legend>
          <label className="sub-check">
            <input
              type="checkbox"
              name="incidentUpdates"
              defaultChecked={view.incidentUpdates}
            />
            <span>Incident updates: new incidents, status changes, and resolutions.</span>
          </label>
          <label className="sub-check">
            <input
              type="checkbox"
              name="maintenanceUpdates"
              defaultChecked={view.maintenanceUpdates}
            />
            <span>Maintenance updates: scheduled maintenance and its outcome.</span>
          </label>
        </fieldset>

        {view.components.length > 0 ? (
          <fieldset className="sub-fieldset">
            <legend>Which components</legend>
            <label className="sub-check">
              <input
                type="radio"
                name="scope"
                value="all"
                defaultChecked={view.allComponents}
              />
              <span>All components</span>
            </label>
            <label className="sub-check">
              <input
                type="radio"
                name="scope"
                value="selected"
                defaultChecked={!view.allComponents}
              />
              <span>Only the components I select</span>
            </label>
            <div style={{ marginTop: 8, paddingLeft: 28 }}>
              {view.components.map((c) => (
                <label className="sub-check" key={c.id}>
                  <input
                    type="checkbox"
                    name="component"
                    value={c.id}
                    defaultChecked={view.selectedComponentIds.includes(c.id)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="sub-actions">
          <button type="submit" className="sub-btn sub-btn--primary">
            Save preferences
          </button>
          <a
            className="sub-btn sub-btn--ghost"
            href={`${appUrl}/status/${view.statusPageSlug}`}
          >
            Return to status page
          </a>
        </div>
      </form>

      <hr className="sub-divider" />

      <form action={unsubscribeAction}>
        <input type="hidden" name="token" value={token} />
        <p className="sub-meta">
          Unsubscribe stops all email from this status page. You can subscribe
          again later.
        </p>
        <button type="submit" className="sub-btn sub-btn--ghost">
          Unsubscribe
        </button>
      </form>

      <form action={requestDeletionAction} style={{ marginTop: 16 }}>
        <input type="hidden" name="token" value={token} />
        <p className="sub-meta">
          Delete my subscriber data. This removes your stored address, not only
          your subscription. It cannot be undone.
        </p>
        <button type="submit" className="sub-btn sub-btn--danger">
          Request deletion
        </button>
      </form>
    </section>
  );
}
