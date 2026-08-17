"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";

import {
  loginAction,
  type AuthActionState,
} from "@/server/auth/actions";

const INITIAL_STATE: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-zinc-950 bg-zinc-100 px-4 py-3 text-sm font-semibold"
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-bold">
          E-mail
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
            placeholder="voce@exemplo.com"
            className="h-13 w-full rounded-xl border-2 border-zinc-950 bg-white pr-4 pl-11 text-sm outline-none transition-shadow placeholder:text-zinc-400 focus:shadow-[4px_4px_0_#18181b] aria-invalid:bg-zinc-100"
          />
        </div>
        {state.fieldErrors?.email ? (
          <p id="email-error" className="text-xs font-semibold" role="alert">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="password" className="text-sm font-bold">
            Senha
          </label>
          <span className="text-xs font-medium text-zinc-500">
            Mínimo de 8 caracteres
          </span>
        </div>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength={72}
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={
              state.fieldErrors?.password ? "password-error" : undefined
            }
            placeholder="Sua senha"
            className="h-13 w-full rounded-xl border-2 border-zinc-950 bg-white pr-4 pl-11 text-sm outline-none transition-shadow placeholder:text-zinc-400 focus:shadow-[4px_4px_0_#18181b] aria-invalid:bg-zinc-100"
          />
        </div>
        {state.fieldErrors?.password ? (
          <p id="password-error" className="text-xs font-semibold" role="alert">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-zinc-600">
        <input
          type="checkbox"
          name="remember"
          className="size-4 rounded border-2 border-zinc-950 accent-zinc-950"
        />
        Manter conectado por 30 dias
      </label>

      <button
        type="submit"
        disabled={pending}
        className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-zinc-950 bg-zinc-950 px-5 text-sm font-bold text-white shadow-[4px_4px_0_#a1a1aa] transition-transform hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar na minha conta"}
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-1"
        />
      </button>

      <p className="text-center text-sm text-zinc-600">
        Ainda não tem uma conta?{" "}
        <Link href="/signup" className="font-bold text-zinc-950 underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
