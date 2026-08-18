import type { Metadata } from "next";
import { CheckCircle2, Clock3 } from "lucide-react";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { formatEventTime } from "@/lib/formatters";
import { getCurrentUser } from "@/server/auth/user";
import { getRecentTicketValidations } from "@/server/gatekeeper/queries";

import { TicketValidator } from "./_components/ticket-validator";

export const metadata: Metadata = {
  title: "Portaria | Sala Cheia",
  description: "Validação de ingressos do Sala Cheia.",
};

export default async function GatekeeperPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "GATEKEEPER") redirect("/");

  const recentValidations = await getRecentTicketValidations(user.id);

  return (
    <main className="min-h-svh bg-[#f7f6f2] text-zinc-950">
      <SiteHeader />

      <section className="border-b-2 border-zinc-950 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
            Portaria
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Controle de entrada
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
            Leia o QR Code do visitante ou informe o código manualmente.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-12">
        <TicketValidator />

        <aside className="rounded-[1.75rem] border-2 border-zinc-950 bg-white p-5 shadow-[4px_4px_0_#d4d4d8] sm:p-6">
          <p className="text-[10px] font-black tracking-[0.18em] text-zinc-500 uppercase">
            Nesta portaria
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold">
            Últimas entradas
          </h2>

          {recentValidations.length > 0 ? (
            <ol className="mt-5 divide-y divide-zinc-200">
              {recentValidations.map((ticket) => (
                <li key={ticket.id} className="flex gap-3 py-4 first:pt-0">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {ticket.event.title}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Assento {ticket.seat.label} · {ticket.code}
                    </p>
                    {ticket.checkedInAt ? (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                        <Clock3 aria-hidden="true" className="size-3" />
                        {formatEventTime(ticket.checkedInAt)}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-5 rounded-xl bg-zinc-100 px-4 py-5 text-sm leading-6 text-zinc-600">
              Nenhum ingresso validado nesta sessão.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
