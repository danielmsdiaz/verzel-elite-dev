import "server-only";

import { prisma } from "@/lib/prisma";

export async function getPublishedEvents() {
  return prisma.event.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      startsAt: "asc",
    },
  });
}

export async function getEventById(eventId: string) {
  return prisma.event.findFirst({
    where: {
      id: eventId,
      status: "PUBLISHED",
    },
    include: {
      seats: {
        orderBy: [{ row: "asc" }, { number: "asc" }],
      },
    },
  });
}

export type EventDetails = NonNullable<
  Awaited<ReturnType<typeof getEventById>>
>;
