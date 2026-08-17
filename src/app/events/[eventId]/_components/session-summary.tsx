import { UsersRound } from "lucide-react";

import type { EventDetails } from "@/server/events/queries";

import {
  formatCurrency,
  formatEventDate,
  formatEventTime,
} from "../_lib/event-formatters";

type SessionSummaryProps = {
  event: EventDetails;
};

export function SessionSummary({ event }: SessionSummaryProps) {
  return (
    <aside className="rounded-[2rem] border-2 border-zinc-950 bg-zinc-950 p-6 text-white shadow-[7px_7px_0_#a1a1aa] lg:sticky lg:top-6">
      <span className="inline-flex rotate-1 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] text-zinc-950 uppercase">
        Resumo da sessão
      </span>

      <h3 className="mt-5 font-serif text-3xl leading-tight font-bold">
        {event.title}
      </h3>

      <dl className="mt-6 space-y-4 border-y border-white/20 py-5 text-sm">
        <SummaryRow label="Data" value={formatEventDate(event.startsAt)} />
        <SummaryRow label="Horário" value={formatEventTime(event.startsAt)} />
        <SummaryRow label="Sala" value={event.room} />
        <SummaryRow label="Capacidade" value={`${event.capacity} lugares`} />
      </dl>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400">Valor por assento</p>
          <p className="mt-1 font-serif text-3xl font-bold">
            {formatCurrency(event.priceCents)}
          </p>
        </div>
        <UsersRound className="size-9 text-zinc-500" aria-hidden="true" />
      </div>

      <button
        type="button"
        disabled
        className="mt-6 min-h-12 w-full cursor-not-allowed rounded-full bg-white px-5 text-sm font-bold text-zinc-950 opacity-65"
      >
        Seleção na próxima etapa
      </button>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
