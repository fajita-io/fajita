import { describe, expect, it } from "vitest";

import {
  codeRejectionMessage,
  normalizeCode,
  suggestCodeFromName,
  validateCode,
} from "./code";

describe("affiliate code validation", () => {
  it("normalizes case and whitespace", () => {
    expect(normalizeCode("  Alex  ")).toBe("alex");
  });

  it("accepts clean codes", () => {
    expect(validateCode("alex").ok).toBe(true);
    expect(validateCode("dev-tools-weekly").ok).toBe(true);
  });

  it("rejects short, long, and invalid characters", () => {
    expect(validateCode("ab").reason).toBe("too_short");
    expect(validateCode("a".repeat(33)).reason).toBe("too_long");
    expect(validateCode("bad_code!").reason).toBe("invalid_characters");
    expect(validateCode("-lead").reason).toBe("invalid_characters");
  });

  it("blocks reserved words and impersonation", () => {
    expect(validateCode("admin").reason).toBe("reserved");
    expect(validateCode("support").reason).toBe("reserved");
    expect(validateCode("fajita").reason).toBe("reserved");
    expect(validateCode("fajitapro").reason).toBe("impersonation");
  });

  it("rejects email-like codes", () => {
    expect(validateCode("me@example.com").reason).toBe("looks_like_email");
  });

  it("suggests a safe code from a display name", () => {
    expect(suggestCodeFromName("Alex Rivera")).toBe("alex-rivera");
    expect(suggestCodeFromName("Fajita Fan")).toBe("");
  });

  it("maps rejection reasons to friendly, user-safe copy", () => {
    expect(codeRejectionMessage("too_short")).toMatch(/3 characters/);
    expect(codeRejectionMessage("reserved")).toMatch(/reserved/i);
    expect(codeRejectionMessage("looks_like_email")).toMatch(/email/i);
  });
});
