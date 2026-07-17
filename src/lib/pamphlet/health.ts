import { isPamphletCapabilityVerified } from "./capabilities";
import { isPamphletConfigured, pamphletConfig } from "./config";
import type { PamphletHealth } from "./types";

export function getPamphletHealth(): PamphletHealth {
  const configured = isPamphletConfigured();
  const cfg = pamphletConfig();
  const contractVerified =
    isPamphletCapabilityVerified("conversation_create") &&
    isPamphletCapabilityVerified("message_send");

  if (!configured) {
    return {
      status: "not_configured",
      configured: false,
      contractVerified: false,
      details:
        "Pamphlet API credentials are unset. Ask Fajita answers from Fajita approved sources locally. Provider sync and provider handoff stay disabled.",
      checkedAt: new Date().toISOString(),
    };
  }

  if (!contractVerified) {
    return {
      status: "contract_unverified",
      configured: true,
      contractVerified: false,
      details:
        "Pamphlet env is present, but no verified public API contract is recorded in this repository. Provider calls remain disabled to avoid invented endpoints.",
      checkedAt: new Date().toISOString(),
    };
  }

  if (!cfg.enabled) {
    return {
      status: "unavailable",
      configured: true,
      contractVerified: true,
      details: "Pamphlet is configured but disabled by PAMPHLET_ENABLED.",
      checkedAt: new Date().toISOString(),
    };
  }

  return {
    status: "ok",
    configured: true,
    contractVerified: true,
    details: "Pamphlet provider contract verified and enabled.",
    checkedAt: new Date().toISOString(),
  };
}
