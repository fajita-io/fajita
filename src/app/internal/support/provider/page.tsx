import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { isPlatformAdmin } from "@/lib/auth/context";
import { PAMPHLET_CAPABILITIES } from "@/lib/pamphlet/capabilities";
import { getPamphletHealth } from "@/lib/pamphlet/health";
import { pamphletConfig } from "@/lib/pamphlet/config";

export const metadata: Metadata = {
  title: "Pamphlet provider",
  robots: { index: false, follow: false },
};

export default async function SupportProviderPage() {
  const admin = await isPlatformAdmin();
  if (!admin) redirect("/app");

  const health = getPamphletHealth();
  const cfg = pamphletConfig();

  return (
    <main className="fj-container" style={{ paddingBlock: "2rem" }}>
      <h1>Pamphlet provider</h1>
      <p>{health.details}</p>
      <ul>
        <li>Status: {health.status}</li>
        <li>API base configured: {cfg.apiBaseUrl ? "yes" : "no"}</li>
        <li>API key present: {cfg.apiKeyPresent ? "yes" : "no"}</li>
        <li>Webhook secret present: {cfg.webhookSecretPresent ? "yes" : "no"}</li>
        <li>Public chatbot id: {cfg.publicChatbotId ? "set" : "unset"}</li>
      </ul>
      <h2>Capabilities</h2>
      <ul>
        {Object.values(PAMPHLET_CAPABILITIES).map((cap) => (
          <li key={cap.id}>
            <strong>{cap.id}</strong>: {cap.status}. {cap.reason}
          </li>
        ))}
      </ul>
      <PoweredByPamphlet />
    </main>
  );
}
