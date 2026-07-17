import { describe, expect, it } from "vitest";

import { maskEmail } from "./mask";

describe("maskEmail", () => {
  it("masks a normal address to first char plus dots", () => {
    expect(maskEmail("alice@example.com")).toBe("a•••@example.com");
  });

  it("masks a two-character local part with a single dot", () => {
    expect(maskEmail("bo@example.com")).toBe("b•@example.com");
  });

  it("masks a single-character local part", () => {
    expect(maskEmail("x@example.com")).toBe("•@example.com");
  });

  it("never reveals more than three dots regardless of length", () => {
    expect(maskEmail("verylonglocalpart@example.com")).toBe("v•••@example.com");
  });

  it("returns a safe placeholder for malformed input", () => {
    expect(maskEmail("not-an-email")).toBe("•••");
  });
});
