import type { Metadata } from "next";
import { CalendarDays, MapPin, Ticket, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import {
  formatCurrency,
  formatEventDate,
  formatEventTime,
} from "@/lib/formatters";
import { getCurrentUser } from "@/server/auth/user";
import { publishOrganizerEventAction } from "@/server/organizer/actions";
import {
  getOrganizerEvents,
  type OrganizerEvent,
} from "@/server/organizer/queries";

import { OrganizerEventForm } from "./_components/event-form";

export const metadata: Metadata = {
  title: "Painel do organizador | Sala Cheia",
  description: "Crie e acompanhe suas sessões no Sala Cheia.",
};

export default async function OrganizerPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "ORGANIZER") redirect("/");

  const events = await getOrganizerEvents(user.id);

  return (
    <main className="min-h-svh bg-[#f7f6f2] text-zinc-950">
      <SiteHeader />

      <section className="border-b-2 border-zinc-950 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end lg:px-8">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
              Organização
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Painel de eventos
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              Escolha um filme, defina os dados da sessão e publique quando
              estiver pronto.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:px-8 lg:py-12">
        <OrganizerEventForm />

        <section aria-labelledby="organizer-events-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] text-zinc-500 uppercase">
                Sua programação
              </p>
              <h2
                id="organizer-events-title"
                className="mt-1 font-serif text-3xl font-bold"
              >
                Eventos
              </h2>
            </div>
            <span className="text-sm font-semibold text-zinc-500">
              {events.length} {events.length === 1 ? "evento" : "eventos"}
            </span>
          </div>

          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <OrganizerEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border-2 border-dashed border-zinc-400 bg-white px-6 py-14 text-center">
              <CalendarDays className="mx-auto size-8 text-zinc-400" />
              <h3 className="mt-4 font-serif text-2xl font-bold">
                Nenhum evento criado
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                Use o formulário ao lado para montar sua primeira sessão.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function OrganizerEventCard({ event }: { event: OrganizerEvent }) {
  return (
    <article className="grid overflow-hidden rounded-[1.5rem] border-2 border-zinc-950 bg-white shadow-[4px_4px_0_#d4d4d8] sm:grid-cols-[112px_minmax(0,1fr)]">
      <div className="relative min-h-36 border-b-2 border-zinc-950 bg-zinc-200 sm:min-h-full sm:border-r-2 sm:border-b-0">
        {event.posterUrl ? (
          <Image
            src={event.posterUrl}
            alt={`Pôster de ${event.title}`}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black tracking-wider uppercase ${
                event.status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {event.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
            </span>
            <h3 className="mt-2 truncate font-serif text-2xl font-bold">
              {event.title}
            </h3>
          </div>
          <strong className="text-sm">{formatCurrency(event.priceCents)}</strong>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-3.5" />
            {event.venue} · {event.room}
          </p>
          <p className="flex items-center gap-2">
            <UsersRound aria-hidden="true" className="size-3.5" />
            {event.capacity} lugares
          </p>
          <p className="flex items-center gap-2">
            <Ticket aria-hidden="true" className="size-3.5" />
            {event.reservedSeats} vendidos
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-200 pt-4">
          {event.status === "DRAFT" ? (
            <form action={publishOrganizerEventAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <button
                type="submit"
                className="inline-flex min-h-9 items-center rounded-full bg-zinc-950 px-4 text-xs font-bold text-white"
              >
                Publicar
              </button>
            </form>
          ) : (
            <Link
              href={`/events/${event.id}`}
              className="inline-flex min-h-9 items-center rounded-full border-2 border-zinc-950 px-4 text-xs font-bold"
            >
              Ver página pública
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
