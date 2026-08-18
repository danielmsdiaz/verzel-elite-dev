import "server-only";

import { prisma } from "@/lib/prisma";

export async function getOrganizerEvents(organizerId: string) {
  const events = await prisma.event.findMany({
    where: { organizerId },
    select: {
      id: true,
      title: true,
      posterUrl: true,
      venue: true,
      room: true,
      startsAt: true,
      capacity: true,
      priceCents: true,
      status: true,
      seats: {
        select: { status: true },
      },
    },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
  });

  return events.map(({ seats, ...event }) => ({
    ...event,
    reservedSeats: seats.filter((seat) => seat.status === "RESERVED").length,
  }));
}

export type OrganizerEvent = Awaited<
  ReturnType<typeof getOrganizerEvents>
>[number];
