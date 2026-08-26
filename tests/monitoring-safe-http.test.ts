import { describe, expect, it } from "vitest";

import {
  SafeHttpBlockedError,
  safeMonitorFetch,
} from "@/lib/monitoring/safe-http";

describe("safeMonitorFetch", () => {
  it("rejects blocked literal IP destinations at connect time", async () => {
    await expect(safeMonitorFetch("http://127.0.0.1/")).rejects.toBeInstanceOf(
      SafeHttpBlockedError,
    );
  });

  it("rejects invalid URLs before opening a socket", async () => {
    await expect(safeMonitorFetch("ftp://example.com/")).rejects.toThrow(
      /scheme/i,
    );
  });
});
