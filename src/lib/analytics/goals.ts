/**
 * Custom goal names for fajita.io.
 *
 * Do not use reserved payment-provider goal names (payment, free_trial,
 * trial_started, subscription_*, etc.). See:
 * https://datafa.st/docs/custom-goals
 *
 * Never send PII or secrets in goal metadata. Use coarse enums and ids only.
 */
export const DataFastGoals = {
  signup: "signup",
  signIn: "sign_in",
  newsletterSubscribe: "newsletter_subscribe",
  initiateCheckout: "initiate_checkout",
  waitlistJoin: "waitlist_join",
  demoRequest: "demo_request",
  firstMonitor: "first_monitor",
  monitorCreated: "monitor_created",
  monitorTested: "monitor_tested",
  monitorActivated: "monitor_activated",
  heartbeatReceived: "heartbeat_received",
  alertChannelAdded: "alert_channel_added",
  statusPagePublished: "status_page_published",
  inviteSent: "invite_sent",
  onboardingComplete: "onboarding_complete",

  /* Public-site conversion events. */
  heroCta: "hero_cta",
  navCta: "nav_cta",
  footerCta: "footer_cta",
  demoStarted: "demo_started",
  demoCompleted: "demo_completed",
  planSelected: "plan_selected",
  contactStarted: "contact_started",
  contactSubmitted: "contact_submitted",
  faqExpanded: "faq_expanded",
  integrationViewed: "integration_viewed",

  /* Open-source funnel events (public site only). */
  openSourceViewed: "open_source_viewed",
  githubClicked: "github_clicked",
  selfHostClicked: "self_host_clicked",
  cloudFromOssClicked: "cloud_from_oss_clicked",
  docsSelfHostClicked: "docs_self_host_clicked",

  /* Auth, org, and settings events. */
  emailVerified: "email_verified",
  organizationCreated: "organization_created",
  organizationSwitched: "organization_switched",
  onboardingStarted: "onboarding_started",
  onboardingStepCompleted: "onboarding_step_completed",
  onboardingSkipped: "onboarding_skipped",
  onboardingResumed: "onboarding_resumed",
  promoCodeRedeemed: "promo_code_redeemed",
  teamInviteInitiated: "team_invite_initiated",
  teamInviteCreated: "team_invite_created",
  teamInviteAccepted: "team_invite_accepted",
  memberRoleChanged: "member_role_changed",
  memberRemoved: "member_removed",
  profileUpdated: "profile_updated",
  organizationUpdated: "organization_updated",
  themeChanged: "theme_changed",
  reducedMotionEnabled: "reduced_motion_enabled",
  commandPaletteOpened: "command_palette_opened",
  notificationOpened: "notification_opened",
  securitySettingsViewed: "security_settings_viewed",
  exportRequested: "export_requested",
  deletionFlowStarted: "deletion_flow_started",
  deletionFlowCanceled: "deletion_flow_canceled",

  /* Monitor product events. */
  monitorCreationStarted: "monitor_creation_started",
  monitorTypeSelected: "monitor_type_selected",
  monitorTemplateSelected: "monitor_template_selected",
  monitorDraftSaved: "monitor_draft_saved",
  monitorTestInitiated: "monitor_test_initiated",
  monitorTestPassed: "monitor_test_passed",
  monitorTestFailed: "monitor_test_failed",
  monitorTestBlocked: "monitor_test_blocked",
  monitorViewed: "monitor_viewed",
  monitorManualCheck: "monitor_manual_check",
  monitorEdited: "monitor_edited",
  monitorVersionActivated: "monitor_version_activated",
  monitorPaused: "monitor_paused",
  monitorResumed: "monitor_resumed",
  monitorDuplicated: "monitor_duplicated",
  monitorArchived: "monitor_archived",
  monitorDeletionRequested: "monitor_deletion_requested",
  monitorGroupCreated: "monitor_group_created",
  monitorTagCreated: "monitor_tag_created",
  monitorFilterApplied: "monitor_filter_applied",
  monitorHistoryPeriodChanged: "monitor_history_period_changed",
  monitorCheckDetailOpened: "monitor_check_detail_opened",
  monitorExportRequested: "monitor_export_requested",
  heartbeatTokenRotated: "heartbeat_token_rotated",
  monitorSecretReplaced: "monitor_secret_replaced",

  /* Incident and maintenance events. */
  incidentListViewed: "incident_list_viewed",
  incidentViewed: "incident_viewed",
  incidentOpenedAutomatic: "incident_opened_automatic",
  manualIncidentStarted: "manual_incident_started",
  manualIncidentCreated: "manual_incident_created",
  incidentAcknowledged: "incident_acknowledged",
  incidentAssigned: "incident_assigned",
  incidentSeverityChanged: "incident_severity_changed",
  incidentNoteAdded: "incident_note_added",
  incidentUpdateAdded: "incident_update_added",
  incidentResolved: "incident_resolved",
  incidentCanceled: "incident_canceled",
  incidentReopened: "incident_reopened",
  incidentEvidenceViewed: "incident_evidence_viewed",
  incidentTimelineFiltered: "incident_timeline_filtered",
  incidentReportExported: "incident_report_exported",
  maintenanceStarted: "maintenance_creation_started",
  maintenanceCreated: "maintenance_created",
  maintenanceUpdated: "maintenance_updated",
  maintenanceCanceled: "maintenance_canceled",
  maintenanceActivated: "maintenance_activated",
  maintenanceEnded: "maintenance_ended",
  monitorEnteredVerification: "monitor_entered_verification",
  monitorEnteredDegraded: "monitor_entered_degraded",
  monitorEnteredDown: "monitor_entered_down",
  monitorEnteredRecovery: "monitor_entered_recovery",
  monitorReturnedOperational: "monitor_returned_operational",
  monitorFlappingDetected: "monitor_flapping_detected",

  /* Alert channel, routing, and delivery events. */
  alertChannelCreationStarted: "alert_channel_creation_started",
  alertChannelCreated: "alert_channel_created",
  alertChannelTested: "alert_channel_tested",
  alertChannelTestPassed: "alert_channel_test_passed",
  alertChannelTestFailed: "alert_channel_test_failed",
  alertChannelActivated: "alert_channel_activated",
  alertChannelPaused: "alert_channel_paused",
  alertChannelResumed: "alert_channel_resumed",
  alertChannelDeleted: "alert_channel_deleted",
  alertChannelCredentialRotated: "alert_channel_credential_rotated",
  alertSigningKeyRotated: "alert_signing_key_rotated",
  alertRuleCreated: "alert_rule_created",
  alertRuleUpdated: "alert_rule_updated",
  alertRuleToggled: "alert_rule_toggled",
  alertRuleDeleted: "alert_rule_deleted",
  alertQuietHoursSaved: "alert_quiet_hours_saved",
  alertDeliveryLogViewed: "alert_delivery_log_viewed",
  alertDeliveryExported: "alert_delivery_exported",
  alertDeadLetterRetried: "alert_dead_letter_retried",
  alertDeadLetterDismissed: "alert_dead_letter_dismissed",

  /* Status page events. */
  statusPageCreationStarted: "status_page_creation_started",
  statusPageSubdomainSelected: "status_page_subdomain_selected",
  statusPageCreated: "status_page_created",
  statusPageComponentCreated: "status_page_component_created",
  statusPageMonitorMapped: "status_page_monitor_mapped",
  statusPageThemeSelected: "status_page_theme_selected",
  statusPageLogoUploaded: "status_page_logo_uploaded",
  statusPageCustomDomainStarted: "status_page_custom_domain_started",
  statusPageDomainVerified: "status_page_domain_verified",
  statusPageTlsActive: "status_page_tls_active",
  statusPagePreviewOpened: "status_page_preview_opened",
  statusPagePublishAttempted: "status_page_publish_attempted",
  statusPagePublishSucceeded: "status_page_publish_succeeded",
  statusPagePublishFailed: "status_page_publish_failed",
  statusPageIncidentPublished: "status_page_incident_published",
  statusPageIncidentUpdatePublished: "status_page_incident_update_published",
  statusPageMaintenancePublished: "status_page_maintenance_published",
  statusPagePoweredByPreviewed: "status_page_powered_by_previewed",
  statusPageSeoSettingChanged: "status_page_seo_setting_changed",
  statusPageVersionRollbackStarted: "status_page_version_rollback_started",
  statusPageVersionRollbackCompleted: "status_page_version_rollback_completed",
  statusPageBadgeCreated: "status_page_badge_created",
  statusPageUnpublished: "status_page_unpublished",

  /* Onboarding and lifecycle events. */
  firstSessionViewed: "first_session_viewed",
  useCaseSelected: "use_case_selected",
  responsibilitySelected: "responsibility_selected",
  firstRealCheckCompleted: "first_real_check_completed",
  alertPathReady: "alert_path_ready",
  statusPageReady: "status_page_ready",
  fullActivationCompleted: "full_activation_completed",
  checklistStepSkipped: "checklist_step_skipped",
  checklistDismissed: "checklist_dismissed",
  checklistReopened: "checklist_reopened",
  tourStarted: "tour_started",
  tourCompleted: "tour_completed",
  tourDismissed: "tour_dismissed",
  tourReplayed: "tour_replayed",
  weeklyReportViewed: "weekly_report_viewed",
  weeklyReportExported: "weekly_report_exported",
  incidentRecapViewed: "incident_recap_viewed",
  incidentRecapExported: "incident_recap_exported",
  followUpActionCreated: "follow_up_action_created",
  lifecycleEmailPrefsUpdated: "lifecycle_email_prefs_updated",
  lifecycleResendRequested: "lifecycle_resend_requested",
  cancellationFeedbackSubmitted: "cancellation_feedback_submitted",
  reactivationChecklistViewed: "reactivation_checklist_viewed",

  /* Docs surface events. */
  docsSearchOpened: "docs_search_opened",
  docsSearchSubmitted: "docs_search_submitted",
  docsSearchNoResult: "docs_search_no_result",
  docsSearchResultSelected: "docs_search_result_selected",
  docsFeedback: "docs_feedback",
  docsCodeCopied: "docs_code_copied",

  /* Glossary events. */
  glossaryIndexViewed: "glossary_index_viewed",
  glossaryCategoryViewed: "glossary_category_viewed",
  glossaryTermViewed: "glossary_term_viewed",
  glossarySearchOpened: "glossary_search_opened",
  glossarySearchSubmitted: "glossary_search_submitted",
  glossarySearchNoResult: "glossary_search_no_result",
  glossarySearchResultSelected: "glossary_search_result_selected",
  glossaryRelatedSelected: "glossary_related_selected",
  glossaryDocsLinkSelected: "glossary_docs_link_selected",
  glossaryProductCta: "glossary_product_cta",
  glossaryFeedback: "glossary_feedback",
  glossaryRawRequested: "glossary_raw_requested",
  glossaryManifestRequested: "glossary_manifest_requested",

  /* Content growth events. */
  blogIndexViewed: "blog_index_viewed",
  articleViewed: "article_viewed",
  blogCategoryViewed: "blog_category_viewed",
  blogAuthorViewed: "blog_author_viewed",
  contentSearchOpened: "content_search_opened",
  contentSearchSubmitted: "content_search_submitted",
  contentSearchNoResult: "content_search_no_result",
  contentSearchResultSelected: "content_search_result_selected",
  relatedArticleSelected: "related_article_selected",
  contentGlossaryLinkSelected: "content_glossary_link_selected",
  contentDocsLinkSelected: "content_docs_link_selected",
  contentToolSelected: "content_tool_selected",
  comparisonViewed: "comparison_viewed",
  comparisonCorrectionStarted: "comparison_correction_started",
  toolViewed: "tool_viewed",
  toolStarted: "tool_started",
  toolCompleted: "tool_completed",
  toolValidationFailed: "tool_validation_failed",
  toolResultCopied: "tool_result_copied",
  researchViewed: "research_viewed",
  contentProductCta: "content_product_cta",
  contentPricingSelected: "content_pricing_selected",
  contentFeedback: "content_feedback",
  contentRssRequested: "content_rss_requested",
  contentRawRequested: "content_raw_requested",
  contentManifestRequested: "content_manifest_requested",

  /* Affiliate program events. */
  affiliatePageViewed: "affiliate_page_viewed",
  affiliateApplicationStarted: "affiliate_application_started",
  affiliateApplicationSubmitted: "affiliate_application_submitted",
  affiliateApplicationApproved: "affiliate_application_approved",
  affiliateApplicationRejected: "affiliate_application_rejected",
  affiliateDashboardViewed: "affiliate_dashboard_viewed",
  affiliateLinkCreated: "affiliate_link_created",
  affiliateCampaignCreated: "affiliate_campaign_created",
  affiliateCreativeDownloaded: "affiliate_creative_downloaded",
  affiliateTermsAccepted: "affiliate_terms_accepted",
  affiliatePayoutSetupStarted: "affiliate_payout_setup_started",
  affiliatePayoutSetupCompleted: "affiliate_payout_setup_completed",
  affiliateTaxSetupStarted: "affiliate_tax_setup_started",
  affiliateExportRequested: "affiliate_export_requested",
  affiliateAccountClosureRequested: "affiliate_account_closure_requested",

  /* Support chatbot events. */
  supportLauncherViewed: "support_launcher_viewed",
  supportLauncherOpened: "support_launcher_opened",
  supportLauncherClosed: "support_launcher_closed",
  supportPromptSelected: "support_prompt_selected",
  supportMessageSubmitted: "support_message_submitted",
  supportAnswerDisplayed: "support_answer_displayed",
  supportSourceSelected: "support_source_selected",
  supportHandoffOffered: "support_handoff_offered",
  supportHandoffRequested: "support_handoff_requested",
  supportFeedbackSubmitted: "support_feedback_submitted",
  supportProviderUnavailable: "support_provider_unavailable",
  supportPamphletClicked: "support_pamphlet_clicked",
  supportSensitiveWarning: "support_sensitive_warning",
  supportInjectionDetected: "support_injection_detected",

  /* Genius in-app feedback (authenticated app only). */
  geniusWidgetReady: "genius_widget_ready",
  geniusOpened: "genius_opened",
  geniusClosed: "genius_closed",
  geniusSubmitted: "genius_submitted",
} as const;

export type DataFastGoalName =
  (typeof DataFastGoals)[keyof typeof DataFastGoals];

const GOAL_NAME_PATTERN = /^[a-z0-9_:-]{1,64}$/;

export function isValidGoalName(name: string): name is DataFastGoalName {
  return GOAL_NAME_PATTERN.test(name);
}

export function sanitizeGoalParams(
  params?: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> | undefined {
  if (!params) return undefined;

  const sanitized: Record<string, string> = {};
  let count = 0;

  for (const [key, value] of Object.entries(params)) {
    if (count >= 10) break;
    if (value == null) continue;
    if (!/^[a-z0-9_-]{1,64}$/.test(key)) continue;

    sanitized[key] = String(value).slice(0, 255);
    count += 1;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}
