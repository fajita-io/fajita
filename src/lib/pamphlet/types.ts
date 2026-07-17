export type PamphletResultOk<T> = { ok: true; data: T };
export type PamphletResultErr = {
  ok: false;
  code:
    | "not_configured"
    | "capability_unavailable"
    | "timeout"
    | "rate_limited"
    | "invalid_response"
    | "provider_error";
  message: string;
  capability?: string;
};
export type PamphletResult<T> = PamphletResultOk<T> | PamphletResultErr;

export type PamphletHealthStatus =
  | "not_configured"
  | "contract_unverified"
  | "unavailable"
  | "ok";

export interface PamphletHealth {
  status: PamphletHealthStatus;
  configured: boolean;
  contractVerified: boolean;
  details: string;
  checkedAt: string;
}

export interface PamphletConversationRef {
  providerConversationId: string;
  mode: "public" | "authenticated";
}

export interface PamphletMessageRef {
  providerMessageId: string;
  providerConversationId: string;
}

export interface PamphletHandoffRef {
  providerHandoffId: string;
  providerConversationId: string;
  routingTag: string;
}

export interface PamphletKnowledgeSyncResult {
  sourceId: string;
  state: "pending" | "processing" | "synchronized" | "partial" | "failed" | "stale" | "removed";
  errorCategory?: string;
}
