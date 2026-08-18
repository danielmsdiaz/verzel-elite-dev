import { ArrowLeft, Clapperboard } from "lucide-react";
import Link from "next/link";

export function CheckoutHeader({ eventId }: { eventId: string }) {
  return (
    <header className="relative z-10 border-b-2 border-zinc-950 bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href={`/events/${eventId}#assentos`}
          className="group inline-flex items-center gap-2 text-sm font-bold"
        >
          <span className="grid size-9 place-items-center rounded-full border-2 border-zinc-950 transition-transform group-hover:-rotate-6">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </span>
          Voltar aos assentos
        </Link>

        <Link href="/" className="inline-flex items-center gap-2 font-serif font-bold">
          <span className="grid size-9 -rotate-3 place-items-center rounded-xl bg-zinc-950 text-white">
            <Clapperboard className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">Sala Cheia</span>
        </Link>
      </div>
    </header>
  );
}
