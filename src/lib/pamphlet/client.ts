import {
  isPamphletCapabilityVerified,
  pamphletCapability,
  type PamphletCapabilityId,
} from "./capabilities";
import { isPamphletConfigured } from "./config";
import type {
  PamphletConversationRef,
  PamphletHandoffRef,
  PamphletKnowledgeSyncResult,
  PamphletMessageRef,
  PamphletResult,
} from "./types";

/**
 * Pamphlet integration adapter.
 *
 * Methods refuse to invent HTTP calls against unverified endpoints. When a
 * verified contract is added to capabilities.ts, implement the matching
 * request here and flip the capability to `verified`.
 */
export class PamphletClient {
  private unavailable<T>(
    capability: PamphletCapabilityId,
  ): PamphletResult<T> {
    if (!isPamphletConfigured()) {
      return {
        ok: false,
        code: "not_configured",
        message: "Pamphlet is not configured in this environment.",
        capability,
      };
    }
    const cap = pamphletCapability(capability);
    if (!isPamphletCapabilityVerified(capability)) {
      return {
        ok: false,
        code: "capability_unavailable",
        message: cap.reason,
        capability,
      };
    }
    return {
      ok: false,
      code: "capability_unavailable",
      message: "Capability marked verified but not implemented.",
      capability,
    };
  }

  createConversation(_: {
    mode: "public" | "authenticated";
    metadata?: Record<string, string>;
  }): Promise<PamphletResult<PamphletConversationRef>> {
    void _;
    return Promise.resolve(this.unavailable("conversation_create"));
  }

  sendMessage(_: {
    providerConversationId: string;
    text: string;
    role: "user" | "assistant" | "system";
  }): Promise<PamphletResult<PamphletMessageRef>> {
    void _;
    return Promise.resolve(this.unavailable("message_send"));
  }

  getConversation(_: string): Promise<PamphletResult<PamphletConversationRef>> {
    void _;
    return Promise.resolve(this.unavailable("conversation_retrieve"));
  }

  requestHandoff(_: {
    providerConversationId: string;
    routingTag: string;
    contactEmail?: string;
    summary?: string;
  }): Promise<PamphletResult<PamphletHandoffRef>> {
    void _;
    return Promise.resolve(this.unavailable("human_handoff"));
  }

  associateContact(_: {
    providerConversationId: string;
    email: string;
    name?: string;
  }): Promise<PamphletResult<{ associated: true }>> {
    void _;
    return Promise.resolve(this.unavailable("contact_associate"));
  }

  submitFeedback(_: {
    providerConversationId: string;
    helpful: boolean;
    reason?: string;
  }): Promise<PamphletResult<{ accepted: true }>> {
    void _;
    return Promise.resolve(this.unavailable("feedback"));
  }

  syncKnowledge(_: {
    sourceId: string;
    contentVersion: string;
    canonicalUrl: string;
    title: string;
    body: string;
  }): Promise<PamphletResult<PamphletKnowledgeSyncResult>> {
    void _;
    return Promise.resolve(this.unavailable("knowledge_sync"));
  }

  deleteConversation(_: string): Promise<PamphletResult<{ deleted: true }>> {
    void _;
    return Promise.resolve(this.unavailable("conversation_delete"));
  }

  healthCheck(): Promise<
    PamphletResult<{ configured: boolean; contractVerified: boolean }>
  > {
    if (!isPamphletConfigured()) {
      return Promise.resolve({
        ok: false,
        code: "not_configured",
        message: "Pamphlet credentials are not configured.",
        capability: "provider_health",
      });
    }
    return Promise.resolve({
      ok: false,
      code: "capability_unavailable",
      message: pamphletCapability("provider_health").reason,
      capability: "provider_health",
    });
  }
}

let cached: PamphletClient | null = null;

export function pamphletClient(): PamphletClient {
  if (!cached) cached = new PamphletClient();
  return cached;
}
