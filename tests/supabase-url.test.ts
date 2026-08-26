import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("serverSupabaseUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers SUPABASE_URL when set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("SUPABASE_URL", "http://rest:3000");
    const { serverSupabaseUrl } = await import("@/lib/supabase/url");
    expect(serverSupabaseUrl()).toBe("http://rest:3000");
  });

  it("falls back to NEXT_PUBLIC_SUPABASE_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321/");
    vi.stubEnv("SUPABASE_URL", "");
    const { serverSupabaseUrl } = await import("@/lib/supabase/url");
    expect(serverSupabaseUrl()).toBe("http://localhost:54321");
  });
});
