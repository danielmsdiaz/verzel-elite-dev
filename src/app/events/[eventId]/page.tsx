import { notFound } from "next/navigation";

import { getEventById } from "@/server/events/queries";

import { EventHero } from "./_components/event-hero";
import { EventPageHeader } from "./_components/event-page-header";
import { SeatSelectionSection } from "./_components/seat-selection-section";

type EventPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const availableSeats = event.seats.filter(
    (seat) => seat.status === "AVAILABLE",
  ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] text-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(24,24,27,.14) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <EventPageHeader />
      <EventHero event={event} availableSeats={availableSeats} />
      <SeatSelectionSection event={event} />
    </main>
  );
}
