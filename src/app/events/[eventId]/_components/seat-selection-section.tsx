import { cn } from "@/lib/utils";
import type { EventDetails } from "@/server/events/queries";

import { SeatMap } from "./seat-map";
import { SessionSummary } from "./session-summary";

type SeatSelectionSectionProps = {
  event: EventDetails;
};

export function SeatSelectionSection({ event }: SeatSelectionSectionProps) {
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
          <Legend className="border-zinc-300 bg-zinc-200" label="Reservado" />
          <Legend className="border-zinc-950 bg-zinc-950" label="Vendido" />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SeatMap seats={event.seats} />
        <SessionSummary event={event} />
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
