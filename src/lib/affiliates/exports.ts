import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Affiliate self-service CSV exports. The affiliate can export their own
 * commissions and payout statements. Exports never include customer identity,
 * organization ids, or Stripe ids: only the affiliate's own amounts, states,
 * and timestamps. Each export is recorded in `affiliate_exports` for audit.
 */

export type ExportKind = "commissions" | "statements";

export const EXPORT_KINDS: ExportKind[] = ["commissions", "statements"];

export function isExportKind(value: string): value is ExportKind {
  return (EXPORT_KINDS as string[]).includes(value);
}

function csvCell(value: string | number | null): string {
  if (value === null) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  return lines.join("\n");
}

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export interface ExportResult {
  csv: string;
  rowCount: number;
  filename: string;
}

/** Build a CSV export for the affiliate. Records the export row. */
export async function buildAffiliateExport(
  affiliateId: string,
  kind: ExportKind,
): Promise<ExportResult> {
  const db = serviceClient();
  let csv: string;
  let rowCount: number;

  if (kind === "commissions") {
    const { data } = await db
      .from("affiliate_commissions")
      .select(
        "invoice_paid_at, gross_eligible_cents, commission_amount_cents, reversed_cents, state, currency",
      )
      .eq("affiliate_id", affiliateId)
      .order("invoice_paid_at", { ascending: false })
      .limit(20000);
    const rows = (data ?? []).map((c) => [
      c.invoice_paid_at ?? "",
      dollars(c.gross_eligible_cents),
      dollars(c.commission_amount_cents),
      dollars(c.reversed_cents),
      c.state,
      (c.currency ?? "usd").toUpperCase(),
    ]);
    csv = toCsv(
      [
        "invoice_paid_at",
        "eligible_revenue",
        "commission",
        "reversed",
        "state",
        "currency",
      ],
      rows,
    );
    rowCount = rows.length;
  } else {
    const { data } = await db
      .from("affiliate_payout_statements")
      .select("period_label, paid_cents, currency, generated_at")
      .eq("affiliate_id", affiliateId)
      .order("generated_at", { ascending: false })
      .limit(20000);
    const rows = (data ?? []).map((s) => [
      s.period_label,
      dollars(s.paid_cents),
      (s.currency ?? "usd").toUpperCase(),
      s.generated_at,
    ]);
    csv = toCsv(["period", "paid", "currency", "generated_at"], rows);
    rowCount = rows.length;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  await db.from("affiliate_exports").insert({
    affiliate_id: affiliateId,
    kind,
    status: "completed",
    completed_at: new Date().toISOString(),
    row_count: rowCount,
  });

  return { csv, rowCount, filename: `fajita-${kind}-${stamp}.csv` };
}
