import type { Metadata } from "next";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthArtwork, DotPattern } from "@/components/auth-artwork";
import { getCurrentUser } from "@/server/auth/user";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Entrar | Sala Cheia",
  description: "Acesse sua conta no cineclube Sala Cheia.",
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f7f6f2] px-4 py-5 text-zinc-950 sm:px-6 sm:py-8 lg:grid lg:place-items-center lg:px-8">
      <DotPattern />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="group mb-5 inline-flex items-center gap-2 text-sm font-bold sm:mb-7"
        >
          <span className="grid size-9 place-items-center rounded-full border-2 border-zinc-950 bg-white transition-transform group-hover:-translate-x-1">
            <ArrowLeft aria-hidden="true" className="size-4" />
          </span>
          Voltar para as sessões
        </Link>

        <div className="grid overflow-hidden rounded-[2rem] border-2 border-zinc-950 bg-white shadow-[8px_8px_0_#18181b] lg:grid-cols-[0.92fr_1.08fr] lg:shadow-[12px_12px_0_#18181b]">
          <AuthArtwork mode="login" />

          <section className="flex items-center p-6 sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <span className="inline-flex -rotate-1 items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase">
                  <Sparkles aria-hidden="true" className="size-3" />
                  Que bom ter você aqui
                </span>
                <h1 className="mt-5 font-serif text-4xl leading-none font-bold tracking-tight sm:text-5xl">
                  Entre em cena.
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-600 sm:text-base">
                  Acesse sua conta para acompanhar suas sessões e ingressos.
                </p>
              </div>

              <LoginForm />

              <p className="mt-7 text-center text-xs leading-5 text-zinc-500">
                Acesso exclusivo para clientes e organizadores cadastrados.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
