import {
  CalendarDays,
  Clock3,
  Film,
  MapPin,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import type { EventDetails } from "@/server/events/queries";

import {
  formatCurrency,
  formatEventDate,
  formatEventTime,
} from "../_lib/event-formatters";

type EventHeroProps = {
  event: EventDetails;
  availableSeats: number;
};

export function EventHero({ event, availableSeats }: EventHeroProps) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-zinc-950 bg-zinc-950 text-white shadow-[10px_10px_0_#d4d4d8]">
        <div className="absolute -top-20 -right-16 size-72 rounded-full border-[44px] border-white/5" />
        <div className="absolute -bottom-32 left-1/3 size-80 rounded-full border border-dashed border-white/15" />

        <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[310px_1fr] lg:gap-12 lg:p-12">
          <div className="mx-auto w-full max-w-[310px] lg:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[1.5rem] border-2 border-white bg-zinc-100 shadow-[7px_7px_0_rgba(255,255,255,.22)]">
              {event.posterUrl ? (
                <Image
                  src={event.posterUrl}
                  alt={`Pôster do filme ${event.title}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 310px, 310px"
                  className="object-cover grayscale contrast-125"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-[linear-gradient(145deg,#fafafa,#d4d4d8)] px-6 text-center text-zinc-950">
                  <Film className="size-14 stroke-[1.4]" aria-hidden="true" />
                  <div>
                    <p className="font-serif text-2xl font-bold">
                      {event.title}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold tracking-[0.24em] text-zinc-500 uppercase">
                      Pôster indisponível
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center py-2 lg:py-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="-rotate-2 rounded-full bg-white px-4 py-2 text-[10px] font-bold tracking-[0.22em] text-zinc-950 uppercase">
                Em cartaz
              </span>
              <span className="rounded-full border border-white/30 px-4 py-2 text-xs text-zinc-300">
                {availableSeats} lugares disponíveis
              </span>
            </div>

            <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {event.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              Uma sessão para viver a história na tela grande — e escolher o
              seu lugar antes que as luzes se apaguem.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <EventInfo
                icon={CalendarDays}
                label="Data"
                value={formatEventDate(event.startsAt)}
              />
              <EventInfo
                icon={Clock3}
                label="Horário"
                value={formatEventTime(event.startsAt)}
              />
              <EventInfo
                icon={MapPin}
                label="Local"
                value={`${event.venue} · ${event.room}`}
              />
              <EventInfo
                icon={Ticket}
                label="Ingresso"
                value={formatCurrency(event.priceCents)}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="#assentos"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-zinc-200"
              >
                Ver mapa de assentos
              </Link>
              <p className="text-xs leading-5 text-zinc-400">
                Chegue com 20 minutos de antecedência.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function EventInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon className="size-4" aria-hidden="true" />
        <span className="text-[10px] font-semibold tracking-[0.18em] uppercase">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
