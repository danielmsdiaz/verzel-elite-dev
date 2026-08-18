import {
  Armchair,
  CalendarDays,
  Clock3,
  Film,
  MapPin,
  TicketCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ShareTicketButton } from "@/components/share-ticket-button";
import {
  formatCurrency,
  formatEventDate,
  formatEventTime,
} from "@/lib/formatters";
import type { UserTicket } from "@/server/profile/queries";

export function TicketCard({ ticket }: { ticket: UserTicket }) {
  return (
    <article className="group grid overflow-hidden rounded-[2rem] border-2 border-zinc-950 bg-white shadow-[7px_7px_0_#a1a1aa] md:grid-cols-[180px_minmax(0,1fr)]">
      <div className="relative min-h-56 overflow-hidden border-b-2 border-zinc-950 bg-zinc-200 md:min-h-full md:border-r-2 md:border-b-0">
        {ticket.event.posterUrl ? (
          <Image
            src={ticket.event.posterUrl}
            alt={`Pôster do filme ${ticket.event.title}`}
            fill
            sizes="(min-width: 768px) 180px, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full min-h-56 flex-col items-center justify-center gap-3 text-zinc-500">
            <Film aria-hidden="true" className="size-12" />
            <span className="text-xs font-bold tracking-wider uppercase">
              Sem pôster
            </span>
          </div>
        )}
      </div>

      <div className="relative flex min-w-0 flex-col p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-white uppercase">
              <TicketCheck aria-hidden="true" className="size-3.5" />
              {ticket.hasEnded ? "Sessão encerrada" : "Ingresso confirmado"}
            </span>
            <h3 className="mt-4 font-serif text-3xl leading-none font-bold tracking-tight">
              {ticket.event.title}
            </h3>
          </div>
          <span className="rounded-full border border-zinc-300 px-3 py-1.5 font-mono text-[10px] font-bold text-zinc-600">
            {ticket.code}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <TicketDetail icon={CalendarDays} label="Data">
            {formatEventDate(ticket.event.startsAt)}
          </TicketDetail>
          <TicketDetail icon={Clock3} label="Horário">
            {formatEventTime(ticket.event.startsAt)}
          </TicketDetail>
          <TicketDetail icon={MapPin} label="Local">
            {ticket.event.venue} · {ticket.event.room}
          </TicketDetail>
          <TicketDetail icon={Armchair} label="Assento">
            {ticket.seat.label}
          </TicketDetail>
        </dl>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t-2 border-dashed border-zinc-300 pt-5">
          <div className="flex items-center gap-3">
            <Image
              src={`/api/tickets/${ticket.shareToken}/qr`}
              alt={`QR Code do ingresso ${ticket.code}`}
              width={88}
              height={88}
              unoptimized
              className="rounded-lg border-2 border-zinc-950 bg-white p-1.5"
            />
            <div>
              <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
                Valor do ingresso
              </p>
              <p className="mt-1 text-xl font-black">
                {formatCurrency(ticket.event.priceCents)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/tickets/${ticket.shareToken}`}
              className="inline-flex min-h-10 items-center rounded-full border-2 border-zinc-950 px-4 text-xs font-bold transition hover:-translate-y-0.5"
            >
              Abrir ingresso
            </Link>
            <ShareTicketButton
              shareToken={ticket.shareToken}
              title={ticket.event.title}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function TicketDetail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-100">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div>
        <dt className="text-[9px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 font-semibold text-zinc-950">{children}</dd>
      </div>
    </div>
  );
}
