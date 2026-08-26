import "server-only";

import { auth } from "@clerk/nextjs/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Per-request Supabase client authenticated as the current Clerk user. The
 * Clerk session token is attached via the `accessToken` hook so Supabase RLS
 * sees the caller's `sub` claim (their Clerk user id). This is the
 * defense-in-depth read path; RLS policies isolate every row to the caller and
 * their organizations.
 *
 * Requires the Clerk third-party auth integration to be enabled on the
 * Supabase project. When the integration is not yet configured, prefer
 * `serviceClient()` with explicit scoping for reads. Writes never use this client.
 */
export async function userClient(): Promise<SupabaseClient<Database>> {
  const { getToken } = await auth();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    publicEnv();
  return createClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      accessToken: async () => (await getToken()) ?? null,
    },
  );
}
