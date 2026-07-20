import { describe, expect, it, vi } from "vitest";

import {
  isValidGeniusProjectKeyFormat,
  warnIfGeniusProjectInvalid,
} from "@/lib/genius/validate-project";

describe("isValidGeniusProjectKeyFormat", () => {
  it("accepts live and test publishable keys", () => {
    expect(isValidGeniusProjectKeyFormat("gen_pk_live_abc123456789012345678")).toBe(
      true,
    );
    expect(isValidGeniusProjectKeyFormat("gen_pk_test_abc123456789012345678")).toBe(
      true,
    );
  });

  it("rejects empty or malformed keys", () => {
    expect(isValidGeniusProjectKeyFormat("")).toBe(false);
    expect(isValidGeniusProjectKeyFormat("gen_pk_live_short")).toBe(false);
    expect(isValidGeniusProjectKeyFormat("pk_live_not_genius")).toBe(false);
  });
});

describe("warnIfGeniusProjectInvalid", () => {
  it("warns when the config API rejects the project key", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "We could not verify this project." }),
      }),
    );

    const valid = await warnIfGeniusProjectInvalid(
      "gen_pk_live_abc123456789012345678",
    );

    expect(valid).toBe(false);
    expect(warn).toHaveBeenCalledWith(
      "[Genius] Feedback cannot be sent: We could not verify this project.",
    );

    vi.unstubAllGlobals();
    warn.mockRestore();
  });
});
