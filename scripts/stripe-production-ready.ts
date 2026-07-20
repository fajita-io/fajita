#!/usr/bin/env tsx
/**
 * Audit and finalize Fajita Stripe for production.
 *
 * Loads .env.production.local when present. Safe to re-run; creates missing
 * portal config and product tax codes, verifies prices and webhooks.
 *
 *   npm run stripe:production-ready
 *   npm run stripe:production-ready -- --fix
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import Stripe from "stripe";

import { BILLING_CATALOG } from "../src/lib/billing/catalog";
import { STRIPE_HANDLED_EVENTS } from "../src/lib/billing/webhook-inbox";

const ROOT = resolve(import.meta.dirname ?? ".", "..");
loadEnvConfig(ROOT);

const prodFile = resolve(ROOT, ".env.production.local");
if (existsSync(prodFile)) {
  for (const line of readFileSync(prodFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] ??= val;
  }
}

const fix = process.argv.includes("--fix");
const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io"
).replace(/\/$/, "");

/** SaaS / website information services (business use). */
const PRODUCT_TAX_CODE = "txcd_10701400";

type Check = { id: string; ok: boolean; detail: string };

function printChecks(title: string, checks: Check[]): void {
  console.log(`\n${title}`);
  for (const c of checks) {
    console.log(`  ${c.ok ? "OK" : "FAIL"} ${c.id}: ${c.detail}`);
  }
}

async function verifyPrices(stripe: Stripe): Promise<Check[]> {
  const checks: Check[] = [];
  for (const plan of Object.values(BILLING_CATALOG)) {
    for (const interval of ["month", "year"] as const) {
      const lookupKey = plan.lookupKeys[interval];
      const expected =
        interval === "month"
          ? plan.pricing.monthlyCents
          : plan.pricing.yearlyCents;
      const listed = await stripe.prices.list({
        lookup_keys: [lookupKey],
        active: true,
        limit: 1,
      });
      const price = listed.data[0];
      if (!price) {
        checks.push({
          id: lookupKey,
          ok: false,
          detail: "no active price",
        });
        continue;
      }
      const ok =
        price.unit_amount === expected &&
        price.recurring?.interval === interval;
      checks.push({
        id: lookupKey,
        ok,
        detail: ok
          ? `${expected} cents / ${interval}`
          : `got ${price.unit_amount} / ${price.recurring?.interval ?? "?"}`,
      });
    }
  }
  return checks;
}

async function ensurePortal(stripe: Stripe): Promise<Check> {
  const listed = await stripe.billingPortal.configurations.list({ limit: 5 });
  const hasDefault = listed.data.some((c) => c.is_default && c.active);
  if (hasDefault) {
    return {
      id: "billing_portal",
      ok: true,
      detail: "default Customer Portal configuration exists",
    };
  }
  if (!fix) {
    return {
      id: "billing_portal",
      ok: false,
      detail: "no default portal config (re-run with --fix)",
    };
  }
  const cfg = await stripe.billingPortal.configurations.create({
    business_profile: { headline: "Manage your Fajita subscription" },
    default_return_url: `${APP_URL}/app/settings/billing`,
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "address", "tax_id"],
      },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: [
            "too_expensive",
            "missing_features",
            "switched_service",
            "unused",
            "other",
          ],
        },
      },
    },
  });
  return {
    id: "billing_portal",
    ok: true,
    detail: `created default config ${cfg.id}`,
  };
}

async function ensureProductTaxCodes(stripe: Stripe): Promise<Check[]> {
  const products = await stripe.products.list({ active: true, limit: 20 });
  const checks: Check[] = [];
  for (const product of products.data) {
    if (product.tax_code === PRODUCT_TAX_CODE) {
      checks.push({
        id: product.name,
        ok: true,
        detail: `tax code ${PRODUCT_TAX_CODE}`,
      });
      continue;
    }
    if (!fix) {
      checks.push({
        id: product.name,
        ok: false,
        detail: `tax_code missing (re-run with --fix)`,
      });
      continue;
    }
    const updated = await stripe.products.update(product.id, {
      tax_code: PRODUCT_TAX_CODE,
    });
    checks.push({
      id: product.name,
      ok: updated.tax_code === PRODUCT_TAX_CODE,
      detail: `set tax code ${updated.tax_code}`,
    });
  }
  return checks;
}

async function verifyWebhook(stripe: Stripe): Promise<Check> {
  const target = `${APP_URL}/api/webhooks/stripe`;
  const listed = await stripe.webhookEndpoints.list({ limit: 20 });
  const match = listed.data.find(
    (e) => e.url === target && e.status === "enabled",
  );
  if (!match) {
    return {
      id: "webhook",
      ok: false,
      detail: `no enabled endpoint for ${target} (run npm run wire:production)`,
    };
  }
  const missing = [...STRIPE_HANDLED_EVENTS].filter(
    (ev) => !match.enabled_events.includes(ev),
  );
  if (missing.length > 0) {
    return {
      id: "webhook",
      ok: false,
      detail: `endpoint ${match.id} missing events: ${missing.join(", ")}`,
    };
  }
  return {
    id: "webhook",
    ok: true,
    detail: `${match.id} → ${target} (${match.enabled_events.length} events)`,
  };
}

