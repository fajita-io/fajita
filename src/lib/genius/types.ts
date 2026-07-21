export type GeniusCategory = "idea" | "confusion" | "bug" | "praise";

export interface GeniusUser {
  id: string;
  email?: string;
  name?: string;
  plan?: string;
  role?: string;
}

export interface GeniusProductContext {
  feature?: string;
  route?: string;
  pageTitle?: string;
  selectedTab?: string;
  helpTopic?: string;
  /** Fajita-only trigger label when mapped to a Genius-safe API source. */
  triggerSource?: string;
}

export interface GeniusAccountContext {
  id: string;
  name?: string;
  plan?: string;
}

export interface GeniusOpenOptions {
  category?: GeniusCategory;
  context?: GeniusProductContext;
}

export interface GeniusSubmitItem {
  category: GeniusCategory;
}

export interface GeniusSubmitCallbacks {
  onSuccess?: (data?: unknown) => void;
  onError?: (error: { error?: string; status?: number }) => void;
}

export interface GeniusSubmitPayload {
  category?: GeniusCategory;
  body: string;
  source?: string;
  context?: Partial<GeniusProductContext>;
  idempotencyKey?: string;
  elapsedMs?: number;
}

export interface GeniusApi {
  open: (options?: GeniusOpenOptions) => void;
  close: () => void;
  identify: (user: GeniusUser) => void;
  setContext: (context: GeniusProductContext) => void;
  setAccount: (account: GeniusAccountContext) => void;
  reset: () => void;
  submit?: (
    payload: GeniusSubmitPayload,
    callbacks?: GeniusSubmitCallbacks,
  ) => Promise<{ ok: boolean; error?: string }>;
  onSubmit?: (item: GeniusSubmitItem) => void;
}

declare global {
  interface Window {
    Genius?: GeniusApi;
  }
}

export {};
