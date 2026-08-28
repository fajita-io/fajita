import { describe, expect, it } from "vitest";

import {
  discordHttpDeliverySummary,
  validateDiscordWebhookUrl,
} from "@/lib/alerts/discord-webhook";

describe("validateDiscordWebhookUrl", () => {
  const valid =
    "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz1234567890";

  it("accepts a standard Discord webhook URL", () => {
    const result = validateDiscordWebhookUrl(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.webhookId).toBe("123456789012345678");
      expect(result.token.length).toBeGreaterThan(9);
    }
  });

  it("accepts the legacy discordapp.com host", () => {
    const result = validateDiscordWebhookUrl(
      "https://discordapp.com/api/webhooks/987654321098765432/AbCdEfGhIjKlMnOpQrStUvWxYz0123456789",
    );
    expect(result.ok).toBe(true);
  });

  it("rejects empty input with guidance", () => {
    const result = validateDiscordWebhookUrl("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/Server Settings/i);
    }
  });

  it("rejects http and missing token segments", () => {
    expect(validateDiscordWebhookUrl("http://discord.com/api/webhooks/1/token").ok).toBe(false);
    expect(validateDiscordWebhookUrl("https://discord.com/api/webhooks/only-id").ok).toBe(false);
    expect(validateDiscordWebhookUrl("https://example.com/hook").ok).toBe(false);
  });

  it("rejects query strings and embedded credentials", () => {
    expect(
      validateDiscordWebhookUrl(`${valid}?wait=true`).ok,
    ).toBe(false);
    expect(
      validateDiscordWebhookUrl("https://user:pass@discord.com/api/webhooks/1/token1234567890").ok,
    ).toBe(false);
  });
});

describe("discordHttpDeliverySummary", () => {
  it("maps common Discord HTTP failures to actionable copy", () => {
    expect(discordHttpDeliverySummary(404)).toMatch(/no longer exists/i);
    expect(discordHttpDeliverySummary(401)).toMatch(/token/i);
    expect(discordHttpDeliverySummary(500)).toBeNull();
  });
});