async function main(): Promise<void> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is required (.env.production.local).");
    process.exit(2);
  }
  const mode = secretKey.startsWith("sk_live_") ? "live" : "test";
  if (mode !== "live") {
    console.warn("Warning: STRIPE_SECRET_KEY is not sk_live_. Use production keys.");
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });

  const account = await stripe.accounts.retrieve();
  const display =
    account.settings?.dashboard?.display_name ?? account.id;
  console.log(`Stripe production readiness (${mode}) — ${account.id} (${display})`);

  const accountChecks: Check[] = [
    {
      id: "live_keys",
      ok: mode === "live" && (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_") ?? false),
      detail:
        mode === "live"
          ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_")
            ? "publishable key is pk_live_"
            : "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be pk_live_ in production"
          : "not live mode",
    },
    {
      id: "webhook_secret",
      ok: (process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_") ?? false),
      detail: process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")
        ? "STRIPE_WEBHOOK_SECRET set"
        : "STRIPE_WEBHOOK_SECRET missing (run npm run wire:production)",
    },
    {
      id: "branding_colors",
      ok:
        account.settings?.branding?.primary_color === "#17130e" &&
        account.settings?.branding?.secondary_color === "#e8590c",
      detail: `primary ${account.settings?.branding?.primary_color ?? "?"} accent ${account.settings?.branding?.secondary_color ?? "?"}`,
    },
    {
      id: "branding_assets",
      ok: Boolean(
        account.settings?.branding?.icon &&
          account.settings?.branding?.logo,
      ),
      detail:
        account.settings?.branding?.icon && account.settings?.branding?.logo
          ? "icon and logo uploaded in Dashboard"
          : "upload logo + icon in Settings → Business → Branding",
    },
    {
      id: "charges_enabled",
      ok: account.charges_enabled === true,
      detail: account.charges_enabled
        ? "live charges enabled"
        : "paused — Stripe account review in progress (Dashboard → View account status)",
    },
    {
      id: "payouts_enabled",
      ok: account.payouts_enabled === true,
      detail: account.payouts_enabled
        ? "payouts enabled"
        : "paused until Stripe completes account review",
    },
    {
      id: "card_payments",
      ok: account.capabilities?.card_payments === "active",
      detail: `card_payments=${account.capabilities?.card_payments ?? "unknown"}`,
    },
    {
      id: "requirements_clear",
      ok: (account.requirements?.currently_due?.length ?? 0) === 0,
      detail:
        (account.requirements?.currently_due?.length ?? 0) === 0
          ? "no fields currently due"
          : `due: ${account.requirements?.currently_due?.join(", ")}`,
    },
  ];

  printChecks("Account", accountChecks);

  const priceChecks = await verifyPrices(stripe);
  printChecks("Catalog prices", priceChecks);

  const taxChecks = await ensureProductTaxCodes(stripe);
  printChecks("Product tax codes", taxChecks);

  const portalCheck = await ensurePortal(stripe);
  printChecks("Customer Portal", [portalCheck]);

  const webhookCheck = await verifyWebhook(stripe);
  printChecks("Webhooks", [webhookCheck]);

  const enforcement = process.env.BILLING_ENFORCEMENT_ENABLED?.trim();
  const enforcementCheck: Check = {
    id: "billing_enforcement",
    ok: enforcement === "true" || enforcement === "1",
    detail:
      enforcement === "true" || enforcement === "1"
        ? "BILLING_ENFORCEMENT_ENABLED is on"
        : "off (enable after docs/operations/real-payment-test.md passes)",
  };
  printChecks("App enforcement", [enforcementCheck]);

  const all = [
    ...accountChecks,
    ...priceChecks,
    ...taxChecks,
    portalCheck,
    webhookCheck,
  ];
  const blockers = all.filter((c) => !c.ok);
  const externalBlockers = blockers.filter((c) =>
    ["charges_enabled", "payouts_enabled", "card_payments"].includes(c.id),
  );
  const fixableBlockers = blockers.filter(
    (c) => !externalBlockers.includes(c),
  );

  console.log("\nSummary");
  if (blockers.length === 0 && enforcementCheck.ok) {
    console.log("  All automated checks passed. Stripe is production-ready.");
    process.exit(0);
  }

  if (externalBlockers.length > 0) {
    console.log(
      "  Stripe is holding live payments until account review completes (2–3 days).",
    );
    console.log("  Finish Settings → View account status if anything is open.");
  }

  if (fixableBlockers.length > 0) {
    console.log("  Fixable blockers remain:");
    for (const b of fixableBlockers) console.log(`    - ${b.id}: ${b.detail}`);
    if (!fix) console.log("  Re-run: npm run stripe:production-ready -- --fix");
  }

  if (!enforcementCheck.ok) {
    console.log(
      "  After first successful live payment test, set BILLING_ENFORCEMENT_ENABLED=true in Vercel production.",
    );
  }

  process.exit(fixableBlockers.length > 0 ? 1 : externalBlockers.length > 0 ? 2 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
