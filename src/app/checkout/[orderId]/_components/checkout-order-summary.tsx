import { CalendarDays, MapPin, Ticket } from "lucide-react";
import Image from "next/image";

import {
  formatCurrency,
  formatEventDate,
  formatEventTime,
} from "@/lib/formatters";
import type { CheckoutOrderDetails } from "@/server/checkout/queries";

export function CheckoutOrderSummary({
  order,
}: {
  order: CheckoutOrderDetails;
}) {
  return (
    <aside className="overflow-hidden rounded-[2rem] border-2 border-zinc-950 bg-white shadow-[7px_7px_0_#18181b] lg:sticky lg:top-6">
      <div className="relative aspect-[16/9] overflow-hidden border-b-2 border-zinc-950 bg-zinc-200">
        {order.event.posterUrl ? (
          <Image
            src={order.event.posterUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover object-[center_30%] grayscale"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full border border-white/50 bg-zinc-950 px-3 py-1.5 text-[9px] font-bold tracking-[0.22em] text-white uppercase">
          Seu pedido
        </span>
      </div>

      <div className="p-6">
        <h2 className="font-serif text-3xl leading-tight font-bold">
          {order.event.title}
        </h2>

        <div className="mt-5 space-y-3 border-y border-zinc-200 py-5 text-sm text-zinc-600">
          <SummaryLine icon={CalendarDays}>
            {formatEventDate(order.event.startsAt)}, às{" "}
            {formatEventTime(order.event.startsAt)}
          </SummaryLine>
          <SummaryLine icon={MapPin}>
            {order.event.venue} · {order.event.room}
          </SummaryLine>
          <SummaryLine icon={Ticket}>
            Assentos {order.seats.map((seat) => seat.label).join(", ")}
          </SummaryLine>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500">
              {order.seatIds.length}{" "}
              {order.seatIds.length === 1 ? "ingresso" : "ingressos"}
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-600">
              {formatCurrency(order.event.priceCents)} cada
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-[0.18em] text-zinc-500 uppercase">
              Total
            </p>
            <p className="font-serif text-3xl font-bold">
              {formatCurrency(order.amountCents)}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SummaryLine({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-zinc-950" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
