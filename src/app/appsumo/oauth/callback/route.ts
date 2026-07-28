import { NextResponse } from "next/server";

import {
  exchangeAppsumoCode,
  fetchAppsumoLicenseKey,
  AppsumoOAuthError,
} from "@/lib/appsumo/oauth";
import { appsumoConfigured } from "@/lib/appsumo/config";

export const runtime = "nodejs";

/**
 * AppSumo OAuth redirect target. After purchase, AppSumo sends the customer here
 * with ?code=. We exchange the code for a license key and send them into the
 * in-app redemption flow.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Partner Portal validation sends a bare GET with no code. Must return 200
  // before OAuth credentials exist (AppSumo generates them after URL validation).
  if (!code) {
    return new NextResponse("OK", { status: 200 });
  }

  if (!appsumoConfigured()) {
    return NextResponse.json(
      { error: "AppSumo OAuth is not configured." },
      { status: 503 },
    );
  }

  try {
    const tokens = await exchangeAppsumoCode(code);
    const license = await fetchAppsumoLicenseKey(tokens.access_token);

    const redeemUrl = new URL("/app/start/appsumo", url.origin);
    redeemUrl.searchParams.set("license_key", license.license_key);
    if (license.status === "deactivated") {
      redeemUrl.searchParams.set("status", "deactivated");
    }

    return NextResponse.redirect(redeemUrl);
  } catch (error) {
    if (error instanceof AppsumoOAuthError) {
      const failUrl = new URL("/app/start/appsumo", url.origin);
      failUrl.searchParams.set("error", "oauth");
      return NextResponse.redirect(failUrl);
    }
    throw error;
  }
}
