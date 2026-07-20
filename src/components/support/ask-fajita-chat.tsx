"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import {
  buildDefaultWelcomeCtas,
  getFallbackResponse,
  inferCtasFromResponse,
  suggestQuickReplies,
  WELCOME_MESSAGE,
  type FajitaChatCta,
} from "@/lib/ai/fajita-chat/ctas";
import { trackGoal } from "@/lib/analytics/client";
import { DataFastGoals } from "@/lib/analytics/goals";
import { PoweredByPamphlet } from "@/components/support/powered-by-pamphlet";
import { SUPPORT_COPY, SUPPORT_IDENTITY } from "@/lib/support/copy";
import type { ConversationMode, PageContext } from "@/lib/support/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ctas?: FajitaChatCta[];
  quickReplies?: string[];
};

function formatAssistantContent(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="fj-chat-spacer" />;

    const renderInline = (str: string) => {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={idx} className="fj-chat-strong">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={idx}>{part}</span>;
      });
    };

    if (trimmed.startsWith("-")) {
      return (
        <div key={i} className="fj-chat-bullet">
          <span className="fj-chat-bullet__mark" aria-hidden="true">
            •
          </span>
          <span>{renderInline(line.replace(/^[\s]*-\s*/, ""))}</span>
        </div>
      );
    }

    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={i} className="fj-chat-bullet">
          <span className="fj-chat-bullet__mark">{numMatch[1]}.</span>
          <span>{renderInline(numMatch[2])}</span>
        </div>
      );
    }

    return (
      <p key={i} className="fj-chat-paragraph">
        {renderInline(line)}
      </p>
    );
  });
}

function CtaButton({
  cta,
  onClick,
}: {
  cta: FajitaChatCta;
  onClick: (href: string) => void;
}) {
  return (
    <Link
      href={cta.href}
      className={
        cta.variant === "primary"
          ? "fj-chat-cta fj-chat-cta--primary"
          : "fj-chat-cta fj-chat-cta--secondary"
      }
      onClick={() => onClick(cta.href)}
    >
      {cta.label}
    </Link>
  );
}

