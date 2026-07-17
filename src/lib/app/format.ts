/** Human-readable relative time, e.g. "2 hours ago". Deterministic, no locale surprises. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = Math.round((then - now.getTime()) / 1000);
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === "second") {
      return rtf.format(Math.round(diff / secs), unit);
    }
  }
  return "just now";
}

const ACTION_LABELS: Record<string, string> = {
  "organization.created": "created the organization",
  "organization.name_changed": "renamed the organization",
  "organization.slug_changed": "changed the organization handle",
  "organization.logo_changed": "updated the organization logo",
  "organization.timezone_changed": "changed the default time zone",
  "member.joined": "joined the organization",
  "member.left": "left the organization",
  "member.removed": "removed a member",
  "member.role_changed": "changed a member's role",
  "invitation.created": "invited a teammate",
  "invitation.resent": "resent an invitation",
  "invitation.revoked": "revoked an invitation",
  "invitation.accepted": "accepted an invitation",
  "security.setting_changed": "changed a security setting",
  "session.revoked": "revoked a session",
  "export.requested": "requested a data export",
  "deletion.requested": "requested a deletion",
  "deletion.canceled": "canceled a deletion request",
  "ownership.transfer_initiated": "started an ownership transfer",
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/[._]/g, " ");
}
