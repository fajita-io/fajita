import "server-only";

const APPSUMO_TOKEN_URL = "https://appsumo.com/openid/token/";
const APPSUMO_LICENSE_KEY_URL = "https://appsumo.com/openid/license_key/";
const APPSUMO_API_BASE = "https://api.licensing.appsumo.com/v2/";

export function appsumoClientId(): string | null {
  return process.env.APPSUMO_CLIENT_ID?.trim() || null;
}

export function appsumoClientSecret(): string | null {
  return process.env.APPSUMO_CLIENT_SECRET?.trim() || null;
}

export function appsumoLicensingKey(): string | null {
  return process.env.APPSUMO_LICENSING_KEY?.trim() || null;
}

export function appsumoOAuthRedirectUrl(): string {
  const explicit = process.env.APPSUMO_OAUTH_REDIRECT_URL?.trim();
  if (explicit) return explicit;
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io").replace(
    /\/$/,
    "",
  );
  return `${base}/appsumo/oauth/callback`;
}

export function appsumoConfigured(): boolean {
  return Boolean(
    appsumoClientId() && appsumoClientSecret() && appsumoLicensingKey(),
  );
}

export { APPSUMO_TOKEN_URL, APPSUMO_LICENSE_KEY_URL, APPSUMO_API_BASE };
