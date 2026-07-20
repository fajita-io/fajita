export type FajitaChatCtaVariant = "primary" | "secondary";

export interface FajitaChatCta {
  label: string;
  href: string;
  variant: FajitaChatCtaVariant;
  trackId: string;
}

export const FAJITA_CHAT_CTAS = {
  signup: "/signup",
  pricing: "/pricing",
  docs: "/docs",
  support: "/support",
} as const;

export function buildDefaultWelcomeCtas(): FajitaChatCta[] {
  return [
    {
      label: "Start monitoring",
      href: FAJITA_CHAT_CTAS.signup,
      variant: "primary",
      trackId: "welcome_signup",
    },
    {
      label: "See pricing",
      href: FAJITA_CHAT_CTAS.pricing,
      variant: "secondary",
      trackId: "welcome_pricing",
    },
  ];
}

export function inferCtasFromResponse(text: string): FajitaChatCta[] | undefined {
  const t = text.toLowerCase();
  const mentionsPrice = /(\$|price|pricing|plan|starter|pro|business|cost|how much)/i.test(
    t,
  );
  const mentionsSignup =
    /(sign ?up|start|get started|try fajita|create an account|first monitor)/i.test(t);

  if (mentionsSignup && mentionsPrice) {
    return [
      {
        label: "Start monitoring",
        href: FAJITA_CHAT_CTAS.signup,
        variant: "primary",
        trackId: "ai_signup",
      },
      {
        label: "See pricing",
        href: FAJITA_CHAT_CTAS.pricing,
        variant: "secondary",
        trackId: "ai_pricing",
      },
    ];
  }
  if (mentionsSignup) {
    return [
      {
        label: "Start monitoring",
        href: FAJITA_CHAT_CTAS.signup,
        variant: "primary",
        trackId: "ai_signup",
      },
    ];
  }
  if (mentionsPrice) {
    return [
      {
        label: "See pricing",
        href: FAJITA_CHAT_CTAS.pricing,
        variant: "primary",
        trackId: "ai_pricing",
      },
    ];
  }
  if (/(doc|documentation|guide|how to)/i.test(t)) {
    return [
      {
        label: "Open docs",
        href: FAJITA_CHAT_CTAS.docs,
        variant: "secondary",
        trackId: "ai_docs",
      },
    ];
  }
  return undefined;
}

export function suggestQuickReplies(text: string, page?: string): string[] {
  const t = text.toLowerCase();
  const chips: string[] = [];

  if (page?.includes("/pricing") || /(plan|price|\$12|\$49|\$99|check)/i.test(t)) {
    chips.push("Which plan fits a small SaaS?");
    chips.push("Why no free plan?");
  }
  if (/(uptimerobot|better stack|pingdom|datadog|pagerduty|competitor)/i.test(t)) {
    chips.push("How is Fajita different?");
  }
  if (/(alert|noise|flaky|page|wake)/i.test(t)) {
    chips.push("How does verification work?");
  }
  if (/(status page|subscriber|incident)/i.test(t)) {
    chips.push("Tell me about status pages");
  }
  if (/(cron|heartbeat|background|job)/i.test(t)) {
    chips.push("How do heartbeats work?");
  }
  if (chips.length < 2) chips.push("What does Fajita monitor?");
  if (chips.length < 2) chips.push("Start monitoring");

  return chips.slice(0, 3);
}

export const WELCOME_MESSAGE = {
  content:
    "Your customers find out before you do. That is the whole problem.\n\nFajita watches your sites, APIs, certificates, and cron jobs. When something starts cooking, your team hears about it first. Ask me anything about monitoring, pricing, or setup.",
  quickReplies: [
    "What does Fajita monitor?",
    "How much does it cost?",
    "How is this different from UptimeRobot?",
    "We already use Datadog",
  ],
} as const;

export function getFallbackResponse(userText: string): {
  content: string;
  ctas?: FajitaChatCta[];
  quickReplies: string[];
} {
  const t = userText.toLowerCase();
  if (/(price|cost|plan|\$)/i.test(t)) {
    return {
      content:
        "Three plans with checks included every month. **Core** ($12/mo, 100K checks) for one product. **Team** ($49/mo, 500K checks) when you grow. **Scale** ($99/mo, 2M checks) for agencies. No free tier. Tap **See pricing** below for the full picture.",
      ctas: buildDefaultWelcomeCtas(),
      quickReplies: ["Which plan fits a small SaaS?", "Why no free plan?"],
    };
  }
  if (/(free|uptimerobot|cheap)/i.test(t)) {
    return {
      content:
        "Free pings exist. Verified incidents, status pages, and heartbeats do not come free. Fajita charges because it confirms failures before it pages you. One real outage costs more than **Core**.",
      ctas: buildDefaultWelcomeCtas(),
      quickReplies: ["How does verification work?", "Start monitoring"],
    };
  }
  if (/(datadog|new relic|observability|apm)/i.test(t)) {
    return {
      content:
        "Keep Datadog for the inside view. Fajita is the outside-in check your customers feel. No agents. No log bill. Add one monitor on your login URL and your API health endpoint.",
      ctas: buildDefaultWelcomeCtas(),
      quickReplies: ["What does Fajita monitor?", "See pricing"],
    };
  }
  return {
    content:
      "I can answer from Fajita's product docs right now. Ask about monitors, alerts, status pages, SSL, cron jobs, or plans. Or tap **Start monitoring** and see it on your stack.",
    ctas: buildDefaultWelcomeCtas(),
    quickReplies: WELCOME_MESSAGE.quickReplies.slice(0, 3),
  };
}
