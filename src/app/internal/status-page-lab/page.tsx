import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isPlatformAdmin } from "@/lib/auth/context";
import { StatusPageLabClient } from "./status-page-lab-client";

export const metadata: Metadata = {
  title: "Status page lab",
  robots: { index: false, follow: false },
};

/**
 * Internal status-page lab. Renders the public renderer against deterministic
 * fixtures across every state: operational, degraded, outage, maintenance,
 * incident lifecycles, uptime windows, missing data, all four themes, stale
 * projection, and each viewport. Platform-admin only (or development), noindex,
 * excluded from ordinary navigation. No real customer data.
 */
export default async function StatusPageLabPage() {
  const admin = await isPlatformAdmin();
  if (!admin && process.env.NODE_ENV === "production") notFound();

  return (
    <main
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "2.5rem 1.25rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.75rem",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Internal · Fixtures only
        </p>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Status page lab</h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, maxWidth: "68ch" }}>
          The public renderer against synthetic scenarios. Nothing here is a real
          customer. Use it to check every state, theme, and viewport without
          publishing a page.
        </p>
      </header>

      <StatusPageLabClient />
    </main>
  );
}
