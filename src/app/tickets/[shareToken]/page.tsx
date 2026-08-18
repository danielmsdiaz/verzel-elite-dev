import type { Metadata } from "next";
import {
  Armchair,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ShareTicketButton } from "@/components/share-ticket-button";
import { SiteHeader } from "@/components/site-header";
import { formatEventDate, formatEventTime } from "@/lib/formatters";
import { getPublicTicket } from "@/server/tickets/queries";

type SharedTicketPageProps = {
  params: Promise<{ shareToken: string }>;
};

export const metadata: Metadata = {
  title: "Ingresso | Sala Cheia",
  description: "Ingresso compartilhado para uma sessão do Sala Cheia.",
};

export default async function SharedTicketPage({
  params,
}: SharedTicketPageProps) {
  const { shareToken } = await params;
  const ticket = await getPublicTicket(shareToken);

  if (!ticket) notFound();

  const status = getTicketStatus(ticket.status);

  return (
    <main className="min-h-svh bg-[#f7f6f2] text-zinc-950">
      <SiteHeader />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="mb-7 text-center">
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
            Ingresso digital
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
            {ticket.event.title}
          </h1>
        </div>

        <article className="overflow-hidden rounded-[2rem] border-2 border-zinc-950 bg-white shadow-[7px_7px_0_#a1a1aa]">
          <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="relative min-h-72 border-b-2 border-zinc-950 bg-zinc-200 md:min-h-full md:border-r-2 md:border-b-0">
              {ticket.event.posterUrl ? (
                <Image
                  src={ticket.event.posterUrl}
                  alt={`Pôster de ${ticket.event.title}`}
                  fill
                  sizes="220px"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1.5 text-[9px] font-black tracking-wider uppercase ${status.className}`}>
                  {status.label}
                </span>
                <span className="font-mono text-xs font-bold text-zinc-500">
                  {ticket.code}
                </span>
              </div>

              <dl className="mt-7 grid gap-5 sm:grid-cols-2">
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

              <div className="mt-8 flex flex-col gap-5 border-t-2 border-dashed border-zinc-300 pt-6 sm:flex-row sm:items-center">
                <Image
                  src={`/api/tickets/${ticket.shareToken}/qr`}
                  alt={`QR Code do ingresso ${ticket.code}`}
                  width={144}
                  height={144}
                  unoptimized
                  className="rounded-xl border-2 border-zinc-950 bg-white p-2"
                />
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <ShieldCheck aria-hidden="true" className="size-4" />
                    Apresente este QR na entrada
                  </p>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">
                    Este link dá acesso ao ingresso. Compartilhe apenas com quem
                    vai utilizá-lo.
                  </p>
                  <div className="mt-4">
                    <ShareTicketButton
                      shareToken={ticket.shareToken}
                      title={ticket.event.title}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-zinc-500">
          <CheckCircle2 aria-hidden="true" className="size-4" />
          Código emitido pelo Sala Cheia
        </p>
      </section>
    </main>
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
        <dt className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-semibold">{children}</dd>
      </div>
    </div>
  );
}

function getTicketStatus(status: "VALID" | "USED" | "CANCELLED") {
  if (status === "VALID") {
    return { label: "Ingresso válido", className: "bg-emerald-100 text-emerald-800" };
  }
  if (status === "USED") {
    return { label: "Ingresso utilizado", className: "bg-zinc-200 text-zinc-700" };
  }
  return { label: "Ingresso cancelado", className: "bg-red-100 text-red-800" };
}
