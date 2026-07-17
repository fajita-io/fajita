import { describe, expect, it } from "vitest";

import { isValidEmail, normalizeEmail, suggestCorrection } from "./normalize";

describe("normalizeEmail", () => {
  it("lowercases the domain and trims whitespace", () => {
    expect(normalizeEmail("  Alice@Example.COM ")).toBe("alice@example.com");
  });

  it("lowercases the local part (documented normalization) but keeps dots and plus tags", () => {
    expect(normalizeEmail("First.Last+tag@Gmail.com")).toBe(
      "first.last+tag@gmail.com",
    );
  });

  it("does not strip Gmail dots or plus aliases", () => {
    const a = normalizeEmail("a.b.c@gmail.com");
    const b = normalizeEmail("abc@gmail.com");
    expect(a).not.toBe(b);
  });

  it("handles input without an @ by lowercasing", () => {
    expect(normalizeEmail("NotAnEmail")).toBe("notanemail");
  });
});

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    expect(isValidEmail("alice@example.com")).toBe(true);
  });

  it("rejects missing domain, missing local, spaces, and short TLDs", () => {
    expect(isValidEmail("alice@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("alice example.com")).toBe(false);
    expect(isValidEmail("alice@example.c")).toBe(false);
  });

  it("rejects absurdly long addresses", () => {
    expect(isValidEmail(`${"a".repeat(250)}@example.com`)).toBe(false);
  });
});

describe("suggestCorrection", () => {
  it("suggests a fix for a known domain typo without applying it", () => {
    expect(suggestCorrection("alice@gmial.com")).toBe("alice@gmail.com");
  });

  it("returns null for a correct domain", () => {
    expect(suggestCorrection("alice@gmail.com")).toBeNull();
  });

  it("returns null when there is no @", () => {
    expect(suggestCorrection("alice")).toBeNull();
  });
});
