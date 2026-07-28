/** AppSumo Licensing API v2 webhook event types. */
export type AppsumoLicenseEvent =
  | "purchase"
  | "activate"
  | "upgrade"
  | "downgrade"
  | "migrate"
  | "deactivate";

export type AppsumoLicenseStatus = "inactive" | "active" | "deactivated";

export interface AppsumoWebhookPayload {
  license_key: string;
  prev_license_key?: string;
  parent_license_key?: string;
  event: AppsumoLicenseEvent;
  event_timestamp: number;
  created_at: number;
  license_status: AppsumoLicenseStatus;
  tier?: number;
  test?: boolean;
  extra?: { reason?: string };
  partner_plan_name?: string;
  unit_quantity?: number;
}

export interface AppsumoWebhookResponse {
  event: AppsumoLicenseEvent;
  success: true;
}

export interface AppsumoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token?: string;
}

export interface AppsumoLicenseKeyResponse {
  license_key: string;
  status: AppsumoLicenseStatus;
  scopes: string[];
}

export type AppsumoWebhookProcessStatus =
  | "processed"
  | "duplicate"
  | "ignored"
  | "failed";
