import "server-only";

import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";

type GetOrCreateCustomerInput = {
  email: string;
  userId: string;
  name?: string | null;
};

export async function getOrCreateStripeCustomer(
  input: GetOrCreateCustomerInput,
): Promise<Stripe.Customer> {
  const stripe = getStripe();

  const existing = await stripe.customers.search({
    query: `metadata['user_id']:'${input.userId}'`,
    limit: 1,
  });

  const customer = existing.data[0];

  if (customer && !("deleted" in customer)) {
    if (customer.email !== input.email || (input.name && customer.name !== input.name)) {
      return stripe.customers.update(customer.id, {
        email: input.email,
        ...(input.name ? { name: input.name } : {}),
      });
    }

    return customer;
  }

  return stripe.customers.create({
    email: input.email,
    ...(input.name ? { name: input.name } : {}),
    metadata: {
      user_id: input.userId,
    },
  });
}

export async function findStripeCustomerByUserId(
  userId: string,
): Promise<Stripe.Customer | null> {
  const stripe = getStripe();

  const result = await stripe.customers.search({
    query: `metadata['user_id']:'${userId}'`,
    limit: 1,
  });

  const customer = result.data[0];
  return customer && !("deleted" in customer) ? customer : null;
}