export function AskFajitaChat({
  mode,
  pageContext,
  suggestedPrompts,
  open: controlledOpen,
  onOpenChange,
  variant = "panel",
}: {
  mode: ConversationMode;
  pageContext?: PageContext;
  suggestedPrompts: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "panel" | "page" | "sheet";
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(variant === "page");
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [teaserVisible, setTeaserVisible] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const welcomedRef = useRef(false);
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : pageContext?.route ?? "/";

  const welcomeQuickReplies =
    suggestedPrompts.length > 0 ? suggestedPrompts : [...WELCOME_MESSAGE.quickReplies];

  useEffect(() => {
    setMounted(true);
    trackGoal(DataFastGoals.supportLauncherViewed, { mode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (variant === "page" || open) return;
    const t = window.setTimeout(() => setTeaserVisible(true), 8000);
    return () => window.clearTimeout(t);
  }, [open, variant]);

  useEffect(() => {
    if (!open || welcomedRef.current) return;
    welcomedRef.current = true;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: WELCOME_MESSAGE.content,
        ctas: buildDefaultWelcomeCtas(),
        quickReplies: welcomeQuickReplies,
      },
    ]);
  }, [open, welcomeQuickReplies]);

  useEffect(() => {
    if (open) {
      trackGoal(DataFastGoals.supportLauncherOpened, { mode });
      inputRef.current?.focus();
    }
  }, [open, mode]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, streamingContent]);

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  const finishAssistant = useCallback(
    (content: string, userText?: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        setSending(false);
        setStreamingContent("");
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: trimmed,
          ctas: inferCtasFromResponse(trimmed),
          quickReplies: suggestQuickReplies(trimmed, pathname),
        },
      ]);
      setStreamingContent("");
      setSending(false);
      trackGoal(DataFastGoals.supportAnswerDisplayed, { mode, confidence: "high" });
      if (userText && /(price|expensive|competitor|datadog|free)/i.test(userText)) {
        trackGoal(DataFastGoals.planSelected, { source: "fajita_chat" });
      }
    },
    [mode, pathname],
  );

  const appendFallback = useCallback((userText: string) => {
    const result = getFallbackResponse(userText);
    window.setTimeout(() => {
      const trimmed = result.content.trim();
      if (!trimmed) {
        setSending(false);
        setStreamingContent("");
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: trimmed,
          ctas: result.ctas ?? inferCtasFromResponse(trimmed),
          quickReplies: result.quickReplies,
        },
      ]);
      setStreamingContent("");
      setSending(false);
      trackGoal(DataFastGoals.supportAnswerDisplayed, { mode, confidence: "supported" });
    }, 350);
  }, [mode]);

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      setError(null);
      setDraft("");
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: trimmed }]);
      setSending(true);
      setStreamingContent("");
      trackGoal(DataFastGoals.supportMessageSubmitted, {
        mode,
        area: pageContext?.productArea ?? "none",
      });

      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ai/fajita-chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history,
            mode,
            page: pageContext?.route ?? pathname,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          trackGoal(DataFastGoals.supportProviderUnavailable, { mode });
          appendFallback(trimmed);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setStreamingContent(acc);
        }
        acc += decoder.decode();
        finishAssistant(acc, trimmed);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(SUPPORT_COPY.errorState);
        appendFallback(trimmed);
      }
    },
    [appendFallback, finishAssistant, messages, mode, pageContext, pathname, sending],
  );

  const openChat = (trigger: string) => {
    setTeaserVisible(false);
    setOpen(true);
    trackGoal(DataFastGoals.supportLauncherOpened, { mode, trigger });
  };

  const newChat = () => {
    welcomedRef.current = false;
    setMessages([]);
    setError(null);
    setStreamingContent("");
    welcomedRef.current = true;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: WELCOME_MESSAGE.content,
        ctas: buildDefaultWelcomeCtas(),
        quickReplies: welcomeQuickReplies,
      },
    ]);
  };

  if (!mounted) return null;

  if (variant !== "page" && !open) {
    return (
      <div className="fj-chat-anchor" data-testid="ask-fajita-root">
        {teaserVisible ? (
          <div className="fj-chat-teaser">
            <button
              type="button"
              className="fj-chat-teaser__dismiss"
              aria-label="Dismiss chat prompt"
              onClick={() => setTeaserVisible(false)}
            >
              ×
            </button>
            <button type="button" className="fj-chat-teaser__body" onClick={() => openChat("teaser")}>
              <p className="fj-chat-teaser__headline">Know before they do.</p>
              <p className="fj-chat-teaser__subline">Ask about monitoring, pricing, or setup</p>
            </button>
          </div>
        ) : null}
        <button
          type="button"
          className="fj-chat-launcher"
          aria-haspopup="dialog"
          aria-expanded={false}
          aria-label={SUPPORT_IDENTITY.launcherLabel}
          data-testid="ask-fajita-launcher"
          onClick={() => openChat("manual")}
        >
          <span className="fj-chat-launcher__ring" aria-hidden="true" />
          <span className="fj-chat-launcher__core" aria-hidden="true">
            <span className="fj-chat-launcher__mark" />
          </span>
          <span className="fj-chat-launcher__status" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const panelClass =
    variant === "page"
      ? "fj-chat-panel fj-chat-panel--page"
      : variant === "sheet"
        ? "fj-chat-panel fj-chat-panel--sheet"
        : "fj-chat-panel";

  return (
    <div
      className={variant === "page" ? "fj-chat-page-wrap" : "fj-chat-anchor fj-chat-anchor--open"}
      data-testid="ask-fajita-root"
    >
      <div
        className={`${panelClass}${open || variant === "page" ? " fj-chat-panel--visible" : ""}`}
        role={variant === "page" ? undefined : "dialog"}
        aria-modal={variant === "page" ? undefined : true}
        aria-labelledby={titleId}
        data-testid="ask-fajita-panel"
      >
        <header className="fj-chat-panel__header">
          <div className="fj-chat-panel__brand">
            <span className="fj-chat-panel__avatar" aria-hidden="true">
              <span className="fj-chat-launcher__mark" />
            </span>
            <div>
              <h2 id={titleId} className="fj-chat-panel__title">
                {SUPPORT_IDENTITY.name}
              </h2>
              <p className="fj-chat-panel__status">
                <span className="fj-chat-panel__status-dot" aria-hidden="true" />
                Online · replies instantly
              </p>
            </div>
          </div>
          {variant !== "page" ? (
            <div className="fj-chat-panel__actions">
              <button type="button" className="fj-chat-icon-btn" onClick={newChat} aria-label="New conversation">
                ↺
              </button>
              <button
                type="button"
                className="fj-chat-icon-btn"
                aria-label={SUPPORT_COPY.close}
                onClick={() => {
                  setOpen(false);
                  trackGoal(DataFastGoals.supportLauncherClosed, { mode });
                }}
              >
                ×
              </button>
            </div>
          ) : null}
        </header>

        <div className="fj-chat-panel__body" ref={listRef}>
          <ul className="fj-chat-messages">
            {messages.map((m) => (
              <li key={m.id} className={`fj-chat-msg fj-chat-msg--${m.role}`}>
                <div className="fj-chat-msg__bubble">
                  {m.role === "assistant" ? formatAssistantContent(m.content) : m.content}
                </div>
                {m.role === "assistant" && m.ctas && m.ctas.length > 0 ? (
                  <div className="fj-chat-ctas">
                    {m.ctas.map((cta) => (
                      <CtaButton
                        key={cta.trackId}
                        cta={cta}
                        onClick={() => trackGoal(DataFastGoals.heroCta, { source: cta.trackId })}
                      />
                    ))}
                  </div>
                ) : null}
                {m.role === "assistant" &&
                m.id === lastAssistantId &&
                !sending &&
                m.quickReplies &&
                m.quickReplies.length > 0 ? (
                  <div className="fj-chat-chips">
                    {m.quickReplies.map((reply) => (
                      <button
                        key={reply}
                        type="button"
                        className="fj-chat-chips__btn"
                        onClick={() => {
                          trackGoal(DataFastGoals.supportPromptSelected, { mode });
                          void submit(reply);
                        }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          {sending ? (
            <div className="fj-chat-msg fj-chat-msg--assistant">
              <div className="fj-chat-msg__bubble fj-chat-msg__bubble--typing">
                {streamingContent ? (
                  <>
                    {formatAssistantContent(streamingContent)}
                    <span className="fj-chat-cursor" aria-hidden="true" />
                  </>
                ) : (
                  <span className="fj-chat-dots" aria-live="polite">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="fj-chat-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="fj-chat-panel__footer">
          <form
            className="fj-chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void submit(draft);
            }}
          >
            <label className="fj-sr-only" htmlFor={`${titleId}-input`}>
              {SUPPORT_COPY.composerPlaceholder}
            </label>
            <textarea
              id={`${titleId}-input`}
              ref={inputRef}
              className="fj-chat-composer__input"
              rows={1}
              value={draft}
              placeholder="Ask about monitoring, pricing, or setup…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit(draft);
                }
              }}
              disabled={sending}
            />
            <button
              type="submit"
              className="fj-chat-composer__send"
              disabled={sending || !draft.trim()}
              aria-label="Send message"
            >
              ↑
            </button>
          </form>
          <PoweredByPamphlet inline />
        </footer>
      </div>
    </div>
  );
}
