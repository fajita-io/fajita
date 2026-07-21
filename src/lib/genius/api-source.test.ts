import { describe, expect, it } from "vitest";

import { toGeniusApiSource } from "@/lib/genius/api-source";

describe("toGeniusApiSource", () => {
  it("passes through Genius-native source values", () => {
    expect(toGeniusApiSource("programmatic")).toBe("programmatic");
    expect(toGeniusApiSource("custom_trigger")).toBe("custom_trigger");
    expect(toGeniusApiSource("inline_trigger")).toBe("inline_trigger");
    expect(toGeniusApiSource("floating_button")).toBe("floating_button");
  });

  it("maps Fajita trigger sources to custom_trigger", () => {
    expect(toGeniusApiSource("sidebar")).toBe("custom_trigger");
    expect(toGeniusApiSource("button")).toBe("custom_trigger");
    expect(toGeniusApiSource("account_menu")).toBe("custom_trigger");
    expect(toGeniusApiSource("command_palette")).toBe("custom_trigger");
  });
});
