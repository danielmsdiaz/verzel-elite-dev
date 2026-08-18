"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/user";

const MAX_SEATS_PER_ORDER = 8;

export type StartCheckoutResult = {
  status: "success" | "error";
  message?: string;
  checkoutUrl?: string;
};

export async function startCheckoutAction({
  eventId,
  seatIds,
}: {
  eventId: string;
  seatIds: string[];
}): Promise<StartCheckoutResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Entre na sua conta para continuar para o checkout.",
    };
  }

  const uniqueSeatIds = [...new Set(seatIds)];

  if (
    !eventId ||
    uniqueSeatIds.length === 0 ||
    uniqueSeatIds.length > MAX_SEATS_PER_ORDER
  ) {
    return {
      status: "error",
      message: `Escolha entre 1 e ${MAX_SEATS_PER_ORDER} assentos.`,
    };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({
        where: {
          id: eventId,
          status: "PUBLISHED",
          startsAt: { gt: new Date() },
        },
        select: {
          id: true,
          priceCents: true,
          seats: {
            where: { id: { in: uniqueSeatIds } },
            select: { id: true, status: true },
          },
        },
      });

      if (
        !event ||
        event.seats.length !== uniqueSeatIds.length ||
        event.seats.some((seat) => seat.status !== "AVAILABLE")
      ) {
        throw new CheckoutUnavailableError();
      }

      return tx.checkoutOrder.create({
        data: {
          userId: user.id,
          eventId: event.id,
          seatIds: uniqueSeatIds,
          amountCents: event.priceCents * uniqueSeatIds.length,
        },
        select: { id: true },
      });
    });

    return {
      status: "success",
      checkoutUrl: `/checkout/${order.id}`,
    };
  } catch (error) {
    if (error instanceof CheckoutUnavailableError) {
      return {
        status: "error",
        message:
          "Um dos assentos não está mais disponível. Atualize o mapa e escolha novamente.",
      };
    }

    console.error("Checkout order creation failed:", error);

    return {
      status: "error",
      message: "Não foi possível iniciar o checkout. Tente novamente.",
    };
  }
}

class CheckoutUnavailableError extends Error {}
