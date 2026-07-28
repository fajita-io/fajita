import "server-only";

import {
  APPSUMO_LICENSE_KEY_URL,
  APPSUMO_TOKEN_URL,
  appsumoClientId,
  appsumoClientSecret,
  appsumoOAuthRedirectUrl,
} from "@/lib/appsumo/config";
import type {
  AppsumoLicenseKeyResponse,
  AppsumoTokenResponse,
} from "@/lib/appsumo/types";

export class AppsumoOAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AppsumoOAuthError";
  }
}

async function postToken(body: URLSearchParams): Promise<AppsumoTokenResponse> {
  const clientId = appsumoClientId();
  const clientSecret = appsumoClientSecret();
  if (!clientId || !clientSecret) {
    throw new AppsumoOAuthError("AppSumo OAuth is not configured.", 503);
  }

  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);

  const res = await fetch(APPSUMO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new AppsumoOAuthError(
      "Could not exchange the AppSumo authorization code.",
      res.status,
    );
  }

  return (await res.json()) as AppsumoTokenResponse;
}

/** Exchange a single-use OAuth authorization code for tokens. */
export async function exchangeAppsumoCode(
  code: string,
): Promise<AppsumoTokenResponse> {
  const body = new URLSearchParams({
    code,
    redirect_uri: appsumoOAuthRedirectUrl(),
    grant_type: "authorization_code",
  });
  return postToken(body);
}

/** Refresh an expired access token. */
export async function refreshAppsumoToken(
  refreshToken: string,
): Promise<AppsumoTokenResponse> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  return postToken(body);
}

/** Fetch the license key associated with an access token. */
export async function fetchAppsumoLicenseKey(
  accessToken: string,
): Promise<AppsumoLicenseKeyResponse> {
  const url = new URL(APPSUMO_LICENSE_KEY_URL);
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new AppsumoOAuthError(
      "Could not fetch the AppSumo license key.",
      res.status,
    );
  }

  return (await res.json()) as AppsumoLicenseKeyResponse;
}
