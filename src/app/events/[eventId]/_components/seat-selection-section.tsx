"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import {
  startCheckoutAction,
  type StartCheckoutResult,
} from "@/server/checkout/actions";
import type { EventDetails } from "@/server/events/queries";

import { SeatMap } from "./seat-map";
import { SessionSummary } from "./session-summary";

type SeatSelectionSectionProps = {
  event: EventDetails;
};

export function SeatSelectionSection({ event }: SeatSelectionSectionProps) {
  const router = useRouter();
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [result, setResult] = useState<StartCheckoutResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedSeats = event.seats.filter((seat) =>
    selectedSeatIds.has(seat.id),
  );

  function toggleSeat(seatId: string) {
    setResult(null);
    setSelectedSeatIds((current) => {
      const next = new Set(current);

      if (next.has(seatId)) next.delete(seatId);
      else if (next.size < 8) next.add(seatId);

      return next;
    });
  }

  function goToCheckout() {
    startTransition(async () => {
      const nextResult = await startCheckoutAction({
        eventId: event.id,
        seatIds: [...selectedSeatIds],
      });

      if (nextResult.status === "success" && nextResult.checkoutUrl) {
        router.push(nextResult.checkoutUrl);
        return;
      }

      setResult(nextResult);
      setSelectedSeatIds(new Set());
      router.refresh();
    });
  }

  return (
    <section
      id="assentos"
      className="relative z-10 mx-auto max-w-7xl scroll-mt-6 px-5 py-14 sm:px-8 lg:px-10 lg:py-20"
    >
      <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <span className="inline-flex -rotate-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.24em] uppercase">
            Escolha seu lugar
          </span>
          <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Onde você quer sentar?
          </h2>
          <p className="mt-2 text-zinc-600">
            Nesta etapa, o mapa representa os lugares cadastrados no banco.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-medium">
          <Legend className="border-zinc-950 bg-white" label="Disponível" />
          <Legend className="border-zinc-950 bg-zinc-950" label="Selecionado" />
          <Legend className="border-zinc-400 bg-zinc-300" label="Reservado" />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SeatMap
          seats={event.seats}
          selectedSeatIds={selectedSeatIds}
          onSeatToggle={toggleSeat}
        />
        <SessionSummary
          event={event}
          selectedSeats={selectedSeats}
          isPending={isPending}
          result={result}
          onCheckout={goToCheckout}
        />
      </div>
    </section>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "size-4 rounded-t-md rounded-b-sm border-2",
          className,
        )}
      />
      {label}
    </span>
  );
}
