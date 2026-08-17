"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";

import {
  signupAction,
  type AuthActionState,
} from "@/server/auth/actions";

const INITIAL_STATE: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-zinc-950 bg-zinc-100 px-4 py-3 text-sm font-semibold"
        >
          {state.message}
        </p>
      ) : null}

      <Field
        id="name"
        name="name"
        type="text"
        label="Nome"
        placeholder="Como podemos chamar você?"
        autoComplete="name"
        maxLength={80}
        error={state.fieldErrors?.name}
        icon={<UserRound aria-hidden="true" className="size-4" />}
      />
      <Field
        id="signup-email"
        name="email"
        type="email"
        label="E-mail"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        maxLength={254}
        error={state.fieldErrors?.email}
        icon={<Mail aria-hidden="true" className="size-4" />}
      />
      <Field
        id="signup-password"
        name="password"
        type="password"
        label="Senha"
        hint="Entre 8 e 72 caracteres"
        placeholder="Crie uma senha segura"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        error={state.fieldErrors?.password}
        icon={<LockKeyhole aria-hidden="true" className="size-4" />}
      />
      <Field
        id="password-confirmation"
        name="passwordConfirmation"
        type="password"
        label="Confirmar senha"
        placeholder="Digite a senha novamente"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        error={state.fieldErrors?.passwordConfirmation}
        icon={<LockKeyhole aria-hidden="true" className="size-4" />}
      />

      <button
        type="submit"
        disabled={pending}
        className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-zinc-950 bg-zinc-950 px-5 text-sm font-bold text-white shadow-[4px_4px_0_#a1a1aa] transition-transform hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Criando conta..." : "Criar minha conta"}
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-1"
        />
      </button>

      <p className="text-center text-sm text-zinc-600">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-bold text-zinc-950 underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

function Field({
  id,
  name,
  type,
  label,
  hint,
  placeholder,
  autoComplete,
  minLength,
  maxLength,
  error,
  icon,
}: {
  id: string;
  name: string;
  type: "text" | "email" | "password";
  label: string;
  hint?: string;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
  error?: string;
  icon: React.ReactNode;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
        </label>
        {hint ? (
          <span className="text-xs font-medium text-zinc-500">{hint}</span>
        ) : null}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-500">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          className="h-13 w-full rounded-xl border-2 border-zinc-950 bg-white pr-4 pl-11 text-sm outline-none transition-shadow placeholder:text-zinc-400 focus:shadow-[4px_4px_0_#18181b] aria-invalid:bg-zinc-100"
        />
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-semibold" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
