/**
 * Discord incoming webhook URL validation (pure, client-safe).
 *
 * Discord webhook URLs look like:
 *   https://discord.com/api/webhooks/{snowflake_id}/{token}
 * Legacy host discordapp.com is also accepted.
 */

const DISCORD_WEBHOOK_RE =
  /^https:\/\/(?:discord(?:app)?)\.com\/api\/webhooks\/(\d+)\/([A-Za-z0-9._-]+)$/;

export type DiscordWebhookValidation =
  | { ok: true; webhookId: string; token: string }
  | { ok: false; message: string };

export function validateDiscordWebhookUrl(raw: string): DiscordWebhookValidation {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      ok: false,
      message:
        "Enter a Discord webhook URL. In Discord: Server Settings → Integrations → Webhooks → copy the webhook URL.",
    };
  }

  if (!trimmed.startsWith("https://")) {
    return {
      ok: false,
      message: "Discord webhook URLs must start with https://. Paste the full URL from Discord.",
    };
  }

  if (trimmed.includes(" ") || trimmed.includes("\n")) {
    return {
      ok: false,
      message: "The webhook URL contains extra whitespace. Paste only the URL from Discord.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      message: "That URL is not valid. Paste the full Discord webhook URL (https://discord.com/api/webhooks/...).",
    };
  }

  if (parsed.username || parsed.password) {
    return {
      ok: false,
      message: "Discord webhook URLs must not include embedded credentials.",
    };
  }

  if (parsed.search || parsed.hash) {
    return {
      ok: false,
      message:
        "Remove query parameters from the webhook URL. Paste the URL exactly as Discord shows it.",
    };
  }

  const match = DISCORD_WEBHOOK_RE.exec(`${parsed.origin}${parsed.pathname}`);
  if (!match) {
    if (/discord/i.test(parsed.hostname) && /webhook/i.test(parsed.pathname)) {
      return {
        ok: false,
        message:
          "That Discord URL is missing the webhook id or token. Copy the full URL from Server Settings → Integrations → Webhooks.",
      };
    }
    return {
      ok: false,
      message:
        "Enter a valid Discord webhook URL (https://discord.com/api/webhooks/{id}/{token}).",
    };
  }

  const [, webhookId, token] = match;
  if (token.length < 10) {
    return {
      ok: false,
      message:
        "The webhook token looks truncated. Copy the full URL from Discord and try again.",
    };
  }

  return { ok: true, webhookId, token };
}

/** Operator-facing summary when Discord rejects a stored webhook at delivery time. */
export function discordHttpDeliverySummary(status: number): string | null {
  if (status === 404 || status === 410) {
    return "This Discord webhook no longer exists. Create a new webhook in Discord and update the channel URL.";
  }
  if (status === 401) {
    return "Discord rejected the webhook token. Copy a fresh webhook URL from Discord and update the channel.";
  }
  if (status === 403) {
    return "Discord denied access to this webhook. Confirm the webhook still exists and the bot has permission to post.";
  }
  if (status === 400) {
    return "Discord rejected the alert payload. Confirm the webhook URL is still valid.";
  }
  return null;
}
