import { describe, expect, it } from "vitest";

import { EMAIL_LINK_ORIGIN, emailAppLink } from "./links";

describe("emailAppLink", () => {
  it("uses the production Fajita origin", () => {
    expect(EMAIL_LINK_ORIGIN).toBe("https://fajita.io");
    expect(emailAppLink("/app")).toBe("https://fajita.io/app");
  });

  it("normalizes paths without a leading slash", () => {
    expect(emailAppLink("app/monitors/new")).toBe(
      "https://fajita.io/app/monitors/new",
    );
  });

  it("never returns localhost", () => {
    expect(emailAppLink("/app/monitors/new")).not.toContain("localhost");
  });
});
