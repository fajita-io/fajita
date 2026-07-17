import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Service-role Supabase client. Bypasses RLS, so it is server-only and must
 * never be imported by a client component. Every mutation and every tenant
 * read performed through this client MUST first pass an explicit authorization
 * check (see `src/lib/auth/*`) and MUST scope its query to the verified caller
 * or organization. RLS is the backstop, not the gate.
 */
let cached: SupabaseClient<Database> | null = null;

export function serviceClient(): SupabaseClient<Database> {
  if (cached) return cached;
  const { NEXT_PUBLIC_SUPABASE_URL } = publicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv();
  cached = createClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  return cached;
}
