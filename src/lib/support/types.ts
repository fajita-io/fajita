export type ConversationMode = "public" | "authenticated";

export type ConversationState =
  | "new"
  | "active"
  | "awaiting_user"
  | "answering"
  | "resolved_by_answer"
  | "handoff_offered"
  | "handoff_requested"
  | "queued_for_human"
  | "human_active"
  | "awaiting_customer"
  | "resolved_by_human"
  | "closed"
  | "expired"
  | "blocked"
  | "provider_unavailable";

export type HandoffState =
  | "none"
  | "offered"
  | "requested"
  | "queued"
  | "active"
  | "resolved"
  | "failed";

export type MessageType =
  | "user_message"
  | "automated_answer"
  | "human_support_response"
  | "system_notice"
  | "source_citation"
  | "suggested_action"
  | "diagnostic_result"
  | "handoff_notice"
  | "safety_notice"
  | "provider_error"
  | "feedback_request";

export type ConfidenceClass =
  | "high"
  | "supported"
  | "partial"
  | "insufficient_evidence"
  | "conflicting_sources"
  | "account_access_required"
  | "human_review_required";

export type SupportIntent =
  | "product_capability"
  | "pricing"
  | "plan_selection"
  | "setup"
  | "monitor_failure"
  | "incident"
  | "alert_failure"
  | "status_page"
  | "subscriber_email"
  | "billing"
  | "affiliate"
  | "security"
  | "privacy"
  | "bug"
  | "feature_request"
  | "human_support"
  | "unknown";

export type HandoffRoutingTag =
  | "sales"
  | "onboarding"
  | "monitor_configuration"
  | "monitor_execution"
  | "incident"
  | "alerts"
  | "status_page"
  | "subscribers"
  | "billing"
  | "affiliate"
  | "security"
  | "privacy"
  | "bug_report"
  | "feature_request"
  | "documentation_gap"
  | "account_access";

export interface SourceCitation {
  sourceId: string;
  title: string;
  sourceType: string;
  url: string;
  sectionLabel?: string;
  stale?: boolean;
}

export interface SuggestedAction {
  label: string;
  href: string;
  kind: "docs" | "app" | "external" | "handoff";
}

export interface DiagnosticCard {
  id: string;
  label: string;
  state: string;
  timestamp?: string;
  explanation: string;
  href?: string;
}

export interface SupportAnswer {
  directAnswer: string;
  explanation?: string;
  steps?: string[];
  sources: SourceCitation[];
  nextAction?: SuggestedAction;
  confidence: ConfidenceClass;
  offerHandoff: boolean;
  handoffReason?: string;
  diagnosticCards?: DiagnosticCard[];
  safetyNotice?: string;
  intent: SupportIntent;
  productArea?: string;
}

export interface PageContext {
  route: string;
  productArea?: string;
  pageTitle?: string;
  selectedTab?: string;
  helpTopic?: string;
  resourceRef?: {
    kind: "monitor" | "incident" | "status_page" | "alert_channel";
    id: string;
  };
}

export interface SupportAskInput {
  message: string;
  mode: ConversationMode;
  conversationId?: string;
  pageContext?: PageContext;
  userId?: string;
  organizationId?: string;
  permissions?: string[];
  sessionId?: string;
}

export interface SupportAskResult {
  answer: SupportAnswer;
  redactedUserMessage: string;
  detections: string[];
  injectionSuspicious: boolean;
  conversationTitle?: string;
  blocked?: boolean;
}
