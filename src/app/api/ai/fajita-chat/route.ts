import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildFajitaChatSystemPrompt,
  FAJITA_CHAT_MAX_HISTORY,
  FAJITA_CHAT_MAX_MSG_LENGTH,
  FAJITA_CHAT_MAX_TOKENS,
  FAJITA_CHAT_TEMPERATURE,
  isMetaQuery,
  redactLeaks,
  SAFE_DEFLECTION,
} from "@/lib/ai/fajita-chat/prompt";
import { streamFajitaChat, isFajitaChatAvailable } from "@/lib/ai/fajita-chat/provider";
import { getFallbackResponse } from "@/lib/ai/fajita-chat/ctas";
import { scanPromptInjection } from "@/lib/support/prompt-injection";
import { scanSensitiveData } from "@/lib/support/sensitive-data";

const bodySchema = z.object({
  message: z.string().min(1).max(FAJITA_CHAT_MAX_MSG_LENGTH),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(FAJITA_CHAT_MAX_MSG_LENGTH),
      }),
    )
    .max(FAJITA_CHAT_MAX_HISTORY)
    .optional(),
  mode: z.enum(["public", "authenticated"]).optional(),
  page: z.string().max(200).optional(),
});

const RATE = new Map<string, { count: number; reset: number }>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = RATE.get(key);
  if (!entry || entry.reset < now) {
    RATE.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function streamPlain(text: string): Response {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid chat request." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip, 40, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Try again shortly." },
      { status: 429 },
    );
  }

  const sensitive = scanSensitiveData(parsed.data.message);
  const injection = scanPromptInjection(parsed.data.message);
  const message = sensitive.redactedText.trim();

  if (sensitive.blocked && message.replace(/\[redacted\]/gi, "").trim().length < 12) {
    return streamPlain(
      "That looks like a credential. Rotate it if it was live, then ask again without pasting secrets.",
    );
  }

  if (injection.suspicious || isMetaQuery(message)) {
    return streamPlain(SAFE_DEFLECTION);
  }

  if (!isFajitaChatAvailable()) {
    const fallback = getFallbackResponse(message);
    return streamPlain(fallback.content);
  }

  const history = (parsed.data.history ?? []).filter(
    (m) => m.content.trim().length > 0,
  );
  const cleanedHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const msg of history) {
    const last = cleanedHistory[cleanedHistory.length - 1];
    if (!cleanedHistory.length && msg.role !== "user") continue;
    if (last && last.role === msg.role) {
      cleanedHistory[cleanedHistory.length - 1] = msg;
    } else {
      cleanedHistory.push(msg);
    }
  }

  const messages = [...cleanedHistory, { role: "user" as const, content: message }];
  const systemPrompt = buildFajitaChatSystemPrompt({
    page: parsed.data.page,
    mode: parsed.data.mode ?? "public",
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let buffered = "";
      let finalText = "";
      let yielded = false;

      try {
        const gen = streamFajitaChat(messages, systemPrompt, {
          maxTokens: FAJITA_CHAT_MAX_TOKENS,
          temperature: FAJITA_CHAT_TEMPERATURE,
        });

        while (true) {
          const next = await gen.next();
          if (next.done) {
            if (!next.value.yielded && !yielded) {
              const fallback = getFallbackResponse(message);
              controller.enqueue(encoder.encode(fallback.content));
            }
            break;
          }

          const ev = next.value;
          if (ev.type === "text" && ev.delta) {
            yielded = true;
            buffered += ev.delta;
            const safeLen = Math.max(0, buffered.length - 32);
            const safePart = buffered.slice(0, safeLen);
            const redaction = redactLeaks(safePart);
            if (safeLen > 0) {
              controller.enqueue(encoder.encode(redaction.text));
              finalText += redaction.text;
              buffered = buffered.slice(safeLen);
            }
          }
        }

        if (buffered.length > 0) {
          const tail = redactLeaks(buffered);
          controller.enqueue(encoder.encode(tail.text));
          finalText += tail.text;
        }

        if (!finalText.trim() && !yielded) {
          const fallback = getFallbackResponse(message);
          controller.enqueue(encoder.encode(fallback.content));
        }
      } catch {
        const fallback = getFallbackResponse(message);
        controller.enqueue(encoder.encode(fallback.content));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
