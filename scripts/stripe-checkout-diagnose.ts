#!/usr/bin/env tsx
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

const ROOT = resolve(import.meta.dirname ?? ".", "..");
for (const f of [".env.production.local", ".env.local"]) {
  const p = resolve(ROOT, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq);
    let v = t.slice(eq + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[k] ??= v;
  }
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");

  const stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  const account = await stripe.accounts.retrieve();
  console.log("account", {
    id: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    card_payments: account.capabilities?.card_payments,
    currently_due: account.requirements?.currently_due,
    disabled_reason: account.requirements?.disabled_reason,
  });

  const sessions = await stripe.checkout.sessions.list({ limit: 5 });
  for (const s of sessions.data) {
    console.log("session", {
      id: s.id,
      status: s.status,
      payment_status: s.payment_status,
      error: s.last_payment_error?.message ?? null,
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
