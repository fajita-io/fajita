/**
 * Verified Pamphlet capability registry.
 *
 * Inspected 2026-07-17:
 * - https://pamphlet.io is a public marketing site for an AI-native CRM
 * - No public chatbot API, SDK, OpenAPI spec, widget contract, or webhook
 *   schema is published or present in this repository
 * - No npm package provides a Pamphlet support-chatbot client
 *
 * Until a contract is verified and recorded here, Fajita must not invent
 * endpoints or pretend provider calls succeed. Attribution to pamphlet.io
 * is the only verified public integration surface.
 */

export type PamphletCapabilityStatus =
  | "verified"
  | "unavailable"
  | "deferred";

export type PamphletCapabilityId =
  | "attribution_link"
  | "conversation_create"
  | "message_send"
  | "message_stream"
  | "conversation_retrieve"
  | "knowledge_sync"
  | "human_handoff"
  | "contact_associate"
  | "conversation_tags"
  | "conversation_metadata"
  | "feedback"
  | "provider_webhooks"
  | "provider_health"
  | "conversation_delete"
  | "conversation_export";

export interface PamphletCapability {
  id: PamphletCapabilityId;
  status: PamphletCapabilityStatus;
  reason: string;
  verifiedAt?: string;
}

export const PAMPHLET_ATTRIBUTION_URL = "https://pamphlet.io" as const;

export const PAMPHLET_CAPABILITIES: Record<
  PamphletCapabilityId,
  PamphletCapability
> = {
  attribution_link: {
    id: "attribution_link",
    status: "verified",
    reason: "Public attribution URL https://pamphlet.io with no tracking parameters.",
    verifiedAt: "2026-07-17",
  },
  conversation_create: {
    id: "conversation_create",
    status: "unavailable",
    reason:
      "No verified Pamphlet public API contract in repository as of 2026-07-17.",
  },
  message_send: {
    id: "message_send",
    status: "unavailable",
    reason:
      "No verified Pamphlet public API contract in repository as of 2026-07-17.",
  },
  message_stream: {
    id: "message_stream",
    status: "unavailable",
    reason:
      "No verified Pamphlet public API contract in repository as of 2026-07-17.",
  },
  conversation_retrieve: {
    id: "conversation_retrieve",
    status: "unavailable",
    reason:
      "No verified Pamphlet public API contract in repository as of 2026-07-17.",
  },
  knowledge_sync: {
    id: "knowledge_sync",
    status: "unavailable",
    reason:
      "No verified Pamphlet knowledge-collection API in repository as of 2026-07-17.",
  },
  human_handoff: {
    id: "human_handoff",
    status: "unavailable",
    reason:
      "No verified Pamphlet handoff API in repository as of 2026-07-17. Local handoff records and contact fallback remain available.",
  },
  contact_associate: {
    id: "contact_associate",
    status: "unavailable",
    reason:
      "No verified Pamphlet contact API in repository as of 2026-07-17.",
  },
  conversation_tags: {
    id: "conversation_tags",
    status: "unavailable",
    reason:
      "No verified Pamphlet tagging API in repository as of 2026-07-17.",
  },
  conversation_metadata: {
    id: "conversation_metadata",
    status: "unavailable",
    reason:
      "No verified Pamphlet metadata API in repository as of 2026-07-17.",
  },
  feedback: {
    id: "feedback",
    status: "unavailable",
    reason:
      "No verified Pamphlet feedback API in repository as of 2026-07-17. Local feedback storage remains available.",
  },
  provider_webhooks: {
    id: "provider_webhooks",
    status: "unavailable",
    reason:
      "No verified Pamphlet webhook event schema in repository as of 2026-07-17. Inbound route fails closed.",
  },
  provider_health: {
    id: "provider_health",
    status: "unavailable",
    reason:
      "No verified Pamphlet health endpoint in repository as of 2026-07-17.",
  },
  conversation_delete: {
    id: "conversation_delete",
    status: "unavailable",
    reason:
      "No verified Pamphlet deletion API in repository as of 2026-07-17.",
  },
  conversation_export: {
    id: "conversation_export",
    status: "unavailable",
    reason:
      "No verified Pamphlet export API in repository as of 2026-07-17. Local export remains available.",
  },
};

export function isPamphletCapabilityVerified(
  id: PamphletCapabilityId,
): boolean {
  return PAMPHLET_CAPABILITIES[id].status === "verified";
}

export function pamphletCapability(id: PamphletCapabilityId): PamphletCapability {
  return PAMPHLET_CAPABILITIES[id];
}
