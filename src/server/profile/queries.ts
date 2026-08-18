import "server-only";

import { prisma } from "@/lib/prisma";

export async function getUserTickets(userId: string) {
  const tickets = await prisma.ticket.findMany({
    where: {
      order: {
        userId,
        status: "FULFILLED",
      },
    },
    select: {
      id: true,
      code: true,
      shareToken: true,
      status: true,
      createdAt: true,
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
      seat: {
        select: {
          id: true,
          label: true,
          row: true,
          number: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  return tickets.map((ticket) => ({
    ...ticket,
    hasEnded: ticket.event.startsAt < now,
  }));
}

export type UserTicket = Awaited<ReturnType<typeof getUserTickets>>[number];
