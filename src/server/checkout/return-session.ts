import "server-only";

import { getStripe } from "@/lib/stripe";

import { fulfillCheckoutSession } from "./fulfillment";
import { getCheckoutOrderDetails } from "./queries";

export async function getCheckoutReturnData(
  sessionId: string,
  userId: string,
) {
  if (!sessionId.startsWith("cs_test_")) {
    throw new CheckoutReturnError("Sessão de checkout inválida.");
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    throw new CheckoutReturnError("Pedido não encontrado na sessão do Stripe.");
  }

  const orderBeforeFulfillment = await getCheckoutOrderDetails(orderId, userId);

  if (
    !orderBeforeFulfillment ||
    orderBeforeFulfillment.stripeCheckoutSessionId !== session.id
  ) {
    throw new CheckoutReturnError("Você não possui acesso a este pedido.");
  }

  const fulfillmentStatus = await fulfillCheckoutSession(session);
  const order = await getCheckoutOrderDetails(orderId, userId);

  if (!order) throw new CheckoutReturnError("Pedido não encontrado.");

  return {
    order,
    fulfillmentStatus,
    sessionStatus: session.status,
  };
}

export class CheckoutReturnError extends Error {}
