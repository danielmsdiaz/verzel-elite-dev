import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const EVENT_PAGE_SIZE = 6;

const eventListSelect = {
  id: true,
  title: true,
  posterUrl: true,
  genres: true,
  venue: true,
  room: true,
  startsAt: true,
  priceCents: true,
} satisfies Prisma.EventSelect;

type PublishedEventPageOptions = {
  cursor?: string;
  query?: string;
  venues?: string[];
  genres?: string[];
};

export async function getPublishedEventPage({
  cursor,
  query = "",
  venues = [],
  genres = [],
}: PublishedEventPageOptions = {}) {
  const where: Prisma.EventWhereInput = {
    status: "PUBLISHED",
    ...(query
      ? {
          title: {
            contains: query,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(venues.length > 0 ? { venue: { in: venues } } : {}),
    ...(genres.length > 0 ? { genres: { hasSome: genres } } : {}),
  };
  const [rows, totalCount] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      select: eventListSelect,
      take: EVENT_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    cursor ? Promise.resolve(null) : prisma.event.count({ where }),
  ]);
  const hasMore = rows.length > EVENT_PAGE_SIZE;
  const events = hasMore ? rows.slice(0, EVENT_PAGE_SIZE) : rows;

  return {
    events,
    totalCount,
    nextCursor: hasMore ? (events.at(-1)?.id ?? null) : null,
  };
}

export async function getPublishedEventFilterOptions() {
  const rows = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: {
      venue: true,
      genres: true,
    },
  });

  return {
    venues: uniqueSorted(rows.map((event) => event.venue)),
    genres: uniqueSorted(rows.flatMap((event) => event.genres)),
  };
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

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
