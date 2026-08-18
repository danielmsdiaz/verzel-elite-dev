import { UsersRound } from "lucide-react";

import {
  formatCurrency,
  formatEventDate,
  formatEventTime,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { EventDetails } from "@/server/events/queries";

type SessionSummaryProps = {
  event: EventDetails;
  selectedSeats: EventDetails["seats"];
  isPending: boolean;
  result: { status: "success" | "error"; message?: string } | null;
  onCheckout: () => void;
};

export function SessionSummary({
  event,
  selectedSeats,
  isPending,
  result,
  onCheckout,
}: SessionSummaryProps) {
  const totalPrice = selectedSeats.length * event.priceCents;

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
        <SummaryRow
          label="Assentos"
          value={
            selectedSeats.length > 0
              ? selectedSeats.map((seat) => seat.label).join(", ")
              : "Nenhum selecionado"
          }
        />
      </dl>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400">
            {selectedSeats.length > 0 ? "Total" : "Valor por assento"}
          </p>
          <p className="mt-1 font-serif text-3xl font-bold">
            {formatCurrency(
              selectedSeats.length > 0 ? totalPrice : event.priceCents,
            )}
          </p>
        </div>
        <UsersRound className="size-9 text-zinc-500" aria-hidden="true" />
      </div>

      <button
        type="button"
        disabled={selectedSeats.length === 0 || isPending}
        onClick={onCheckout}
        className="mt-6 min-h-12 w-full rounded-full bg-white px-5 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isPending
          ? "Preparando checkout..."
          : selectedSeats.length > 0
            ? "Continuar para pagamento"
            : "Selecione seus assentos"}
      </button>

      {result ? (
        <p
          role="status"
          className={cn(
            "mt-4 rounded-2xl border px-4 py-3 text-sm",
            result.status === "success"
              ? "border-white/30 bg-white/10 text-white"
              : "border-red-300/40 bg-red-950/40 text-red-100",
          )}
        >
          {result.message}
        </p>
      ) : null}
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
