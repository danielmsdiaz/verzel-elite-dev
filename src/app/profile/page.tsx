import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/server/auth/user";
import { getUserTickets } from "@/server/profile/queries";

import { TicketCard } from "./_components/ticket-card";

export const metadata: Metadata = {
  title: "Meu perfil | Sala Cheia",
  description: "Consulte seus dados e ingressos no Sala Cheia.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const tickets = await getUserTickets(user.id);
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;
  const seatCount = tickets.length;

  return (
    <main className="min-h-svh bg-[#f7f6f2] text-zinc-950">
      <SiteHeader />

      <section className="relative overflow-hidden border-b-2 border-zinc-950 bg-zinc-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,1fr)_360px] md:items-end lg:px-8 lg:py-16">
          <div>
            <span className="inline-flex -rotate-1 rounded-full bg-white px-3 py-1.5 text-[9px] font-black tracking-[0.2em] text-zinc-950 uppercase">
              Área do cliente
            </span>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.95] font-bold tracking-tight sm:text-6xl">
              Olá, {firstName}.
              <span className="block text-zinc-400">Seus lugares estão aqui.</span>
            </h1>
          </div>
        </div>
      </section>

      <section
        id="ingressos"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="mt-2 font-serif text-4xl font-bold tracking-tight">
              Meus ingressos
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Seus pagamentos confirmados e os assentos garantidos.
            </p>
          </div>

          <div className="flex gap-3">
            <Stat label="Ingressos" value={seatCount} />
          </div>
        </div>

        {tickets.length > 0 ? (
          <div className="grid gap-7">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border-2 border-dashed border-zinc-400 bg-white px-6 py-16 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-zinc-100">
              <UserRound aria-hidden="true" className="size-7 text-zinc-500" />
            </span>
            <h3 className="mt-5 font-serif text-3xl font-bold">
              Sua carteira está vazia
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Quando um pagamento for confirmado, seus ingressos aparecerão
              aqui automaticamente.
            </p>
            <Link
              href="/#eventos"
              className="mt-6 inline-flex min-h-11 items-center rounded-full border-2 border-zinc-950 bg-zinc-950 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              Explorar sessões
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-2xl border-2 border-zinc-950 bg-white px-4 py-3 text-center shadow-[3px_3px_0_#18181b]">
      <strong className="block font-serif text-2xl leading-none">{value}</strong>
      <span className="mt-1 block text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
        {label}
      </span>
    </div>
  );
}
