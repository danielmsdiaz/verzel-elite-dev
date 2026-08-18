import "server-only";

import { prisma } from "@/lib/prisma";

export async function getCheckoutOrderDetails(orderId: string, userId: string) {
  const order = await prisma.checkoutOrder.findFirst({
    where: { id: orderId, userId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
          venue: true,
          room: true,
          startsAt: true,
          priceCents: true,
        },
      },
    },
  });

  if (!order) return null;

  const seats = await prisma.eventSeat.findMany({
    where: {
      eventId: order.eventId,
      id: { in: order.seatIds },
    },
    select: {
      id: true,
      label: true,
      row: true,
      number: true,
      status: true,
    },
    orderBy: [{ row: "asc" }, { number: "asc" }],
  });

  return { ...order, seats };
}

export type CheckoutOrderDetails = NonNullable<
  Awaited<ReturnType<typeof getCheckoutOrderDetails>>
>;
