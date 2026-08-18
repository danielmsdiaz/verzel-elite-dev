import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublicTicket(shareToken: string) {
  return prisma.ticket.findUnique({
    where: { shareToken },
    select: {
      id: true,
      code: true,
      shareToken: true,
      status: true,
      checkedInAt: true,
      event: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
          venue: true,
          room: true,
          startsAt: true,
        },
      },
      seat: {
        select: {
          label: true,
        },
      },
    },
  });
}

export type PublicTicket = NonNullable<
  Awaited<ReturnType<typeof getPublicTicket>>
>;
