import { ArrowUpRight, Clapperboard } from "lucide-react";
import Link from "next/link";

import { getCurrentUser } from "@/server/auth/user";

import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="relative z-30 border-b-2 border-zinc-950 bg-white">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Sala Cheia — página inicial"
          className="group inline-flex items-center gap-3"
        >
          <span className="grid size-10 -rotate-3 place-items-center rounded-xl border-2 border-zinc-950 bg-zinc-950 text-white transition-transform group-hover:rotate-3">
            <Clapperboard aria-hidden="true" className="size-5" />
          </span>
          <span className="leading-none">
            <span className="block text-[10px] font-bold tracking-[0.28em] text-zinc-500 uppercase">
              Cineclube
            </span>
            <span className="font-serif text-xl font-bold tracking-tight">
              Sala Cheia
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <nav aria-label="Navegação principal" className="hidden sm:block">
            <Link
              href="/#eventos"
              className="text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-950"
            >
              Sessões
            </Link>
          </nav>

          {user ? (
            <UserMenu name={user.name} email={user.email} role={user.role} />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="text-xs font-bold underline-offset-4 hover:underline sm:text-sm"
              >
                <span className="sm:hidden">Criar</span>
                <span className="hidden sm:inline">Criar conta</span>
              </Link>
              <Link
                href="/login"
                className="group inline-flex h-10 items-center gap-2 rounded-full border-2 border-zinc-950 bg-white px-4 text-sm font-bold shadow-[3px_3px_0_#18181b] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Entrar
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:rotate-12"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
