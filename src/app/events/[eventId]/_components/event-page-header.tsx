import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function EventPageHeader() {
  return (
    <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-medium"
      >
        <span className="grid size-9 place-items-center rounded-full border-2 border-zinc-950 bg-white transition-transform group-hover:-rotate-6">
          <ArrowLeft className="size-4" aria-hidden="true" />
        </span>
        Voltar às sessões
      </Link>

      <span className="hidden rounded-full border border-zinc-300 bg-white/80 px-4 py-2 text-[10px] font-semibold tracking-[0.28em] uppercase sm:inline-flex">
        Sessões especiais
      </span>
    </header>
  );
}
