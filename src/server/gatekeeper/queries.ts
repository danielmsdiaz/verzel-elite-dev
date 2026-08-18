import "server-only";

import { prisma } from "@/lib/prisma";

export async function getRecentTicketValidations(gatekeeperId: string) {
  return prisma.ticket.findMany({
    where: {
      checkedInById: gatekeeperId,
      status: "USED",
    },
    select: {
      id: true,
      code: true,
      checkedInAt: true,
      event: {
        select: {
          title: true,
        },
      },
      seat: {
        select: {
          label: true,
        },
      },
    },
    orderBy: {
      checkedInAt: "desc",
    },
    take: 6,
  });
}
