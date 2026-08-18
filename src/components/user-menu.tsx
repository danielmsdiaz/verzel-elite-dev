"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ScanLine,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { logoutAction } from "@/server/auth/actions";
import type { UserRole } from "@/generated/prisma/enums";

type UserMenuProps = {
  name: string;
  email: string;
  role: UserRole;
};

export function UserMenu({ name, email, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstName = name.trim().split(/\s+/)[0] || name;
  const initial = firstName.charAt(0).toLocaleUpperCase("pt-BR");

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="group inline-flex h-11 items-center gap-2 rounded-full border-2 border-zinc-950 bg-white py-1 pr-3 pl-1 shadow-[3px_3px_0_#18181b] transition-transform hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <span className="grid size-8 place-items-center rounded-full bg-zinc-950 text-xs font-black text-white">
          {initial}
        </span>
        <span className="hidden text-sm font-bold sm:inline">
          Olá, {firstName}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute top-[calc(100%+14px)] right-0 z-50 w-72 rounded-3xl border-2 border-zinc-950 bg-white p-2 shadow-[7px_7px_0_#18181b]"
        >
          <span
            aria-hidden="true"
            className="absolute -top-[7px] right-8 size-3 rotate-45 border-t-2 border-l-2 border-zinc-950 bg-white"
          />

          <div className="border-b border-zinc-200 px-3 py-3">
            <p className="truncate text-sm font-bold text-zinc-950">{name}</p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">{email}</p>
          </div>

          <div className="py-2">
            {role === "ORGANIZER" ? (
              <MenuLink
                href="/organizer"
                icon={LayoutDashboard}
                label="Painel de eventos"
                onClick={() => setIsOpen(false)}
              />
            ) : null}
            {role === "GATEKEEPER" ? (
              <MenuLink
                href="/gatekeeper"
                icon={ScanLine}
                label="Portaria"
                onClick={() => setIsOpen(false)}
              />
            ) : null}
            <MenuLink
              href="/profile"
              icon={UserRound}
              label="Meu perfil"
              onClick={() => setIsOpen(false)}
            />
          </div>

          <form action={logoutAction} className="border-t border-zinc-200 pt-2">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-red-700 transition-colors hover:bg-red-50"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sair
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof UserRound;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </Link>
  );
}
