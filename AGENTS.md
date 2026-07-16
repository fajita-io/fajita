# fajita-io agent guide

Build in ~20 phased implementations. Keep each phase shippable, token-cheap, and Fable 5-grade.

## Headroom (token cost control)

Headroom compresses tool output, logs, files, and history before they hit the model. Run the proxy before long agent sessions:

```bash
./scripts/headroom-start.sh
```

Cursor routing (after proxy is up):

| Provider | Override Base URL |
| --- | --- |
| OpenAI | `http://127.0.0.1:8787/p/fajita-io/v1` |
| Anthropic | `http://127.0.0.1:8787/p/fajita-io` |

MCP tools (`headroom_compress`, `headroom_retrieve`, `headroom_stats`) are configured in `.cursor/mcp.json`.

Check setup: `headroom doctor` · Live savings: `headroom dashboard`

## Phase loop (repeat ~20x)

1. Lock intent for this phase (scope, non-goals, done criteria).
2. Design routes, data, and auth boundaries before UI.
3. Implement end-to-end for the phase only. No placeholders or mock data.
4. Polish interaction, empty/error states, motion, and a11y.
5. QA the phase, then move on. Do not expand scope mid-phase.

Track progress inline in commits or issues. One phase = one reviewable vertical slice.

## Working rules

- Exact scope per phase. No drive-by refactors.
- Production polish: real data paths, real auth, real deploy wiring.
- Prefer terse tool output; let Headroom + MCP compression handle large reads.
- Learn from failures: `headroom learn` writes corrections here or to `CLAUDE.local.md` (gitignored).

## Production maturity gates

Beyond looking like a well-funded SaaS, Fajita must behave like one. Before implementing the systems below, satisfy the matching gate in `DESIGN_WORKFLOW.md` (Gates 1 to 6) and read `.cursor/maturity-memory/`:

- Auth or user data: invoke `security-and-privacy-architect` (Gate 2)
- Billing or entitlements: invoke `billing-and-entitlement-architect` (Gate 3)
- Emails or notifications: invoke `lifecycle-communication-director` (Gate 4)
- Background jobs or integrations: invoke `operations-and-observability-architect` (Gate 5)
- Launch: invoke `production-readiness-auditor` in fresh context (Gate 6)

Permanent rules: `security-and-privacy.mdc`, `billing-and-entitlements.mdc`, `lifecycle-communications.mdc`, `operations-and-observability.mdc`. Prefer the smallest coherent system that reaches large-company reliability; do not overengineer.

## DataFast analytics

Analytics is wired globally. Use it in every phase that touches customer-facing flows.

| Layer | Location | Use |
| --- | --- | --- |
| Pageviews | `DataFastScript` in `src/app/layout.tsx` | Automatic; do not duplicate the script |
| Bot traffic | `src/middleware.ts` | AI/search/training crawlers; deploy to see Bot traffic card |
| Client goals | `trackGoal()` from `@/lib/analytics` | UI clicks, client-confirmed actions |
| Server goals | `trackServerGoal()` from `@/lib/analytics` | Auth, webhooks, backend-confirmed events |
| Stripe revenue | `getStripeDataFastMetadata()` | Pass as Checkout `metadata`; connect Stripe in DataFast dashboard |

**Goal names:** Add to `DataFastGoals` in `src/lib/analytics/goals.ts`. Never use reserved payment goal names (`payment`, `subscription_*`, etc.).

**Examples:**

```tsx
import { DataFastGoals, trackGoal } from "@/lib/analytics";

<button
  data-fast-goal={DataFastGoals.initiateCheckout}
  data-fast-goal-plan="pro"
>
  Start Pro
</button>
```

```ts
import { DataFastGoals, trackServerGoal } from "@/lib/analytics";

await trackServerGoal({
  name: DataFastGoals.signup,
  metadata: { plan: "free" },
});
```

```ts
import { getStripeDataFastMetadata } from "@/lib/analytics";

metadata: await getStripeDataFastMetadata({ plan: "pro" }),
```

Env: `NEXT_PUBLIC_DATAFAST_*` (public), `DATAFAST_API_KEY` and optional `DATAFAST_BOT_TOKEN` (server only). See `.env.example`.
