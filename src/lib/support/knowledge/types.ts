export type KnowledgeSourceType =
  | "documentation_page"
  | "glossary_term"
  | "blog_article"
  | "comparison_page"
  | "tool_methodology"
  | "public_policy"
  | "pricing_catalog"
  | "entitlement_registry"
  | "product_claims_registry"
  | "safe_account_tool"
  | "troubleshooting_rule"
  | "support_macro";

export type KnowledgeAudience = "public" | "authenticated" | "both";
export type KnowledgeVisibility = "public" | "authenticated" | "internal";
export type KnowledgeSensitivity = "public" | "account" | "restricted";

export interface KnowledgeSource {
  sourceId: string;
  sourceType: KnowledgeSourceType;
  title: string;
  canonicalUrl: string;
  productArea: string;
  audience: KnowledgeAudience;
  visibility: KnowledgeVisibility;
  authorityLevel: number;
  contentVersion: string;
  productVersion: string;
  publishedAt: string;
  lastReviewedAt: string;
  expiresAt?: string;
  deprecated: boolean;
  replacementSource?: string;
  indexableForChat: boolean;
  supportsPublicMode: boolean;
  supportsAuthenticatedMode: boolean;
  requiredPermissions: string[];
  allowedAnswerTypes: string[];
  sensitivity: KnowledgeSensitivity;
  /** Searchable body excerpt (plain text). */
  body: string;
  keywords: string[];
}

export interface KnowledgeChunk {
  source: KnowledgeSource;
  section?: string;
  excerpt: string;
  score: number;
}
