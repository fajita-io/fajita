import "server-only";

/**
 * PostgREST / Supabase API URL for server-side clients.
 * In Docker Compose, set SUPABASE_URL=http://rest:3000 while keeping
 * NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 for browser clients.
 */
export function serverSupabaseUrl(): string {
  const internal = process.env.SUPABASE_URL?.trim();
  if (internal) return internal.replace(/\/$/, "");

  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!publicUrl) {
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
  }
  return publicUrl.replace(/\/$/, "");
}
