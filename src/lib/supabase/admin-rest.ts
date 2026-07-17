/**
 * Minimal server-only Supabase REST (PostgREST) helper for form inserts.
 * Uses the service role key; never import from client components. Kept as
 * plain fetch to avoid adding a client library for two insert calls.
 */

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export async function insertRow(
  table: "early_access_signups" | "contact_messages",
  row: Record<string, string>,
  options?: { onConflict?: string },
): Promise<{ ok: boolean }> {
  const cfg = config();
  if (!cfg) {
    console.error(`[forms] Supabase env missing; cannot store ${table} row`);
    return { ok: false };
  }

  const params = options?.onConflict
    ? `?on_conflict=${encodeURIComponent(options.onConflict)}`
    : "";

  const res = await fetch(`${cfg.url}/rest/v1/${table}${params}`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: options?.onConflict
        ? "resolution=ignore-duplicates,return=minimal"
        : "return=minimal",
    },
    body: JSON.stringify(row),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`[forms] insert into ${table} failed`, res.status);
    return { ok: false };
  }
  return { ok: true };
}
