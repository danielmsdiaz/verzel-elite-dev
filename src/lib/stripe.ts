import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey?.startsWith("sk_test_")) {
    throw new StripeConfigurationError(
      "Configure STRIPE_SECRET_KEY com uma chave de teste sk_test_.",
    );
  }

  stripeClient ??= new Stripe(secretKey, {
    appInfo: {
      name: "Sala Cheia",
      version: "0.1.0",
    },
  });

  return stripeClient;
}

export function getStripePublishableKey() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey?.startsWith("pk_test_")) {
    throw new StripeConfigurationError(
      "Configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY com uma chave de teste pk_test_.",
    );
  }

  return publishableKey;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret?.startsWith("whsec_")) {
    throw new StripeConfigurationError(
      "Configure STRIPE_WEBHOOK_SECRET com o segredo do webhook.",
    );
  }

  return webhookSecret;
}

export class StripeConfigurationError extends Error {}
