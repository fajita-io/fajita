/** Customer-facing copy when live card checkout cannot charge yet. */
export function stripePaymentsUnavailableMessage(): string {
  return "Live card payments are still activating on our billing account. If your total is $0 after a promo code, subscribe without entering a card. Paid checkout works once Stripe finishes review (usually a few business days).";
}
