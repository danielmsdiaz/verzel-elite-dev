"use server";

import { revalidatePath } from "next/cache";

import {
  EVENT_CAPACITIES,
  EVENT_ROOMS,
  EVENT_VENUES,
} from "@/lib/event-options";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/user";
import { getMovieById } from "@/server/tmdb/client";

const SEATS_PER_ROW = 10;

type EventField =
  | "movie"
  | "startsAt"
  | "venue"
  | "room"
  | "capacity"
  | "price";

export type CreateOrganizerEventState = {
  status?: "success" | "error";
  message?: string;
  eventId?: string;
  fieldErrors?: Partial<Record<EventField, string>>;
};

export async function createOrganizerEventAction(
  _previousState: CreateOrganizerEventState,
  formData: FormData,
): Promise<CreateOrganizerEventState> {
  const organizer = await getCurrentUser();

  if (!organizer || organizer.role !== "ORGANIZER") {
    return {
      status: "error",
      message: "Apenas organizadores podem criar eventos.",
    };
  }

  const tmdbMovieId = Number(readText(formData, "tmdbMovieId"));
  const startsAt = parseLocalDateTime(readText(formData, "startsAt"));
  const venue = normalizeText(readText(formData, "venue"));
  const room = normalizeText(readText(formData, "room"));
  const capacity = Number(readText(formData, "capacity"));
  const price = Number(readText(formData, "price").replace(",", "."));
  const status = formData.get("intent") === "publish" ? "PUBLISHED" : "DRAFT";
  const fieldErrors: NonNullable<CreateOrganizerEventState["fieldErrors"]> = {};

  if (!Number.isInteger(tmdbMovieId) || tmdbMovieId <= 0) {
    fieldErrors.movie = "Escolha um filme do catálogo.";
  }
  if (!startsAt || startsAt <= new Date()) {
    fieldErrors.startsAt = "Escolha uma data e um horário futuros.";
  }
  if (!EVENT_VENUES.some((option) => option === venue)) {
    fieldErrors.venue = "Escolha um local da lista.";
  }
  if (!EVENT_ROOMS.some((option) => option === room)) {
    fieldErrors.room = "Escolha uma sala da lista.";
  }
  if (!EVENT_CAPACITIES.some((option) => option === capacity)) {
    fieldErrors.capacity = "Escolha uma capacidade da lista.";
  }
  if (!Number.isFinite(price) || price < 1 || price > 10_000) {
    fieldErrors.price = "Informe um preço entre R$ 1,00 e R$ 10.000,00.";
  }

  if (Object.keys(fieldErrors).length > 0 || !startsAt) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors,
    };
  }

  try {
    const movie = await getMovieById(tmdbMovieId);
    const event = await prisma.$transaction(async (tx) => {
      const createdEvent = await tx.event.create({
        data: {
          organizerId: organizer.id,
          status,
          tmdbMovieId: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          genres: movie.genres.map((genre) => genre.name),
          venue,
          room,
          startsAt,
          capacity,
          priceCents: Math.round(price * 100),
        },
        select: { id: true },
      });

      await tx.eventSeat.createMany({
        data: createSeats(createdEvent.id, capacity),
      });

      return createdEvent;
    });

    revalidatePath("/");
    revalidatePath("/organizer");

    return {
      status: "success",
      message:
        status === "PUBLISHED"
          ? "Evento publicado e disponível para venda."
          : "Rascunho salvo com sucesso.",
      eventId: event.id,
    };
  } catch (error) {
    console.error("Organizer event creation failed:", error);

    return {
      status: "error",
      message: "Não foi possível criar o evento. Tente novamente.",
    };
  }
}

export async function publishOrganizerEventAction(formData: FormData) {
  const organizer = await getCurrentUser();

  if (!organizer || organizer.role !== "ORGANIZER") return;

  const eventId = readText(formData, "eventId");

  if (!eventId) return;

  await prisma.event.updateMany({
    where: {
      id: eventId,
      organizerId: organizer.id,
      status: "DRAFT",
      startsAt: { gt: new Date() },
    },
    data: { status: "PUBLISHED" },
  });

  revalidatePath("/");
  revalidatePath("/organizer");
}

function createSeats(eventId: string, capacity: number) {
  return Array.from({ length: capacity }, (_, index) => {
    const rowIndex = Math.floor(index / SEATS_PER_ROW);
    const number = (index % SEATS_PER_ROW) + 1;
    const row = String.fromCharCode(65 + rowIndex);

    return {
      eventId,
      row,
      number,
      label: `${row}-${String(number).padStart(2, "0")}`,
    };
  });
}

function parseLocalDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;

  const date = new Date(`${value}:00-03:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").normalize("NFKC");
}
