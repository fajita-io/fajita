import Link from "next/link";

import {
  OpsLinkButton,
  OpsPanel,
  OpsStatus,
} from "@/components/platform/ops-ui";
import type { Phase19PrerequisiteResult } from "@/lib/platform/post-launch";
import type { StabilizationWindow } from "@/lib/platform/post-launch";

export function PostLaunchBlockedBanner({
  result,
  window,
}: {
  result: Phase19PrerequisiteResult;
  window: StabilizationWindow;
}) {
  const tone =
    result.authorization === "blocked"
      ? "degraded"
      : result.authorization === "conditionally_authorized"
        ? "degraded"
        : "operational";

  return (
    <OpsPanel title="Phase 19 authorization">
      <p>
        <OpsStatus state={tone} />{" "}
        <strong>{result.authorizationLabel}</strong>. Phase 18 is{" "}
        <strong>{result.phase18ClassificationLabel}</strong>. Launch stage:{" "}
        <code>{result.launchStage}</code>. Stabilization: {window.phaseLabel}.
      </p>
      {result.authorization === "blocked" ? (
        <p className="fj-ops-page-deck" style={{ marginTop: 12 }}>
          Growth work is frozen. Resolve Phase 18 blockers, re-run readiness
          gates, and update go-live approval before experiments, onboarding
          changes, pricing changes, or intentional traffic expansion.
        </p>
      ) : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <OpsLinkButton href="/internal/readiness" primary>
          Readiness scorecard
        </OpsLinkButton>
        <OpsLinkButton href="/internal/launch">Launch control</OpsLinkButton>
        <OpsLinkButton href="/internal/post-launch/overview">
          Prerequisite detail
        </OpsLinkButton>
      </div>
    </OpsPanel>
  );
}

export function PostLaunchPrerequisiteTable({
  result,
}: {
  result: Phase19PrerequisiteResult;
}) {
  return (
    <OpsPanel title="Prerequisite check">
      <table className="fj-ops-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Check</th>
            <th scope="col">Severity</th>
            <th scope="col">Status</th>
            <th scope="col">Blockers</th>
          </tr>
        </thead>
        <tbody>
          {result.prerequisites.map((p) => (
            <tr key={p.id}>
              <td>
                <code>{p.id}</code>
              </td>
              <td>
                {p.title}
                {p.notes ? (
                  <div className="fj-ops-empty" style={{ marginTop: 4 }}>
                    {p.notes}
                  </div>
                ) : null}
              </td>
              <td>{p.severity}</td>
              <td>{p.status}</td>
              <td>
                {p.blockerIds.length
                  ? p.blockerIds.map((id) => (
                      <span key={id}>
                        <Link href="/internal/readiness">{id}</Link>{" "}
                      </span>
                    ))
                  : "none"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </OpsPanel>
  );
}

export function PostLaunchLinkedBlockers({
  result,
}: {
  result: Phase19PrerequisiteResult;
}) {
  if (result.linkedBlockers.length === 0) {
    return (
      <OpsPanel title="Linked Phase 18 blockers">
        <p>No linked open blockers for failed prerequisites.</p>
      </OpsPanel>
    );
  }

  return (
    <OpsPanel title="Linked Phase 18 blockers">
      <ul>
        {result.linkedBlockers.map((b) => (
          <li key={b.id}>
            <strong>
              {b.id}: {b.title}
            </strong>{" "}
            ({b.severity}, {b.status}). Owner: {b.owner}. Target:{" "}
            {b.targetDate ?? "unset"}.
          </li>
        ))}
      </ul>
    </OpsPanel>
  );
}
