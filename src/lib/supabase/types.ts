export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      acquisition_channels: {
        Row: {
          budget_cap_cents: number | null
          channel_key: string
          channel_type: string
          created_at: string
          decision_reason: string | null
          evidence: Json
          guardrails: Json
          id: string
          name: string
          owner_user_id: string | null
          primary_metric: string | null
          review_date: string | null
          state: string
          stop_conditions: Json
          updated_at: string
          volume_cap: number | null
        }
        Insert: {
          budget_cap_cents?: number | null
          channel_key: string
          channel_type: string
          created_at?: string
          decision_reason?: string | null
          evidence?: Json
          guardrails?: Json
          id?: string
          name: string
          owner_user_id?: string | null
          primary_metric?: string | null
          review_date?: string | null
          state?: string
          stop_conditions?: Json
          updated_at?: string
          volume_cap?: number | null
        }
        Update: {
          budget_cap_cents?: number | null
          channel_key?: string
          channel_type?: string
          created_at?: string
          decision_reason?: string | null
          evidence?: Json
          guardrails?: Json
          id?: string
          name?: string
          owner_user_id?: string | null
          primary_metric?: string | null
          review_date?: string | null
          state?: string
          stop_conditions?: Json
          updated_at?: string
          volume_cap?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_channels_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_admin_actions: {
        Row: {
          action: string
          actor_user_id: string | null
          affiliate_id: string | null
          created_at: string
          id: string
          metadata: Json
          reason: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          affiliate_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          affiliate_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_admin_actions_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_admin_actions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_application_reviews: {
        Row: {
          action: string
          application_id: string
          created_at: string
          id: string
          internal_notes: string | null
          reason: string | null
          reviewer_user_id: string | null
        }
        Insert: {
          action: string
          application_id: string
          created_at?: string
          id?: string
          internal_notes?: string | null
          reason?: string | null
          reviewer_user_id?: string | null
        }
        Update: {
          action?: string
          application_id?: string
          created_at?: string
          id?: string
          internal_notes?: string | null
          reason?: string | null
          reviewer_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_application_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "affiliate_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_application_reviews_reviewer_user_id_fkey"
            columns: ["reviewer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_applications: {
        Row: {
          applicant_user_id: string
          audience_description: string | null
          audience_size_band: string | null
          country: string | null
          created_at: string
          decided_at: string | null
          decided_by_user_id: string | null
          disclosure_method: string | null
          email: string
          experience: string | null
          id: string
          is_existing_customer: boolean
          privacy_version: number | null
          program_version: number
          promotion_methods: string[]
          relevance: string | null
          risk_signals: Json
          state: string
          submitted_at: string | null
          terms_version: number | null
          updated_at: string
          uses_coupons: boolean
          uses_email_marketing: boolean
          uses_paid_search: boolean
          website_url: string | null
        }
        Insert: {
          applicant_user_id: string
          audience_description?: string | null
          audience_size_band?: string | null
          country?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by_user_id?: string | null
          disclosure_method?: string | null
          email: string
          experience?: string | null
          id?: string
          is_existing_customer?: boolean
          privacy_version?: number | null
          program_version?: number
          promotion_methods?: string[]
          relevance?: string | null
          risk_signals?: Json
          state?: string
          submitted_at?: string | null
          terms_version?: number | null
          updated_at?: string
          uses_coupons?: boolean
          uses_email_marketing?: boolean
          uses_paid_search?: boolean
          website_url?: string | null
        }
        Update: {
          applicant_user_id?: string
          audience_description?: string | null
          audience_size_band?: string | null
          country?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by_user_id?: string | null
          disclosure_method?: string | null
          email?: string
          experience?: string | null
          id?: string
          is_existing_customer?: boolean
          privacy_version?: number | null
          program_version?: number
          promotion_methods?: string[]
          relevance?: string | null
          risk_signals?: Json
          state?: string
          submitted_at?: string | null
          terms_version?: number | null
          updated_at?: string
          uses_coupons?: boolean
          uses_email_marketing?: boolean
          uses_paid_search?: boolean
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_applications_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_applications_decided_by_user_id_fkey"
            columns: ["decided_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_attributions: {
        Row: {
          affiliate_id: string
          attributed_at: string
          campaign_id: string | null
          code: string | null
          created_at: string
          eligibility_status: string
          first_touch_at: string | null
          id: string
          invalidated_reason: string | null
          last_touch_at: string | null
          locked_at: string | null
          model_version: number
          organization_id: string
          session_id: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          attributed_at?: string
          campaign_id?: string | null
          code?: string | null
          created_at?: string
          eligibility_status?: string
          first_touch_at?: string | null
          id?: string
          invalidated_reason?: string | null
          last_touch_at?: string | null
          locked_at?: string | null
          model_version?: number
          organization_id: string
          session_id?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          attributed_at?: string
          campaign_id?: string | null
          code?: string | null
          created_at?: string
          eligibility_status?: string
          first_touch_at?: string | null
          id?: string
          invalidated_reason?: string | null
          last_touch_at?: string | null
          locked_at?: string | null
          model_version?: number
          organization_id?: string
          session_id?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_attributions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_attributions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "affiliate_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_attributions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_attributions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "affiliate_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_campaigns: {
        Row: {
          affiliate_id: string
          archived_at: string | null
          content_label: string | null
          created_at: string
          destination: string
          id: string
          medium: string | null
          name: string
          slug: string
          source: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          archived_at?: string | null
          content_label?: string | null
          created_at?: string
          destination?: string
          id?: string
          medium?: string | null
          name: string
          slug: string
          source?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          archived_at?: string | null
          content_label?: string | null
          created_at?: string
          destination?: string
          id?: string
          medium?: string | null
          name?: string
          slug?: string
          source?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          attribution_eligible: boolean
          bot_classification: string
          campaign_id: string | null
          country_region: string | null
          created_at: string
          destination: string | null
          id: string
          invalid_reason: string | null
          link_id: string | null
          occurred_at: string
          referrer_domain: string | null
          session_id: string | null
          user_agent_category: string | null
        }
        Insert: {
          affiliate_id: string
          attribution_eligible?: boolean
          bot_classification?: string
          campaign_id?: string | null
          country_region?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          invalid_reason?: string | null
          link_id?: string | null
          occurred_at?: string
          referrer_domain?: string | null
          session_id?: string | null
          user_agent_category?: string | null
        }
        Update: {
          affiliate_id?: string
          attribution_eligible?: boolean
          bot_classification?: string
          campaign_id?: string | null
          country_region?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          invalid_reason?: string | null
          link_id?: string | null
          occurred_at?: string
          referrer_domain?: string | null
          session_id?: string | null
          user_agent_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "affiliate_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "affiliate_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_codes: {
        Row: {
          affiliate_id: string
          code: string
          created_at: string
          id: string
          is_default: boolean
          normalized_code: string
          retired_at: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          code: string
          created_at?: string
          id?: string
          is_default?: boolean
          normalized_code: string
          retired_at?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          code?: string
          created_at?: string
          id?: string
          is_default?: boolean
          normalized_code?: string
          retired_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_codes_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commission_adjustments: {
        Row: {
          adjustment_type: string
          affiliate_id: string
          amount_cents: number
          approved_by_user_id: string | null
          commission_id: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          evidence: Json
          id: string
          reason: string
          source_event: string | null
        }
        Insert: {
          adjustment_type: string
          affiliate_id: string
          amount_cents: number
          approved_by_user_id?: string | null
          commission_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency?: string
          evidence?: Json
          id?: string
          reason: string
          source_event?: string | null
        }
        Update: {
          adjustment_type?: string
          affiliate_id?: string
          amount_cents?: number
          approved_by_user_id?: string | null
          commission_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency?: string
          evidence?: Json
          id?: string
          reason?: string
          source_event?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commission_adjustments_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commission_adjustments_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commission_adjustments_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "affiliate_commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commission_adjustments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commission_ledger: {
        Row: {
          affiliate_id: string
          amount_cents: number
          calculation_version: number | null
          commission_id: string | null
          conversion_id: string | null
          created_at: string
          created_by: string
          currency: string
          effective_at: string
          entry_type: string
          id: string
          idempotency_key: string
          payout_id: string | null
          reason: string | null
          source_event: string | null
          stripe_invoice_id: string | null
        }
        Insert: {
          affiliate_id: string
          amount_cents: number
          calculation_version?: number | null
          commission_id?: string | null
          conversion_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          effective_at?: string
          entry_type: string
          id?: string
          idempotency_key: string
          payout_id?: string | null
          reason?: string | null
          source_event?: string | null
          stripe_invoice_id?: string | null
        }
        Update: {
          affiliate_id?: string
          amount_cents?: number
          calculation_version?: number | null
          commission_id?: string | null
          conversion_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          effective_at?: string
          entry_type?: string
          id?: string
          idempotency_key?: string
          payout_id?: string | null
          reason?: string | null
          source_event?: string | null
          stripe_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commission_ledger_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commission_ledger_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "affiliate_commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commission_ledger_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "affiliate_conversions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          calculation_version: number
          commission_amount_cents: number
          commission_rate_bps: number
          conversion_id: string
          created_at: string
          currency: string
          eligibility_reason: string | null
          excluded_cents: number
          gross_eligible_cents: number
          hold_release_at: string | null
          id: string
          invoice_paid_at: string | null
          organization_id: string
          payout_item_id: string | null
          program_version: number
          reversed_cents: number
          state: string
          stripe_invoice_id: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          calculation_version?: number
          commission_amount_cents?: number
          commission_rate_bps: number
          conversion_id: string
          created_at?: string
          currency?: string
          eligibility_reason?: string | null
          excluded_cents?: number
          gross_eligible_cents?: number
          hold_release_at?: string | null
          id?: string
          invoice_paid_at?: string | null
          organization_id: string
          payout_item_id?: string | null
          program_version?: number
          reversed_cents?: number
          state?: string
          stripe_invoice_id: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          calculation_version?: number
          commission_amount_cents?: number
          commission_rate_bps?: number
          conversion_id?: string
          created_at?: string
          currency?: string
          eligibility_reason?: string | null
          excluded_cents?: number
          gross_eligible_cents?: number
          hold_release_at?: string | null
          id?: string
          invoice_paid_at?: string | null
          organization_id?: string
          payout_item_id?: string | null
          program_version?: number
          reversed_cents?: number
          state?: string
          stripe_invoice_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "affiliate_conversions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_payout_item_fk"
            columns: ["payout_item_id"]
            isOneToOne: false
            referencedRelation: "affiliate_payout_items"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_conversion_events: {
        Row: {
          conversion_id: string
          created_at: string
          id: string
          kind: string
          metadata: Json
          occurred_at: string
          source_event: string | null
        }
        Insert: {
          conversion_id: string
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          occurred_at?: string
          source_event?: string | null
        }
        Update: {
          conversion_id?: string
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          occurred_at?: string
          source_event?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversion_events_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "affiliate_conversions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_conversions: {
        Row: {
          affiliate_id: string
          anon_ref: string
          attribution_id: string | null
          billing_interval: string | null
          canceled_at: string | null
          confirmed_at: string | null
          created_at: string
          first_paid_at: string | null
          first_paid_invoice_id: string | null
          fraud_state: string
          id: string
          organization_id: string
          plan_key: string | null
          program_version: number
          state: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          anon_ref: string
          attribution_id?: string | null
          billing_interval?: string | null
          canceled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          first_paid_at?: string | null
          first_paid_invoice_id?: string | null
          fraud_state?: string
          id?: string
          organization_id: string
          plan_key?: string | null
          program_version?: number
          state?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          anon_ref?: string
          attribution_id?: string | null
          billing_interval?: string | null
          canceled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          first_paid_at?: string | null
          first_paid_invoice_id?: string | null
          fraud_state?: string
          id?: string
          organization_id?: string
          plan_key?: string | null
          program_version?: number
          state?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_conversions_attribution_id_fkey"
            columns: ["attribution_id"]
            isOneToOne: false
            referencedRelation: "affiliate_attributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_conversions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_creatives: {
        Row: {
          alt_text: string | null
          created_at: string
          dimensions: string | null
          id: string
          intended_use: string | null
          kind: string
          retired_at: string | null
          status: string
          storage_ref: string | null
          theme: string | null
          title: string
          usage_notes: string | null
          version: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          dimensions?: string | null
          id?: string
          intended_use?: string | null
          kind: string
          retired_at?: string | null
          status?: string
          storage_ref?: string | null
          theme?: string | null
          title: string
          usage_notes?: string | null
          version?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          dimensions?: string | null
          id?: string
          intended_use?: string | null
          kind?: string
          retired_at?: string | null
          status?: string
          storage_ref?: string | null
          theme?: string | null
          title?: string
          usage_notes?: string | null
          version?: string
        }
        Relationships: []
      }
      affiliate_dispute_events: {
        Row: {
          commission_id: string | null
          created_at: string
          id: string
          idempotency_key: string
          occurred_at: string
          organization_id: string
          source_event: string | null
          status: string
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
        }
        Insert: {
          commission_id?: string | null
          created_at?: string
          id?: string
          idempotency_key: string
          occurred_at?: string
          organization_id: string
          source_event?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
        }
        Update: {
          commission_id?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string
          occurred_at?: string
          organization_id?: string
          source_event?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_dispute_events_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "affiliate_commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_dispute_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_eligibility_windows: {
        Row: {
          affiliate_id: string
          conversion_id: string
          created_at: string
          eligibility_end: string
          eligibility_start: string
          ended_reason: string | null
          id: string
          max_months: number
          organization_id: string
          paused_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          conversion_id: string
          created_at?: string
          eligibility_end: string
          eligibility_start: string
          ended_reason?: string | null
          id?: string
          max_months?: number
          organization_id: string
          paused_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          conversion_id?: string
          created_at?: string
          eligibility_end?: string
          eligibility_start?: string
          ended_reason?: string | null
          id?: string
          max_months?: number
          organization_id?: string
          paused_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_eligibility_windows_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_eligibility_windows_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: true
            referencedRelation: "affiliate_conversions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_eligibility_windows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_email_preferences: {
        Row: {
          affiliate_id: string
          commission_notifications: boolean
          conversion_notifications: boolean
          educational: boolean
          payout_notifications: boolean
          program_updates: boolean
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_notifications?: boolean
          conversion_notifications?: boolean
          educational?: boolean
          payout_notifications?: boolean
          program_updates?: boolean
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_notifications?: boolean
          conversion_notifications?: boolean
          educational?: boolean
          payout_notifications?: boolean
          program_updates?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_email_preferences_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_exports: {
        Row: {
          affiliate_id: string
          completed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          kind: string
          requested_at: string
          row_count: number | null
          status: string
          storage_ref: string | null
        }
        Insert: {
          affiliate_id: string
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          kind: string
          requested_at?: string
          row_count?: number | null
          status?: string
          storage_ref?: string | null
        }
        Update: {
          affiliate_id?: string
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          requested_at?: string
          row_count?: number | null
          status?: string
          storage_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_exports_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_fraud_flags: {
        Row: {
          affiliate_id: string
          conversion_id: string | null
          created_at: string
          evidence: Json
          flag_type: string
          id: string
          resolution: string | null
          resolved_at: string | null
          review_state: string
          reviewer_user_id: string | null
          severity: string
          source: string
        }
        Insert: {
          affiliate_id: string
          conversion_id?: string | null
          created_at?: string
          evidence?: Json
          flag_type: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          review_state?: string
          reviewer_user_id?: string | null
          severity?: string
          source?: string
        }
        Update: {
          affiliate_id?: string
          conversion_id?: string | null
          created_at?: string
          evidence?: Json
          flag_type?: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          review_state?: string
          reviewer_user_id?: string | null
          severity?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_fraud_flags_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_fraud_flags_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "affiliate_conversions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_fraud_flags_reviewer_user_id_fkey"
            columns: ["reviewer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_fraud_reviews: {
        Row: {
          affiliate_id: string
          created_at: string
          decision: string | null
          id: string
          opened_by_user_id: string | null
          reason: string | null
          resolved_at: string | null
          state: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          decision?: string | null
          id?: string
          opened_by_user_id?: string | null
          reason?: string | null
          resolved_at?: string | null
          state?: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          decision?: string | null
          id?: string
          opened_by_user_id?: string | null
          reason?: string | null
          resolved_at?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_fraud_reviews_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_fraud_reviews_opened_by_user_id_fkey"
            columns: ["opened_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          affiliate_id: string
          archived_at: string | null
          campaign_id: string | null
          code_id: string
          content_label: string | null
          created_at: string
          destination: string
          id: string
          medium: string | null
          source: string | null
        }
        Insert: {
          affiliate_id: string
          archived_at?: string | null
          campaign_id?: string | null
          code_id: string
          content_label?: string | null
          created_at?: string
          destination?: string
          id?: string
          medium?: string | null
          source?: string | null
        }
        Update: {
          affiliate_id?: string
          archived_at?: string | null
          campaign_id?: string | null
          code_id?: string
          content_label?: string | null
          created_at?: string
          destination?: string
          id?: string
          medium?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "affiliate_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_notifications: {
        Row: {
          affiliate_id: string
          channel: string
          created_at: string
          dedupe_key: string
          id: string
          kind: string
          payload: Json
          sent_at: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          channel?: string
          created_at?: string
          dedupe_key: string
          id?: string
          kind: string
          payload?: Json
          sent_at?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          channel?: string
          created_at?: string
          dedupe_key?: string
          id?: string
          kind?: string
          payload?: Json
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_notifications_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payout_batches: {
        Row: {
          affiliate_count: number
          approved_at: string | null
          approved_by_user_id: string | null
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          failed_at: string | null
          id: string
          period_label: string
          processing_at: string | null
          provider_reference: string | null
          status: string
          total_amount_cents: number
        }
        Insert: {
          affiliate_count?: number
          approved_at?: string | null
          approved_by_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency?: string
          failed_at?: string | null
          id?: string
          period_label: string
          processing_at?: string | null
          provider_reference?: string | null
          status?: string
          total_amount_cents?: number
        }
        Update: {
          affiliate_count?: number
          approved_at?: string | null
          approved_by_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency?: string
          failed_at?: string | null
          id?: string
          period_label?: string
          processing_at?: string | null
          provider_reference?: string | null
          status?: string
          total_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payout_batches_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payout_batches_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payout_items: {
        Row: {
          affiliate_id: string
          batch_id: string
          created_at: string
          currency: string
          failure_reason: string | null
          gross_payable_cents: number
          id: string
          negative_adjustment_cents: number
          net_payout_cents: number
          paid_at: string | null
          provider_fee_cents: number
          provider_reference: string | null
          status: string
          tax_withholding_cents: number
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          batch_id: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          gross_payable_cents?: number
          id?: string
          negative_adjustment_cents?: number
          net_payout_cents?: number
          paid_at?: string | null
          provider_fee_cents?: number
          provider_reference?: string | null
          status?: string
          tax_withholding_cents?: number
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          batch_id?: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          gross_payable_cents?: number
          id?: string
          negative_adjustment_cents?: number
          net_payout_cents?: number
          paid_at?: string | null
          provider_fee_cents?: number
          provider_reference?: string | null
          status?: string
          tax_withholding_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payout_items_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payout_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "affiliate_payout_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payout_profiles: {
        Row: {
          account_status: string
          affiliate_id: string
          capabilities: Json
          connected_account_id: string | null
          country: string | null
          created_at: string
          entity_type: string | null
          legal_name: string | null
          payout_hold: boolean
          preferred_currency: string
          provider: string
          requirements: Json
          updated_at: string
        }
        Insert: {
          account_status?: string
          affiliate_id: string
          capabilities?: Json
          connected_account_id?: string | null
          country?: string | null
          created_at?: string
          entity_type?: string | null
          legal_name?: string | null
          payout_hold?: boolean
          preferred_currency?: string
          provider?: string
          requirements?: Json
          updated_at?: string
        }
        Update: {
          account_status?: string
          affiliate_id?: string
          capabilities?: Json
          connected_account_id?: string | null
          country?: string | null
          created_at?: string
          entity_type?: string | null
          legal_name?: string | null
          payout_hold?: boolean
          preferred_currency?: string
          provider?: string
          requirements?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payout_profiles_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payout_statements: {
        Row: {
          adjustments_cents: number
          affiliate_id: string
          batch_id: string | null
          closing_balance_cents: number
          commission_cents: number
          created_at: string
          currency: string
          generated_at: string
          id: string
          opening_balance_cents: number
          paid_cents: number
          period_label: string
          storage_ref: string | null
        }
        Insert: {
          adjustments_cents?: number
          affiliate_id: string
          batch_id?: string | null
          closing_balance_cents?: number
          commission_cents?: number
          created_at?: string
          currency?: string
          generated_at?: string
          id?: string
          opening_balance_cents?: number
          paid_cents?: number
          period_label: string
          storage_ref?: string | null
        }
        Update: {
          adjustments_cents?: number
          affiliate_id?: string
          batch_id?: string | null
          closing_balance_cents?: number
          commission_cents?: number
          created_at?: string
          currency?: string
          generated_at?: string
          id?: string
          opening_balance_cents?: number
          paid_cents?: number
          period_label?: string
          storage_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payout_statements_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payout_statements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "affiliate_payout_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_profiles: {
        Row: {
          affiliate_id: string
          channel_links: Json
          contact_email: string | null
          country: string | null
          created_at: string
          display_name: string | null
          promotion_methods: string[]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          affiliate_id: string
          channel_links?: Json
          contact_email?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          promotion_methods?: string[]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          affiliate_id?: string
          channel_links?: Json
          contact_email?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          promotion_methods?: string[]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_profiles_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_program_versions: {
        Row: {
          created_at: string
          effective_from: string
          id: string
          label: string
          program_id: string
          terms: Json
          version: number
        }
        Insert: {
          created_at?: string
          effective_from: string
          id?: string
          label: string
          program_id: string
          terms?: Json
          version: number
        }
        Update: {
          created_at?: string
          effective_from?: string
          id?: string
          label?: string
          program_id?: string
          terms?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_program_versions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "affiliate_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_programs: {
        Row: {
          active_version: number
          created_at: string
          id: string
          name: string
          published: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          active_version?: number
          created_at?: string
          id?: string
          name: string
          published?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          active_version?: number
          created_at?: string
          id?: string
          name?: string
          published?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_reconciliation_runs: {
        Row: {
          checked: number
          differences_found: number
          differences_repaired: number
          dry_run: boolean
          finished_at: string | null
          id: string
          kind: string
          report: Json
          started_at: string
        }
        Insert: {
          checked?: number
          differences_found?: number
          differences_repaired?: number
          dry_run?: boolean
          finished_at?: string | null
          id?: string
          kind: string
          report?: Json
          started_at?: string
        }
        Update: {
          checked?: number
          differences_found?: number
          differences_repaired?: number
          dry_run?: boolean
          finished_at?: string | null
          id?: string
          kind?: string
          report?: Json
          started_at?: string
        }
        Relationships: []
      }
      affiliate_refund_events: {
        Row: {
          amount_cents: number
          commission_id: string | null
          created_at: string
          id: string
          idempotency_key: string
          kind: string
          organization_id: string
          processed_at: string | null
          source_event: string | null
          stripe_invoice_id: string | null
        }
        Insert: {
          amount_cents?: number
          commission_id?: string | null
          created_at?: string
          id?: string
          idempotency_key: string
          kind: string
          organization_id: string
          processed_at?: string | null
          source_event?: string | null
          stripe_invoice_id?: string | null
        }
        Update: {
          amount_cents?: number
          commission_id?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string
          kind?: string
          organization_id?: string
          processed_at?: string | null
          source_event?: string | null
          stripe_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_refund_events_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "affiliate_commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_refund_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_sessions: {
        Row: {
          affiliate_id: string
          campaign_id: string | null
          converted_at: string | null
          created_at: string
          expires_at: string
          first_click_at: string
          id: string
          invalidated_at: string | null
          invalidated_reason: string | null
          last_eligible_click_at: string
          model_version: number
          org_attached_at: string | null
          organization_id: string | null
          status: string
          user_attached_at: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_id: string
          campaign_id?: string | null
          converted_at?: string | null
          created_at?: string
          expires_at: string
          first_click_at?: string
          id?: string
          invalidated_at?: string | null
          invalidated_reason?: string | null
          last_eligible_click_at?: string
          model_version?: number
          org_attached_at?: string | null
          organization_id?: string | null
          status?: string
          user_attached_at?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_id?: string
          campaign_id?: string | null
          converted_at?: string | null
          created_at?: string
          expires_at?: string
          first_click_at?: string
          id?: string
          invalidated_at?: string | null
          invalidated_reason?: string | null
          last_eligible_click_at?: string
          model_version?: number
          org_attached_at?: string | null
          organization_id?: string | null
          status?: string
          user_attached_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_sessions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sessions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "affiliate_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_tax_profiles: {
        Row: {
          affiliate_id: string
          country: string | null
          created_at: string
          document_version: string | null
          entity_type: string | null
          provider_reference: string | null
          requirement_summary: string | null
          status: string
          updated_at: string
          verification_date: string | null
          withholding_status: string | null
        }
        Insert: {
          affiliate_id: string
          country?: string | null
          created_at?: string
          document_version?: string | null
          entity_type?: string | null
          provider_reference?: string | null
          requirement_summary?: string | null
          status?: string
          updated_at?: string
          verification_date?: string | null
          withholding_status?: string | null
        }
        Update: {
          affiliate_id?: string
          country?: string | null
          created_at?: string
          document_version?: string | null
          entity_type?: string | null
          provider_reference?: string | null
          requirement_summary?: string | null
          status?: string
          updated_at?: string
          verification_date?: string | null
          withholding_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_tax_profiles_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_terms_acceptances: {
        Row: {
          accepted_at: string
          affiliate_id: string | null
          application_id: string | null
          created_at: string
          id: string
          privacy_version: number | null
          program_version: number
          request_context: Json
          source: string | null
          terms_version: number
          user_id: string | null
        }
        Insert: {
          accepted_at?: string
          affiliate_id?: string | null
          application_id?: string | null
          created_at?: string
          id?: string
          privacy_version?: number | null
          program_version: number
          request_context?: Json
          source?: string | null
          terms_version: number
          user_id?: string | null
        }
        Update: {
          accepted_at?: string
          affiliate_id?: string | null
          application_id?: string | null
          created_at?: string
          id?: string
          privacy_version?: number | null
          program_version?: number
          request_context?: Json
          source?: string | null
          terms_version?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_terms_acceptances_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_terms_acceptances_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "affiliate_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_terms_acceptances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_webhook_events: {
        Row: {
          attempts: number
          event_type: string
          last_error: string | null
          processed_at: string | null
          provider: string
          provider_event_id: string
          received_at: string
          status: string
          summary: Json
        }
        Insert: {
          attempts?: number
          event_type: string
          last_error?: string | null
          processed_at?: string | null
          provider?: string
          provider_event_id: string
          received_at?: string
          status?: string
          summary?: Json
        }
        Update: {
          attempts?: number
          event_type?: string
          last_error?: string | null
          processed_at?: string | null
          provider?: string
          provider_event_id?: string
          received_at?: string
          status?: string
          summary?: Json
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          approved_at: string | null
          closed_at: string | null
          created_at: string
          fraud_state: string
          id: string
          membership_state: string
          paused_at: string | null
          payout_eligibility_state: string
          program_id: string
          program_version: number
          suspended_at: string | null
          tax_state: string
          terminated_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          closed_at?: string | null
          created_at?: string
          fraud_state?: string
          id?: string
          membership_state?: string
          paused_at?: string | null
          payout_eligibility_state?: string
          program_id: string
          program_version?: number
          suspended_at?: string | null
          tax_state?: string
          terminated_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          closed_at?: string | null
          created_at?: string
          fraud_state?: string
          id?: string
          membership_state?: string
          paused_at?: string | null
          payout_eligibility_state?: string
          program_id?: string
          program_version?: number
          suspended_at?: string | null
          tax_state?: string
          terminated_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "affiliate_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_channel_secrets: {
        Row: {
          channel_id: string
          created_at: string
          created_by_user_id: string | null
          encrypted_payload: string
          encryption_key_version: number
          header_name: string | null
          id: string
          masked_label: string
          organization_id: string
          revoked_at: string | null
          rotated_at: string | null
          secret_type: string
          status: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          created_by_user_id?: string | null
          encrypted_payload: string
          encryption_key_version: number
          header_name?: string | null
          id?: string
          masked_label: string
          organization_id: string
          revoked_at?: string | null
          rotated_at?: string | null
          secret_type: string
          status?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          created_by_user_id?: string | null
          encrypted_payload?: string
          encryption_key_version?: number
          header_name?: string | null
          id?: string
          masked_label?: string
          organization_id?: string
          revoked_at?: string | null
          rotated_at?: string | null
          secret_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_channel_secrets_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_channel_secrets_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_channel_secrets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_channel_versions: {
        Row: {
          change_reason: string | null
          channel_id: string
          configuration: Json
          created_at: string
          created_by_user_id: string | null
          id: string
          organization_id: string
          version: number
        }
        Insert: {
          change_reason?: string | null
          channel_id: string
          configuration?: Json
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          organization_id: string
          version: number
        }
        Update: {
          change_reason?: string | null
          channel_id?: string
          configuration?: Json
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          organization_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "alert_channel_versions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_channel_versions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_channel_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_channels: {
        Row: {
          consecutive_failures: number
          created_at: string
          created_by_user_id: string | null
          current_version: number
          default_for_organization: boolean
          deleted_at: string | null
          description: string | null
          health_status: string
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          last_tested_at: string | null
          name: string
          organization_id: string
          paused_at: string | null
          paused_reason: string | null
          provider: string
          provider_metadata: Json
          status: string
          updated_at: string
          updated_by_user_id: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          consecutive_failures?: number
          created_at?: string
          created_by_user_id?: string | null
          current_version?: number
          default_for_organization?: boolean
          deleted_at?: string | null
          description?: string | null
          health_status?: string
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          last_tested_at?: string | null
          name: string
          organization_id: string
          paused_at?: string | null
          paused_reason?: string | null
          provider: string
          provider_metadata?: Json
          status?: string
          updated_at?: string
          updated_by_user_id?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          consecutive_failures?: number
          created_at?: string
          created_by_user_id?: string | null
          current_version?: number
          default_for_organization?: boolean
          deleted_at?: string | null
          description?: string | null
          health_status?: string
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          last_tested_at?: string | null
          name?: string
          organization_id?: string
          paused_at?: string | null
          paused_reason?: string | null
          provider?: string
          provider_metadata?: Json
          status?: string
          updated_at?: string
          updated_by_user_id?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_channels_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_channels_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_delivery_attempts: {
        Row: {
          attempt_number: number
          completed_at: string | null
          duration_ms: number | null
          error_category: string | null
          http_status: number | null
          id: string
          intent_id: string
          is_manual: boolean
          next_retry_at: string | null
          organization_id: string
          provider_request_id: string | null
          result: string
          safe_summary: string | null
          started_at: string
        }
        Insert: {
          attempt_number: number
          completed_at?: string | null
          duration_ms?: number | null
          error_category?: string | null
          http_status?: number | null
          id?: string
          intent_id: string
          is_manual?: boolean
          next_retry_at?: string | null
          organization_id: string
          provider_request_id?: string | null
          result: string
          safe_summary?: string | null
          started_at?: string
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          duration_ms?: number | null
          error_category?: string | null
          http_status?: number | null
          id?: string
          intent_id?: string
          is_manual?: boolean
          next_retry_at?: string | null
          organization_id?: string
          provider_request_id?: string | null
          result?: string
          safe_summary?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_delivery_attempts_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "alert_delivery_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_delivery_dead_letters: {
        Row: {
          channel_id: string | null
          created_at: string
          error_category: string | null
          event_type: string
          final_attempt_at: string | null
          first_attempt_at: string | null
          id: string
          intent_id: string
          organization_id: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          rule_id: string | null
          safe_summary: string | null
          status: string
          suggested_action: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          error_category?: string | null
          event_type: string
          final_attempt_at?: string | null
          first_attempt_at?: string | null
          id?: string
          intent_id: string
          organization_id: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          rule_id?: string | null
          safe_summary?: string | null
          status?: string
          suggested_action?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          error_category?: string | null
          event_type?: string
          final_attempt_at?: string | null
          first_attempt_at?: string | null
          id?: string
          intent_id?: string
          organization_id?: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          rule_id?: string | null
          safe_summary?: string | null
          status?: string
          suggested_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_delivery_dead_letters_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_dead_letters_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: true
            referencedRelation: "alert_delivery_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_dead_letters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_dead_letters_resolved_by_user_id_fkey"
            columns: ["resolved_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_dead_letters_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_delivery_deduplication: {
        Row: {
          created_at: string
          dedup_key: string
          intent_id: string | null
          organization_id: string
        }
        Insert: {
          created_at?: string
          dedup_key: string
          intent_id?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string
          dedup_key?: string
          intent_id?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_delivery_deduplication_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_delivery_intents: {
        Row: {
          attempt_count: number
          channel_id: string
          channel_version: number
          completed_at: string | null
          created_at: string
          dedup_key: string | null
          event_payload: Json
          event_type: string
          id: string
          incident_id: string | null
          kind: string
          last_error_category: string | null
          lease_expires_at: string | null
          locked_at: string | null
          locked_by_worker: string | null
          max_attempts: number
          monitor_id: string | null
          next_attempt_at: string | null
          organization_id: string
          outbox_id: string | null
          payload_version: number
          provider: string
          routing_explanation: string | null
          rule_id: string | null
          scheduled_at: string
          severity: string | null
          status: string
          suppression_reason: string | null
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          channel_id: string
          channel_version: number
          completed_at?: string | null
          created_at?: string
          dedup_key?: string | null
          event_payload?: Json
          event_type: string
          id?: string
          incident_id?: string | null
          kind?: string
          last_error_category?: string | null
          lease_expires_at?: string | null
          locked_at?: string | null
          locked_by_worker?: string | null
          max_attempts?: number
          monitor_id?: string | null
          next_attempt_at?: string | null
          organization_id: string
          outbox_id?: string | null
          payload_version?: number
          provider: string
          routing_explanation?: string | null
          rule_id?: string | null
          scheduled_at?: string
          severity?: string | null
          status?: string
          suppression_reason?: string | null
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          channel_id?: string
          channel_version?: number
          completed_at?: string | null
          created_at?: string
          dedup_key?: string | null
          event_payload?: Json
          event_type?: string
          id?: string
          incident_id?: string | null
          kind?: string
          last_error_category?: string | null
          lease_expires_at?: string | null
          locked_at?: string | null
          locked_by_worker?: string | null
          max_attempts?: number
          monitor_id?: string | null
          next_attempt_at?: string | null
          organization_id?: string
          outbox_id?: string | null
          payload_version?: number
          provider?: string
          routing_explanation?: string | null
          rule_id?: string | null
          scheduled_at?: string
          severity?: string | null
          status?: string
          suppression_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_delivery_intents_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_intents_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_intents_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_intents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_intents_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "incident_delivery_outbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_intents_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_delivery_suppressions: {
        Row: {
          channel_id: string | null
          created_at: string
          event_type: string
          explanation: string | null
          id: string
          incident_id: string | null
          organization_id: string
          outbox_id: string | null
          reason: string
          rule_id: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          event_type: string
          explanation?: string | null
          id?: string
          incident_id?: string | null
          organization_id: string
          outbox_id?: string | null
          reason: string
          rule_id?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          event_type?: string
          explanation?: string | null
          id?: string
          incident_id?: string | null
          organization_id?: string
          outbox_id?: string | null
          reason?: string
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_delivery_suppressions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_suppressions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_suppressions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_suppressions_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "incident_delivery_outbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_delivery_suppressions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_email_recipients: {
        Row: {
          channel_id: string
          created_at: string
          created_by_user_id: string | null
          email: string
          id: string
          is_organization_member: boolean
          label: string | null
          organization_id: string
          removed_at: string | null
          verification_status: string
          verification_token_hash: string | null
          verified_at: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          created_by_user_id?: string | null
          email: string
          id?: string
          is_organization_member?: boolean
          label?: string | null
          organization_id: string
          removed_at?: string | null
          verification_status?: string
          verification_token_hash?: string | null
          verified_at?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          created_by_user_id?: string | null
          email?: string
          id?: string
          is_organization_member?: boolean
          label?: string | null
          organization_id?: string
          removed_at?: string | null
          verification_status?: string
          verification_token_hash?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_email_recipients_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_email_recipients_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_email_recipients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_email_suppressions: {
        Row: {
          created_at: string
          email: string
          id: string
          organization_id: string
          provider_message_id: string | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          organization_id: string
          provider_message_id?: string | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          organization_id?: string
          provider_message_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_email_suppressions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_quiet_hours: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          days: number[]
          end_minute: number
          event_type_exceptions: string[]
          id: string
          name: string
          organization_id: string
          rule_id: string | null
          severity_exceptions: string[]
          start_minute: number
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          days?: number[]
          end_minute: number
          event_type_exceptions?: string[]
          id?: string
          name?: string
          organization_id: string
          rule_id?: string | null
          severity_exceptions?: string[]
          start_minute: number
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          days?: number[]
          end_minute?: number
          event_type_exceptions?: string[]
          id?: string
          name?: string
          organization_id?: string
          rule_id?: string | null
          severity_exceptions?: string[]
          start_minute?: number
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_quiet_hours_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_quiet_hours_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_quiet_hours_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_routing_rules: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          deduplicate: boolean
          id: string
          is_default: boolean
          name: string
          organization_id: string
          precedence_rank: number
          quiet_behavior: string
          recovery_behavior: string
          scope_kind: string
          status: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          deduplicate?: boolean
          id?: string
          is_default?: boolean
          name: string
          organization_id: string
          precedence_rank?: number
          quiet_behavior?: string
          recovery_behavior?: string
          scope_kind?: string
          status?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          deduplicate?: boolean
          id?: string
          is_default?: boolean
          name?: string
          organization_id?: string
          precedence_rank?: number
          quiet_behavior?: string
          recovery_behavior?: string
          scope_kind?: string
          status?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_routing_rules_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_routing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_routing_rules_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rule_channels: {
        Row: {
          channel_id: string
          created_at: string
          fallback_order: number | null
          id: string
          organization_id: string
          role: string
          rule_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          fallback_order?: number | null
          id?: string
          organization_id: string
          role?: string
          rule_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          fallback_order?: number | null
          id?: string
          organization_id?: string
          role?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rule_channels_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_channels_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rule_event_types: {
        Row: {
          created_at: string
          event_type: string
          id: string
          organization_id: string
          rule_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          organization_id: string
          rule_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          organization_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rule_event_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_event_types_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rule_monitor_groups: {
        Row: {
          created_at: string
          id: string
          monitor_group_id: string
          organization_id: string
          rule_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monitor_group_id: string
          organization_id: string
          rule_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monitor_group_id?: string
          organization_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rule_monitor_groups_monitor_group_id_fkey"
            columns: ["monitor_group_id"]
            isOneToOne: false
            referencedRelation: "monitor_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_monitor_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_monitor_groups_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rule_monitors: {
        Row: {
          created_at: string
          id: string
          monitor_id: string
          organization_id: string
          rule_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monitor_id: string
          organization_id: string
          rule_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monitor_id?: string
          organization_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rule_monitors_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_monitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_monitors_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rule_severities: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          rule_id: string
          severity: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          rule_id: string
          severity: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          rule_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rule_severities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_severities_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rule_tags: {
        Row: {
          created_at: string
          id: string
          monitor_tag_id: string
          organization_id: string
          rule_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monitor_tag_id: string
          organization_id: string
          rule_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monitor_tag_id?: string
          organization_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rule_tags_monitor_tag_id_fkey"
            columns: ["monitor_tag_id"]
            isOneToOne: false
            referencedRelation: "monitor_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_tags_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_test_deliveries: {
        Row: {
          channel_id: string
          channel_version: number
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_category: string | null
          http_status: number | null
          id: string
          organization_id: string
          requested_by_user_id: string | null
          result: string | null
          safe_summary: string | null
          status: string
        }
        Insert: {
          channel_id: string
          channel_version: number
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_category?: string | null
          http_status?: number | null
          id?: string
          organization_id: string
          requested_by_user_id?: string | null
          result?: string | null
          safe_summary?: string | null
          status?: string
        }
        Update: {
          channel_id?: string
          channel_version?: number
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_category?: string | null
          http_status?: number | null
          id?: string
          organization_id?: string
          requested_by_user_id?: string | null
          result?: string | null
          safe_summary?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_test_deliveries_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_test_deliveries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_test_deliveries_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_webhook_signing_keys: {
        Row: {
          channel_id: string
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          key_id: string
          organization_id: string
          retiring_at: string | null
          revoked_at: string | null
          secret_id: string | null
          status: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          key_id: string
          organization_id: string
          retiring_at?: string | null
          revoked_at?: string | null
          secret_id?: string | null
          status?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          key_id?: string
          organization_id?: string
          retiring_at?: string | null
          revoked_at?: string | null
          secret_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_webhook_signing_keys_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "alert_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_webhook_signing_keys_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_webhook_signing_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_webhook_signing_keys_secret_id_fkey"
            columns: ["secret_id"]
            isOneToOne: false
            referencedRelation: "alert_channel_secrets"
            referencedColumns: ["id"]
          },
        ]
      }
      appsumo_licenses: {
        Row: {
          created_at: string
          deactivated_at: string | null
          license_key: string
          organization_id: string | null
          parent_license_key: string | null
          partner_plan_name: string | null
          plan_key: string
          prev_license_key: string | null
          redeemed_by_user_id: string | null
          status: string
          tier: number
          unit_quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deactivated_at?: string | null
          license_key: string
          organization_id?: string | null
          parent_license_key?: string | null
          partner_plan_name?: string | null
          plan_key: string
          prev_license_key?: string | null
          redeemed_by_user_id?: string | null
          status?: string
          tier?: number
          unit_quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deactivated_at?: string | null
          license_key?: string
          organization_id?: string | null
          parent_license_key?: string | null
          partner_plan_name?: string | null
          plan_key?: string
          prev_license_key?: string | null
          redeemed_by_user_id?: string | null
          status?: string
          tier?: number
          unit_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appsumo_licenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appsumo_licenses_redeemed_by_user_id_fkey"
            columns: ["redeemed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appsumo_webhook_events: {
        Row: {
          attempts: number
          event_timestamp: number
          event_type: string
          idempotency_key: string
          last_error: string | null
          license_key: string
          organization_id: string | null
          payload: Json
          processed_at: string | null
          received_at: string
          status: string
        }
        Insert: {
          attempts?: number
          event_timestamp: number
          event_type: string
          idempotency_key: string
          last_error?: string | null
          license_key: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Update: {
          attempts?: number
          event_timestamp?: number
          event_type?: string
          idempotency_key?: string
          last_error?: string | null
          license_key?: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appsumo_webhook_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_type: string
          actor_user_id: string | null
          correlation_id: string | null
          created_at: string
          id: string
          metadata: Json
          organization_id: string | null
          summary: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_type?: string
          actor_user_id?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          summary?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_type?: string
          actor_user_id?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          summary?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_admin_overrides: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          effective_at: string
          entitlement_key: string
          expires_at: string | null
          id: string
          organization_id: string
          override_value: Json
          reason: string
          reference: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          effective_at?: string
          entitlement_key: string
          expires_at?: string | null
          id?: string
          organization_id: string
          override_value: Json
          reason: string
          reference?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          effective_at?: string
          entitlement_key?: string
          expires_at?: string | null
          id?: string
          organization_id?: string
          override_value?: Json
          reason?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_admin_overrides_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_admin_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_cancellation_records: {
        Row: {
          canceled_at: string | null
          effective_at: string | null
          feedback: string | null
          follow_up_ok: boolean | null
          id: string
          missing_feature: string | null
          organization_id: string
          reactivated_at: string | null
          reason_code: string | null
          requested_at: string
          requested_by_user_id: string | null
          secondary_reason: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          canceled_at?: string | null
          effective_at?: string | null
          feedback?: string | null
          follow_up_ok?: boolean | null
          id?: string
          missing_feature?: string | null
          organization_id: string
          reactivated_at?: string | null
          reason_code?: string | null
          requested_at?: string
          requested_by_user_id?: string | null
          secondary_reason?: string | null
          status?: string
          subscription_id?: string | null
        }
        Update: {
          canceled_at?: string | null
          effective_at?: string | null
          feedback?: string | null
          follow_up_ok?: boolean | null
          id?: string
          missing_feature?: string | null
          organization_id?: string
          reactivated_at?: string | null
          reason_code?: string | null
          requested_at?: string
          requested_by_user_id?: string | null
          secondary_reason?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_cancellation_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_cancellation_records_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_cancellation_records_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "billing_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_checkout_intents: {
        Row: {
          billing_interval: string
          canceled_at: string | null
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          initiated_by_user_id: string
          organization_id: string
          plan_key: string
          status: string
          stripe_checkout_session_id: string | null
        }
        Insert: {
          billing_interval: string
          canceled_at?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          initiated_by_user_id: string
          organization_id: string
          plan_key: string
          status?: string
          stripe_checkout_session_id?: string | null
        }
        Update: {
          billing_interval?: string
          canceled_at?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          initiated_by_user_id?: string
          organization_id?: string
          plan_key?: string
          status?: string
          stripe_checkout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_checkout_intents_initiated_by_user_id_fkey"
            columns: ["initiated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_checkout_intents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          billing_email: string | null
          billing_name: string | null
          created_at: string
          organization_id: string
          stripe_customer_id: string
          tax_id_present: boolean
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string
          organization_id: string
          stripe_customer_id: string
          tax_id_present?: boolean
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string
          organization_id?: string
          stripe_customer_id?: string
          tax_id_present?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_downgrade_plans: {
        Row: {
          billing_interval: string
          created_at: string
          effective_at: string
          from_plan_key: string
          id: string
          organization_id: string
          selections: Json
          status: string
          to_plan_key: string
        }
        Insert: {
          billing_interval: string
          created_at?: string
          effective_at: string
          from_plan_key: string
          id?: string
          organization_id: string
          selections?: Json
          status?: string
          to_plan_key: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          effective_at?: string
          from_plan_key?: string
          id?: string
          organization_id?: string
          selections?: Json
          status?: string
          to_plan_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_downgrade_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_entitlement_snapshots: {
        Row: {
          access_state: string
          calculated_at: string
          entitlement_version: number
          entitlements: Json
          id: string
          organization_id: string
          plan_key: string | null
          source: string
          subscription_id: string | null
        }
        Insert: {
          access_state: string
          calculated_at?: string
          entitlement_version: number
          entitlements: Json
          id?: string
          organization_id: string
          plan_key?: string | null
          source?: string
          subscription_id?: string | null
        }
        Update: {
          access_state?: string
          calculated_at?: string
          entitlement_version?: number
          entitlements?: Json
          id?: string
          organization_id?: string
          plan_key?: string | null
          source?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_entitlement_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_entitlement_snapshots_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "billing_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_grace_periods: {
        Row: {
          ended_at: string | null
          id: string
          organization_id: string
          reason: string | null
          restriction_at: string | null
          started_at: string
          status: string
          subscription_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          organization_id: string
          reason?: string | null
          restriction_at?: string | null
          started_at?: string
          status?: string
          subscription_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          organization_id?: string
          reason?: string | null
          restriction_at?: string | null
          started_at?: string
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_grace_periods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_grace_periods_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "billing_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_payment_events: {
        Row: {
          amount_cents: number
          currency: string
          hosted_invoice_url: string | null
          id: string
          invoice_pdf_url: string | null
          kind: string
          occurred_at: string
          organization_id: string
          stripe_invoice_id: string | null
          summary: Json
        }
        Insert: {
          amount_cents?: number
          currency?: string
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          kind: string
          occurred_at?: string
          organization_id: string
          stripe_invoice_id?: string | null
          summary?: Json
        }
        Update: {
          amount_cents?: number
          currency?: string
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          kind?: string
          occurred_at?: string
          organization_id?: string
          stripe_invoice_id?: string | null
          summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "billing_payment_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_reconciliation_runs: {
        Row: {
          differences_found: number
          differences_repaired: number
          dry_run: boolean
          finished_at: string | null
          id: string
          organizations_checked: number
          report: Json
          started_at: string
        }
        Insert: {
          differences_found?: number
          differences_repaired?: number
          dry_run?: boolean
          finished_at?: string | null
          id?: string
          organizations_checked?: number
          report?: Json
          started_at?: string
        }
        Update: {
          differences_found?: number
          differences_repaired?: number
          dry_run?: boolean
          finished_at?: string | null
          id?: string
          organizations_checked?: number
          report?: Json
          started_at?: string
        }
        Relationships: []
      }
      billing_subscriptions: {
        Row: {
          access_state: string
          billing_interval: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          cancellation_effective_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          plan_key: string
          recurring_amount_cents: number
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          stripe_updated_at: number | null
          updated_at: string
        }
        Insert: {
          access_state?: string
          billing_interval: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          cancellation_effective_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          plan_key: string
          recurring_amount_cents?: number
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          stripe_updated_at?: number | null
          updated_at?: string
        }
        Update: {
          access_state?: string
          billing_interval?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          cancellation_effective_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          plan_key?: string
          recurring_amount_cents?: number
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          stripe_updated_at?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_usage_counters: {
        Row: {
          active_monitors: number
          alert_channels: number
          alert_rules: number
          checks_period_end: string | null
          checks_period_start: string | null
          checks_this_period: number
          confirmed_subscribers: number
          custom_domains: number
          organization_id: string
          pending_invitations: number
          rebuilt_at: string | null
          status_pages: number
          team_members: number
          total_monitors: number
          updated_at: string
        }
        Insert: {
          active_monitors?: number
          alert_channels?: number
          alert_rules?: number
          checks_period_end?: string | null
          checks_period_start?: string | null
          checks_this_period?: number
          confirmed_subscribers?: number
          custom_domains?: number
          organization_id: string
          pending_invitations?: number
          rebuilt_at?: string | null
          status_pages?: number
          team_members?: number
          total_monitors?: number
          updated_at?: string
        }
        Update: {
          active_monitors?: number
          alert_channels?: number
          alert_rules?: number
          checks_period_end?: string | null
          checks_period_start?: string | null
          checks_this_period?: number
          confirmed_subscribers?: number
          custom_domains?: number
          organization_id?: string
          pending_invitations?: number
          rebuilt_at?: string | null
          status_pages?: number
          team_members?: number
          total_monitors?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_usage_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_webhook_events: {
        Row: {
          api_version: string | null
          attempts: number
          event_type: string
          last_error: string | null
          livemode: boolean
          organization_id: string | null
          processed_at: string | null
          received_at: string
          status: string
          stripe_event_id: string
          stripe_object_id: string | null
          summary: Json
        }
        Insert: {
          api_version?: string | null
          attempts?: number
          event_type: string
          last_error?: string | null
          livemode?: boolean
          organization_id?: string | null
          processed_at?: string | null
          received_at?: string
          status?: string
          stripe_event_id: string
          stripe_object_id?: string | null
          summary?: Json
        }
        Update: {
          api_version?: string | null
          attempts?: number
          event_type?: string
          last_error?: string | null
          livemode?: boolean
          organization_id?: string | null
          processed_at?: string | null
          received_at?: string
          status?: string
          stripe_event_id?: string
          stripe_object_id?: string | null
          summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "billing_webhook_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_budgets: {
        Row: {
          audience_scope: string | null
          campaign_id: string
          created_at: string
          daily_cap_cents: number | null
          excluded_audiences: string | null
          fajita_side_cap_set: boolean
          geographic_scope: string | null
          id: string
          max_activated_cac_cents: number | null
          max_cost_per_paid_cents: number | null
          max_retained_cac_cents: number | null
          max_test_days: number | null
          min_conversions: number | null
          provider_side_cap_set: boolean
          total_cap_cents: number
          updated_at: string
        }
        Insert: {
          audience_scope?: string | null
          campaign_id: string
          created_at?: string
          daily_cap_cents?: number | null
          excluded_audiences?: string | null
          fajita_side_cap_set?: boolean
          geographic_scope?: string | null
          id?: string
          max_activated_cac_cents?: number | null
          max_cost_per_paid_cents?: number | null
          max_retained_cac_cents?: number | null
          max_test_days?: number | null
          min_conversions?: number | null
          provider_side_cap_set?: boolean
          total_cap_cents: number
          updated_at?: string
        }
        Update: {
          audience_scope?: string | null
          campaign_id?: string
          created_at?: string
          daily_cap_cents?: number | null
          excluded_audiences?: string | null
          fajita_side_cap_set?: boolean
          geographic_scope?: string | null
          id?: string
          max_activated_cac_cents?: number | null
          max_cost_per_paid_cents?: number | null
          max_retained_cac_cents?: number | null
          max_test_days?: number | null
          min_conversions?: number | null
          provider_side_cap_set?: boolean
          total_cap_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_budgets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "growth_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_costs: {
        Row: {
          allocation_method: string
          amount_cents: number
          campaign_id: string | null
          channel_id: string | null
          conversion_date: string | null
          conversion_rate: number | null
          conversion_source: string | null
          cost_date: string
          created_at: string
          currency: string
          id: string
          invoice_reference: string | null
          original_amount_cents: number | null
          original_currency: string | null
          owner_user_id: string | null
          source: string
          tax_treatment: string | null
          verified: boolean
        }
        Insert: {
          allocation_method?: string
          amount_cents: number
          campaign_id?: string | null
          channel_id?: string | null
          conversion_date?: string | null
          conversion_rate?: number | null
          conversion_source?: string | null
          cost_date: string
          created_at?: string
          currency?: string
          id?: string
          invoice_reference?: string | null
          original_amount_cents?: number | null
          original_currency?: string | null
          owner_user_id?: string | null
          source: string
          tax_treatment?: string | null
          verified?: boolean
        }
        Update: {
          allocation_method?: string
          amount_cents?: number
          campaign_id?: string | null
          channel_id?: string | null
          conversion_date?: string | null
          conversion_rate?: number | null
          conversion_source?: string | null
          cost_date?: string
          created_at?: string
          currency?: string
          id?: string
          invoice_reference?: string | null
          original_amount_cents?: number | null
          original_currency?: string | null
          owner_user_id?: string | null
          source?: string
          tax_treatment?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "campaign_costs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "growth_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_costs_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "acquisition_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_costs_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_results: {
        Row: {
          activated_organizations: number
          calculation_version: string
          campaign_id: string
          completeness: string
          created_at: string
          day30_retained: number
          day7_retained: number
          id: string
          paid_organizations: number
          period_end: string
          period_start: string
          retained_mrr_cents: number
          spend_cents: number
          support_contacts: number
        }
        Insert: {
          activated_organizations?: number
          calculation_version?: string
          campaign_id: string
          completeness?: string
          created_at?: string
          day30_retained?: number
          day7_retained?: number
          id?: string
          paid_organizations?: number
          period_end: string
          period_start: string
          retained_mrr_cents?: number
          spend_cents?: number
          support_contacts?: number
        }
        Update: {
          activated_organizations?: number
          calculation_version?: string
          campaign_id?: string
          completeness?: string
          created_at?: string
          day30_retained?: number
          day7_retained?: number
          id?: string
          paid_organizations?: number
          period_end?: string
          period_start?: string
          retained_mrr_cents?: number
          spend_cents?: number
          support_contacts?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "growth_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      capacity_forecasts: {
        Row: {
          assumptions: Json
          calculated_at: string
          calculation_version: string
          confidence: string
          forecast_value: number
          horizon_days: number
          id: string
          resource_key: string
        }
        Insert: {
          assumptions?: Json
          calculated_at?: string
          calculation_version?: string
          confidence?: string
          forecast_value: number
          horizon_days: number
          id?: string
          resource_key: string
        }
        Update: {
          assumptions?: Json
          calculated_at?: string
          calculation_version?: string
          confidence?: string
          forecast_value?: number
          horizon_days?: number
          id?: string
          resource_key?: string
        }
        Relationships: []
      }
      capacity_thresholds: {
        Row: {
          cost_impact_cents: number | null
          created_at: string
          critical_threshold: number
          current_usage: number | null
          id: string
          label: string
          lead_time_hours: number
          normal_max: number | null
          normal_min: number | null
          owner: string
          resource_key: string
          runbook_path: string | null
          scale_threshold: number
          scaling_action: string
          unit: string
          updated_at: string
          warning_threshold: number
        }
        Insert: {
          cost_impact_cents?: number | null
          created_at?: string
          critical_threshold: number
          current_usage?: number | null
          id?: string
          label: string
          lead_time_hours?: number
          normal_max?: number | null
          normal_min?: number | null
          owner: string
          resource_key: string
          runbook_path?: string | null
          scale_threshold: number
          scaling_action: string
          unit: string
          updated_at?: string
          warning_threshold: number
        }
        Update: {
          cost_impact_cents?: number | null
          created_at?: string
          critical_threshold?: number
          current_usage?: number | null
          id?: string
          label?: string
          lead_time_hours?: number
          normal_max?: number | null
          normal_min?: number | null
          owner?: string
          resource_key?: string
          runbook_path?: string | null
          scale_threshold?: number
          scaling_action?: string
          unit?: string
          updated_at?: string
          warning_threshold?: number
        }
        Relationships: []
      }
      channel_quality_snapshots: {
        Row: {
          activated_cac_cents: number | null
          activated_organizations: number
          calculation_version: string
          channel_id: string
          chargebacks: number
          cohort_date: string
          completeness: string
          confidence: string
          contribution_cents: number | null
          cost_cents: number
          created_at: string
          currency: string
          day30_retained: number
          day7_retained: number
          id: string
          mrr_cents: number
          paid_organizations: number
          payback_months: number | null
          period_end: string
          period_start: string
          qualified_visitors: number
          refunds_cents: number
          retained_cac_cents: number | null
          retained_mrr_cents: number
          security_abuse_events: number
          signups: number
          support_contacts: number
          visitors: number
        }
        Insert: {
          activated_cac_cents?: number | null
          activated_organizations?: number
          calculation_version?: string
          channel_id: string
          chargebacks?: number
          cohort_date: string
          completeness?: string
          confidence?: string
          contribution_cents?: number | null
          cost_cents?: number
          created_at?: string
          currency?: string
          day30_retained?: number
          day7_retained?: number
          id?: string
          mrr_cents?: number
          paid_organizations?: number
          payback_months?: number | null
          period_end: string
          period_start: string
          qualified_visitors?: number
          refunds_cents?: number
          retained_cac_cents?: number | null
          retained_mrr_cents?: number
          security_abuse_events?: number
          signups?: number
          support_contacts?: number
          visitors?: number
        }
        Update: {
          activated_cac_cents?: number | null
          activated_organizations?: number
          calculation_version?: string
          channel_id?: string
          chargebacks?: number
          cohort_date?: string
          completeness?: string
          confidence?: string
          contribution_cents?: number | null
          cost_cents?: number
          created_at?: string
          currency?: string
          day30_retained?: number
          day7_retained?: number
          id?: string
          mrr_cents?: number
          paid_organizations?: number
          payback_months?: number | null
          period_end?: string
          period_start?: string
          qualified_visitors?: number
          refunds_cents?: number
          retained_cac_cents?: number | null
          retained_mrr_cents?: number
          security_abuse_events?: number
          signups?: number
          support_contacts?: number
          visitors?: number
        }
        Relationships: [
          {
            foreignKeyName: "channel_quality_snapshots_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "acquisition_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      check_assertion_results: {
        Row: {
          actual_summary: string | null
          assertion_id: string | null
          assertion_type: string
          created_at: string
          evaluation_ms: number | null
          execution_id: string
          expected_summary: string | null
          failure_reason: string | null
          id: string
          monitor_id: string
          organization_id: string
          passed: boolean
          position: number
          result_id: string
        }
        Insert: {
          actual_summary?: string | null
          assertion_id?: string | null
          assertion_type: string
          created_at?: string
          evaluation_ms?: number | null
          execution_id: string
          expected_summary?: string | null
          failure_reason?: string | null
          id?: string
          monitor_id: string
          organization_id: string
          passed: boolean
          position?: number
          result_id: string
        }
        Update: {
          actual_summary?: string | null
          assertion_id?: string | null
          assertion_type?: string
          created_at?: string
          evaluation_ms?: number | null
          execution_id?: string
          expected_summary?: string | null
          failure_reason?: string | null
          id?: string
          monitor_id?: string
          organization_id?: string
          passed?: boolean
          position?: number
          result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_assertion_results_assertion_id_fkey"
            columns: ["assertion_id"]
            isOneToOne: false
            referencedRelation: "monitor_assertions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_assertion_results_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "check_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_assertion_results_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_assertion_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_assertion_results_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "check_results"
            referencedColumns: ["id"]
          },
        ]
      }
      check_executions: {
        Row: {
          attempt_count: number
          completed_at: string | null
          correlation_id: string | null
          created_at: string
          id: string
          idempotency_key: string
          is_test: boolean
          leased_at: string | null
          monitor_id: string
          monitor_version_id: string
          organization_id: string
          phase: string | null
          region: string | null
          scheduled_for: string
          started_at: string | null
          status: string
          worker_id: string | null
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          idempotency_key: string
          is_test?: boolean
          leased_at?: string | null
          monitor_id: string
          monitor_version_id: string
          organization_id: string
          phase?: string | null
          region?: string | null
          scheduled_for: string
          started_at?: string | null
          status?: string
          worker_id?: string | null
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string
          is_test?: boolean
          leased_at?: string | null
          monitor_id?: string
          monitor_version_id?: string
          organization_id?: string
          phase?: string | null
          region?: string | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_executions_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      check_results: {
        Row: {
          checked_at: string
          connect_ms: number | null
          created_at: string
          diagnostic_snippet: string | null
          dns_ms: number | null
          execution_id: string
          failure_category: string | null
          final_url: string | null
          http_status: number | null
          id: string
          monitor_id: string
          monitor_version_id: string
          organization_id: string
          redirect_count: number | null
          region: string | null
          response_bytes: number | null
          safe_error_message: string | null
          status: string
          tls_ms: number | null
          tls_summary: Json | null
          total_ms: number | null
          ttfb_ms: number | null
          worker_id: string | null
        }
        Insert: {
          checked_at: string
          connect_ms?: number | null
          created_at?: string
          diagnostic_snippet?: string | null
          dns_ms?: number | null
          execution_id: string
          failure_category?: string | null
          final_url?: string | null
          http_status?: number | null
          id?: string
          monitor_id: string
          monitor_version_id: string
          organization_id: string
          redirect_count?: number | null
          region?: string | null
          response_bytes?: number | null
          safe_error_message?: string | null
          status: string
          tls_ms?: number | null
          tls_summary?: Json | null
          total_ms?: number | null
          ttfb_ms?: number | null
          worker_id?: string | null
        }
        Update: {
          checked_at?: string
          connect_ms?: number | null
          created_at?: string
          diagnostic_snippet?: string | null
          dns_ms?: number | null
          execution_id?: string
          failure_category?: string | null
          final_url?: string | null
          http_status?: number | null
          id?: string
          monitor_id?: string
          monitor_version_id?: string
          organization_id?: string
          redirect_count?: number | null
          region?: string | null
          response_bytes?: number | null
          safe_error_message?: string | null
          status?: string
          tls_ms?: number | null
          tls_summary?: Json | null
          total_ms?: number | null
          ttfb_ms?: number | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_results_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: true
            referencedRelation: "check_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_results_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      check_schedules: {
        Row: {
          attempt_count: number
          consecutive_lease_failures: number
          enabled: boolean
          interval_seconds: number
          lease_expires_at: string | null
          locked_at: string | null
          locked_by_worker_id: string | null
          monitor_id: string
          monitor_version_id: string
          next_check_at: string
          organization_id: string
          priority: number
          schedule_generation: number
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          consecutive_lease_failures?: number
          enabled?: boolean
          interval_seconds: number
          lease_expires_at?: string | null
          locked_at?: string | null
          locked_by_worker_id?: string | null
          monitor_id: string
          monitor_version_id: string
          next_check_at: string
          organization_id: string
          priority?: number
          schedule_generation?: number
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          consecutive_lease_failures?: number
          enabled?: boolean
          interval_seconds?: number
          lease_expires_at?: string | null
          locked_at?: string | null
          locked_by_worker_id?: string | null
          monitor_id?: string
          monitor_version_id?: string
          next_check_at?: string
          organization_id?: string
          priority?: number
          schedule_generation?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_schedules_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: true
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_schedules_monitor_version_id_fkey"
            columns: ["monitor_version_id"]
            isOneToOne: false
            referencedRelation: "monitor_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string | null
          topic: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name?: string | null
          topic: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string | null
          topic?: string
        }
        Relationships: []
      }
      content_compounding_snapshots: {
        Row: {
          activations: number
          assisted_mrr_cents: number
          calculation_version: string
          completeness: string
          content_key: string
          created_at: string
          id: string
          paid_conversions: number
          period_end: string
          period_start: string
          pricing_transitions: number
          qualified_visits: number
          refresh_needed: boolean
          retentions: number
          search_clicks: number | null
          search_impressions: number | null
          support_burden: number
        }
        Insert: {
          activations?: number
          assisted_mrr_cents?: number
          calculation_version?: string
          completeness?: string
          content_key: string
          created_at?: string
          id?: string
          paid_conversions?: number
          period_end: string
          period_start: string
          pricing_transitions?: number
          qualified_visits?: number
          refresh_needed?: boolean
          retentions?: number
          search_clicks?: number | null
          search_impressions?: number | null
          support_burden?: number
        }
        Update: {
          activations?: number
          assisted_mrr_cents?: number
          calculation_version?: string
          completeness?: string
          content_key?: string
          created_at?: string
          id?: string
          paid_conversions?: number
          period_end?: string
          period_start?: string
          pricing_transitions?: number
          qualified_visits?: number
          refresh_needed?: boolean
          retentions?: number
          search_clicks?: number | null
          search_impressions?: number | null
          support_burden?: number
        }
        Relationships: []
      }
      content_investment_tiers: {
        Row: {
          classification: string
          content_key: string
          content_path: string
          created_at: string
          id: string
          next_review_date: string | null
          owner_user_id: string | null
          tier: number
          updated_at: string
        }
        Insert: {
          classification: string
          content_key: string
          content_path: string
          created_at?: string
          id?: string
          next_review_date?: string | null
          owner_user_id?: string | null
          tier: number
          updated_at?: string
        }
        Update: {
          classification?: string
          content_key?: string
          content_path?: string
          created_at?: string
          id?: string
          next_review_date?: string | null
          owner_user_id?: string | null
          tier?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_investment_tiers_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_referrals: {
        Row: {
          advocate_user_id: string
          created_at: string
          id: string
          organization_id: string
          referral_code: string
          reward_type: string
          status: string
          updated_at: string
        }
        Insert: {
          advocate_user_id: string
          created_at?: string
          id?: string
          organization_id: string
          referral_code: string
          reward_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          advocate_user_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          referral_code?: string
          reward_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_referrals_advocate_user_id_fkey"
            columns: ["advocate_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_referrals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_requests: {
        Row: {
          canceled_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          organization_id: string | null
          requested_by_user_id: string
          scheduled_for: string | null
          status: string
          subject_type: string
          subject_user_id: string | null
          updated_at: string
        }
        Insert: {
          canceled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          requested_by_user_id: string
          scheduled_for?: string | null
          status?: string
          subject_type: string
          subject_user_id?: string | null
          updated_at?: string
        }
        Update: {
          canceled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          requested_by_user_id?: string
          scheduled_for?: string | null
          status?: string
          subject_type?: string
          subject_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deletion_requests_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deletion_requests_subject_user_id_fkey"
            columns: ["subject_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_feedback: {
        Row: {
          comment: string | null
          created_at: string
          docs_version: string
          helpful: boolean
          id: string
          owner: string | null
          product_version: string | null
          reason: string | null
          resolution_state: string
          slug: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          docs_version: string
          helpful: boolean
          id?: string
          owner?: string | null
          product_version?: string | null
          reason?: string | null
          resolution_state?: string
          slug: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          docs_version?: string
          helpful?: boolean
          id?: string
          owner?: string | null
          product_version?: string | null
          reason?: string | null
          resolution_state?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      docs_search_no_result: {
        Row: {
          created_at: string
          docs_version: string
          id: string
          redacted_query: string
        }
        Insert: {
          created_at?: string
          docs_version: string
          id?: string
          redacted_query: string
        }
        Update: {
          created_at?: string
          docs_version?: string
          id?: string
          redacted_query?: string
        }
        Relationships: []
      }
      early_access_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          download_path: string | null
          expires_at: string | null
          id: string
          organization_id: string | null
          requested_at: string
          requested_by_user_id: string
          scope: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          download_path?: string | null
          expires_at?: string | null
          id?: string
          organization_id?: string | null
          requested_at?: string
          requested_by_user_id: string
          scope: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          download_path?: string | null
          expires_at?: string | null
          id?: string
          organization_id?: string | null
          requested_at?: string
          requested_by_user_id?: string
          scope?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_requests_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag_overrides: {
        Row: {
          created_at: string
          enabled: boolean
          flag_key: string
          id: string
          note: string | null
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled: boolean
          flag_key: string
          id?: string
          note?: string | null
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          flag_key?: string
          id?: string
          note?: string | null
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_assumptions: {
        Row: {
          actual_vs_forecast: string | null
          assumption_key: string
          confidence: string
          created_at: string
          id: string
          label: string
          owner: string
          review_date: string | null
          scenario: string | null
          source: string
          updated_at: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          actual_vs_forecast?: string | null
          assumption_key: string
          confidence?: string
          created_at?: string
          id?: string
          label: string
          owner: string
          review_date?: string | null
          scenario?: string | null
          source: string
          updated_at?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          actual_vs_forecast?: string | null
          assumption_key?: string
          confidence?: string
          created_at?: string
          id?: string
          label?: string
          owner?: string
          review_date?: string | null
          scenario?: string | null
          source?: string
          updated_at?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: []
      }
      founder_content_queue: {
        Row: {
          approved_links: Json
          created_at: string
          id: string
          insight: string
          performance: Json
          public_safe_wording: string | null
          publication_channel: string | null
          reuse_potential: string | null
          sensitive_data_reviewed: boolean
          source_evidence: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_links?: Json
          created_at?: string
          id?: string
          insight: string
          performance?: Json
          public_safe_wording?: string | null
          publication_channel?: string | null
          reuse_potential?: string | null
          sensitive_data_reviewed?: boolean
          source_evidence?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_links?: Json
          created_at?: string
          id?: string
          insight?: string
          performance?: Json
          public_safe_wording?: string | null
          publication_channel?: string | null
          reuse_potential?: string | null
          sensitive_data_reviewed?: boolean
          source_evidence?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      glossary_feedback: {
        Row: {
          comment: string | null
          content_version: string
          created_at: string
          helpful: boolean
          id: string
          reason: string | null
          resolution_state: string
          slug: string
        }
        Insert: {
          comment?: string | null
          content_version: string
          created_at?: string
          helpful: boolean
          id?: string
          reason?: string | null
          resolution_state?: string
          slug: string
        }
        Update: {
          comment?: string | null
          content_version?: string
          created_at?: string
          helpful?: boolean
          id?: string
          reason?: string | null
          resolution_state?: string
          slug?: string
        }
        Relationships: []
      }
      glossary_search_no_result: {
        Row: {
          created_at: string
          glossary_version: string
          id: string
          redacted_query: string
        }
        Insert: {
          created_at?: string
          glossary_version: string
          id?: string
          redacted_query: string
        }
        Update: {
          created_at?: string
          glossary_version?: string
          id?: string
          redacted_query?: string
        }
        Relationships: []
      }
      growth_campaigns: {
        Row: {
          approval_id: string | null
          attribution_params: Json
          audience: string | null
          budget_cents: number | null
          campaign_key: string
          capacity_reviewed: boolean
          channel_id: string | null
          claims_reviewed: boolean
          created_at: string
          creative_version: string | null
          end_date: string | null
          experiment_id: string | null
          id: string
          landing_page_path: string | null
          message: string | null
          name: string
          objective: string
          offer: string | null
          owner_user_id: string | null
          pricing_version: string | null
          product_version: string | null
          results: Json
          spend_cents: number
          start_date: string | null
          status: string
          stop_conditions: Json
          support_reviewed: boolean
          updated_at: string
          volume_cap: number | null
        }
        Insert: {
          approval_id?: string | null
          attribution_params?: Json
          audience?: string | null
          budget_cents?: number | null
          campaign_key: string
          capacity_reviewed?: boolean
          channel_id?: string | null
          claims_reviewed?: boolean
          created_at?: string
          creative_version?: string | null
          end_date?: string | null
          experiment_id?: string | null
          id?: string
          landing_page_path?: string | null
          message?: string | null
          name: string
          objective: string
          offer?: string | null
          owner_user_id?: string | null
          pricing_version?: string | null
          product_version?: string | null
          results?: Json
          spend_cents?: number
          start_date?: string | null
          status?: string
          stop_conditions?: Json
          support_reviewed?: boolean
          updated_at?: string
          volume_cap?: number | null
        }
        Update: {
          approval_id?: string | null
          attribution_params?: Json
          audience?: string | null
          budget_cents?: number | null
          campaign_key?: string
          capacity_reviewed?: boolean
          channel_id?: string | null
          claims_reviewed?: boolean
          created_at?: string
          creative_version?: string | null
          end_date?: string | null
          experiment_id?: string | null
          id?: string
          landing_page_path?: string | null
          message?: string | null
          name?: string
          objective?: string
          offer?: string | null
          owner_user_id?: string | null
          pricing_version?: string | null
          product_version?: string | null
          results?: Json
          spend_cents?: number
          start_date?: string | null
          status?: string
          stop_conditions?: Json
          support_reviewed?: boolean
          updated_at?: string
          volume_cap?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_campaigns_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "acquisition_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_campaigns_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_partners: {
        Row: {
          audience: string | null
          category: string
          commercial_terms_summary: string | null
          created_at: string
          data_sharing: string
          distribution_method: string | null
          exit_process: string | null
          id: string
          legal_review_status: string
          name: string
          owner_user_id: string | null
          product_fit: string | null
          renewal_date: string | null
          results: Json
          security_review_status: string
          status: string
          updated_at: string
          value_exchange: string | null
        }
        Insert: {
          audience?: string | null
          category: string
          commercial_terms_summary?: string | null
          created_at?: string
          data_sharing?: string
          distribution_method?: string | null
          exit_process?: string | null
          id?: string
          legal_review_status?: string
          name: string
          owner_user_id?: string | null
          product_fit?: string | null
          renewal_date?: string | null
          results?: Json
          security_review_status?: string
          status?: string
          updated_at?: string
          value_exchange?: string | null
        }
        Update: {
          audience?: string | null
          category?: string
          commercial_terms_summary?: string | null
          created_at?: string
          data_sharing?: string
          distribution_method?: string | null
          exit_process?: string | null
          id?: string
          legal_review_status?: string
          name?: string
          owner_user_id?: string | null
          product_fit?: string | null
          renewal_date?: string | null
          results?: Json
          security_review_status?: string
          status?: string
          updated_at?: string
          value_exchange?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_partners_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      heartbeat_events: {
        Row: {
          event_source: string | null
          external_event_id: string | null
          heartbeat_token_id: string
          id: number
          monitor_id: string
          organization_id: string
          received_at: string
          safe_metadata: Json | null
        }
        Insert: {
          event_source?: string | null
          external_event_id?: string | null
          heartbeat_token_id: string
          id?: never
          monitor_id: string
          organization_id: string
          received_at?: string
          safe_metadata?: Json | null
        }
        Update: {
          event_source?: string | null
          external_event_id?: string | null
          heartbeat_token_id?: string
          id?: never
          monitor_id?: string
          organization_id?: string
          received_at?: string
          safe_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "heartbeat_events_heartbeat_token_id_fkey"
            columns: ["heartbeat_token_id"]
            isOneToOne: false
            referencedRelation: "heartbeat_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heartbeat_events_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heartbeat_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      heartbeat_tokens: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          expected_interval_seconds: number
          grace_period_seconds: number
          id: string
          last_heartbeat_at: string | null
          masked_label: string
          monitor_id: string
          next_expected_at: string | null
          organization_id: string
          revoked_at: string | null
          rotated_at: string | null
          state: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          expected_interval_seconds: number
          grace_period_seconds?: number
          id?: string
          last_heartbeat_at?: string | null
          masked_label: string
          monitor_id: string
          next_expected_at?: string | null
          organization_id: string
          revoked_at?: string | null
          rotated_at?: string | null
          state?: string
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          expected_interval_seconds?: number
          grace_period_seconds?: number
          id?: string
          last_heartbeat_at?: string | null
          masked_label?: string
          monitor_id?: string
          next_expected_at?: string | null
          organization_id?: string
          revoked_at?: string | null
          rotated_at?: string | null
          state?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "heartbeat_tokens_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heartbeat_tokens_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heartbeat_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hiring_triggers: {
        Row: {
          budget_available: boolean
          created_at: string
          decision_record_id: string | null
          evaluated_at: string
          evidence: Json
          four_week_trend: string | null
          id: string
          label: string
          owner: string
          review_date: string | null
          role_category: string
          satisfied: boolean
          trigger_key: string
          updated_at: string
          workload_analysis: string | null
        }
        Insert: {
          budget_available?: boolean
          created_at?: string
          decision_record_id?: string | null
          evaluated_at?: string
          evidence?: Json
          four_week_trend?: string | null
          id?: string
          label: string
          owner: string
          review_date?: string | null
          role_category: string
          satisfied?: boolean
          trigger_key: string
          updated_at?: string
          workload_analysis?: string | null
        }
        Update: {
          budget_available?: boolean
          created_at?: string
          decision_record_id?: string | null
          evaluated_at?: string
          evidence?: Json
          four_week_trend?: string | null
          id?: string
          label?: string
          owner?: string
          review_date?: string | null
          role_category?: string
          satisfied?: boolean
          trigger_key?: string
          updated_at?: string
          workload_analysis?: string | null
        }
        Relationships: []
      }
      incident_acknowledgments: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          incident_id: string
          note: string | null
          organization_id: string
        }
        Insert: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          incident_id: string
          note?: string | null
          organization_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string
          note?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_acknowledgments_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_acknowledgments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_acknowledgments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_assignments: {
        Row: {
          action: string
          assigned_by_user_id: string | null
          assignee_user_id: string | null
          created_at: string
          id: string
          incident_id: string
          organization_id: string
        }
        Insert: {
          action?: string
          assigned_by_user_id?: string | null
          assignee_user_id?: string | null
          created_at?: string
          id?: string
          incident_id: string
          organization_id: string
        }
        Update: {
          action?: string
          assigned_by_user_id?: string | null
          assignee_user_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_assignments_assigned_by_user_id_fkey"
            columns: ["assigned_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_assignments_assignee_user_id_fkey"
            columns: ["assignee_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_assignments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_counters: {
        Row: {
          next_value: number
          organization_id: string
        }
        Insert: {
          next_value?: number
          organization_id: string
        }
        Update: {
          next_value?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_counters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_delivery_outbox: {
        Row: {
          created_at: string
          event_type: string
          id: string
          idempotency_key: string
          incident_id: string | null
          monitor_id: string | null
          occurred_at: string
          organization_id: string
          payload: Json
          schema_version: number
          status: string
          suppression_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          idempotency_key: string
          incident_id?: string | null
          monitor_id?: string | null
          occurred_at?: string
          organization_id: string
          payload?: Json
          schema_version?: number
          status?: string
          suppression_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          idempotency_key?: string
          incident_id?: string | null
          monitor_id?: string | null
          occurred_at?: string
          organization_id?: string
          payload?: Json
          schema_version?: number
          status?: string
          suppression_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_delivery_outbox_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_delivery_outbox_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_delivery_outbox_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_events: {
        Row: {
          actor_kind: string
          actor_user_id: string | null
          created_at: string
          description: string | null
          event_type: string
          evidence_id: string | null
          id: string
          incident_id: string
          metadata: Json
          monitor_id: string | null
          occurred_at: string
          organization_id: string
          region: string | null
          sequence: number
          title: string
          visibility: string
        }
        Insert: {
          actor_kind?: string
          actor_user_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          evidence_id?: string | null
          id?: string
          incident_id: string
          metadata?: Json
          monitor_id?: string | null
          occurred_at?: string
          organization_id: string
          region?: string | null
          sequence: number
          title: string
          visibility?: string
        }
        Update: {
          actor_kind?: string
          actor_user_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          evidence_id?: string | null
          id?: string
          incident_id?: string
          metadata?: Json
          monitor_id?: string | null
          occurred_at?: string
          organization_id?: string
          region?: string | null
          sequence?: number
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_events_evidence_fk"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "incident_evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_events_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_evidence: {
        Row: {
          attempt_count: number | null
          checked_at: string | null
          created_at: string
          execution_id: string | null
          failure_category: string | null
          http_status: number | null
          id: string
          incident_id: string
          metadata: Json
          monitor_id: string | null
          monitor_version_id: string | null
          organization_id: string
          region: string | null
          response_time_ms: number | null
          result_status: string | null
          role: string
          safe_failure_summary: string | null
          scheduled_for: string | null
          tls_summary: Json | null
        }
        Insert: {
          attempt_count?: number | null
          checked_at?: string | null
          created_at?: string
          execution_id?: string | null
          failure_category?: string | null
          http_status?: number | null
          id?: string
          incident_id: string
          metadata?: Json
          monitor_id?: string | null
          monitor_version_id?: string | null
          organization_id: string
          region?: string | null
          response_time_ms?: number | null
          result_status?: string | null
          role?: string
          safe_failure_summary?: string | null
          scheduled_for?: string | null
          tls_summary?: Json | null
        }
        Update: {
          attempt_count?: number | null
          checked_at?: string | null
          created_at?: string
          execution_id?: string | null
          failure_category?: string | null
          http_status?: number | null
          id?: string
          incident_id?: string
          metadata?: Json
          monitor_id?: string | null
          monitor_version_id?: string | null
          organization_id?: string
          region?: string | null
          response_time_ms?: number | null
          result_status?: string | null
          role?: string
          safe_failure_summary?: string | null
          scheduled_for?: string | null
          tls_summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_evidence_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_evidence_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_evidence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_follow_up_actions: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          due_date: string | null
          id: string
          incident_id: string
          organization_id: string
          owner_user_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          incident_id: string
          organization_id: string
          owner_user_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          incident_id?: string
          organization_id?: string
          owner_user_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_follow_up_actions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_follow_up_actions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_follow_up_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_follow_up_actions_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_monitors: {
        Row: {
          attach_origin: string
          attached_at: string
          attached_by_user_id: string | null
          id: string
          incident_id: string
          monitor_id: string
          monitor_name_snapshot: string | null
          organization_id: string
          relationship: string
          relationship_note: string | null
          removed_at: string | null
        }
        Insert: {
          attach_origin?: string
          attached_at?: string
          attached_by_user_id?: string | null
          id?: string
          incident_id: string
          monitor_id: string
          monitor_name_snapshot?: string | null
          organization_id: string
          relationship?: string
          relationship_note?: string | null
          removed_at?: string | null
        }
        Update: {
          attach_origin?: string
          attached_at?: string
          attached_by_user_id?: string | null
          id?: string
          incident_id?: string
          monitor_id?: string
          monitor_name_snapshot?: string | null
          organization_id?: string
          relationship?: string
          relationship_note?: string | null
          removed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_monitors_attached_by_user_id_fkey"
            columns: ["attached_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_monitors_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_monitors_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_monitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_notes: {
        Row: {
          author_user_id: string | null
          body: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          incident_id: string
          organization_id: string
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          incident_id: string
          organization_id: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          incident_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_notes_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_notes_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_public_projections: {
        Row: {
          affected_components: Json
          incident_id: string
          opened_at: string | null
          organization_id: string
          public_status: string
          public_summary: string | null
          public_title: string | null
          public_updates: Json
          resolved_at: string | null
          severity: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          affected_components?: Json
          incident_id: string
          opened_at?: string | null
          organization_id: string
          public_status?: string
          public_summary?: string | null
          public_title?: string | null
          public_updates?: Json
          resolved_at?: string | null
          severity?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          affected_components?: Json
          incident_id?: string
          opened_at?: string | null
          organization_id?: string
          public_status?: string
          public_summary?: string | null
          public_title?: string | null
          public_updates?: Json
          resolved_at?: string | null
          severity?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_public_projections_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: true
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_public_projections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_recap_revisions: {
        Row: {
          changed_by_user_id: string | null
          created_at: string
          field: string
          id: string
          new_value: string | null
          organization_id: string
          previous_value: string | null
          recap_id: string
        }
        Insert: {
          changed_by_user_id?: string | null
          created_at?: string
          field: string
          id?: string
          new_value?: string | null
          organization_id: string
          previous_value?: string | null
          recap_id: string
        }
        Update: {
          changed_by_user_id?: string | null
          created_at?: string
          field?: string
          id?: string
          new_value?: string | null
          organization_id?: string
          previous_value?: string | null
          recap_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_recap_revisions_changed_by_user_id_fkey"
            columns: ["changed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_recap_revisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_recap_revisions_recap_id_fkey"
            columns: ["recap_id"]
            isOneToOne: false
            referencedRelation: "incident_recaps"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_recaps: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          incident_id: string
          organization_id: string
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          revision: number
          root_cause: string | null
          root_cause_updated_at: string | null
          root_cause_updated_by: string | null
          snapshot: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          incident_id: string
          organization_id: string
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          revision?: number
          root_cause?: string | null
          root_cause_updated_at?: string | null
          root_cause_updated_by?: string | null
          snapshot: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          incident_id?: string
          organization_id?: string
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          revision?: number
          root_cause?: string | null
          root_cause_updated_at?: string | null
          root_cause_updated_by?: string | null
          snapshot?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_recaps_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: true
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_recaps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_recaps_reviewed_by_user_id_fkey"
            columns: ["reviewed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_recaps_root_cause_updated_by_fkey"
            columns: ["root_cause_updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_state_transitions: {
        Row: {
          evaluation_version: number
          execution_id: string | null
          from_state: string
          id: string
          incident_id: string | null
          metadata: Json
          monitor_id: string | null
          occurred_at: string
          organization_id: string
          reason: string | null
          to_state: string
          trigger: string
        }
        Insert: {
          evaluation_version?: number
          execution_id?: string | null
          from_state: string
          id?: string
          incident_id?: string | null
          metadata?: Json
          monitor_id?: string | null
          occurred_at?: string
          organization_id: string
          reason?: string | null
          to_state: string
          trigger?: string
        }
        Update: {
          evaluation_version?: number
          execution_id?: string | null
          from_state?: string
          id?: string
          incident_id?: string | null
          metadata?: Json
          monitor_id?: string | null
          occurred_at?: string
          organization_id?: string
          reason?: string | null
          to_state?: string
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_state_transitions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_state_transitions_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_state_transitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_suppressions: {
        Row: {
          created_at: string
          execution_id: string | null
          expires_at: string | null
          id: string
          incident_id: string | null
          maintenance_occurrence_id: string | null
          monitor_id: string | null
          organization_id: string
          reason: string
        }
        Insert: {
          created_at?: string
          execution_id?: string | null
          expires_at?: string | null
          id?: string
          incident_id?: string | null
          maintenance_occurrence_id?: string | null
          monitor_id?: string | null
          organization_id: string
          reason: string
        }
        Update: {
          created_at?: string
          execution_id?: string | null
          expires_at?: string | null
          id?: string
          incident_id?: string | null
          maintenance_occurrence_id?: string | null
          monitor_id?: string | null
          organization_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_suppressions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_suppressions_maintenance_occurrence_id_fkey"
            columns: ["maintenance_occurrence_id"]
            isOneToOne: false
            referencedRelation: "maintenance_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_suppressions_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_suppressions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_updates: {
        Row: {
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          incident_id: string
          organization_id: string
          superseded_at: string | null
          supersedes_update_id: string | null
          update_type: string
          visibility: string
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          incident_id: string
          organization_id: string
          superseded_at?: string | null
          supersedes_update_id?: string | null
          update_type?: string
          visibility?: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          incident_id?: string
          organization_id?: string
          superseded_at?: string | null
          supersedes_update_id?: string | null
          update_type?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_updates_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_updates_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_updates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_updates_supersedes_update_id_fkey"
            columns: ["supersedes_update_id"]
            isOneToOne: false
            referencedRelation: "incident_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by_user_id: string | null
          active_maintenance_occurrence_id: string | null
          affected_monitor_count: number
          canceled_at: string | null
          canceled_by_user_id: string | null
          cancellation_reason: string | null
          correlation_generation: number
          correlation_key: string
          created_at: string
          created_by_user_id: string | null
          current_assignee_user_id: string | null
          deleted_at: string | null
          evaluation_version: number
          first_failure_at: string | null
          id: string
          internal_summary: string | null
          is_flapping: boolean
          last_transition_at: string
          lifecycle_status: string
          metadata: Json
          opened_at: string
          operational_status: string
          organization_id: string
          origin: string
          primary_monitor_id: string | null
          public_summary: string | null
          public_title: string | null
          public_visibility: string
          recovery_started_at: string | null
          reference_code: string | null
          resolution_summary: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          severity: string
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by_user_id?: string | null
          active_maintenance_occurrence_id?: string | null
          affected_monitor_count?: number
          canceled_at?: string | null
          canceled_by_user_id?: string | null
          cancellation_reason?: string | null
          correlation_generation?: number
          correlation_key: string
          created_at?: string
          created_by_user_id?: string | null
          current_assignee_user_id?: string | null
          deleted_at?: string | null
          evaluation_version?: number
          first_failure_at?: string | null
          id?: string
          internal_summary?: string | null
          is_flapping?: boolean
          last_transition_at?: string
          lifecycle_status?: string
          metadata?: Json
          opened_at?: string
          operational_status?: string
          organization_id: string
          origin?: string
          primary_monitor_id?: string | null
          public_summary?: string | null
          public_title?: string | null
          public_visibility?: string
          recovery_started_at?: string | null
          reference_code?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity?: string
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by_user_id?: string | null
          active_maintenance_occurrence_id?: string | null
          affected_monitor_count?: number
          canceled_at?: string | null
          canceled_by_user_id?: string | null
          cancellation_reason?: string | null
          correlation_generation?: number
          correlation_key?: string
          created_at?: string
          created_by_user_id?: string | null
          current_assignee_user_id?: string | null
          deleted_at?: string | null
          evaluation_version?: number
          first_failure_at?: string | null
          id?: string
          internal_summary?: string | null
          is_flapping?: boolean
          last_transition_at?: string
          lifecycle_status?: string
          metadata?: Json
          opened_at?: string
          operational_status?: string
          organization_id?: string
          origin?: string
          primary_monitor_id?: string | null
          public_summary?: string | null
          public_title?: string | null
          public_visibility?: string
          recovery_started_at?: string | null
          reference_code?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity?: string
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_acknowledged_by_user_id_fkey"
            columns: ["acknowledged_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_active_maintenance_fk"
            columns: ["active_maintenance_occurrence_id"]
            isOneToOne: false
            referencedRelation: "maintenance_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_canceled_by_user_id_fkey"
            columns: ["canceled_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_current_assignee_user_id_fkey"
            columns: ["current_assignee_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_primary_monitor_id_fkey"
            columns: ["primary_monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_resolved_by_user_id_fkey"
            columns: ["resolved_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_delivery_attempts: {
        Row: {
          attempt_number: number
          completed_at: string | null
          duration_ms: number | null
          error_category: string | null
          http_status: number | null
          id: string
          intent_id: string
          next_retry_at: string | null
          organization_id: string | null
          provider_message_id: string | null
          result: string
          safe_summary: string | null
          started_at: string
        }
        Insert: {
          attempt_number: number
          completed_at?: string | null
          duration_ms?: number | null
          error_category?: string | null
          http_status?: number | null
          id?: string
          intent_id: string
          next_retry_at?: string | null
          organization_id?: string | null
          provider_message_id?: string | null
          result: string
          safe_summary?: string | null
          started_at?: string
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          duration_ms?: number | null
          error_category?: string | null
          http_status?: number | null
          id?: string
          intent_id?: string
          next_retry_at?: string | null
          organization_id?: string | null
          provider_message_id?: string | null
          result?: string
          safe_summary?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_delivery_attempts_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "lifecycle_delivery_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_delivery_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_delivery_intents: {
        Row: {
          attempt_count: number
          completed_at: string | null
          created_at: string
          dedup_key: string
          id: string
          last_error_category: string | null
          lease_expires_at: string | null
          locked_at: string | null
          locked_by_worker: string | null
          max_attempts: number
          message_class: string
          message_key: string
          organization_id: string | null
          payload: Json
          related_id: string | null
          related_type: string | null
          scheduled_at: string
          status: string
          suppression_reason: string | null
          template_version: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          dedup_key: string
          id?: string
          last_error_category?: string | null
          lease_expires_at?: string | null
          locked_at?: string | null
          locked_by_worker?: string | null
          max_attempts?: number
          message_class: string
          message_key: string
          organization_id?: string | null
          payload?: Json
          related_id?: string | null
          related_type?: string | null
          scheduled_at?: string
          status?: string
          suppression_reason?: string | null
          template_version?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          dedup_key?: string
          id?: string
          last_error_category?: string | null
          lease_expires_at?: string | null
          locked_at?: string | null
          locked_by_worker?: string | null
          max_attempts?: number
          message_class?: string
          message_key?: string
          organization_id?: string | null
          payload?: Json
          related_id?: string | null
          related_type?: string | null
          scheduled_at?: string
          status?: string
          suppression_reason?: string | null
          template_version?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_delivery_intents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_delivery_intents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_email_preferences: {
        Row: {
          created_at: string
          incident_recaps: boolean
          reactivation_reminders: boolean
          setup_guidance: boolean
          updated_at: string
          usage_notices: boolean
          user_id: string
          weekly_report: boolean
        }
        Insert: {
          created_at?: string
          incident_recaps?: boolean
          reactivation_reminders?: boolean
          setup_guidance?: boolean
          updated_at?: string
          usage_notices?: boolean
          user_id: string
          weekly_report?: boolean
        }
        Update: {
          created_at?: string
          incident_recaps?: boolean
          reactivation_reminders?: boolean
          setup_guidance?: boolean
          updated_at?: string
          usage_notices?: boolean
          user_id?: string
          weekly_report?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_email_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_events: {
        Row: {
          created_at: string
          detail: Json
          event_type: string
          id: string
          organization_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: Json
          event_type: string
          id?: string
          organization_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: Json
          event_type?: string
          id?: string
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_states: {
        Row: {
          computed_at: string
          created_at: string
          organization_id: string
          previous_state: string | null
          reasons: Json
          state: string
          updated_at: string
        }
        Insert: {
          computed_at?: string
          created_at?: string
          organization_id: string
          previous_state?: string | null
          reasons?: Json
          state?: string
          updated_at?: string
        }
        Update: {
          computed_at?: string
          created_at?: string
          organization_id?: string
          previous_state?: string | null
          reasons?: Json
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_states_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_suppressions: {
        Row: {
          created_at: string
          id: string
          provider_event_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_event_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_event_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_suppressions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_monitor_links: {
        Row: {
          created_at: string
          id: string
          maintenance_window_id: string
          monitor_id: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          maintenance_window_id: string
          monitor_id: string
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          maintenance_window_id?: string
          monitor_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_monitor_links_maintenance_window_id_fkey"
            columns: ["maintenance_window_id"]
            isOneToOne: false
            referencedRelation: "maintenance_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_monitor_links_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_monitor_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_occurrences: {
        Row: {
          created_at: string
          ended_at: string | null
          ends_at: string
          id: string
          maintenance_window_id: string
          organization_id: string
          started_at: string | null
          starts_at: string
          status: string
          suppressed_failure_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          ends_at: string
          id?: string
          maintenance_window_id: string
          organization_id: string
          started_at?: string | null
          starts_at: string
          status?: string
          suppressed_failure_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          ends_at?: string
          id?: string
          maintenance_window_id?: string
          organization_id?: string
          started_at?: string | null
          starts_at?: string
          status?: string
          suppressed_failure_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_occurrences_maintenance_window_id_fkey"
            columns: ["maintenance_window_id"]
            isOneToOne: false
            referencedRelation: "maintenance_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_occurrences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_windows: {
        Row: {
          canceled_at: string | null
          canceled_by_user_id: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          ends_at: string
          id: string
          internal_notes: string | null
          name: string
          organization_id: string
          public_summary: string | null
          public_visibility: string
          recurrence: string
          starts_at: string
          status: string
          suppression_policy: string
          timezone: string
          updated_at: string
        }
        Insert: {
          canceled_at?: string | null
          canceled_by_user_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          ends_at: string
          id?: string
          internal_notes?: string | null
          name: string
          organization_id: string
          public_summary?: string | null
          public_visibility?: string
          recurrence?: string
          starts_at: string
          status?: string
          suppression_policy?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          canceled_at?: string | null
          canceled_by_user_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          internal_notes?: string | null
          name?: string
          organization_id?: string
          public_summary?: string | null
          public_visibility?: string
          recurrence?: string
          starts_at?: string
          status?: string
          suppression_policy?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_windows_canceled_by_user_id_fkey"
            columns: ["canceled_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_windows_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_windows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          activated_organizations: number
          created_at: string
          id: string
          last_reviewed_at: string | null
          listing_url: string | null
          logo_version: string | null
          notes: string | null
          owner_user_id: string | null
          paid_organizations: number
          platform: string
          pricing_version: string | null
          product_description_version: string | null
          referral_params: Json
          retained_organizations: number
          status: string
          traffic: number
          updated_at: string
        }
        Insert: {
          activated_organizations?: number
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          listing_url?: string | null
          logo_version?: string | null
          notes?: string | null
          owner_user_id?: string | null
          paid_organizations?: number
          platform: string
          pricing_version?: string | null
          product_description_version?: string | null
          referral_params?: Json
          retained_organizations?: number
          status?: string
          traffic?: number
          updated_at?: string
        }
        Update: {
          activated_organizations?: number
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          listing_url?: string | null
          logo_version?: string | null
          notes?: string | null
          owner_user_id?: string | null
          paid_organizations?: number
          platform?: string
          pricing_version?: string | null
          product_description_version?: string | null
          referral_params?: Json
          retained_organizations?: number
          status?: string
          traffic?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_assertions: {
        Row: {
          assertion_type: string
          case_sensitive: boolean
          created_at: string
          enabled: boolean
          expected_value: string | null
          expected_value_type: string
          field_path: string | null
          id: string
          monitor_id: string
          monitor_version_id: string
          operator: string | null
          organization_id: string
          position: number
        }
        Insert: {
          assertion_type: string
          case_sensitive?: boolean
          created_at?: string
          enabled?: boolean
          expected_value?: string | null
          expected_value_type?: string
          field_path?: string | null
          id?: string
          monitor_id: string
          monitor_version_id: string
          operator?: string | null
          organization_id: string
          position?: number
        }
        Update: {
          assertion_type?: string
          case_sensitive?: boolean
          created_at?: string
          enabled?: boolean
          expected_value?: string | null
          expected_value_type?: string
          field_path?: string | null
          id?: string
          monitor_id?: string
          monitor_version_id?: string
          operator?: string | null
          organization_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "monitor_assertions_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_assertions_monitor_version_id_fkey"
            columns: ["monitor_version_id"]
            isOneToOne: false
            referencedRelation: "monitor_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_assertions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          error_summary: string | null
          expires_at: string | null
          format: string
          id: string
          monitor_id: string | null
          organization_id: string
          requested_by_user_id: string | null
          row_count: number | null
          scope: string
          status: string
          storage_path: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_summary?: string | null
          expires_at?: string | null
          format: string
          id?: string
          monitor_id?: string | null
          organization_id: string
          requested_by_user_id?: string | null
          row_count?: number | null
          scope: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_summary?: string | null
          expires_at?: string | null
          format?: string
          id?: string
          monitor_id?: string | null
          organization_id?: string
          requested_by_user_id?: string | null
          row_count?: number | null
          scope?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitor_export_requests_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_export_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_export_requests_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_groups: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_groups_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_leases: {
        Row: {
          id: string
          idempotency_key: string
          lease_expires_at: string
          leased_at: string
          monitor_id: string
          monitor_version_id: string
          organization_id: string
          outcome: string | null
          region: string
          released_at: string | null
          schedule_generation: number
          scheduled_for: string
          worker_id: string
        }
        Insert: {
          id?: string
          idempotency_key: string
          lease_expires_at: string
          leased_at?: string
          monitor_id: string
          monitor_version_id: string
          organization_id: string
          outcome?: string | null
          region: string
          released_at?: string | null
          schedule_generation: number
          scheduled_for: string
          worker_id: string
        }
        Update: {
          id?: string
          idempotency_key?: string
          lease_expires_at?: string
          leased_at?: string
          monitor_id?: string
          monitor_version_id?: string
          organization_id?: string
          outcome?: string | null
          region?: string
          released_at?: string | null
          schedule_generation?: number
          scheduled_for?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_leases_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_leases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_operational_states: {
        Row: {
          active_incident_id: string | null
          consecutive_eligible_failures: number
          consecutive_eligible_successes: number
          evaluation_version: number
          flapping_since: string | null
          last_eligible_failure_at: string | null
          last_eligible_success_at: string | null
          last_evaluated_checked_at: string | null
          last_evaluated_execution_id: string | null
          lock_version: number
          maintenance_occurrence_id: string | null
          monitor_id: string
          organization_id: string
          pre_maintenance_state: string | null
          recent_transition_count: number
          recent_window_started_at: string | null
          recovery_started_at: string | null
          state: string
          state_since: string
          updated_at: string
          verification_started_at: string | null
        }
        Insert: {
          active_incident_id?: string | null
          consecutive_eligible_failures?: number
          consecutive_eligible_successes?: number
          evaluation_version?: number
          flapping_since?: string | null
          last_eligible_failure_at?: string | null
          last_eligible_success_at?: string | null
          last_evaluated_checked_at?: string | null
          last_evaluated_execution_id?: string | null
          lock_version?: number
          maintenance_occurrence_id?: string | null
          monitor_id: string
          organization_id: string
          pre_maintenance_state?: string | null
          recent_transition_count?: number
          recent_window_started_at?: string | null
          recovery_started_at?: string | null
          state?: string
          state_since?: string
          updated_at?: string
          verification_started_at?: string | null
        }
        Update: {
          active_incident_id?: string | null
          consecutive_eligible_failures?: number
          consecutive_eligible_successes?: number
          evaluation_version?: number
          flapping_since?: string | null
          last_eligible_failure_at?: string | null
          last_eligible_success_at?: string | null
          last_evaluated_checked_at?: string | null
          last_evaluated_execution_id?: string | null
          lock_version?: number
          maintenance_occurrence_id?: string | null
          monitor_id?: string
          organization_id?: string
          pre_maintenance_state?: string | null
          recent_transition_count?: number
          recent_window_started_at?: string | null
          recovery_started_at?: string | null
          state?: string
          state_since?: string
          updated_at?: string
          verification_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitor_operational_states_active_incident_fk"
            columns: ["active_incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_operational_states_maintenance_fk"
            columns: ["maintenance_occurrence_id"]
            isOneToOne: false
            referencedRelation: "maintenance_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_operational_states_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: true
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_operational_states_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_regions: {
        Row: {
          code: string
          created_at: string
          display_name: string
          is_public: boolean
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          display_name: string
          is_public?: boolean
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          display_name?: string
          is_public?: boolean
          status?: string
        }
        Relationships: []
      }
      monitor_secrets: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          encrypted_payload: string
          encryption_key_version: number
          header_name: string | null
          id: string
          masked_label: string
          monitor_id: string
          organization_id: string
          rotated_at: string | null
          secret_type: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          encrypted_payload: string
          encryption_key_version: number
          header_name?: string | null
          id?: string
          masked_label: string
          monitor_id: string
          organization_id: string
          rotated_at?: string | null
          secret_type: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          encrypted_payload?: string
          encryption_key_version?: number
          header_name?: string | null
          id?: string
          masked_label?: string
          monitor_id?: string
          organization_id?: string
          rotated_at?: string | null
          secret_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_secrets_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_secrets_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_secrets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_security_events: {
        Row: {
          correlation_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          monitor_id: string | null
          organization_id: string | null
          safe_summary: string
          severity: string
          worker_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          monitor_id?: string | null
          organization_id?: string | null
          safe_summary: string
          severity?: string
          worker_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          monitor_id?: string | null
          organization_id?: string | null
          safe_summary?: string
          severity?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitor_security_events_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_state_evaluations: {
        Row: {
          attempts: number
          enqueued_at: string
          execution_id: string
          id: string
          last_error: string | null
          locked_at: string | null
          monitor_id: string
          organization_id: string
          processed_at: string | null
          source: string
          status: string
        }
        Insert: {
          attempts?: number
          enqueued_at?: string
          execution_id: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          monitor_id: string
          organization_id: string
          processed_at?: string | null
          source?: string
          status?: string
        }
        Update: {
          attempts?: number
          enqueued_at?: string
          execution_id?: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          monitor_id?: string
          organization_id?: string
          processed_at?: string | null
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_state_evaluations_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_state_evaluations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_tag_assignments: {
        Row: {
          created_at: string
          monitor_id: string
          organization_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          monitor_id: string
          organization_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          monitor_id?: string
          organization_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_tag_assignments_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_tag_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "monitor_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_tags: {
        Row: {
          color_token: string
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          color_token?: string
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          color_token?: string
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_tags_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_versions: {
        Row: {
          change_summary: string | null
          configuration_snapshot: Json
          created_at: string
          created_by_user_id: string | null
          id: string
          monitor_id: string
          organization_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          configuration_snapshot: Json
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          monitor_id: string
          organization_id: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          configuration_snapshot?: Json
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          monitor_id?: string
          organization_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "monitor_versions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_versions_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitor_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_worker_heartbeats: {
        Row: {
          active_lease_count: number | null
          avg_execution_ms: number | null
          id: number
          queue_lag_seconds: number | null
          region: string | null
          reported_at: string
          status: string | null
          worker_id: string
        }
        Insert: {
          active_lease_count?: number | null
          avg_execution_ms?: number | null
          id?: never
          queue_lag_seconds?: number | null
          region?: string | null
          reported_at?: string
          status?: string | null
          worker_id: string
        }
        Update: {
          active_lease_count?: number | null
          avg_execution_ms?: number | null
          id?: never
          queue_lag_seconds?: number | null
          region?: string | null
          reported_at?: string
          status?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_worker_heartbeats_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "monitor_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_workers: {
        Row: {
          active_lease_count: number
          avg_execution_ms: number | null
          build_commit: string | null
          check_capacity: number | null
          contract_version: number
          created_at: string
          deployment_id: string | null
          id: string
          last_heartbeat_at: string | null
          queue_lag_seconds: number | null
          recent_failure_count: number
          recent_success_count: number
          region: string
          shutdown_requested: boolean
          started_at: string | null
          status: string
          updated_at: string
          version: string | null
          worker_key: string
        }
        Insert: {
          active_lease_count?: number
          avg_execution_ms?: number | null
          build_commit?: string | null
          check_capacity?: number | null
          contract_version?: number
          created_at?: string
          deployment_id?: string | null
          id?: string
          last_heartbeat_at?: string | null
          queue_lag_seconds?: number | null
          recent_failure_count?: number
          recent_success_count?: number
          region: string
          shutdown_requested?: boolean
          started_at?: string | null
          status?: string
          updated_at?: string
          version?: string | null
          worker_key: string
        }
        Update: {
          active_lease_count?: number
          avg_execution_ms?: number | null
          build_commit?: string | null
          check_capacity?: number | null
          contract_version?: number
          created_at?: string
          deployment_id?: string | null
          id?: string
          last_heartbeat_at?: string | null
          queue_lag_seconds?: number | null
          recent_failure_count?: number
          recent_success_count?: number
          region?: string
          shutdown_requested?: boolean
          started_at?: string | null
          status?: string
          updated_at?: string
          version?: string | null
          worker_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_workers_region_fkey"
            columns: ["region"]
            isOneToOne: false
            referencedRelation: "monitor_regions"
            referencedColumns: ["code"]
          },
        ]
      }
      monitors: {
        Row: {
          archived_at: string | null
          body_size_limit_bytes: number
          check_interval_seconds: number
          consecutive_failures: number
          consecutive_successes: number
          created_at: string
          created_by_user_id: string | null
          criticality: string
          current_version_id: string | null
          degraded_response_time_ms: number | null
          deleted_at: string | null
          description: string | null
          expected_status_codes: number[]
          failure_confirmation_threshold: number
          follow_redirects: boolean
          group_id: string | null
          http_method: string
          id: string
          incident_reopen_window_seconds: number
          incident_suppressed: boolean
          last_check_at: string | null
          last_failure_at: string | null
          last_response_time_ms: number | null
          last_result_status: string | null
          last_success_at: string | null
          max_redirects: number
          monitor_type: string
          name: string
          next_check_at: string | null
          normalized_url: string | null
          organization_id: string
          paused_at: string | null
          recovery_confirmation_threshold: number
          region_policy: string
          response_time_threshold_ms: number | null
          retry_count: number
          retry_delay_ms: number
          status: string
          target_url: string | null
          timeout_ms: number
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          body_size_limit_bytes?: number
          check_interval_seconds?: number
          consecutive_failures?: number
          consecutive_successes?: number
          created_at?: string
          created_by_user_id?: string | null
          criticality?: string
          current_version_id?: string | null
          degraded_response_time_ms?: number | null
          deleted_at?: string | null
          description?: string | null
          expected_status_codes?: number[]
          failure_confirmation_threshold?: number
          follow_redirects?: boolean
          group_id?: string | null
          http_method?: string
          id?: string
          incident_reopen_window_seconds?: number
          incident_suppressed?: boolean
          last_check_at?: string | null
          last_failure_at?: string | null
          last_response_time_ms?: number | null
          last_result_status?: string | null
          last_success_at?: string | null
          max_redirects?: number
          monitor_type: string
          name: string
          next_check_at?: string | null
          normalized_url?: string | null
          organization_id: string
          paused_at?: string | null
          recovery_confirmation_threshold?: number
          region_policy?: string
          response_time_threshold_ms?: number | null
          retry_count?: number
          retry_delay_ms?: number
          status?: string
          target_url?: string | null
          timeout_ms?: number
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          body_size_limit_bytes?: number
          check_interval_seconds?: number
          consecutive_failures?: number
          consecutive_successes?: number
          created_at?: string
          created_by_user_id?: string | null
          criticality?: string
          current_version_id?: string | null
          degraded_response_time_ms?: number | null
          deleted_at?: string | null
          description?: string | null
          expected_status_codes?: number[]
          failure_confirmation_threshold?: number
          follow_redirects?: boolean
          group_id?: string | null
          http_method?: string
          id?: string
          incident_reopen_window_seconds?: number
          incident_suppressed?: boolean
          last_check_at?: string | null
          last_failure_at?: string | null
          last_response_time_ms?: number | null
          last_result_status?: string | null
          last_success_at?: string | null
          max_redirects?: number
          monitor_type?: string
          name?: string
          next_check_at?: string | null
          normalized_url?: string | null
          organization_id?: string
          paused_at?: string | null
          recovery_confirmation_threshold?: number
          region_policy?: string
          response_time_threshold_ms?: number | null
          retry_count?: number
          retry_delay_ms?: number
          status?: string
          target_url?: string | null
          timeout_ms?: number
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitors_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitors_current_version_fk"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "monitor_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitors_group_fk"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "monitor_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitors_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          account_activity: boolean
          changelog_digest: boolean
          created_at: string
          education: boolean
          feature_announcements: boolean
          marketing: boolean
          product_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_activity?: boolean
          changelog_digest?: boolean
          created_at?: string
          education?: boolean
          feature_announcements?: boolean
          marketing?: boolean
          product_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_activity?: boolean
          changelog_digest?: boolean
          created_at?: string
          education?: boolean
          feature_announcements?: boolean
          marketing?: boolean
          product_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          href: string | null
          id: string
          organization_id: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category: string
          created_at?: string
          href?: string | null
          id?: string
          organization_id?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          href?: string | null
          id?: string
          organization_id?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          organization_id: string
          step_key: string | null
          user_id: string | null
          version: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          organization_id: string
          step_key?: string | null
          user_id?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          organization_id?: string
          step_key?: string | null
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_delegations: {
        Row: {
          audit_required: boolean
          backup: string | null
          created_at: string
          escalation: string | null
          id: string
          label: string
          owner: string
          permission: string | null
          quality_standard: string | null
          review_cadence: string
          runbook_path: string | null
          task_key: string
          updated_at: string
        }
        Insert: {
          audit_required?: boolean
          backup?: string | null
          created_at?: string
          escalation?: string | null
          id?: string
          label: string
          owner: string
          permission?: string | null
          quality_standard?: string | null
          review_cadence?: string
          runbook_path?: string | null
          task_key: string
          updated_at?: string
        }
        Update: {
          audit_required?: boolean
          backup?: string | null
          created_at?: string
          escalation?: string | null
          id?: string
          label?: string
          owner?: string
          permission?: string | null
          quality_standard?: string | null
          review_cadence?: string
          runbook_path?: string | null
          task_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string | null
          organization_id: string
          revoked_at: string | null
          role: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by_user_id?: string | null
          organization_id: string
          revoked_at?: string | null
          role?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string | null
          organization_id?: string
          revoked_at?: string | null
          role?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_accepted_by_user_id_fkey"
            columns: ["accepted_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_by_user_id: string | null
          joined_at: string
          organization_id: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by_user_id?: string | null
          joined_at?: string
          organization_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by_user_id?: string | null
          joined_at?: string
          organization_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_onboarding: {
        Row: {
          activated_at: string | null
          alert_destination: string | null
          alert_path_ready_at: string | null
          checklist_dismissed_at: string | null
          completed_at: string | null
          created_at: string
          first_concern: string | null
          first_monitor_activated_at: string | null
          first_real_check_at: string | null
          monitoring_scope: string | null
          organization_id: string
          plans_status_page: boolean | null
          responsibility_role: string | null
          service_count: string | null
          status_page_ready_at: string | null
          steps: Json
          updated_at: string
          use_case: string | null
          version: number
        }
        Insert: {
          activated_at?: string | null
          alert_destination?: string | null
          alert_path_ready_at?: string | null
          checklist_dismissed_at?: string | null
          completed_at?: string | null
          created_at?: string
          first_concern?: string | null
          first_monitor_activated_at?: string | null
          first_real_check_at?: string | null
          monitoring_scope?: string | null
          organization_id: string
          plans_status_page?: boolean | null
          responsibility_role?: string | null
          service_count?: string | null
          status_page_ready_at?: string | null
          steps?: Json
          updated_at?: string
          use_case?: string | null
          version?: number
        }
        Update: {
          activated_at?: string | null
          alert_destination?: string | null
          alert_path_ready_at?: string | null
          checklist_dismissed_at?: string | null
          completed_at?: string | null
          created_at?: string
          first_concern?: string | null
          first_monitor_activated_at?: string | null
          first_real_check_at?: string | null
          monitoring_scope?: string | null
          organization_id?: string
          plans_status_page?: boolean | null
          responsibility_role?: string | null
          service_count?: string | null
          status_page_ready_at?: string | null
          steps?: Json
          updated_at?: string
          use_case?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_onboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_onboarding_steps: {
        Row: {
          completed_at: string | null
          completed_by_user_id: string | null
          created_at: string
          id: string
          organization_id: string
          skipped_at: string | null
          source: string
          status: string
          step_key: string
          updated_at: string
          version: number
        }
        Insert: {
          completed_at?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          id?: string
          organization_id: string
          skipped_at?: string | null
          source?: string
          status?: string
          step_key: string
          updated_at?: string
          version?: number
        }
        Update: {
          completed_at?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          skipped_at?: string | null
          source?: string
          status?: string
          step_key?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_onboarding_steps_completed_by_user_id_fkey"
            columns: ["completed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_onboarding_steps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_report_settings: {
        Row: {
          created_at: string
          enabled: boolean
          organization_id: string
          updated_at: string
          week_start: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          organization_id: string
          updated_at?: string
          week_start?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          organization_id?: string
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_report_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          default_locale: string
          default_timezone: string
          deleted_at: string | null
          id: string
          is_internal: boolean
          logo_url: string | null
          name: string
          owner_user_id: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_locale?: string
          default_timezone?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          logo_url?: string | null
          name: string
          owner_user_id: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_locale?: string
          default_timezone?: string
          deleted_at?: string | null
          id?: string
          is_internal?: boolean
          logo_url?: string | null
          name?: string
          owner_user_id?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_agreements_metadata: {
        Row: {
          agreement_type: string
          created_at: string
          document_ref: string | null
          effective_date: string | null
          end_date: string | null
          id: string
          notes: string | null
          partner_id: string
        }
        Insert: {
          agreement_type: string
          created_at?: string
          document_ref?: string | null
          effective_date?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          partner_id: string
        }
        Update: {
          agreement_type?: string
          created_at?: string
          document_ref?: string | null
          effective_date?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_agreements_metadata_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "growth_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_ai_citation_observations: {
        Row: {
          ai_platform: string
          citation_accuracy: string | null
          citation_date: string
          citation_type: string | null
          cited_url: string | null
          content_version: string | null
          correction_needed: boolean
          created_at: string
          id: string
          notes: string | null
          owner: string | null
          query: string
          status: string
        }
        Insert: {
          ai_platform: string
          citation_accuracy?: string | null
          citation_date: string
          citation_type?: string | null
          cited_url?: string | null
          content_version?: string | null
          correction_needed?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          owner?: string | null
          query: string
          status?: string
        }
        Update: {
          ai_platform?: string
          citation_accuracy?: string | null
          citation_date?: string
          citation_type?: string | null
          cited_url?: string | null
          content_version?: string | null
          correction_needed?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          owner?: string | null
          query?: string
          status?: string
        }
        Relationships: []
      }
      platform_anomaly_events: {
        Row: {
          baseline_value: number | null
          created_at: string
          current_value: number | null
          customer_impact: string | null
          detected_at: string
          evidence: Json
          id: string
          owner_user_id: string | null
          platform_incident_id: string | null
          related_deployment: string | null
          related_provider: string | null
          rule_key: string
          state: string
          updated_at: string
        }
        Insert: {
          baseline_value?: number | null
          created_at?: string
          current_value?: number | null
          customer_impact?: string | null
          detected_at?: string
          evidence?: Json
          id?: string
          owner_user_id?: string | null
          platform_incident_id?: string | null
          related_deployment?: string | null
          related_provider?: string | null
          rule_key: string
          state?: string
          updated_at?: string
        }
        Update: {
          baseline_value?: number | null
          created_at?: string
          current_value?: number | null
          customer_impact?: string | null
          detected_at?: string
          evidence?: Json
          id?: string
          owner_user_id?: string | null
          platform_incident_id?: string | null
          related_deployment?: string | null
          related_provider?: string | null
          rule_key?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_anomaly_events_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_anomaly_events_platform_incident_id_fkey"
            columns: ["platform_incident_id"]
            isOneToOne: false
            referencedRelation: "platform_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_anomaly_events_rule_key_fkey"
            columns: ["rule_key"]
            isOneToOne: false
            referencedRelation: "platform_anomaly_rules"
            referencedColumns: ["rule_key"]
          },
        ]
      }
      platform_anomaly_rules: {
        Row: {
          baseline_description: string
          cooldown_minutes: number
          created_at: string
          display_name: string
          enabled: boolean
          minimum_sample: number
          notification_channel: string | null
          owner: string | null
          rule_key: string
          runbook_key: string | null
          severity: string
          source_metric: string
          threshold_description: string
          updated_at: string
          window_minutes: number
        }
        Insert: {
          baseline_description: string
          cooldown_minutes?: number
          created_at?: string
          display_name: string
          enabled?: boolean
          minimum_sample?: number
          notification_channel?: string | null
          owner?: string | null
          rule_key: string
          runbook_key?: string | null
          severity?: string
          source_metric: string
          threshold_description: string
          updated_at?: string
          window_minutes: number
        }
        Update: {
          baseline_description?: string
          cooldown_minutes?: number
          created_at?: string
          display_name?: string
          enabled?: boolean
          minimum_sample?: number
          notification_channel?: string | null
          owner?: string | null
          rule_key?: string
          runbook_key?: string | null
          severity?: string
          source_metric?: string
          threshold_description?: string
          updated_at?: string
          window_minutes?: number
        }
        Relationships: []
      }
      platform_approvals: {
        Row: {
          approval_type: string
          approver_user_id: string | null
          completed_at: string | null
          cooling_off_until: string | null
          correlation_id: string | null
          created_at: string
          decision_reason: string | null
          evidence: Json
          executed_at: string | null
          execution_result: Json | null
          expires_at: string | null
          id: string
          impact_summary: string | null
          reason: string
          requester_user_id: string
          risk_classification: string
          scope: Json
          state: string
          updated_at: string
        }
        Insert: {
          approval_type: string
          approver_user_id?: string | null
          completed_at?: string | null
          cooling_off_until?: string | null
          correlation_id?: string | null
          created_at?: string
          decision_reason?: string | null
          evidence?: Json
          executed_at?: string | null
          execution_result?: Json | null
          expires_at?: string | null
          id?: string
          impact_summary?: string | null
          reason: string
          requester_user_id: string
          risk_classification?: string
          scope?: Json
          state?: string
          updated_at?: string
        }
        Update: {
          approval_type?: string
          approver_user_id?: string | null
          completed_at?: string | null
          cooling_off_until?: string | null
          correlation_id?: string | null
          created_at?: string
          decision_reason?: string | null
          evidence?: Json
          executed_at?: string | null
          execution_result?: Json | null
          expires_at?: string | null
          id?: string
          impact_summary?: string | null
          reason?: string
          requester_user_id?: string
          risk_classification?: string
          scope?: Json
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_approvals_approver_user_id_fkey"
            columns: ["approver_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_approvals_requester_user_id_fkey"
            columns: ["requester_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_audit_sequence: {
        Row: {
          audit_event_id: string
          created_at: string
          id: number
          prev_hash: string | null
          row_hash: string
        }
        Insert: {
          audit_event_id: string
          created_at?: string
          id?: number
          prev_hash?: string | null
          row_hash: string
        }
        Update: {
          audit_event_id?: string
          created_at?: string
          id?: number
          prev_hash?: string | null
          row_hash?: string
        }
        Relationships: []
      }
      platform_calendar_items: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          due_at: string
          evidence: string | null
          id: string
          owner_user_id: string | null
          recurrence: string | null
          runbook_key: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          due_at: string
          evidence?: string | null
          id?: string
          owner_user_id?: string | null
          recurrence?: string | null
          runbook_key?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          due_at?: string
          evidence?: string | null
          id?: string
          owner_user_id?: string | null
          recurrence?: string | null
          runbook_key?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_calendar_items_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_claims_findings: {
        Row: {
          claim_key: string | null
          controlling_value: string | null
          created_at: string
          finding_type: string
          fix_recommendation: string | null
          id: string
          owner: string | null
          severity: string
          sources: string[]
          status: string
          updated_at: string
        }
        Insert: {
          claim_key?: string | null
          controlling_value?: string | null
          created_at?: string
          finding_type: string
          fix_recommendation?: string | null
          id?: string
          owner?: string | null
          severity?: string
          sources?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          claim_key?: string | null
          controlling_value?: string | null
          created_at?: string
          finding_type?: string
          fix_recommendation?: string | null
          id?: string
          owner?: string | null
          severity?: string
          sources?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_configuration_settings: {
        Row: {
          change_reason: string | null
          documentation_relationship: string | null
          environment: string
          key: string
          last_changed_at: string
          owner: string | null
          public_impact: boolean
          source: string
          value: Json
          version: string
        }
        Insert: {
          change_reason?: string | null
          documentation_relationship?: string | null
          environment?: string
          key: string
          last_changed_at?: string
          owner?: string | null
          public_impact?: boolean
          source?: string
          value: Json
          version?: string
        }
        Update: {
          change_reason?: string | null
          documentation_relationship?: string | null
          environment?: string
          key?: string
          last_changed_at?: string
          owner?: string | null
          public_impact?: boolean
          source?: string
          value?: Json
          version?: string
        }
        Relationships: []
      }
      platform_cost_anomalies: {
        Row: {
          baseline_cents: number | null
          confidence: string
          created_at: string
          current_cents: number | null
          id: string
          likely_drivers: string | null
          metric: string
          owner: string | null
          period_end: string
          period_start: string
          review_state: string
        }
        Insert: {
          baseline_cents?: number | null
          confidence?: string
          created_at?: string
          current_cents?: number | null
          id?: string
          likely_drivers?: string | null
          metric: string
          owner?: string | null
          period_end: string
          period_start: string
          review_state?: string
        }
        Update: {
          baseline_cents?: number | null
          confidence?: string
          created_at?: string
          current_cents?: number | null
          id?: string
          likely_drivers?: string | null
          metric?: string
          owner?: string | null
          period_end?: string
          period_start?: string
          review_state?: string
        }
        Relationships: []
      }
      platform_cost_entries: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          currency: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          provider_key: string
          source: string
        }
        Insert: {
          amount_cents: number
          category: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          provider_key: string
          source: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          provider_key?: string
          source?: string
        }
        Relationships: []
      }
      platform_customer_notes: {
        Row: {
          author_user_id: string
          body: string
          category: string
          created_at: string
          deleted_at: string | null
          id: string
          organization_id: string
          resource_id: string | null
          resource_type: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          author_user_id: string
          body: string
          category: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          organization_id: string
          resource_id?: string | null
          resource_type?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_user_id?: string
          body?: string
          category?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          organization_id?: string
          resource_id?: string | null
          resource_type?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_customer_notes_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_customer_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_daily_health: {
        Row: {
          activated_organizations: number
          active_monitors: number
          active_organizations: number
          alert_delivery_success_rate: number | null
          alert_state: string
          approval_backlog: number
          at_risk_organizations: number
          calculation_version: string
          check_success_rate: number | null
          checks_completed: number
          checks_delayed: number
          collected_revenue_cents: number
          completeness: string
          critical_security_events: number
          database_state: string
          day: string
          monitoring_state: string
          mrr_cents: number
          open_customer_incidents: number
          overall_state: string
          provider_state: string
          reconciliation_differences: number
          refreshed_at: string
          status_page_state: string
          worker_state: string
        }
        Insert: {
          activated_organizations?: number
          active_monitors?: number
          active_organizations?: number
          alert_delivery_success_rate?: number | null
          alert_state?: string
          approval_backlog?: number
          at_risk_organizations?: number
          calculation_version?: string
          check_success_rate?: number | null
          checks_completed?: number
          checks_delayed?: number
          collected_revenue_cents?: number
          completeness?: string
          critical_security_events?: number
          database_state?: string
          day: string
          monitoring_state?: string
          mrr_cents?: number
          open_customer_incidents?: number
          overall_state?: string
          provider_state?: string
          reconciliation_differences?: number
          refreshed_at?: string
          status_page_state?: string
          worker_state?: string
        }
        Update: {
          activated_organizations?: number
          active_monitors?: number
          active_organizations?: number
          alert_delivery_success_rate?: number | null
          alert_state?: string
          approval_backlog?: number
          at_risk_organizations?: number
          calculation_version?: string
          check_success_rate?: number | null
          checks_completed?: number
          checks_delayed?: number
          collected_revenue_cents?: number
          completeness?: string
          critical_security_events?: number
          database_state?: string
          day?: string
          monitoring_state?: string
          mrr_cents?: number
          open_customer_incidents?: number
          overall_state?: string
          provider_state?: string
          reconciliation_differences?: number
          refreshed_at?: string
          status_page_state?: string
          worker_state?: string
        }
        Relationships: []
      }
      platform_data_inventory: {
        Row: {
          access_roles: string[]
          created_at: string
          data_category: string
          deletion_behavior: string | null
          encryption_state: string | null
          export_behavior: string | null
          id: string
          last_reviewed_at: string | null
          legal_basis_placeholder: string | null
          owner: string | null
          purpose: string
          region: string | null
          retention: string | null
          sensitivity: string
          subprocessor: string | null
          system_name: string
          table_or_provider: string
          updated_at: string
        }
        Insert: {
          access_roles?: string[]
          created_at?: string
          data_category: string
          deletion_behavior?: string | null
          encryption_state?: string | null
          export_behavior?: string | null
          id?: string
          last_reviewed_at?: string | null
          legal_basis_placeholder?: string | null
          owner?: string | null
          purpose: string
          region?: string | null
          retention?: string | null
          sensitivity?: string
          subprocessor?: string | null
          system_name: string
          table_or_provider: string
          updated_at?: string
        }
        Update: {
          access_roles?: string[]
          created_at?: string
          data_category?: string
          deletion_behavior?: string | null
          encryption_state?: string | null
          export_behavior?: string | null
          id?: string
          last_reviewed_at?: string | null
          legal_basis_placeholder?: string | null
          owner?: string | null
          purpose?: string
          region?: string | null
          retention?: string | null
          sensitivity?: string
          subprocessor?: string | null
          system_name?: string
          table_or_provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_environment_inventory: {
        Row: {
          analytics_mode: string | null
          billing_mode: string | null
          current_version: string | null
          domains: string[]
          email_mode: string | null
          environment: string
          health: string
          last_deployment_at: string | null
          mismatch_notes: string | null
          pamphlet_workspace: string | null
          provider_projects: Json
          refreshed_at: string
        }
        Insert: {
          analytics_mode?: string | null
          billing_mode?: string | null
          current_version?: string | null
          domains?: string[]
          email_mode?: string | null
          environment: string
          health?: string
          last_deployment_at?: string | null
          mismatch_notes?: string | null
          pamphlet_workspace?: string | null
          provider_projects?: Json
          refreshed_at?: string
        }
        Update: {
          analytics_mode?: string | null
          billing_mode?: string | null
          current_version?: string | null
          domains?: string[]
          email_mode?: string | null
          environment?: string
          health?: string
          last_deployment_at?: string | null
          mismatch_notes?: string | null
          pamphlet_workspace?: string | null
          provider_projects?: Json
          refreshed_at?: string
        }
        Relationships: []
      }
      platform_exports: {
        Row: {
          approval_id: string | null
          column_allowlist: string[]
          completed_at: string | null
          content_hash: string | null
          created_at: string
          deleted_at: string | null
          download_count: number
          error_message: string | null
          expires_at: string | null
          export_type: string
          filters: Json
          id: string
          requested_by: string
          row_count: number | null
          state: string
          storage_path: string | null
          watermark: string | null
        }
        Insert: {
          approval_id?: string | null
          column_allowlist?: string[]
          completed_at?: string | null
          content_hash?: string | null
          created_at?: string
          deleted_at?: string | null
          download_count?: number
          error_message?: string | null
          expires_at?: string | null
          export_type: string
          filters?: Json
          id?: string
          requested_by: string
          row_count?: number | null
          state?: string
          storage_path?: string | null
          watermark?: string | null
        }
        Update: {
          approval_id?: string | null
          column_allowlist?: string[]
          completed_at?: string | null
          content_hash?: string | null
          created_at?: string
          deleted_at?: string | null
          download_count?: number
          error_message?: string | null
          expires_at?: string | null
          export_type?: string
          filters?: Json
          id?: string
          requested_by?: string
          row_count?: number | null
          state?: string
          storage_path?: string | null
          watermark?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_exports_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "platform_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_exports_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_feature_flag_changes: {
        Row: {
          actor_user_id: string | null
          approval_id: string | null
          change_type: string
          created_at: string
          environment: string
          flag_key: string
          id: string
          new_value: Json
          prior_value: Json | null
          reason: string | null
          risk_classification: string
        }
        Insert: {
          actor_user_id?: string | null
          approval_id?: string | null
          change_type: string
          created_at?: string
          environment?: string
          flag_key: string
          id?: string
          new_value: Json
          prior_value?: Json | null
          reason?: string | null
          risk_classification?: string
        }
        Update: {
          actor_user_id?: string | null
          approval_id?: string | null
          change_type?: string
          created_at?: string
          environment?: string
          flag_key?: string
          id?: string
          new_value?: Json
          prior_value?: Json | null
          reason?: string | null
          risk_classification?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_feature_flag_changes_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_feature_flag_changes_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "platform_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_incident_events: {
        Row: {
          actor_user_id: string | null
          body: string
          created_at: string
          event_type: string
          id: string
          incident_id: string
        }
        Insert: {
          actor_user_id?: string | null
          body: string
          created_at?: string
          event_type: string
          id?: string
          incident_id: string
        }
        Update: {
          actor_user_id?: string | null
          body?: string
          created_at?: string
          event_type?: string
          id?: string
          incident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_incident_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_incident_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "platform_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_incidents: {
        Row: {
          assignee_user_id: string | null
          category: string
          created_at: string
          customer_impact: string | null
          fajita_status_page_incident_id: string | null
          id: string
          mitigated_at: string | null
          public_communication_decision: string
          resolved_at: string | null
          severity: string
          started_at: string
          state: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_user_id?: string | null
          category: string
          created_at?: string
          customer_impact?: string | null
          fajita_status_page_incident_id?: string | null
          id?: string
          mitigated_at?: string | null
          public_communication_decision?: string
          resolved_at?: string | null
          severity: string
          started_at?: string
          state?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_user_id?: string | null
          category?: string
          created_at?: string
          customer_impact?: string | null
          fajita_status_page_incident_id?: string | null
          id?: string
          mitigated_at?: string | null
          public_communication_decision?: string
          resolved_at?: string | null
          severity?: string
          started_at?: string
          state?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_incidents_assignee_user_id_fkey"
            columns: ["assignee_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_infrastructure_services: {
        Row: {
          backup_state: string | null
          cost_category: string | null
          created_at: string
          data_sensitivity: string | null
          deployment_identifier: string | null
          domain: string | null
          environment: string
          health: string
          id: string
          owner: string | null
          provider: string
          purpose: string
          region: string | null
          runbook_key: string | null
          scaling_model: string | null
          secret_references: string[]
          service_key: string
          transfer_status: string
          updated_at: string
          version: string | null
        }
        Insert: {
          backup_state?: string | null
          cost_category?: string | null
          created_at?: string
          data_sensitivity?: string | null
          deployment_identifier?: string | null
          domain?: string | null
          environment: string
          health?: string
          id?: string
          owner?: string | null
          provider: string
          purpose: string
          region?: string | null
          runbook_key?: string | null
          scaling_model?: string | null
          secret_references?: string[]
          service_key: string
          transfer_status?: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          backup_state?: string | null
          cost_category?: string | null
          created_at?: string
          data_sensitivity?: string | null
          deployment_identifier?: string | null
          domain?: string | null
          environment?: string
          health?: string
          id?: string
          owner?: string | null
          provider?: string
          purpose?: string
          region?: string | null
          runbook_key?: string | null
          scaling_model?: string | null
          secret_references?: string[]
          service_key?: string
          transfer_status?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      platform_internal_page_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json
          operator_user_id: string | null
          path: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          operator_user_id?: string | null
          path?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          operator_user_id?: string | null
          path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_internal_page_events_operator_user_id_fkey"
            columns: ["operator_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_metric_snapshots: {
        Row: {
          calculation_version: string
          comparison_period_end: string | null
          comparison_period_start: string | null
          completeness: string
          created_at: string
          id: string
          known_lag_seconds: number | null
          metric_key: string
          notes: string | null
          period_end: string
          period_start: string
          refreshed_at: string
          source: string
          value_json: Json | null
          value_numeric: number | null
        }
        Insert: {
          calculation_version: string
          comparison_period_end?: string | null
          comparison_period_start?: string | null
          completeness?: string
          created_at?: string
          id?: string
          known_lag_seconds?: number | null
          metric_key: string
          notes?: string | null
          period_end: string
          period_start: string
          refreshed_at?: string
          source: string
          value_json?: Json | null
          value_numeric?: number | null
        }
        Update: {
          calculation_version?: string
          comparison_period_end?: string | null
          comparison_period_start?: string | null
          completeness?: string
          created_at?: string
          id?: string
          known_lag_seconds?: number | null
          metric_key?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          refreshed_at?: string
          source?: string
          value_json?: Json | null
          value_numeric?: number | null
        }
        Relationships: []
      }
      platform_mrr_movements: {
        Row: {
          billing_interval: string | null
          calculation_version: string
          created_at: string
          difference_cents: number
          effective_date: string
          id: string
          idempotency_key: string | null
          movement_type: string
          new_mrr_cents: number
          organization_id: string
          plan_key: string | null
          prior_mrr_cents: number
          source_event: string | null
          subscription_id: string | null
        }
        Insert: {
          billing_interval?: string | null
          calculation_version?: string
          created_at?: string
          difference_cents: number
          effective_date: string
          id?: string
          idempotency_key?: string | null
          movement_type: string
          new_mrr_cents?: number
          organization_id: string
          plan_key?: string | null
          prior_mrr_cents?: number
          source_event?: string | null
          subscription_id?: string | null
        }
        Update: {
          billing_interval?: string | null
          calculation_version?: string
          created_at?: string
          difference_cents?: number
          effective_date?: string
          id?: string
          idempotency_key?: string | null
          movement_type?: string
          new_mrr_cents?: number
          organization_id?: string
          plan_key?: string | null
          prior_mrr_cents?: number
          source_event?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_mrr_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_operational_events: {
        Row: {
          actor_ref: string | null
          actor_type: string
          causation_id: string | null
          correlation_id: string | null
          environment: string
          event_type: string
          event_version: number
          id: string
          idempotency_key: string | null
          metadata: Json
          occurred_at: string
          organization_id: string | null
          recorded_at: string
          resource_id: string | null
          resource_type: string | null
          source_system: string
        }
        Insert: {
          actor_ref?: string | null
          actor_type?: string
          causation_id?: string | null
          correlation_id?: string | null
          environment?: string
          event_type: string
          event_version?: number
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          occurred_at: string
          organization_id?: string | null
          recorded_at?: string
          resource_id?: string | null
          resource_type?: string | null
          source_system: string
        }
        Update: {
          actor_ref?: string | null
          actor_type?: string
          causation_id?: string | null
          correlation_id?: string | null
          environment?: string
          event_type?: string
          event_version?: number
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          occurred_at?: string
          organization_id?: string | null
          recorded_at?: string
          resource_id?: string | null
          resource_type?: string | null
          source_system?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_operational_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_operational_tasks: {
        Row: {
          approval_id: string | null
          category: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          owner_user_id: string | null
          priority: string
          related_event_id: string | null
          related_resource_id: string | null
          related_resource_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_id?: string | null
          category: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          owner_user_id?: string | null
          priority?: string
          related_event_id?: string | null
          related_resource_id?: string | null
          related_resource_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_id?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          owner_user_id?: string | null
          priority?: string
          related_event_id?: string | null
          related_resource_id?: string | null
          related_resource_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_operational_tasks_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "platform_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_operational_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_operational_tasks_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_operator_notifications: {
        Row: {
          assignee_user_id: string | null
          body: string
          category: string
          created_at: string
          id: string
          resolved_at: string | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          snooze_until: string | null
          state: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_user_id?: string | null
          body: string
          category: string
          created_at?: string
          id?: string
          resolved_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          snooze_until?: string | null
          state?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_user_id?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          resolved_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          snooze_until?: string | null
          state?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_operator_notifications_assignee_user_id_fkey"
            columns: ["assignee_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_operator_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          reason: string | null
          revoked_at: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          reason?: string | null
          revoked_at?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          reason?: string | null
          revoked_at?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_operator_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_operator_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_org_health_snapshots: {
        Row: {
          activation_state: string | null
          active_monitors: number
          billing_state: string | null
          created_at: string
          evaluated_at: string
          evidence: Json
          health_state: string
          id: string
          last_meaningful_activity_at: string | null
          mrr_cents: number
          open_incidents: number
          organization_id: string
          owner_user_id: string | null
          plan_key: string | null
          published_status_pages: number
          recommended_action: string | null
          rule_version: string
          subscriber_count: number
        }
        Insert: {
          activation_state?: string | null
          active_monitors?: number
          billing_state?: string | null
          created_at?: string
          evaluated_at?: string
          evidence?: Json
          health_state: string
          id?: string
          last_meaningful_activity_at?: string | null
          mrr_cents?: number
          open_incidents?: number
          organization_id: string
          owner_user_id?: string | null
          plan_key?: string | null
          published_status_pages?: number
          recommended_action?: string | null
          rule_version?: string
          subscriber_count?: number
        }
        Update: {
          activation_state?: string | null
          active_monitors?: number
          billing_state?: string | null
          created_at?: string
          evaluated_at?: string
          evidence?: Json
          health_state?: string
          id?: string
          last_meaningful_activity_at?: string | null
          mrr_cents?: number
          open_incidents?: number
          organization_id?: string
          owner_user_id?: string | null
          plan_key?: string | null
          published_status_pages?: number
          recommended_action?: string | null
          rule_version?: string
          subscriber_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "platform_org_health_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_org_health_snapshots_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_privacy_requests: {
        Row: {
          completed_at: string | null
          completion_evidence: Json | null
          created_at: string
          deadline_at: string | null
          id: string
          identity_verified: boolean
          organization_id: string | null
          owner_user_id: string | null
          request_type: string
          requester_ref: string
          scope: Json
          state: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completion_evidence?: Json | null
          created_at?: string
          deadline_at?: string | null
          id?: string
          identity_verified?: boolean
          organization_id?: string | null
          owner_user_id?: string | null
          request_type: string
          requester_ref: string
          scope?: Json
          state?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completion_evidence?: Json | null
          created_at?: string
          deadline_at?: string | null
          id?: string
          identity_verified?: boolean
          organization_id?: string | null
          owner_user_id?: string | null
          request_type?: string
          requester_ref?: string
          scope?: Json
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_privacy_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_privacy_requests_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_product_friction_items: {
        Row: {
          created_at: string
          existing_source: string | null
          frequency: number
          id: string
          impact: string | null
          last_observed_at: string
          organizations_affected: number
          owner: string | null
          product_area: string | null
          queue_type: string
          related_documentation_issue: string | null
          related_product_issue: string | null
          sanitized_issue: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          existing_source?: string | null
          frequency?: number
          id?: string
          impact?: string | null
          last_observed_at?: string
          organizations_affected?: number
          owner?: string | null
          product_area?: string | null
          queue_type: string
          related_documentation_issue?: string | null
          related_product_issue?: string | null
          sanitized_issue: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          existing_source?: string | null
          frequency?: number
          id?: string
          impact?: string | null
          last_observed_at?: string
          organizations_affected?: number
          owner?: string | null
          product_area?: string | null
          queue_type?: string
          related_documentation_issue?: string | null
          related_product_issue?: string | null
          sanitized_issue?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_provider_health: {
        Row: {
          configuration_state: string
          credential_expires_at: string | null
          display_name: string
          documentation_url: string | null
          error_rate: number | null
          fallback_behavior: string | null
          last_successful_at: string | null
          latency_ms: number | null
          mode: string
          notes: string | null
          operational_state: string
          owner: string | null
          provider_key: string
          rate_limit_state: string | null
          refreshed_at: string
          subprocessor: boolean
          webhook_lag_seconds: number | null
        }
        Insert: {
          configuration_state?: string
          credential_expires_at?: string | null
          display_name: string
          documentation_url?: string | null
          error_rate?: number | null
          fallback_behavior?: string | null
          last_successful_at?: string | null
          latency_ms?: number | null
          mode?: string
          notes?: string | null
          operational_state?: string
          owner?: string | null
          provider_key: string
          rate_limit_state?: string | null
          refreshed_at?: string
          subprocessor?: boolean
          webhook_lag_seconds?: number | null
        }
        Update: {
          configuration_state?: string
          credential_expires_at?: string | null
          display_name?: string
          documentation_url?: string | null
          error_rate?: number | null
          fallback_behavior?: string | null
          last_successful_at?: string | null
          latency_ms?: number | null
          mode?: string
          notes?: string | null
          operational_state?: string
          owner?: string | null
          provider_key?: string
          rate_limit_state?: string | null
          refreshed_at?: string
          subprocessor?: boolean
          webhook_lag_seconds?: number | null
        }
        Relationships: []
      }
      platform_reconciliation_runs: {
        Row: {
          actor_user_id: string | null
          approval_id: string | null
          auto_repaired: number
          completed_at: string | null
          differences: number
          domain: string
          failed_repairs: number
          id: string
          manual_review: number
          mode: string
          started_at: string
          state: string
          summary: Json
        }
        Insert: {
          actor_user_id?: string | null
          approval_id?: string | null
          auto_repaired?: number
          completed_at?: string | null
          differences?: number
          domain: string
          failed_repairs?: number
          id?: string
          manual_review?: number
          mode?: string
          started_at?: string
          state?: string
          summary?: Json
        }
        Update: {
          actor_user_id?: string | null
          approval_id?: string | null
          auto_repaired?: number
          completed_at?: string | null
          differences?: number
          domain?: string
          failed_repairs?: number
          id?: string
          manual_review?: number
          mode?: string
          started_at?: string
          state?: string
          summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_reconciliation_runs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_reconciliation_runs_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "platform_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_releases: {
        Row: {
          commit_ref: string | null
          completed_at: string | null
          created_at: string
          deployment_url: string | null
          environment: string
          feature_flags: string[] | null
          health_notes: string | null
          id: string
          initiator: string | null
          migration_set: string[] | null
          release_id: string
          rollback_ref: string | null
          started_at: string | null
          status: string
          version: string | null
        }
        Insert: {
          commit_ref?: string | null
          completed_at?: string | null
          created_at?: string
          deployment_url?: string | null
          environment: string
          feature_flags?: string[] | null
          health_notes?: string | null
          id?: string
          initiator?: string | null
          migration_set?: string[] | null
          release_id: string
          rollback_ref?: string | null
          started_at?: string | null
          status?: string
          version?: string | null
        }
        Update: {
          commit_ref?: string | null
          completed_at?: string | null
          created_at?: string
          deployment_url?: string | null
          environment?: string
          feature_flags?: string[] | null
          health_notes?: string | null
          id?: string
          initiator?: string | null
          migration_set?: string[] | null
          release_id?: string
          rollback_ref?: string | null
          started_at?: string | null
          status?: string
          version?: string | null
        }
        Relationships: []
      }
      platform_report_notes: {
        Row: {
          author_user_id: string
          body: string
          created_at: string
          id: string
          note_type: string
          related_metric: string | null
          related_task_id: string | null
          report_id: string
          updated_at: string
          version: number
        }
        Insert: {
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          note_type: string
          related_metric?: string | null
          related_task_id?: string | null
          report_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          note_type?: string
          related_metric?: string | null
          related_task_id?: string | null
          report_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "platform_report_notes_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_report_notes_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "platform_operational_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_report_notes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "platform_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_reports: {
        Row: {
          calculation_version: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          expires_at: string | null
          filters: Json
          generated_by: string | null
          id: string
          payload: Json | null
          period_end: string
          period_start: string
          report_type: string
          state: string
        }
        Insert: {
          calculation_version?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          filters?: Json
          generated_by?: string | null
          id?: string
          payload?: Json | null
          period_end: string
          period_start: string
          report_type: string
          state?: string
        }
        Update: {
          calculation_version?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          filters?: Json
          generated_by?: string | null
          id?: string
          payload?: Json | null
          period_end?: string
          period_start?: string
          report_type?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_runbooks: {
        Row: {
          communication: string | null
          created_at: string
          customer_impact: string | null
          escalation: string | null
          follow_up: string | null
          last_reviewed_at: string | null
          mitigation: string | null
          owner: string | null
          preconditions: string | null
          rollback: string | null
          runbook_key: string
          safe_checks: string | null
          severity: string
          title: string
          trigger_description: string
          updated_at: string
          verification: string | null
        }
        Insert: {
          communication?: string | null
          created_at?: string
          customer_impact?: string | null
          escalation?: string | null
          follow_up?: string | null
          last_reviewed_at?: string | null
          mitigation?: string | null
          owner?: string | null
          preconditions?: string | null
          rollback?: string | null
          runbook_key: string
          safe_checks?: string | null
          severity?: string
          title: string
          trigger_description: string
          updated_at?: string
          verification?: string | null
        }
        Update: {
          communication?: string | null
          created_at?: string
          customer_impact?: string | null
          escalation?: string | null
          follow_up?: string | null
          last_reviewed_at?: string | null
          mitigation?: string | null
          owner?: string | null
          preconditions?: string | null
          rollback?: string | null
          runbook_key?: string
          safe_checks?: string | null
          severity?: string
          title?: string
          trigger_description?: string
          updated_at?: string
          verification?: string | null
        }
        Relationships: []
      }
      platform_saved_views: {
        Row: {
          columns: string[]
          created_at: string
          filters: Json
          id: string
          name: string
          owner_user_id: string
          shared_roles: string[]
          sharing_state: string
          sort_spec: Json | null
          surface: string
          updated_at: string
        }
        Insert: {
          columns?: string[]
          created_at?: string
          filters?: Json
          id?: string
          name: string
          owner_user_id: string
          shared_roles?: string[]
          sharing_state?: string
          sort_spec?: Json | null
          surface: string
          updated_at?: string
        }
        Update: {
          columns?: string[]
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          owner_user_id?: string
          shared_roles?: string[]
          sharing_state?: string
          sort_spec?: Json | null
          surface?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_saved_views_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_security_events: {
        Row: {
          created_at: string
          detection_time: string
          environment: string
          event_type: string
          evidence_summary: string
          first_observed_at: string
          id: string
          last_observed_at: string
          occurrence_count: number
          organization_id: string | null
          owner_user_id: string | null
          related_incident_id: string | null
          resolution: string | null
          resource_id: string | null
          resource_type: string | null
          restricted_evidence_ref: string | null
          severity: string
          source: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detection_time?: string
          environment?: string
          event_type: string
          evidence_summary: string
          first_observed_at?: string
          id?: string
          last_observed_at?: string
          occurrence_count?: number
          organization_id?: string | null
          owner_user_id?: string | null
          related_incident_id?: string | null
          resolution?: string | null
          resource_id?: string | null
          resource_type?: string | null
          restricted_evidence_ref?: string | null
          severity: string
          source: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detection_time?: string
          environment?: string
          event_type?: string
          evidence_summary?: string
          first_observed_at?: string
          id?: string
          last_observed_at?: string
          occurrence_count?: number
          organization_id?: string | null
          owner_user_id?: string | null
          related_incident_id?: string | null
          resolution?: string | null
          resource_id?: string | null
          resource_type?: string | null
          restricted_evidence_ref?: string | null
          severity?: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_security_events_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_security_events_related_incident_id_fkey"
            columns: ["related_incident_id"]
            isOneToOne: false
            referencedRelation: "platform_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_seo_observations: {
        Row: {
          average_position: number | null
          clicks: number | null
          content_type: string | null
          country: string | null
          created_at: string
          ctr: number | null
          device_class: string | null
          id: string
          impressions: number | null
          landing_page: string | null
          notes: string | null
          observation_date: string
          query_group: string | null
          search_engine: string
          source: string
        }
        Insert: {
          average_position?: number | null
          clicks?: number | null
          content_type?: string | null
          country?: string | null
          created_at?: string
          ctr?: number | null
          device_class?: string | null
          id?: string
          impressions?: number | null
          landing_page?: string | null
          notes?: string | null
          observation_date: string
          query_group?: string | null
          search_engine?: string
          source?: string
        }
        Update: {
          average_position?: number | null
          clicks?: number | null
          content_type?: string | null
          country?: string | null
          created_at?: string
          ctr?: number | null
          device_class?: string | null
          id?: string
          impressions?: number | null
          landing_page?: string | null
          notes?: string | null
          observation_date?: string
          query_group?: string | null
          search_engine?: string
          source?: string
        }
        Relationships: []
      }
      platform_step_up_events: {
        Row: {
          action_key: string
          correlation_id: string | null
          created_at: string
          expires_at: string
          id: string
          resource_id: string | null
          resource_type: string | null
          user_id: string
          verified_at: string
        }
        Insert: {
          action_key: string
          correlation_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id: string
          verified_at?: string
        }
        Update: {
          action_key?: string
          correlation_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_step_up_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_capacity_snapshots: {
        Row: {
          cost_cents: number | null
          current_usage: number | null
          evaluated_at: string
          failure_behavior: string | null
          fallback: string | null
          hard_limit: number | null
          id: string
          owner: string
          provider_key: string
          rate_limit: string | null
          soft_limit: number | null
          tier: string | null
          upgrade_lead_time_hours: number | null
          warning_threshold: number | null
        }
        Insert: {
          cost_cents?: number | null
          current_usage?: number | null
          evaluated_at?: string
          failure_behavior?: string | null
          fallback?: string | null
          hard_limit?: number | null
          id?: string
          owner: string
          provider_key: string
          rate_limit?: string | null
          soft_limit?: number | null
          tier?: string | null
          upgrade_lead_time_hours?: number | null
          warning_threshold?: number | null
        }
        Update: {
          cost_cents?: number | null
          current_usage?: number | null
          evaluated_at?: string
          failure_behavior?: string | null
          fallback?: string | null
          hard_limit?: number | null
          id?: string
          owner?: string
          provider_key?: string
          rate_limit?: string | null
          soft_limit?: number | null
          tier?: string | null
          upgrade_lead_time_hours?: number | null
          warning_threshold?: number | null
        }
        Relationships: []
      }
      referral_attributions: {
        Row: {
          affiliate_conflict: boolean
          attributed_at: string
          created_at: string
          id: string
          metadata: Json
          referral_id: string
          referred_organization_id: string | null
          state: string
          window_expires_at: string
        }
        Insert: {
          affiliate_conflict?: boolean
          attributed_at?: string
          created_at?: string
          id?: string
          metadata?: Json
          referral_id: string
          referred_organization_id?: string | null
          state?: string
          window_expires_at: string
        }
        Update: {
          affiliate_conflict?: boolean
          attributed_at?: string
          created_at?: string
          id?: string
          metadata?: Json
          referral_id?: string
          referred_organization_id?: string | null
          state?: string
          window_expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_attributions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "customer_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_attributions_referred_organization_id_fkey"
            columns: ["referred_organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          attribution_id: string | null
          created_at: string
          event_type: string
          id: string
          idempotency_key: string | null
          metadata: Json
          occurred_at: string
          referral_id: string | null
        }
        Insert: {
          attribution_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          occurred_at?: string
          referral_id?: string | null
        }
        Update: {
          attribution_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          occurred_at?: string
          referral_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_attribution_id_fkey"
            columns: ["attribution_id"]
            isOneToOne: false
            referencedRelation: "referral_attributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "customer_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      role_scorecards: {
        Row: {
          access_level: string
          budget_cents: number | null
          contractor_vs_employee: string | null
          created_at: string
          first_30_days: Json
          first_60_days: Json
          first_90_days: Json
          hiring_trigger_key: string | null
          id: string
          metrics: Json
          mission: string
          non_responsibilities: Json
          outcomes: Json
          required_skills: Json
          responsibilities: Json
          review_date: string | null
          role_key: string
          security_requirements: Json
          status: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          budget_cents?: number | null
          contractor_vs_employee?: string | null
          created_at?: string
          first_30_days?: Json
          first_60_days?: Json
          first_90_days?: Json
          hiring_trigger_key?: string | null
          id?: string
          metrics?: Json
          mission: string
          non_responsibilities?: Json
          outcomes?: Json
          required_skills?: Json
          responsibilities?: Json
          review_date?: string | null
          role_key: string
          security_requirements?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          budget_cents?: number | null
          contractor_vs_employee?: string | null
          created_at?: string
          first_30_days?: Json
          first_60_days?: Json
          first_90_days?: Json
          hiring_trigger_key?: string | null
          id?: string
          metrics?: Json
          mission?: string
          non_responsibilities?: Json
          outcomes?: Json
          required_skills?: Json
          responsibilities?: Json
          review_date?: string | null
          role_key?: string
          security_requirements?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_scorecards_hiring_trigger_key_fkey"
            columns: ["hiring_trigger_key"]
            isOneToOne: false
            referencedRelation: "hiring_triggers"
            referencedColumns: ["trigger_key"]
          },
        ]
      }
      scale_decisions: {
        Row: {
          alternatives: string | null
          approval_id: string | null
          created_at: string
          decided_at: string
          decision: string
          decision_type: string
          economics: string | null
          evidence: string
          id: string
          owner: string
          privacy_impact: string | null
          product_simplicity_impact: string | null
          reliability_impact: string | null
          revisit_condition: string | null
          security_impact: string | null
          title: string
        }
        Insert: {
          alternatives?: string | null
          approval_id?: string | null
          created_at?: string
          decided_at?: string
          decision: string
          decision_type: string
          economics?: string | null
          evidence: string
          id?: string
          owner: string
          privacy_impact?: string | null
          product_simplicity_impact?: string | null
          reliability_impact?: string | null
          revisit_condition?: string | null
          security_impact?: string | null
          title: string
        }
        Update: {
          alternatives?: string | null
          approval_id?: string | null
          created_at?: string
          decided_at?: string
          decision?: string
          decision_type?: string
          economics?: string | null
          evidence?: string
          id?: string
          owner?: string
          privacy_impact?: string | null
          product_simplicity_impact?: string | null
          reliability_impact?: string | null
          revisit_condition?: string | null
          security_impact?: string | null
          title?: string
        }
        Relationships: []
      }
      scale_expansion_opportunities: {
        Row: {
          billing_state: string | null
          created_at: string
          evidence: Json
          id: string
          organization_id: string
          owner_user_id: string | null
          plan_key: string | null
          recommended_action: string
          signal: string
          status: string
          support_state: string | null
          updated_at: string
          usage_pct: number | null
        }
        Insert: {
          billing_state?: string | null
          created_at?: string
          evidence?: Json
          id?: string
          organization_id: string
          owner_user_id?: string | null
          plan_key?: string | null
          recommended_action: string
          signal: string
          status?: string
          support_state?: string | null
          updated_at?: string
          usage_pct?: number | null
        }
        Update: {
          billing_state?: string | null
          created_at?: string
          evidence?: Json
          id?: string
          organization_id?: string
          owner_user_id?: string | null
          plan_key?: string | null
          recommended_action?: string
          signal?: string
          status?: string
          support_state?: string | null
          updated_at?: string
          usage_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scale_expansion_opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scale_expansion_opportunities_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scale_forecasts: {
        Row: {
          calculation_version: string
          created_at: string
          id: string
          inputs: Json
          outputs: Json
          owner_user_id: string | null
          period_end: string
          period_start: string
          scenario: string
        }
        Insert: {
          calculation_version?: string
          created_at?: string
          id?: string
          inputs?: Json
          outputs?: Json
          owner_user_id?: string | null
          period_end: string
          period_start: string
          scenario: string
        }
        Update: {
          calculation_version?: string
          created_at?: string
          id?: string
          inputs?: Json
          outputs?: Json
          owner_user_id?: string | null
          period_end?: string
          period_start?: string
          scenario?: string
        }
        Relationships: [
          {
            foreignKeyName: "scale_forecasts_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scale_readiness_snapshots: {
        Row: {
          blockers: Json
          calculation_version: string
          created_at: string
          customer_evidence_ready: boolean
          economics_ready: boolean
          evaluated_at: string
          evaluated_by: string | null
          evidence: Json
          gate_status: string
          id: string
          operations_ready: boolean
          phase18_classification: string
          phase19_stabilization_active: boolean
          product_stable: boolean
        }
        Insert: {
          blockers?: Json
          calculation_version?: string
          created_at?: string
          customer_evidence_ready?: boolean
          economics_ready?: boolean
          evaluated_at?: string
          evaluated_by?: string | null
          evidence?: Json
          gate_status: string
          id?: string
          operations_ready?: boolean
          phase18_classification: string
          phase19_stabilization_active?: boolean
          product_stable?: boolean
        }
        Update: {
          blockers?: Json
          calculation_version?: string
          created_at?: string
          customer_evidence_ready?: boolean
          economics_ready?: boolean
          evaluated_at?: string
          evaluated_by?: string | null
          evidence?: Json
          gate_status?: string
          id?: string
          operations_ready?: boolean
          phase18_classification?: string
          phase19_stabilization_active?: boolean
          product_stable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "scale_readiness_snapshots_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scale_risks: {
        Row: {
          accepted_by: string | null
          category: string
          created_at: string
          evidence: string | null
          id: string
          mitigation: string | null
          owner: string
          review_date: string | null
          risk_key: string
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          accepted_by?: string | null
          category: string
          created_at?: string
          evidence?: string | null
          id?: string
          mitigation?: string | null
          owner: string
          review_date?: string | null
          risk_key: string
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          accepted_by?: string | null
          category?: string
          created_at?: string
          evidence?: string | null
          id?: string
          mitigation?: string | null
          owner?: string
          review_date?: string | null
          risk_key?: string
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      scale_stages: {
        Row: {
          approval_id: string | null
          created_at: string
          ended_at: string | null
          entry_criteria: Json
          id: string
          max_budget_cents: number | null
          max_traffic_label: string | null
          notes: string | null
          owner_user_id: string | null
          stage: number
          stage_key: string
          started_at: string | null
          status: string
          stop_conditions: Json
          updated_at: string
        }
        Insert: {
          approval_id?: string | null
          created_at?: string
          ended_at?: string | null
          entry_criteria?: Json
          id?: string
          max_budget_cents?: number | null
          max_traffic_label?: string | null
          notes?: string | null
          owner_user_id?: string | null
          stage: number
          stage_key: string
          started_at?: string | null
          status?: string
          stop_conditions?: Json
          updated_at?: string
        }
        Update: {
          approval_id?: string | null
          created_at?: string
          ended_at?: string | null
          entry_criteria?: Json
          id?: string
          max_budget_cents?: number | null
          max_traffic_label?: string | null
          notes?: string | null
          owner_user_id?: string | null
          stage?: number
          stage_key?: string
          started_at?: string | null
          status?: string
          stop_conditions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scale_stages_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_analytics_events: {
        Row: {
          count: number
          created_at: string
          event_type: string
          id: string
          occurred_on: string
          organization_id: string
          status_page_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          event_type: string
          id?: string
          occurred_on?: string
          organization_id: string
          status_page_id: string
        }
        Update: {
          count?: number
          created_at?: string
          event_type?: string
          id?: string
          occurred_on?: string
          organization_id?: string
          status_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_analytics_events_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_brand_assets: {
        Row: {
          byte_size: number | null
          content_type: string | null
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          height: number | null
          id: string
          kind: string
          organization_id: string
          public_url: string | null
          status_page_id: string
          storage_path: string | null
          width: number | null
        }
        Insert: {
          byte_size?: number | null
          content_type?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          height?: number | null
          id?: string
          kind: string
          organization_id: string
          public_url?: string | null
          status_page_id: string
          storage_path?: string | null
          width?: number | null
        }
        Update: {
          byte_size?: number | null
          content_type?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          height?: number | null
          id?: string
          kind?: string
          organization_id?: string
          public_url?: string | null
          status_page_id?: string
          storage_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_brand_assets_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_brand_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_brand_assets_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_component_groups: {
        Row: {
          collapsed_by_default: boolean
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_hidden: boolean
          name: string
          organization_id: string
          position: number
          status_page_id: string
          updated_at: string
        }
        Insert: {
          collapsed_by_default?: boolean
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_hidden?: boolean
          name: string
          organization_id: string
          position?: number
          status_page_id: string
          updated_at?: string
        }
        Update: {
          collapsed_by_default?: boolean
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_hidden?: boolean
          name?: string
          organization_id?: string
          position?: number
          status_page_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_component_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_component_groups_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_component_monitors: {
        Row: {
          component_id: string
          created_at: string
          id: string
          include_in_uptime: boolean
          is_critical: boolean
          is_primary: boolean
          monitor_id: string
          organization_id: string
          status_page_id: string
        }
        Insert: {
          component_id: string
          created_at?: string
          id?: string
          include_in_uptime?: boolean
          is_critical?: boolean
          is_primary?: boolean
          monitor_id: string
          organization_id: string
          status_page_id: string
        }
        Update: {
          component_id?: string
          created_at?: string
          id?: string
          include_in_uptime?: boolean
          is_critical?: boolean
          is_primary?: boolean
          monitor_id?: string
          organization_id?: string
          status_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_component_monitors_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "status_page_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_component_monitors_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_component_monitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_component_monitors_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_components: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          group_id: string | null
          id: string
          is_archived: boolean
          manual_status: string | null
          manual_status_reason: string | null
          manual_status_since: string | null
          manual_status_until: string | null
          name: string
          organization_id: string
          position: number
          show_response_time: boolean
          show_uptime: boolean
          slug: string
          status_calculation_mode: string
          status_page_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          is_archived?: boolean
          manual_status?: string | null
          manual_status_reason?: string | null
          manual_status_since?: string | null
          manual_status_until?: string | null
          name: string
          organization_id: string
          position?: number
          show_response_time?: boolean
          show_uptime?: boolean
          slug: string
          status_calculation_mode?: string
          status_page_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          is_archived?: boolean
          manual_status?: string | null
          manual_status_reason?: string | null
          manual_status_since?: string | null
          manual_status_until?: string | null
          name?: string
          organization_id?: string
          position?: number
          show_response_time?: boolean
          show_uptime?: boolean
          slug?: string
          status_calculation_mode?: string
          status_page_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_components_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "status_page_component_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_components_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_domain_verifications: {
        Row: {
          attempts: number
          created_at: string
          domain_id: string
          expires_at: string | null
          id: string
          last_checked_at: string | null
          method: string
          organization_id: string
          record_host: string | null
          status: string
          token_hash: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          domain_id: string
          expires_at?: string | null
          id?: string
          last_checked_at?: string | null
          method?: string
          organization_id: string
          record_host?: string | null
          status?: string
          token_hash: string
        }
        Update: {
          attempts?: number
          created_at?: string
          domain_id?: string
          expires_at?: string | null
          id?: string
          last_checked_at?: string | null
          method?: string
          organization_id?: string
          record_host?: string | null
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_domain_verifications_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "status_page_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_domain_verifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_domains: {
        Row: {
          cname_target: string | null
          created_at: string
          created_by_user_id: string | null
          domain: string
          failure_reason: string | null
          id: string
          is_primary: boolean
          kind: string
          last_checked_at: string | null
          organization_id: string
          removed_at: string | null
          status_page_id: string
          tls_activated_at: string | null
          tls_status: string
          updated_at: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          cname_target?: string | null
          created_at?: string
          created_by_user_id?: string | null
          domain: string
          failure_reason?: string | null
          id?: string
          is_primary?: boolean
          kind?: string
          last_checked_at?: string | null
          organization_id: string
          removed_at?: string | null
          status_page_id: string
          tls_activated_at?: string | null
          tls_status?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          cname_target?: string | null
          created_at?: string
          created_by_user_id?: string | null
          domain?: string
          failure_reason?: string | null
          id?: string
          is_primary?: boolean
          kind?: string
          last_checked_at?: string | null
          organization_id?: string
          removed_at?: string | null
          status_page_id?: string
          tls_activated_at?: string | null
          tls_status?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_domains_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_domains_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_incidents: {
        Row: {
          created_at: string
          id: string
          incident_id: string
          organization_id: string
          public_slug: string
          publication_state: string
          published_at: string | null
          published_by_user_id: string | null
          status_page_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          incident_id: string
          organization_id: string
          public_slug: string
          publication_state?: string
          published_at?: string | null
          published_by_user_id?: string | null
          status_page_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          incident_id?: string
          organization_id?: string
          public_slug?: string
          publication_state?: string
          published_at?: string | null
          published_by_user_id?: string | null
          status_page_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_incidents_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_incidents_published_by_user_id_fkey"
            columns: ["published_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_incidents_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_maintenance: {
        Row: {
          created_at: string
          id: string
          maintenance_window_id: string
          organization_id: string
          public_slug: string
          publication_state: string
          published_at: string | null
          published_by_user_id: string | null
          status_page_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          maintenance_window_id: string
          organization_id: string
          public_slug: string
          publication_state?: string
          published_at?: string | null
          published_by_user_id?: string | null
          status_page_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          maintenance_window_id?: string
          organization_id?: string
          public_slug?: string
          publication_state?: string
          published_at?: string | null
          published_by_user_id?: string | null
          status_page_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_maintenance_maintenance_window_id_fkey"
            columns: ["maintenance_window_id"]
            isOneToOne: false
            referencedRelation: "maintenance_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_maintenance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_maintenance_published_by_user_id_fkey"
            columns: ["published_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_maintenance_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_manual_messages: {
        Row: {
          body: string
          created_at: string
          created_by_user_id: string | null
          ends_at: string | null
          id: string
          notice_type: string
          organization_id: string
          public_slug: string
          publication_state: string
          published_at: string | null
          starts_at: string
          status_page_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by_user_id?: string | null
          ends_at?: string | null
          id?: string
          notice_type?: string
          organization_id: string
          public_slug: string
          publication_state?: string
          published_at?: string | null
          starts_at?: string
          status_page_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by_user_id?: string | null
          ends_at?: string | null
          id?: string
          notice_type?: string
          organization_id?: string
          public_slug?: string
          publication_state?: string
          published_at?: string | null
          starts_at?: string
          status_page_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_manual_messages_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_manual_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_manual_messages_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_public_snapshots: {
        Row: {
          content_hash: string | null
          data: Json
          generated_at: string
          organization_id: string
          overall_status: string
          published_at: string | null
          slug: string
          source_refreshed_at: string
          status_page_id: string
          updated_at: string
          version_id: string | null
          visibility: string
        }
        Insert: {
          content_hash?: string | null
          data?: Json
          generated_at?: string
          organization_id: string
          overall_status?: string
          published_at?: string | null
          slug: string
          source_refreshed_at?: string
          status_page_id: string
          updated_at?: string
          version_id?: string | null
          visibility?: string
        }
        Update: {
          content_hash?: string | null
          data?: Json
          generated_at?: string
          organization_id?: string
          overall_status?: string
          published_at?: string | null
          slug?: string
          source_refreshed_at?: string
          status_page_id?: string
          updated_at?: string
          version_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_public_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_public_snapshots_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: true
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_components: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          status_page_component_id: string
          status_page_id: string
          subscriber_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          status_page_component_id: string
          status_page_id: string
          subscriber_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          status_page_component_id?: string
          status_page_id?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_components_status_page_component_id_fkey"
            columns: ["status_page_component_id"]
            isOneToOne: false
            referencedRelation: "status_page_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_components_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_components_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_consent_records: {
        Row: {
          consent_source: string | null
          consent_text_version: string | null
          created_at: string
          event: string
          id: string
          ip_hash: string | null
          occurred_at: string
          organization_id: string
          policy_version: string | null
          selected_scope: string | null
          status_page_id: string
          subscriber_id: string
          user_agent_summary: string | null
        }
        Insert: {
          consent_source?: string | null
          consent_text_version?: string | null
          created_at?: string
          event: string
          id?: string
          ip_hash?: string | null
          occurred_at?: string
          organization_id: string
          policy_version?: string | null
          selected_scope?: string | null
          status_page_id: string
          subscriber_id: string
          user_agent_summary?: string | null
        }
        Update: {
          consent_source?: string | null
          consent_text_version?: string | null
          created_at?: string
          event?: string
          id?: string
          ip_hash?: string | null
          occurred_at?: string
          organization_id?: string
          policy_version?: string | null
          selected_scope?: string | null
          status_page_id?: string
          subscriber_id?: string
          user_agent_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_consent_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_consent_records_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_consent_records_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_delivery_attempts: {
        Row: {
          attempt_number: number
          completed_at: string | null
          duration_ms: number | null
          error_category: string | null
          http_status: number | null
          id: string
          intent_id: string
          is_manual: boolean
          next_retry_at: string | null
          organization_id: string
          provider_request_id: string | null
          result: string
          safe_summary: string | null
          started_at: string
        }
        Insert: {
          attempt_number: number
          completed_at?: string | null
          duration_ms?: number | null
          error_category?: string | null
          http_status?: number | null
          id?: string
          intent_id: string
          is_manual?: boolean
          next_retry_at?: string | null
          organization_id: string
          provider_request_id?: string | null
          result: string
          safe_summary?: string | null
          started_at?: string
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          duration_ms?: number | null
          error_category?: string | null
          http_status?: number | null
          id?: string
          intent_id?: string
          is_manual?: boolean
          next_retry_at?: string | null
          organization_id?: string
          provider_request_id?: string | null
          result?: string
          safe_summary?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_delivery_attempts_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscriber_delivery_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_delivery_dead_letters: {
        Row: {
          created_at: string
          error_category: string | null
          event_id: string | null
          event_type: string | null
          final_attempt_at: string | null
          first_attempt_at: string | null
          intent_id: string
          organization_id: string
          provider_message_id: string | null
          resolved_at: string | null
          safe_summary: string | null
          status_page_id: string
          suggested_action: string | null
        }
        Insert: {
          created_at?: string
          error_category?: string | null
          event_id?: string | null
          event_type?: string | null
          final_attempt_at?: string | null
          first_attempt_at?: string | null
          intent_id: string
          organization_id: string
          provider_message_id?: string | null
          resolved_at?: string | null
          safe_summary?: string | null
          status_page_id: string
          suggested_action?: string | null
        }
        Update: {
          created_at?: string
          error_category?: string | null
          event_id?: string | null
          event_type?: string | null
          final_attempt_at?: string | null
          first_attempt_at?: string | null
          intent_id?: string
          organization_id?: string
          provider_message_id?: string | null
          resolved_at?: string | null
          safe_summary?: string | null
          status_page_id?: string
          suggested_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_delivery_dead_lette_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_dead_letter_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_dead_letters_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscriber_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_dead_letters_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: true
            referencedRelation: "status_page_subscriber_delivery_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_delivery_deduplication: {
        Row: {
          created_at: string
          dedup_key: string
          intent_id: string | null
          organization_id: string
        }
        Insert: {
          created_at?: string
          dedup_key: string
          intent_id?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string
          dedup_key?: string
          intent_id?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_delivery_deduplicat_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_delivery_intents: {
        Row: {
          attempt_count: number
          completed_at: string | null
          content_revision: number
          created_at: string
          dedup_key: string | null
          event_id: string | null
          event_type: string
          id: string
          is_manual: boolean
          last_error_category: string | null
          lease_expires_at: string | null
          locked_at: string | null
          locked_by_worker: string | null
          match_explanation: string | null
          max_attempts: number
          message_kind: string
          next_attempt_at: string | null
          organization_id: string
          provider_message_id: string | null
          render_payload: Json
          scheduled_at: string
          status: string
          status_page_id: string
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          content_revision?: number
          created_at?: string
          dedup_key?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          is_manual?: boolean
          last_error_category?: string | null
          lease_expires_at?: string | null
          locked_at?: string | null
          locked_by_worker?: string | null
          match_explanation?: string | null
          max_attempts?: number
          message_kind: string
          next_attempt_at?: string | null
          organization_id: string
          provider_message_id?: string | null
          render_payload?: Json
          scheduled_at?: string
          status?: string
          status_page_id: string
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          content_revision?: number
          created_at?: string
          dedup_key?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          is_manual?: boolean
          last_error_category?: string | null
          lease_expires_at?: string | null
          locked_at?: string | null
          locked_by_worker?: string | null
          match_explanation?: string | null
          max_attempts?: number
          message_kind?: string
          next_attempt_at?: string | null
          organization_id?: string
          provider_message_id?: string | null
          render_payload?: Json
          scheduled_at?: string
          status?: string
          status_page_id?: string
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_delivery_intents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscriber_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_intents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_intents_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_intents_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_delivery_suppressions: {
        Row: {
          created_at: string
          event_id: string | null
          event_type: string | null
          explanation: string | null
          id: string
          organization_id: string
          reason: string
          status_page_id: string
          subscriber_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          event_type?: string | null
          explanation?: string | null
          id?: string
          organization_id: string
          reason: string
          status_page_id: string
          subscriber_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          event_type?: string | null
          explanation?: string | null
          id?: string
          organization_id?: string
          reason?: string
          status_page_id?: string
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_delivery_suppressio_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_suppression_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_suppressions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscriber_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_delivery_suppressions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_event_prefs: {
        Row: {
          all_components: boolean
          created_at: string
          incident_opened: boolean
          incident_reopened: boolean
          incident_resolved: boolean
          incident_updates: boolean
          maintenance_canceled: boolean
          maintenance_completed: boolean
          maintenance_scheduled: boolean
          maintenance_started: boolean
          maintenance_updates: boolean
          organization_id: string
          status_page_id: string
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          all_components?: boolean
          created_at?: string
          incident_opened?: boolean
          incident_reopened?: boolean
          incident_resolved?: boolean
          incident_updates?: boolean
          maintenance_canceled?: boolean
          maintenance_completed?: boolean
          maintenance_scheduled?: boolean
          maintenance_started?: boolean
          maintenance_updates?: boolean
          organization_id: string
          status_page_id: string
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          all_components?: boolean
          created_at?: string
          incident_opened?: boolean
          incident_reopened?: boolean
          incident_resolved?: boolean
          incident_updates?: boolean
          maintenance_canceled?: boolean
          maintenance_completed?: boolean
          maintenance_scheduled?: boolean
          maintenance_started?: boolean
          maintenance_updates?: boolean
          organization_id?: string
          status_page_id?: string
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_event_prefs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_event_prefs_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_event_prefs_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: true
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_events: {
        Row: {
          content_revision: number
          created_at: string
          eligible_count: number | null
          event_type: string
          fanned_out_at: string | null
          fanout_status: string
          id: string
          idempotency_key: string
          incident_id: string | null
          intent_count: number
          maintenance_window_id: string | null
          manual_message_id: string | null
          occurred_at: string
          organization_id: string
          page_wide: boolean
          public_payload: Json
          schema_version: number
          status_page_id: string
          updated_at: string
        }
        Insert: {
          content_revision?: number
          created_at?: string
          eligible_count?: number | null
          event_type: string
          fanned_out_at?: string | null
          fanout_status?: string
          id?: string
          idempotency_key: string
          incident_id?: string | null
          intent_count?: number
          maintenance_window_id?: string | null
          manual_message_id?: string | null
          occurred_at?: string
          organization_id: string
          page_wide?: boolean
          public_payload?: Json
          schema_version?: number
          status_page_id: string
          updated_at?: string
        }
        Update: {
          content_revision?: number
          created_at?: string
          eligible_count?: number | null
          event_type?: string
          fanned_out_at?: string | null
          fanout_status?: string
          id?: string
          idempotency_key?: string
          incident_id?: string | null
          intent_count?: number
          maintenance_window_id?: string | null
          manual_message_id?: string | null
          occurred_at?: string
          organization_id?: string
          page_wide?: boolean
          public_payload?: Json
          schema_version?: number
          status_page_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_events_maintenance_window_id_fkey"
            columns: ["maintenance_window_id"]
            isOneToOne: false
            referencedRelation: "maintenance_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_events_manual_message_id_fkey"
            columns: ["manual_message_id"]
            isOneToOne: false
            referencedRelation: "status_page_manual_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_events_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          download_expires_at: string | null
          filters: Json
          id: string
          organization_id: string
          requested_by_user_id: string | null
          row_count: number | null
          status: string
          status_page_id: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          download_expires_at?: string | null
          filters?: Json
          id?: string
          organization_id: string
          requested_by_user_id?: string | null
          row_count?: number | null
          status?: string
          status_page_id: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          download_expires_at?: string | null
          filters?: Json
          id?: string
          organization_id?: string
          requested_by_user_id?: string | null
          row_count?: number | null
          status?: string
          status_page_id?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_export_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_export_jobs_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_export_jobs_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_import_jobs: {
        Row: {
          activation_mode: string
          completed_at: string | null
          confirmed_rows: number | null
          consent_attested: boolean
          consent_source: string | null
          created_at: string
          duplicate_rows: number | null
          error_summary: string | null
          expires_at: string | null
          failed_rows: number | null
          id: string
          invalid_rows: number | null
          organization_id: string
          pending_rows: number | null
          requested_by_user_id: string | null
          result_report_path: string | null
          status: string
          status_page_id: string
          storage_path: string | null
          suppressed_rows: number | null
          total_rows: number | null
          updated_at: string
          valid_rows: number | null
        }
        Insert: {
          activation_mode?: string
          completed_at?: string | null
          confirmed_rows?: number | null
          consent_attested?: boolean
          consent_source?: string | null
          created_at?: string
          duplicate_rows?: number | null
          error_summary?: string | null
          expires_at?: string | null
          failed_rows?: number | null
          id?: string
          invalid_rows?: number | null
          organization_id: string
          pending_rows?: number | null
          requested_by_user_id?: string | null
          result_report_path?: string | null
          status?: string
          status_page_id: string
          storage_path?: string | null
          suppressed_rows?: number | null
          total_rows?: number | null
          updated_at?: string
          valid_rows?: number | null
        }
        Update: {
          activation_mode?: string
          completed_at?: string | null
          confirmed_rows?: number | null
          consent_attested?: boolean
          consent_source?: string | null
          created_at?: string
          duplicate_rows?: number | null
          error_summary?: string | null
          expires_at?: string | null
          failed_rows?: number | null
          id?: string
          invalid_rows?: number | null
          organization_id?: string
          pending_rows?: number | null
          requested_by_user_id?: string | null
          result_report_path?: string | null
          status?: string
          status_page_id?: string
          storage_path?: string | null
          suppressed_rows?: number | null
          total_rows?: number | null
          updated_at?: string
          valid_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_import_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_import_jobs_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_import_jobs_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_preference_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          organization_id: string
          purpose: string
          revoked_at: string | null
          status_page_id: string
          subscriber_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          organization_id: string
          purpose?: string
          revoked_at?: string | null
          status_page_id: string
          subscriber_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          organization_id?: string
          purpose?: string
          revoked_at?: string | null
          status_page_id?: string
          subscriber_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_preference_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_preference_tokens_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_preference_tokens_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_preferences: {
        Row: {
          component_id: string | null
          created_at: string
          id: string
          incident_updates: boolean
          maintenance_updates: boolean
          organization_id: string
          status_page_id: string
          subscriber_id: string
        }
        Insert: {
          component_id?: string | null
          created_at?: string
          id?: string
          incident_updates?: boolean
          maintenance_updates?: boolean
          organization_id: string
          status_page_id: string
          subscriber_id: string
        }
        Update: {
          component_id?: string | null
          created_at?: string
          id?: string
          incident_updates?: boolean
          maintenance_updates?: boolean
          organization_id?: string
          status_page_id?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_preferences_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "status_page_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_preferences_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_preferences_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_provider_events: {
        Row: {
          bounce_class: string | null
          event_type: string
          id: string
          intent_id: string | null
          occurred_at: string | null
          organization_id: string | null
          provider: string
          provider_event_id: string | null
          provider_message_id: string | null
          received_at: string
          safe_summary: string | null
          status_page_id: string | null
          subscriber_id: string | null
        }
        Insert: {
          bounce_class?: string | null
          event_type: string
          id?: string
          intent_id?: string | null
          occurred_at?: string | null
          organization_id?: string | null
          provider?: string
          provider_event_id?: string | null
          provider_message_id?: string | null
          received_at?: string
          safe_summary?: string | null
          status_page_id?: string | null
          subscriber_id?: string | null
        }
        Update: {
          bounce_class?: string | null
          event_type?: string
          id?: string
          intent_id?: string | null
          occurred_at?: string | null
          organization_id?: string | null
          provider?: string
          provider_event_id?: string | null
          provider_message_id?: string | null
          received_at?: string
          safe_summary?: string | null
          status_page_id?: string | null
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_provider_events_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscriber_delivery_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_provider_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_provider_events_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_provider_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscriber_suppressions: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          email_hash: string
          id: string
          organization_id: string
          reason: string
          removed_at: string | null
          removed_by_user_id: string | null
          reversible: boolean
          status_page_id: string
          subscriber_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          email_hash: string
          id?: string
          organization_id: string
          reason: string
          removed_at?: string | null
          removed_by_user_id?: string | null
          reversible?: boolean
          status_page_id: string
          subscriber_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          email_hash?: string
          id?: string
          organization_id?: string
          reason?: string
          removed_at?: string | null
          removed_by_user_id?: string | null
          reversible?: boolean
          status_page_id?: string
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscriber_suppressions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_suppressions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_suppressions_removed_by_user_id_fkey"
            columns: ["removed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_suppressions_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscriber_suppressions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "status_page_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_subscribers: {
        Row: {
          bounced_at: string | null
          complained_at: string | null
          confirmation_expires_at: string | null
          confirmation_resend_count: number
          confirmation_sent_at: string | null
          confirmation_token_hash: string | null
          confirmed_at: string | null
          consent_ip_hash: string | null
          consent_source: string | null
          consent_text_version: string | null
          consent_timestamp: string | null
          consent_user_agent_summary: string | null
          created_at: string
          deleted_at: string | null
          deletion_requested_at: string | null
          email_hash: string
          email_normalized: string
          encrypted_email: string | null
          encryption_key_version: number | null
          id: string
          last_confirmation_resend_at: string | null
          last_delivery_at: string | null
          link_token_version: number
          organization_id: string
          soft_bounce_count: number
          source: string
          status: string
          status_page_id: string
          suppressed_at: string | null
          suppression_reason: string | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          bounced_at?: string | null
          complained_at?: string | null
          confirmation_expires_at?: string | null
          confirmation_resend_count?: number
          confirmation_sent_at?: string | null
          confirmation_token_hash?: string | null
          confirmed_at?: string | null
          consent_ip_hash?: string | null
          consent_source?: string | null
          consent_text_version?: string | null
          consent_timestamp?: string | null
          consent_user_agent_summary?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_requested_at?: string | null
          email_hash: string
          email_normalized: string
          encrypted_email?: string | null
          encryption_key_version?: number | null
          id?: string
          last_confirmation_resend_at?: string | null
          last_delivery_at?: string | null
          link_token_version?: number
          organization_id: string
          soft_bounce_count?: number
          source?: string
          status?: string
          status_page_id: string
          suppressed_at?: string | null
          suppression_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          bounced_at?: string | null
          complained_at?: string | null
          confirmation_expires_at?: string | null
          confirmation_resend_count?: number
          confirmation_sent_at?: string | null
          confirmation_token_hash?: string | null
          confirmed_at?: string | null
          consent_ip_hash?: string | null
          consent_source?: string | null
          consent_text_version?: string | null
          consent_timestamp?: string | null
          consent_user_agent_summary?: string | null
          created_at?: string
          deleted_at?: string | null
          deletion_requested_at?: string | null
          email_hash?: string
          email_normalized?: string
          encrypted_email?: string | null
          encryption_key_version?: number | null
          id?: string
          last_confirmation_resend_at?: string | null
          last_delivery_at?: string | null
          link_token_version?: number
          organization_id?: string
          soft_bounce_count?: number
          source?: string
          status?: string
          status_page_id?: string
          suppressed_at?: string | null
          suppression_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_page_subscribers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_subscribers_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_uptime_summaries: {
        Row: {
          avg_response_ms: number | null
          component_id: string
          created_at: string
          day: string
          id: string
          organization_id: string
          sample_count: number
          status_page_id: string
          updated_at: string
          uptime_fraction: number | null
          worst_state: string | null
        }
        Insert: {
          avg_response_ms?: number | null
          component_id: string
          created_at?: string
          day: string
          id?: string
          organization_id: string
          sample_count?: number
          status_page_id: string
          updated_at?: string
          uptime_fraction?: number | null
          worst_state?: string | null
        }
        Update: {
          avg_response_ms?: number | null
          component_id?: string
          created_at?: string
          day?: string
          id?: string
          organization_id?: string
          sample_count?: number
          status_page_id?: string
          updated_at?: string
          uptime_fraction?: number | null
          worst_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_page_uptime_summaries_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "status_page_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_uptime_summaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_uptime_summaries_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_page_versions: {
        Row: {
          content_hash: string | null
          created_at: string
          created_by_user_id: string | null
          id: string
          organization_id: string
          snapshot: Json
          status_page_id: string
          version_number: number
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          organization_id: string
          snapshot: Json
          status_page_id: string
          version_number: number
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          organization_id?: string
          snapshot?: Json
          status_page_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "status_page_versions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_page_versions_status_page_id_fkey"
            columns: ["status_page_id"]
            isOneToOne: false
            referencedRelation: "status_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      status_pages: {
        Row: {
          appearance: Json
          auto_publish_incidents: string
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          description: string | null
          draft_version_id: string | null
          favicon_asset_id: string | null
          headline: string | null
          id: string
          incident_history_window: string
          index_incident_archive: boolean
          index_individual_incidents: boolean
          last_public_change_at: string | null
          locale: string
          logo_asset_id: string | null
          name: string
          organization_id: string
          password_hash: string | null
          powered_by_visible: boolean
          primary_domain_id: string | null
          private_link_token_hash: string | null
          public_state_delay_seconds: number
          published_at: string | null
          published_version_id: string | null
          search_indexing_enabled: boolean
          show_component_descriptions: boolean
          show_incident_history: boolean
          show_response_time: boolean
          show_scheduled_maintenance: boolean
          show_subscriber_form: boolean
          show_uptime_history: boolean
          slug: string
          status: string
          subscriber_all_components_default: boolean
          subscriber_component_selection_enabled: boolean
          subscriber_confirmation_cooldown_seconds: number
          subscriber_form_auto_paused_at: string | null
          subscriber_form_pause_reason: string | null
          subscriber_incident_opened_enabled: boolean
          subscriber_incident_reopened_enabled: boolean
          subscriber_incident_resolved_enabled: boolean
          subscriber_incident_updates_enabled: boolean
          subscriber_maintenance_canceled_enabled: boolean
          subscriber_maintenance_completed_enabled: boolean
          subscriber_maintenance_scheduled_enabled: boolean
          subscriber_maintenance_started_enabled: boolean
          subscriber_maintenance_updated_enabled: boolean
          subscriber_manual_notice_enabled: boolean
          subscriber_powered_by_removed: boolean
          subscriber_privacy_url: string | null
          subscriber_public_count_visible: boolean
          subscriber_reply_to: string | null
          subscriber_reply_to_verified: boolean
          subscriptions_enabled: boolean
          support_url: string | null
          theme_key: string
          timezone: string
          title: string | null
          updated_at: string
          updated_by_user_id: string | null
          uptime_history_days: number
          visibility: string
          website_url: string | null
        }
        Insert: {
          appearance?: Json
          auto_publish_incidents?: string
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          description?: string | null
          draft_version_id?: string | null
          favicon_asset_id?: string | null
          headline?: string | null
          id?: string
          incident_history_window?: string
          index_incident_archive?: boolean
          index_individual_incidents?: boolean
          last_public_change_at?: string | null
          locale?: string
          logo_asset_id?: string | null
          name: string
          organization_id: string
          password_hash?: string | null
          powered_by_visible?: boolean
          primary_domain_id?: string | null
          private_link_token_hash?: string | null
          public_state_delay_seconds?: number
          published_at?: string | null
          published_version_id?: string | null
          search_indexing_enabled?: boolean
          show_component_descriptions?: boolean
          show_incident_history?: boolean
          show_response_time?: boolean
          show_scheduled_maintenance?: boolean
          show_subscriber_form?: boolean
          show_uptime_history?: boolean
          slug: string
          status?: string
          subscriber_all_components_default?: boolean
          subscriber_component_selection_enabled?: boolean
          subscriber_confirmation_cooldown_seconds?: number
          subscriber_form_auto_paused_at?: string | null
          subscriber_form_pause_reason?: string | null
          subscriber_incident_opened_enabled?: boolean
          subscriber_incident_reopened_enabled?: boolean
          subscriber_incident_resolved_enabled?: boolean
          subscriber_incident_updates_enabled?: boolean
          subscriber_maintenance_canceled_enabled?: boolean
          subscriber_maintenance_completed_enabled?: boolean
          subscriber_maintenance_scheduled_enabled?: boolean
          subscriber_maintenance_started_enabled?: boolean
          subscriber_maintenance_updated_enabled?: boolean
          subscriber_manual_notice_enabled?: boolean
          subscriber_powered_by_removed?: boolean
          subscriber_privacy_url?: string | null
          subscriber_public_count_visible?: boolean
          subscriber_reply_to?: string | null
          subscriber_reply_to_verified?: boolean
          subscriptions_enabled?: boolean
          support_url?: string | null
          theme_key?: string
          timezone?: string
          title?: string | null
          updated_at?: string
          updated_by_user_id?: string | null
          uptime_history_days?: number
          visibility?: string
          website_url?: string | null
        }
        Update: {
          appearance?: Json
          auto_publish_incidents?: string
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          description?: string | null
          draft_version_id?: string | null
          favicon_asset_id?: string | null
          headline?: string | null
          id?: string
          incident_history_window?: string
          index_incident_archive?: boolean
          index_individual_incidents?: boolean
          last_public_change_at?: string | null
          locale?: string
          logo_asset_id?: string | null
          name?: string
          organization_id?: string
          password_hash?: string | null
          powered_by_visible?: boolean
          primary_domain_id?: string | null
          private_link_token_hash?: string | null
          public_state_delay_seconds?: number
          published_at?: string | null
          published_version_id?: string | null
          search_indexing_enabled?: boolean
          show_component_descriptions?: boolean
          show_incident_history?: boolean
          show_response_time?: boolean
          show_scheduled_maintenance?: boolean
          show_subscriber_form?: boolean
          show_uptime_history?: boolean
          slug?: string
          status?: string
          subscriber_all_components_default?: boolean
          subscriber_component_selection_enabled?: boolean
          subscriber_confirmation_cooldown_seconds?: number
          subscriber_form_auto_paused_at?: string | null
          subscriber_form_pause_reason?: string | null
          subscriber_incident_opened_enabled?: boolean
          subscriber_incident_reopened_enabled?: boolean
          subscriber_incident_resolved_enabled?: boolean
          subscriber_incident_updates_enabled?: boolean
          subscriber_maintenance_canceled_enabled?: boolean
          subscriber_maintenance_completed_enabled?: boolean
          subscriber_maintenance_scheduled_enabled?: boolean
          subscriber_maintenance_started_enabled?: boolean
          subscriber_maintenance_updated_enabled?: boolean
          subscriber_manual_notice_enabled?: boolean
          subscriber_powered_by_removed?: boolean
          subscriber_privacy_url?: string | null
          subscriber_public_count_visible?: boolean
          subscriber_reply_to?: string | null
          subscriber_reply_to_verified?: boolean
          subscriptions_enabled?: boolean
          support_url?: string | null
          theme_key?: string
          timezone?: string
          title?: string | null
          updated_at?: string
          updated_by_user_id?: string | null
          uptime_history_days?: number
          visibility?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_pages_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pages_draft_version_fk"
            columns: ["draft_version_id"]
            isOneToOne: false
            referencedRelation: "status_page_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pages_favicon_asset_fk"
            columns: ["favicon_asset_id"]
            isOneToOne: false
            referencedRelation: "status_page_brand_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pages_logo_asset_fk"
            columns: ["logo_asset_id"]
            isOneToOne: false
            referencedRelation: "status_page_brand_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pages_primary_domain_fk"
            columns: ["primary_domain_id"]
            isOneToOne: false
            referencedRelation: "status_page_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pages_published_version_fk"
            columns: ["published_version_id"]
            isOneToOne: false
            referencedRelation: "status_page_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_pages_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_account_context_access: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          organization_id: string
          result_category: string
          tool_name: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          organization_id: string
          result_category: string
          tool_name: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          result_category?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_account_context_access_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          participant_ref: string
          participant_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          participant_ref: string
          participant_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          participant_ref?: string
          participant_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversations: {
        Row: {
          closed_at: string | null
          created_at: string
          deleted_at: string | null
          handoff_state: string
          id: string
          intent: string | null
          last_activity_at: string
          mode: string
          organization_id: string | null
          product_area: string | null
          provider: string
          provider_conversation_id: string | null
          redaction_state: string
          retention_class: string
          session_id: string | null
          state: string
          title: string | null
          updated_at: string
          user_id: string | null
          visibility: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          handoff_state?: string
          id?: string
          intent?: string | null
          last_activity_at?: string
          mode: string
          organization_id?: string | null
          product_area?: string | null
          provider?: string
          provider_conversation_id?: string | null
          redaction_state?: string
          retention_class?: string
          session_id?: string | null
          state?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
          visibility?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          handoff_state?: string
          id?: string
          intent?: string | null
          last_activity_at?: string
          mode?: string
          organization_id?: string | null
          product_area?: string | null
          provider?: string
          provider_conversation_id?: string | null
          redaction_state?: string
          retention_class?: string
          session_id?: string | null
          state?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_documentation_gaps: {
        Row: {
          created_at: string
          frequency: number
          id: string
          intent: string | null
          product_area: string | null
          sanitized_question: string
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          frequency?: number
          id?: string
          intent?: string | null
          product_area?: string | null
          sanitized_question: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          frequency?: number
          id?: string
          intent?: string | null
          product_area?: string | null
          sanitized_question?: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_feedback: {
        Row: {
          comment_redacted: string | null
          conversation_id: string
          created_at: string
          helpful: boolean
          id: string
          message_id: string | null
          reasons: string[]
        }
        Insert: {
          comment_redacted?: string | null
          conversation_id: string
          created_at?: string
          helpful: boolean
          id?: string
          message_id?: string | null
          reasons?: string[]
        }
        Update: {
          comment_redacted?: string | null
          conversation_id?: string
          created_at?: string
          helpful?: boolean
          id?: string
          message_id?: string | null
          reasons?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "support_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "support_messages_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      support_handoffs: {
        Row: {
          contact_email_hash: string | null
          conversation_id: string
          created_at: string
          id: string
          provider_handoff_id: string | null
          routing_tag: string
          status: string
          summary_redacted: string | null
          updated_at: string
        }
        Insert: {
          contact_email_hash?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          provider_handoff_id?: string | null
          routing_tag: string
          status?: string
          summary_redacted?: string | null
          updated_at?: string
        }
        Update: {
          contact_email_hash?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          provider_handoff_id?: string | null
          routing_tag?: string
          status?: string
          summary_redacted?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_handoffs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_intents: {
        Row: {
          confidence_bucket: string | null
          conversation_id: string
          created_at: string
          id: string
          intent: string
        }
        Insert: {
          confidence_bucket?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          intent: string
        }
        Update: {
          confidence_bucket?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          intent?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_intents_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_knowledge_syncs: {
        Row: {
          content_version: string
          created_at: string
          error_category: string | null
          id: string
          provider_ref: string | null
          source_id: string
          sync_state: string
          updated_at: string
        }
        Insert: {
          content_version: string
          created_at?: string
          error_category?: string | null
          id?: string
          provider_ref?: string | null
          source_id: string
          sync_state: string
          updated_at?: string
        }
        Update: {
          content_version?: string
          created_at?: string
          error_category?: string | null
          id?: string
          provider_ref?: string | null
          source_id?: string
          sync_state?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_leads: {
        Row: {
          company_name: string | null
          conversation_id: string | null
          created_at: string
          custom_domain_need: boolean | null
          email_hash: string | null
          id: string
          monitor_count_band: string | null
          source_page: string | null
          team_size_band: string | null
        }
        Insert: {
          company_name?: string | null
          conversation_id?: string | null
          created_at?: string
          custom_domain_need?: boolean | null
          email_hash?: string | null
          id?: string
          monitor_count_band?: string | null
          source_page?: string | null
          team_size_band?: string | null
        }
        Update: {
          company_name?: string | null
          conversation_id?: string | null
          created_at?: string
          custom_domain_need?: boolean | null
          email_hash?: string | null
          id?: string
          monitor_count_band?: string | null
          source_page?: string | null
          team_size_band?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_message_sources: {
        Row: {
          created_at: string
          id: string
          message_id: string
          source_id: string
          source_title: string
          source_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          source_id: string
          source_title: string
          source_url: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          source_id?: string
          source_title?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_message_sources_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "support_messages_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages_metadata: {
        Row: {
          author_type: string
          conversation_id: string
          created_at: string
          has_body_local: boolean
          id: string
          message_type: string
          provider_message_id: string | null
          redacted: boolean
          sequence: number
        }
        Insert: {
          author_type: string
          conversation_id: string
          created_at?: string
          has_body_local?: boolean
          id?: string
          message_type: string
          provider_message_id?: string | null
          redacted?: boolean
          sequence?: number
        }
        Update: {
          author_type?: string
          conversation_id?: string
          created_at?: string
          has_body_local?: boolean
          id?: string
          message_type?: string
          provider_message_id?: string | null
          redacted?: boolean
          sequence?: number
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_metadata_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_provider_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          payload_category: string | null
          processed_at: string
          provider: string
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          payload_category?: string | null
          processed_at?: string
          provider?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          payload_category?: string | null
          processed_at?: string
          provider?: string
        }
        Relationships: []
      }
      support_reconciliation_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          differences_count: number
          dry_run: boolean
          id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          differences_count?: number
          dry_run?: boolean
          id?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          differences_count?: number
          dry_run?: boolean
          id?: string
          status?: string
        }
        Relationships: []
      }
      support_redactions: {
        Row: {
          conversation_id: string
          created_at: string
          detection_type: string
          id: string
          message_meta_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          detection_type: string
          id?: string
          message_meta_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          detection_type?: string
          id?: string
          message_meta_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_redactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_redactions_message_meta_id_fkey"
            columns: ["message_meta_id"]
            isOneToOne: false
            referencedRelation: "support_messages_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      support_safety_events: {
        Row: {
          conversation_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          severity: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          severity?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_safety_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          created_at: string
          replay_count: number
          tours: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          replay_count?: number
          tours?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          replay_count?: number
          tours?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          chart_density: string
          created_at: string
          date_format: string
          default_landing: string
          time_format: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          chart_density?: string
          created_at?: string
          date_format?: string
          default_landing?: string
          time_format?: string
          updated_at?: string
          user_id: string
          week_start?: string
        }
        Update: {
          chart_density?: string
          created_at?: string
          date_format?: string
          default_landing?: string
          time_format?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          external_id: string
          id: string
          last_seen_at: string | null
          locale: string
          marketing_email_preference: boolean
          onboarding_status: string
          primary_email: string | null
          product_email_preference: boolean
          reduced_motion_preference: string
          suspended_at: string | null
          theme_preference: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          external_id: string
          id?: string
          last_seen_at?: string | null
          locale?: string
          marketing_email_preference?: boolean
          onboarding_status?: string
          primary_email?: string | null
          product_email_preference?: boolean
          reduced_motion_preference?: string
          suspended_at?: string | null
          theme_preference?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          external_id?: string
          id?: string
          last_seen_at?: string | null
          locale?: string
          marketing_email_preference?: boolean
          onboarding_status?: string
          primary_email?: string | null
          product_email_preference?: boolean
          reduced_motion_preference?: string
          suspended_at?: string | null
          theme_preference?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_report_recipients: {
        Row: {
          added_by_user_id: string | null
          created_at: string
          id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          added_by_user_id?: string | null
          created_at?: string
          id?: string
          organization_id: string
          user_id: string
        }
        Update: {
          added_by_user_id?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_report_recipients_added_by_user_id_fkey"
            columns: ["added_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_report_recipients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_report_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reports: {
        Row: {
          created_at: string
          data_completeness: string
          generated_at: string
          id: string
          metrics_version: number
          organization_id: string
          period_end: string
          period_start: string
          snapshot: Json
          timezone: string
        }
        Insert: {
          created_at?: string
          data_completeness?: string
          generated_at?: string
          id?: string
          metrics_version?: number
          organization_id: string
          period_end: string
          period_start: string
          snapshot: Json
          timezone?: string
        }
        Update: {
          created_at?: string
          data_completeness?: string
          generated_at?: string
          id?: string
          metrics_version?: number
          organization_id?: string
          period_end?: string
          period_start?: string
          snapshot?: Json
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_subscriber_provider_event: {
        Args: {
          p_bounce_class: string
          p_event_type: string
          p_provider: string
          p_provider_event_id: string
          p_provider_message_id: string
          p_safe_summary: string
          p_soft_bounce_threshold?: number
        }
        Returns: string
      }
      cancel_lifecycle_intents: {
        Args: { p_message_keys: string[]; p_reason: string; p_user_id: string }
        Returns: number
      }
      cancel_pending_subscriber_intents: {
        Args: { p_subscriber_id: string }
        Returns: number
      }
      claim_alert_outbox: {
        Args: { p_limit?: number }
        Returns: {
          event_type: string
          id: string
          incident_id: string
          monitor_id: string
          occurred_at: string
          organization_id: string
          payload: Json
          schema_version: number
        }[]
      }
      claim_subscriber_events: {
        Args: { p_limit?: number }
        Returns: {
          content_revision: number
          event_type: string
          id: string
          occurred_at: string
          organization_id: string
          page_wide: boolean
          public_payload: Json
          status_page_id: string
        }[]
      }
      create_alert_intent: {
        Args: {
          p_channel_id: string
          p_channel_version: number
          p_dedup_key: string
          p_event_payload: Json
          p_event_type: string
          p_incident_id: string
          p_kind: string
          p_max_attempts: number
          p_monitor_id: string
          p_organization_id: string
          p_outbox_id: string
          p_provider: string
          p_routing_explanation: string
          p_rule_id: string
          p_scheduled_at: string
          p_severity: string
        }
        Returns: string
      }
      create_lifecycle_intent: {
        Args: {
          p_dedup_key: string
          p_message_class: string
          p_message_key: string
          p_organization_id: string
          p_payload: Json
          p_related_id?: string
          p_related_type?: string
          p_scheduled_at: string
          p_template_version: number
          p_user_id: string
        }
        Returns: string
      }
      create_subscriber_intent: {
        Args: {
          p_content_revision: number
          p_dedup_key: string
          p_event_id: string
          p_event_type: string
          p_is_manual?: boolean
          p_match_explanation: string
          p_message_kind: string
          p_organization_id: string
          p_render_payload: Json
          p_status_page_id: string
          p_subscriber_id: string
        }
        Returns: string
      }
      detect_missed_heartbeats: { Args: never; Returns: number }
      expire_stale_alert_leases: { Args: never; Returns: number }
      expire_stale_lifecycle_leases: { Args: never; Returns: number }
      expire_stale_subscriber_leases: { Args: never; Returns: number }
      incident_acknowledge: {
        Args: {
          p_acknowledge: boolean
          p_actor_user_id: string
          p_incident_id: string
          p_note: string
          p_organization_id: string
        }
        Returns: undefined
      }
      incident_add_note: {
        Args: {
          p_actor_user_id: string
          p_body: string
          p_incident_id: string
          p_organization_id: string
        }
        Returns: string
      }
      incident_add_update: {
        Args: {
          p_actor_user_id: string
          p_body: string
          p_incident_id: string
          p_organization_id: string
          p_update_type: string
          p_visibility: string
        }
        Returns: string
      }
      incident_assign: {
        Args: {
          p_actor_user_id: string
          p_assignee_user_id: string
          p_incident_id: string
          p_organization_id: string
        }
        Returns: undefined
      }
      incident_attach_monitor: {
        Args: {
          p_actor_user_id: string
          p_incident_id: string
          p_monitor_id: string
          p_note: string
          p_organization_id: string
          p_relationship: string
        }
        Returns: undefined
      }
      incident_cancel: {
        Args: {
          p_actor_user_id: string
          p_incident_id: string
          p_organization_id: string
          p_reason: string
        }
        Returns: undefined
      }
      incident_change_severity: {
        Args: {
          p_actor_user_id: string
          p_incident_id: string
          p_organization_id: string
          p_severity: string
        }
        Returns: undefined
      }
      incident_create_manual: {
        Args: {
          p_actor_user_id: string
          p_assignee_user_id: string
          p_internal_summary: string
          p_opened_at: string
          p_operational_status: string
          p_organization_id: string
          p_public_summary: string
          p_public_visibility: string
          p_severity: string
          p_title: string
        }
        Returns: string
      }
      incident_remove_monitor: {
        Args: {
          p_actor_user_id: string
          p_incident_id: string
          p_monitor_id: string
          p_organization_id: string
        }
        Returns: undefined
      }
      incident_resolve: {
        Args: {
          p_actor_user_id: string
          p_incident_id: string
          p_organization_id: string
          p_resolution_summary: string
          p_suppress_reopen_seconds: number
        }
        Returns: undefined
      }
      lease_alert_deliveries: {
        Args: { p_lease_seconds?: number; p_max?: number; p_worker: string }
        Returns: {
          attempt_count: number
          channel_id: string
          channel_version: number
          event_payload: Json
          event_type: string
          id: string
          incident_id: string
          kind: string
          max_attempts: number
          monitor_id: string
          organization_id: string
          provider: string
          rule_id: string
          severity: string
        }[]
      }
      lease_lifecycle_deliveries: {
        Args: { p_lease_seconds?: number; p_max?: number; p_worker: string }
        Returns: {
          attempt_count: number
          id: string
          max_attempts: number
          message_class: string
          message_key: string
          organization_id: string
          payload: Json
          related_id: string
          related_type: string
          template_version: number
          user_id: string
        }[]
      }
      lease_subscriber_deliveries: {
        Args: { p_lease_seconds?: number; p_max?: number; p_worker: string }
        Returns: {
          attempt_count: number
          event_id: string
          event_type: string
          id: string
          max_attempts: number
          message_kind: string
          organization_id: string
          render_payload: Json
          status_page_id: string
          subscriber_id: string
        }[]
      }
      maintenance_notify: {
        Args: {
          p_event_type: string
          p_organization_id: string
          p_window_id: string
        }
        Returns: undefined
      }
      maintenance_tick: { Args: { p_organization_id?: string }; Returns: Json }
      mark_alert_outbox: {
        Args: { p_outbox_id: string; p_reason?: string; p_status: string }
        Returns: undefined
      }
      mark_subscriber_event: {
        Args: {
          p_eligible: number
          p_event_id: string
          p_intent_count: number
          p_status: string
        }
        Returns: undefined
      }
      monitor_result_stats: {
        Args: { p_monitor?: string; p_org: string; p_since: string }
        Returns: {
          avg_total_ms: number
          blocked: number
          errored: number
          failed: number
          last_checked_at: string
          monitor_id: string
          passed: number
          timed_out: number
          total_considered: number
        }[]
      }
      next_subscriber_fanout_batch: {
        Args: {
          p_after_created?: string
          p_after_id?: string
          p_event_id: string
          p_limit?: number
        }
        Returns: {
          component_match: boolean
          created_at: string
          event_pref_ok: boolean
          subscriber_id: string
        }[]
      }
      process_incident_evaluations: {
        Args: { p_limit?: number }
        Returns: number
      }
      reconcile_alert_delivery: {
        Args: { p_dry_run?: boolean; p_limit?: number }
        Returns: Json
      }
      reconcile_incident_state: {
        Args: { p_dry_run?: boolean; p_limit?: number }
        Returns: Json
      }
      reconcile_lifecycle_delivery: {
        Args: { p_dry_run?: boolean; p_limit?: number }
        Returns: Json
      }
      reconcile_subscriber_delivery: {
        Args: { p_dry_run?: boolean; p_limit?: number }
        Returns: Json
      }
      record_alert_attempt: {
        Args: {
          p_duration_ms: number
          p_error_category: string
          p_http_status: number
          p_intent_id: string
          p_is_manual?: boolean
          p_provider_request_id: string
          p_result: string
          p_safe_summary: string
        }
        Returns: string
      }
      record_alert_test_result: {
        Args: {
          p_duration_ms: number
          p_error_category: string
          p_http_status: number
          p_result: string
          p_safe_summary: string
          p_test_id: string
        }
        Returns: undefined
      }
      record_lifecycle_attempt: {
        Args: {
          p_duration_ms?: number
          p_error_category?: string
          p_http_status?: number
          p_intent_id: string
          p_provider_message_id?: string
          p_result: string
          p_safe_summary?: string
          p_suppression_reason?: string
        }
        Returns: string
      }
      record_subscriber_attempt: {
        Args: {
          p_duration_ms: number
          p_error_category: string
          p_http_status: number
          p_intent_id: string
          p_is_manual?: boolean
          p_provider_request_id: string
          p_result: string
          p_safe_summary: string
        }
        Returns: string
      }
      record_subscriber_suppression: {
        Args: {
          p_event_id: string
          p_event_type: string
          p_explanation: string
          p_organization_id: string
          p_reason: string
          p_status_page_id: string
          p_subscriber_id: string
        }
        Returns: undefined
      }
      replay_check_evaluation: {
        Args: { p_evaluation_version?: number; p_execution_id: string }
        Returns: string
      }
      report_check_stats: {
        Args: { p_from: string; p_org: string; p_to: string }
        Returns: {
          avg_success_ms: number
          blocked: number
          errored: number
          failed: number
          monitor_id: string
          p95_success_ms: number
          passed: number
          timed_out: number
          total_considered: number
        }[]
      }
      status_page_component_uptime: {
        Args: { p_monitor_ids: string[]; p_org: string; p_since: string }
        Returns: {
          avg_ms: number
          day: string
          passed: number
          total: number
        }[]
      }
      suppress_subscriber: {
        Args: {
          p_actor_profile_id?: string
          p_reason: string
          p_reversible?: boolean
          p_subscriber_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
