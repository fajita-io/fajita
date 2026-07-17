/**
 * Integration catalog for the public site. Only integrations whose claim
 * status permits marketing appear with "At launch"; roadmap-only channels
 * stay off this list entirely (see src/lib/site/claims.ts).
 */

export type IntegrationStatus = "at-launch" | "planned";

export interface IntegrationDefinition {
  id: string;
  name: string;
  status: IntegrationStatus;
  /** What it does, one line. */
  summary: string;
  /** What arrives in the channel. */
  payload: string;
}

export const integrations: IntegrationDefinition[] = [
  {
    id: "email",
    name: "Email",
    status: "at-launch",
    summary: "Incident and recovery alerts to any address on the team.",
    payload:
      "A plain, factual message: which monitor, what failed, when, and a link to the incident. Recovery sends the all-clear to the same people.",
  },
  {
    id: "slack",
    name: "Slack",
    status: "at-launch",
    summary: "Alerts posted to the channel your team already watches.",
    payload:
      "One message per confirmed incident with status, monitor, and duration. Updates thread under the original, so a long incident stays one conversation.",
  },
  {
    id: "discord",
    name: "Discord",
    status: "at-launch",
    summary: "The same verified alerts, for teams that live in Discord.",
    payload:
      "A single embed per incident: monitor, state, timestamp, incident link. Recovery posts to the same channel.",
  },
  {
    id: "webhook",
    name: "Webhooks",
    status: "at-launch",
    summary: "A signed JSON payload to any URL. Build whatever you want on it.",
    payload:
      "POST with the incident object and an HMAC signature header. Page someone, open a ticket, turn on a real red light. Your call.",
  },
];
