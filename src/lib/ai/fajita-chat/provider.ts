import Anthropic from "@anthropic-ai/sdk";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamEvent {
  type: "text" | "usage" | "done";
  delta?: string;
  tokensIn?: number;
  tokensOut?: number;
  stopReason?: string | null;
}

const MODEL =
  process.env.FAJITA_CHAT_ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

export function isFajitaChatAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export async function* streamFajitaChat(
  messages: ChatMessage[],
  system: string,
  opts: { maxTokens: number; temperature: number },
): AsyncGenerator<StreamEvent, { yielded: boolean }, void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { yielded: false };
  }

  const client = new Anthropic({ apiKey });
  let yielded = false;

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: opts.maxTokens,
      temperature: opts.temperature,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yielded = true;
        yield { type: "text", delta: event.delta.text };
      } else if (event.type === "message_start") {
        const u = event.message?.usage;
        if (u) {
          yield {
            type: "usage",
            tokensIn: u.input_tokens,
            tokensOut: u.output_tokens,
          };
        }
      } else if (event.type === "message_delta") {
        if (event.usage?.output_tokens != null) {
          yield { type: "usage", tokensOut: event.usage.output_tokens };
        }
        yield { type: "done", stopReason: event.delta.stop_reason ?? null };
      }
    }
  } catch {
    if (yielded) return { yielded: true };
    return { yielded: false };
  }

  return { yielded };
}
