import "server-only";

import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export type CheckoutFulfillmentStatus =
  | "pending"
  | "fulfilled"
  | "refunded"
  | "expired";

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<CheckoutFulfillmentStatus> {
  if (session.payment_status !== "paid") return "pending";

  const orderId = session.metadata?.orderId;

  if (!orderId) throw new Error("Stripe session is missing orderId metadata.");

  const paymentIntentId = getPaymentIntentId(session.payment_intent);

  try {
    return await prisma.$transaction(async (tx) => {
      const claimed = await tx.checkoutOrder.updateMany({
        where: {
          id: orderId,
          stripeCheckoutSessionId: session.id,
          status: "PENDING",
        },
        data: { status: "PROCESSING" },
      });

      if (claimed.count === 0) {
        const current = await tx.checkoutOrder.findUnique({
          where: { id: orderId },
          select: { status: true },
        });

        return orderStatusToFulfillment(current?.status);
      }

      const order = await tx.checkoutOrder.findUniqueOrThrow({
        where: { id: orderId },
        select: {
          eventId: true,
          seatIds: true,
          amountCents: true,
          currency: true,
        },
      });

      if (
        session.amount_total !== order.amountCents ||
        session.currency !== order.currency
      ) {
        throw new FulfillmentRejectedError();
      }

      const seats = await tx.eventSeat.updateMany({
        where: {
          eventId: order.eventId,
          id: { in: order.seatIds },
          status: "AVAILABLE",
        },
        data: { status: "RESERVED" },
      });

      if (seats.count !== order.seatIds.length) {
        throw new FulfillmentRejectedError();
      }

      await tx.checkoutOrder.update({
        where: { id: orderId },
        data: {
          status: "FULFILLED",
          stripePaymentIntentId: paymentIntentId,
          fulfilledAt: new Date(),
        },
      });

      return "fulfilled";
    });
  } catch (error) {
    if (!(error instanceof FulfillmentRejectedError)) throw error;

    if (!paymentIntentId) {
      throw new Error("Paid Stripe session is missing a PaymentIntent.");
    }

    const stripe = getStripe();

    await stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        reason: "requested_by_customer",
        metadata: { orderId, reason: "seat_unavailable" },
      },
      { idempotencyKey: `seat-conflict-refund-${session.id}` },
    );

    await prisma.checkoutOrder.updateMany({
      where: {
        id: orderId,
        status: { in: ["PENDING", "PROCESSING"] },
      },
      data: {
        status: "REFUNDED",
        stripePaymentIntentId: paymentIntentId,
        refundedAt: new Date(),
      },
    });

    return "refunded";
  }
}

export async function expireCheckoutSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) return;

  await prisma.checkoutOrder.updateMany({
    where: {
      id: orderId,
      stripeCheckoutSessionId: session.id,
      status: "PENDING",
    },
    data: { status: "EXPIRED" },
  });
}

function getPaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null,
) {
  if (typeof paymentIntent === "string") return paymentIntent;
  return paymentIntent?.id ?? null;
}

function orderStatusToFulfillment(
  status:
    | "PENDING"
    | "PROCESSING"
    | "FULFILLED"
    | "REFUNDED"
    | "EXPIRED"
    | undefined,
): CheckoutFulfillmentStatus {
  if (status === "FULFILLED") return "fulfilled";
  if (status === "REFUNDED") return "refunded";
  if (status === "EXPIRED") return "expired";
  return "pending";
}

class FulfillmentRejectedError extends Error {}
