/**
 * Pamphlet configuration. All values are optional. Missing config is a
 * truthful disabled state, not a crash.
 *
 * Secrets stay server-side. Do not import this module from client components
 * that read API keys (use public chatbot ids only via a dedicated public helper).
 */

export interface PamphletConfig {
  enabled: boolean;
  apiBaseUrl: string | null;
  apiKeyPresent: boolean;
  webhookSecretPresent: boolean;
  publicChatbotId: string | null;
  authChatbotId: string | null;
  workspaceId: string | null;
  knowledgeCollectionId: string | null;
}

function optional(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function pamphletConfig(): PamphletConfig {
  const apiKey = optional("PAMPHLET_API_KEY");
  const webhookSecret = optional("PAMPHLET_WEBHOOK_SECRET");
  const enabledFlag = optional("PAMPHLET_ENABLED");
  const configured =
    Boolean(apiKey) && Boolean(optional("PAMPHLET_API_BASE_URL"));

  return {
    enabled: enabledFlag === "true" || enabledFlag === "1" || configured,
    apiBaseUrl: optional("PAMPHLET_API_BASE_URL"),
    apiKeyPresent: Boolean(apiKey),
    webhookSecretPresent: Boolean(webhookSecret),
    publicChatbotId: optional("PAMPHLET_PUBLIC_CHATBOT_ID"),
    authChatbotId: optional("PAMPHLET_AUTH_CHATBOT_ID"),
    workspaceId: optional("PAMPHLET_WORKSPACE_ID"),
    knowledgeCollectionId: optional("PAMPHLET_KNOWLEDGE_COLLECTION_ID"),
  };
}

/** True when env suggests an operator intended to connect Pamphlet. */
export function isPamphletConfigured(): boolean {
  const cfg = pamphletConfig();
  return cfg.apiKeyPresent && Boolean(cfg.apiBaseUrl);
}

/** Public, non-secret identifiers safe for client bootstrap. */
export function pamphletPublicBootstrap(): {
  publicChatbotId: string | null;
  attributionUrl: "https://pamphlet.io";
  providerReady: false;
} {
  return {
    publicChatbotId: optional("NEXT_PUBLIC_PAMPHLET_PUBLIC_CHATBOT_ID"),
    attributionUrl: "https://pamphlet.io",
    // Provider conversation APIs remain unverified.
    providerReady: false,
  };
}
