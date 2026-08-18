import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  getStripe,
  getStripeWebhookSecret,
  StripeConfigurationError,
} from "@/lib/stripe";
import {
  expireCheckoutSession,
  fulfillCheckoutSession,
} from "@/server/checkout/fulfillment";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const payload = await request.text();

    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );

    console.log("Webhook recebido:", event.type);
  } catch (error) {
    const status = error instanceof StripeConfigurationError ? 503 : 400;

    console.error("Stripe webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook." }, { status });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckoutSession(event.data.object);
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await expireCheckoutSession(event.data.object);
    }
  } catch (error) {
    console.error(`Stripe webhook ${event.id} failed:`, error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
