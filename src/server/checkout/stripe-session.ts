import "server-only";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

import { getCheckoutOrderDetails } from "./queries";

export async function getOrCreateEmbeddedCheckoutSession(
  orderId: string,
  userId: string,
) {
  const order = await getCheckoutOrderDetails(orderId, userId);

  if (!order || order.status !== "PENDING") {
    throw new CheckoutSessionError("Este checkout não está mais disponível.");
  }

  if (
    order.seats.length !== order.seatIds.length ||
    order.seats.some((seat) => seat.status !== "AVAILABLE")
  ) {
    throw new CheckoutSessionError(
      "Um dos assentos não está mais disponível. Volte e escolha novamente.",
    );
  }

  const stripe = getStripe();

  if (order.stripeCheckoutSessionId) {
    const existingSession = await stripe.checkout.sessions.retrieve(
      order.stripeCheckoutSessionId,
    );

    if (existingSession.status === "expired") {
      await prisma.checkoutOrder.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "EXPIRED" },
      });

      throw new CheckoutSessionError("Este checkout expirou.");
    }

    if (existingSession.client_secret) {
      return existingSession.client_secret;
    }
  }

  const baseUrl = await getBaseUrl();
  const seatLabels = order.seats.map((seat) => seat.label).join(", ");
  const session = await stripe.checkout.sessions.create(
    {
      ui_mode: "embedded_page",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: order.user.email,
      client_reference_id: order.id,
      locale: "pt-BR",
      submit_type: "book",
      redirect_on_completion: "always",
      return_url: `${baseUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      line_items: [
        {
          price_data: {
            currency: order.currency,
            unit_amount: order.event.priceCents,
            product_data: {
              name: order.event.title,
              description: `${order.event.venue} · ${order.event.room} · Assentos ${seatLabels}`,
            },
          },
          quantity: order.seatIds.length,
        },
      ],
      metadata: {
        orderId: order.id,
        eventId: order.eventId,
        userId: order.userId,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          eventId: order.eventId,
          userId: order.userId,
        },
      },
    },
    { idempotencyKey: `checkout-order-${order.id}` },
  );

  if (!session.client_secret) {
    throw new CheckoutSessionError(
      "O Stripe não retornou o segredo da sessão de checkout.",
    );
  }

  const saved = await prisma.checkoutOrder.updateMany({
    where: {
      id: order.id,
      userId,
      status: "PENDING",
      stripeCheckoutSessionId: null,
    },
    data: { stripeCheckoutSessionId: session.id },
  });

  if (saved.count !== 1) {
    throw new CheckoutSessionError("Não foi possível vincular o checkout.");
  }

  return session.client_secret;
}

async function getBaseUrl() {
  const requestHeaders = await headers();
  const candidate =
    process.env.APP_URL ?? requestHeaders.get("origin") ?? "http://localhost:3000";

  try {
    const url = new URL(candidate);

    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();

    return url.origin;
  } catch {
    throw new CheckoutSessionError("APP_URL possui um endereço inválido.");
  }
}

export class CheckoutSessionError extends Error {}
