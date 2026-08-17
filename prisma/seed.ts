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

  const eventSeeds = [
    {
      id: "seed-event-interstellar",
      tmdbMovieId: 157336,
      title: "Interestelar",
      posterUrl: posterUrl("/6ricSDD83BClJsFdGB6x7cM0MFQ.jpg"),
      genres: ["Aventura", "Drama", "Ficção científica"],
      venue: "Cinema Central",
      room: "Sala 01",
      daysFromNow: 7,
      hour: 19,
      minute: 30,
      priceCents: 2500,
    },
    {
      id: "seed-event-inception",
      tmdbMovieId: 27205,
      title: "A Origem",
      posterUrl: posterUrl("/9e3Dz7aCANy5aRUQF745IlNloJ1.jpg"),
      genres: ["Ação", "Ficção científica", "Aventura"],
      venue: "Movie Plaza",
      room: "Sala IMAX",
      daysFromNow: 8,
      hour: 20,
      minute: 30,
      priceCents: 3200,
    },
    {
      id: "seed-event-the-dark-knight",
      tmdbMovieId: 155,
      title: "Batman: O Cavaleiro das Trevas",
      posterUrl: posterUrl("/4lj1ikfsSmMZNyfdi8R8Tv5tsgb.jpg"),
      genres: ["Ação", "Crime", "Thriller"],
      venue: "Cine Aurora",
      room: "Sala Principal",
      daysFromNow: 9,
      hour: 21,
      minute: 0,
      priceCents: 2800,
    },
    {
      id: "seed-event-dune",
      tmdbMovieId: 438631,
      title: "Duna",
      posterUrl: posterUrl("/uzERcfV2rSHNhW5eViQiO9hNiA7.jpg"),
      genres: ["Ficção científica", "Aventura"],
      venue: "Estação Cinema",
      room: "Sala 03",
      daysFromNow: 10,
      hour: 18,
      minute: 30,
      priceCents: 2400,
    },
    {
      id: "seed-event-dune-part-two",
      tmdbMovieId: 693134,
      title: "Duna: Parte Dois",
      posterUrl: posterUrl("/8LJJjLjAzAwXS40S5mx79PJ2jSs.jpg"),
      genres: ["Ficção científica", "Aventura"],
      venue: "Movie Plaza",
      room: "Sala IMAX",
      daysFromNow: 11,
      hour: 20,
      minute: 0,
      priceCents: 3500,
    },
    {
      id: "seed-event-parasite",
      tmdbMovieId: 496243,
      title: "Parasita",
      posterUrl: posterUrl("/igw938inb6Fy0YVcwIyxQ7Lu5FO.jpg"),
      genres: ["Comédia", "Thriller", "Drama"],
      venue: "Cinema Central",
      room: "Sala 02",
      daysFromNow: 12,
      hour: 19,
      minute: 0,
      priceCents: 2200,
    },
    {
      id: "seed-event-spirited-away",
      tmdbMovieId: 129,
      title: "A Viagem de Chihiro",
      posterUrl: posterUrl("/hhoKhsyJ3hFaxEm5pMdZRiTu2lJ.jpg"),
      genres: ["Animação", "Família", "Fantasia"],
      venue: "Cine Aurora",
      room: "Sala Principal",
      daysFromNow: 13,
      hour: 16,
      minute: 30,
      priceCents: 1800,
    },
    {
      id: "seed-event-pulp-fiction",
      tmdbMovieId: 680,
      title: "Pulp Fiction: Tempo de Violência",
      posterUrl: posterUrl("/tptjnB2LDbuUWya9Cx5sQtv5hqb.jpg"),
      genres: ["Thriller", "Crime", "Comédia"],
      venue: "Estação Cinema",
      room: "Sala 03",
      daysFromNow: 14,
      hour: 21,
      minute: 30,
      priceCents: 2600,
    },
    {
      id: "seed-event-whiplash",
      tmdbMovieId: 244786,
      title: "Whiplash: Em Busca da Perfeição",
      posterUrl: posterUrl("/2msJb27jMeuA101ox4MuTQK4mDa.jpg"),
      genres: ["Drama", "Música", "Thriller"],
      venue: "Cinema Central",
      room: "Sala 01",
      daysFromNow: 15,
      hour: 20,
      minute: 0,
      priceCents: 2300,
    },
    {
      id: "seed-event-mad-max-fury-road",
      tmdbMovieId: 76341,
      title: "Mad Max: Estrada da Fúria",
      posterUrl: posterUrl("/tH64gzAHDFg7EFcgfkkZyHdGM5P.jpg"),
      genres: ["Ação", "Aventura", "Ficção científica"],
      venue: "Movie Plaza",
      room: "Sala IMAX",
      daysFromNow: 16,
      hour: 21,
      minute: 0,
      priceCents: 3400,
    },
    {
      id: "seed-event-everything-everywhere",
      tmdbMovieId: 545611,
      title: "Tudo em Todo o Lugar ao Mesmo Tempo",
      posterUrl: posterUrl("/2dSZQGwijlXvMSyuGe0FSgrXnv0.jpg"),
      genres: ["Ação", "Aventura", "Ficção científica"],
      venue: "Cine Aurora",
      room: "Sala Principal",
      daysFromNow: 17,
      hour: 19,
      minute: 30,
      priceCents: 2700,
    },
  ];

  let seatCount = 0;

  for (const eventSeed of eventSeeds) {
    const startsAt = futureDate(
      eventSeed.daysFromNow,
      eventSeed.hour,
      eventSeed.minute,
    );
    const eventData = {
      organizerId: organizer.id,
      status: "PUBLISHED" as const,
      tmdbMovieId: eventSeed.tmdbMovieId,
      title: eventSeed.title,
      posterUrl: eventSeed.posterUrl,
      genres: eventSeed.genres,
      venue: eventSeed.venue,
      room: eventSeed.room,
      startsAt,
      capacity: 20,
      priceCents: eventSeed.priceCents,
    };
    const event = await prisma.event.upsert({
      where: { id: eventSeed.id },
      update: eventData,
      create: {
        id: eventSeed.id,
        ...eventData,
      },
    });
    const seats = createSeats(event.id);

    await prisma.eventSeat.createMany({
      data: seats,
      skipDuplicates: true,
    });
    seatCount += seats.length;
  }

  console.log("Seed executado com sucesso.");
  console.log("Usuários criados:");
  console.log("  Organizador: organizer@example.com");
  console.log("  Cliente: customer@example.com");
  console.log("  Porteiro: gatekeeper@example.com");
  console.log("  Senha: Demo@123");
  console.log(`Eventos preparados: ${eventSeeds.length}`);
  console.log(`Assentos preparados: ${seatCount}`);
}

function posterUrl(path: string) {
  return `https://image.tmdb.org/t/p/w500${path}`;
}

function futureDate(daysFromNow: number, hour: number, minute: number) {
  const date = new Date();

  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);

  return date;
}

function createSeats(eventId: string) {
  return ["A", "B", "C", "D"].flatMap((row) =>
    Array.from({ length: 5 }, (_, index) => {
      const number = index + 1;

      return {
        eventId,
        row,
        number,
        label: `${row}-${String(number).padStart(2, "0")}`,
      };
    }),
  );
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
