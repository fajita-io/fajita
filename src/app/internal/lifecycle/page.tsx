import { revalidatePath } from "next/cache";

import { serviceClient } from "@/lib/supabase/service";
import { isPlatformAdmin } from "@/lib/auth/context";
import { lifecycleMessage } from "@/lib/lifecycle/messages";
import {
  reconcileLifecycleDelivery,
  reconcileOnboardingBatch,
} from "@/lib/lifecycle/reconciliation";

/**
 * Internal lifecycle operations view (platform admin only, guarded by the
 * layout). Aggregates only: lifecycle states, delivery health, onboarding
 * funnel counts, and churn reasons. No monitor secrets, subscriber lists,
 * incident notes, card data, or written cancellation feedback bodies.
 */

export const dynamic = "force-dynamic";

async function countBy<T extends string>(
  rows: Array<Record<string, unknown>> | null,
  key: string,
): Promise<Record<T, number>> {
  const out = {} as Record<T, number>;
  for (const row of rows ?? []) {
    const value = String(row[key] ?? "unknown") as T;
    out[value] = (out[value] ?? 0) + 1;
  }
  return out;
}

async function runOnboardingReconcile() {
  "use server";
  if (!(await isPlatformAdmin()) && process.env.NODE_ENV === "production") {
    return;
  }
  await reconcileOnboardingBatch(100, false);
  revalidatePath("/internal/lifecycle");
}

async function runDeliveryReconcile() {
  "use server";
  if (!(await isPlatformAdmin()) && process.env.NODE_ENV === "production") {
    return;
  }
  await reconcileLifecycleDelivery(false);
  revalidatePath("/internal/lifecycle");
}

export default async function LifecycleOpsPage() {
  const db = serviceClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [statesRes, intentsRes, failuresRes, eventsRes, churnRes, versionsRes, reconcilePreview] =
    await Promise.all([
      db.from("lifecycle_states").select("state").limit(5000),
      db
        .from("lifecycle_delivery_intents")
        .select("status")
        .gte("created_at", weekAgo)
        .limit(5000),
      db
        .from("lifecycle_delivery_intents")
        .select("id, message_key, status, attempt_count, last_error_category, updated_at")
        .in("status", ["failed", "dead_letter"])
        .order("updated_at", { ascending: false })
        .limit(20),
      db
        .from("onboarding_events")
        .select("event_type")
        .gte("created_at", weekAgo)
        .limit(5000),
      db
        .from("billing_cancellation_records")
        .select("reason_code, secondary_reason, status")
        .limit(1000),
      db.from("organization_onboarding_steps").select("version").limit(5000),
      reconcileLifecycleDelivery(true),
    ]);

  const stateCounts = await countBy(statesRes.data, "state");
  const intentCounts = await countBy(intentsRes.data, "status");
  const funnelCounts = await countBy(eventsRes.data, "event_type");
  const churnCounts = await countBy(
    (churnRes.data ?? []).filter((r) => r.reason_code != null) as never,
    "reason_code",
  );
  const versionCounts = await countBy(versionsRes.data, "version");

  const section: React.CSSProperties = {
    border: "1px solid var(--color-border, #333)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1>Lifecycle operations</h1>
      <p style={{ color: "var(--color-text-muted, #888)" }}>
        Internal aggregates only. Counts over the last 7 days unless noted.
      </p>

      <section style={section}>
        <h2>Organization lifecycle states (current)</h2>
        <CountTable counts={stateCounts} />
      </section>

      <section style={section}>
        <h2>Delivery intents (7 days)</h2>
        <CountTable counts={intentCounts} />
      </section>

      <section style={section}>
        <h2>Recent delivery failures</h2>
        {(failuresRes.data ?? []).length === 0 ? (
          <p>None.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Message</th>
                <th align="left">Status</th>
                <th align="left">Attempts</th>
                <th align="left">Error</th>
              </tr>
            </thead>
            <tbody>
              {(failuresRes.data ?? []).map((f) => (
                <tr key={f.id}>
                  <td>{lifecycleMessage(f.message_key)?.label ?? f.message_key}</td>
                  <td>{f.status}</td>
                  <td>{f.attempt_count}</td>
                  <td>{f.last_error_category ?? "unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={section}>
        <h2>Onboarding funnel events (7 days)</h2>
        <CountTable counts={funnelCounts} />
      </section>

      <section style={section}>
        <h2>Cancellation reasons (all time)</h2>
        <CountTable counts={churnCounts} />
        <p style={{ color: "var(--color-text-muted, #888)" }}>
          Written feedback is intentionally not shown here; it lives in the
          protected cancellation records.
        </p>
      </section>

      <section style={section}>
        <h2>Onboarding version adoption (step rows)</h2>
        <CountTable counts={versionCounts} />
      </section>

      <section style={section}>
        <h2>Reconciliation</h2>
        <p>
          Delivery drift (dry run): {reconcilePreview.staleLeases} stale
          leases, {reconcilePreview.stuckProcessing} stuck processing,{" "}
          {reconcilePreview.pendingNoAttempt} old pending intents without an
          attempt.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <form action={runOnboardingReconcile}>
            <button type="submit">Reconcile onboarding state</button>
          </form>
          <form action={runDeliveryReconcile}>
            <button type="submit">Repair delivery queue</button>
          </form>
        </div>
        <p style={{ color: "var(--color-text-muted, #888)" }}>
          Both runs are bounded, idempotent, and audited. Nothing is deleted;
          history is preserved.
        </p>
      </section>
    </main>
  );
}

function CountTable({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p>No data.</p>;
  return (
    <table style={{ borderCollapse: "collapse" }}>
      <tbody>
        {entries.map(([key, count]) => (
          <tr key={key}>
            <td style={{ paddingRight: 24 }}>{key}</td>
            <td align="right">{count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
