import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  serverEnv: vi.fn(),
}));

import { serverEnv } from "@/lib/env";
import { activeEmailProvider } from "./transport";

describe("activeEmailProvider", () => {
  afterEach(() => {
    vi.mocked(serverEnv).mockReset();
  });

  it("returns disabled when no provider configured", () => {
    vi.mocked(serverEnv).mockReturnValue({} as ReturnType<typeof serverEnv>);
    expect(activeEmailProvider()).toBe("disabled");
  });

  it("prefers resend when API key is set", () => {
    vi.mocked(serverEnv).mockReturnValue({
      RESEND_API_KEY: "re_test",
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: 587,
      SMTP_FROM: "alerts@example.com",
    } as ReturnType<typeof serverEnv>);
    expect(activeEmailProvider()).toBe("resend");
  });

  it("returns smtp when host and from are set without resend", () => {
    vi.mocked(serverEnv).mockReturnValue({
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: 587,
      SMTP_FROM: "alerts@example.com",
    } as ReturnType<typeof serverEnv>);
    expect(activeEmailProvider()).toBe("smtp");
  });
});
