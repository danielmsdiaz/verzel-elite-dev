import { Clapperboard, Star, Ticket } from "lucide-react";
import Link from "next/link";

export function AuthArtwork({ mode }: { mode: "login" | "signup" }) {
  const quote =
    mode === "login"
      ? "“O melhor lugar da sala é aquele que espera por você.”"
      : "“Toda grande história começa com o primeiro ingresso.”";

  return (
    <aside className="relative hidden min-h-[680px] overflow-hidden border-r-2 border-zinc-950 bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-24 size-72 rounded-full border-[46px] border-white/[0.06]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-24 size-72 rounded-full border border-dashed border-white/30"
      />

      <Link href="/" className="relative inline-flex w-fit items-center gap-3">
        <span className="grid size-11 -rotate-3 place-items-center rounded-xl border-2 border-white bg-white text-zinc-950">
          <Clapperboard aria-hidden="true" className="size-6" />
        </span>
        <span>
          <span className="block text-[9px] font-bold tracking-[0.3em] text-zinc-400 uppercase">
            Cineclube
          </span>
          <span className="font-serif text-2xl font-bold">Sala Cheia</span>
        </span>
      </Link>

      <div className="relative py-8">
        <div className="absolute -top-4 right-5 rotate-12">
          <Star aria-hidden="true" className="size-12 fill-white stroke-white" />
        </div>

        <TicketCard />

        <blockquote className="mt-10 max-w-sm font-serif text-3xl leading-tight font-bold text-balance">
          {quote}
        </blockquote>
      </div>

      <p className="relative text-xs font-medium tracking-[0.18em] text-zinc-500 uppercase">
        Luzes. Câmera. Sessão.
      </p>
    </aside>
  );
}

export function DotPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-50"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(24,24,27,.18) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}

function TicketCard() {
  return (
    <div className="relative max-w-sm rotate-[-2deg] rounded-2xl border-2 border-white bg-white p-5 text-zinc-950 shadow-[7px_7px_0_rgba(255,255,255,.2)]">
      <div className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full border-r-2 border-zinc-950 bg-zinc-950" />
      <div className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full border-l-2 border-zinc-950 bg-zinc-950" />

      <div className="flex items-start justify-between gap-5 border-b-2 border-dashed border-zinc-300 pb-4">
        <div>
          <p className="text-[9px] font-bold tracking-[0.24em] text-zinc-500 uppercase">
            Seu ingresso
          </p>
          <p className="mt-1 font-serif text-2xl font-bold">Próxima sessão</p>
        </div>
        <Ticket aria-hidden="true" className="size-8" />
      </div>
      <div className="mt-4 flex justify-between gap-4 text-xs font-bold uppercase">
        <span>Filme</span>
        <span>Sala 01</span>
        <span>20:30</span>
      </div>
    </div>
  );
}
