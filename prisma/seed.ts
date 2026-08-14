import "dotenv/config";
import { hash } from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const passwordHash = await hash("Demo@123", 12);

  const organizer = await prisma.user.upsert({
    where: {
      email: "organizer@example.com",
    },
    update: {
      name: "Organizador Demo",
      passwordHash,
      role: "ORGANIZER",
    },
    create: {
      name: "Organizador Demo",
      email: "organizer@example.com",
      passwordHash,
      role: "ORGANIZER",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "customer@example.com",
    },
    update: {
      name: "Cliente Demo",
      passwordHash,
      role: "CUSTOMER",
    },
    create: {
      name: "Cliente Demo",
      email: "customer@example.com",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "gatekeeper@example.com",
    },
    update: {
      name: "Porteiro Demo",
      passwordHash,
      role: "GATEKEEPER",
    },
    create: {
      name: "Porteiro Demo",
      email: "gatekeeper@example.com",
      passwordHash,
      role: "GATEKEEPER",
    },
  });

  const startsAt = new Date();

  startsAt.setDate(startsAt.getDate() + 7);
  startsAt.setHours(19, 30, 0, 0);

  const event = await prisma.event.upsert({
    where: {
      id: "seed-event-interstellar",
    },
    update: {
      organizerId: organizer.id,
      status: "PUBLISHED",
      tmdbMovieId: 157336,
      title: "Interestelar",
      venue: "Cinema Central",
      room: "Sala 01",
      startsAt,
      capacity: 20,
      priceCents: 2500,
    },
    create: {
      id: "seed-event-interstellar",
      organizerId: organizer.id,
      status: "PUBLISHED",
      tmdbMovieId: 157336,
      title: "Interestelar",
      venue: "Cinema Central",
      room: "Sala 01",
      startsAt,
      capacity: 20,
      priceCents: 2500,
    },
  });

  const seats = ["A", "B", "C", "D"].flatMap((row) =>
    Array.from({ length: 5 }, (_, index) => {
      const number = index + 1;

      return {
        eventId: event.id,
        row,
        number,
        label: `${row}-${String(number).padStart(2, "0")}`,
      };
    }),
  );

  await prisma.eventSeat.createMany({
    data: seats,
    skipDuplicates: true,
  });

  console.log("Seed executado com sucesso.");
  console.log("Usuários criados:");
  console.log("  Organizador: organizer@example.com");
  console.log("  Cliente: customer@example.com");
  console.log("  Porteiro: gatekeeper@example.com");
  console.log("  Senha: Demo@123");
  console.log(`Evento criado: ${event.title}`);
  console.log(`Assentos cadastrados: ${seats.length}`);
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });