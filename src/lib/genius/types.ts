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

export interface GeniusApi {
  open: (options?: GeniusOpenOptions) => void;
  close: () => void;
  identify: (user: GeniusUser) => void;
  setContext: (context: GeniusProductContext) => void;
  setAccount: (account: GeniusAccountContext) => void;
  reset: () => void;
  onSubmit?: (item: GeniusSubmitItem) => void;
}

declare global {
  interface Window {
    Genius?: GeniusApi;
  }
}

export {};
