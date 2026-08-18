"use server";

import { revalidatePath } from "next/cache";

import type { TicketStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/user";

export type GatekeeperValidationState = {
  outcome?: "accepted" | "used" | "cancelled" | "not_found" | "error";
  message?: string;
  ticket?: {
    code: string;
    status: TicketStatus;
    checkedInAt: string | null;
    event: {
      title: string;
      venue: string;
      room: string;
      startsAt: string;
    };
    seat: {
      label: string;
    };
  };
};

type TicketSnapshot = {
  code: string;
  status: TicketStatus;
  checkedInAt: Date | null;
  event: {
    title: string;
    venue: string;
    room: string;
    startsAt: Date;
  };
  seat: {
    label: string;
  };
};

export async function validateTicketAction(
  _previousState: GatekeeperValidationState,
  formData: FormData,
): Promise<GatekeeperValidationState> {
  const gatekeeper = await getCurrentUser();

  if (!gatekeeper || gatekeeper.role !== "GATEKEEPER") {
    return {
      outcome: "error",
      message: "Sua sessão não possui acesso à portaria.",
    };
  }

  const rawCode = readText(formData, "ticketCode").trim();

  if (!rawCode || rawCode.length > 500) {
    return {
      outcome: "error",
      message: "Leia um QR Code ou informe um código válido.",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: getTicketLookup(rawCode),
        select: {
          id: true,
          code: true,
          status: true,
          checkedInAt: true,
          event: {
            select: {
              title: true,
              venue: true,
              room: true,
              startsAt: true,
            },
          },
          seat: {
            select: { label: true },
          },
        },
      });

      if (!ticket) {
        return {
          outcome: "not_found" as const,
          message: "Ingresso não encontrado.",
        };
      }

      if (ticket.status === "CANCELLED") {
        return ticketResult(
          "cancelled",
          "Ingresso cancelado. Não autorize a entrada.",
          ticket,
        );
      }

      if (ticket.status === "USED") {
        return ticketResult(
          "used",
          "Ingresso já utilizado anteriormente.",
          ticket,
        );
      }

      const checkedInAt = new Date();
      const updated = await tx.ticket.updateMany({
        where: {
          id: ticket.id,
          status: "VALID",
        },
        data: {
          status: "USED",
          checkedInAt,
          checkedInById: gatekeeper.id,
        },
      });

      if (updated.count === 0) {
        const current = await tx.ticket.findUniqueOrThrow({
          where: { id: ticket.id },
          select: {
            code: true,
            status: true,
            checkedInAt: true,
            event: {
              select: {
                title: true,
                venue: true,
                room: true,
                startsAt: true,
              },
            },
            seat: {
              select: { label: true },
            },
          },
        });

        return ticketResult(
          "used",
          "Ingresso já utilizado anteriormente.",
          current,
        );
      }

      return ticketResult(
        "accepted",
        "Entrada autorizada.",
        {
          ...ticket,
          status: "USED",
          checkedInAt,
        },
      );
    });

    revalidatePath("/gatekeeper");
    return result;
  } catch (error) {
    console.error("Ticket validation failed:", error);

    return {
      outcome: "error",
      message: "Não foi possível validar o ingresso agora.",
    };
  }
}

function getTicketLookup(rawCode: string) {
  let shareToken = rawCode;

  try {
    const url = new URL(rawCode);
    const match = url.pathname.match(/^\/tickets\/([^/]+)\/?$/);
    if (match?.[1]) shareToken = decodeURIComponent(match[1]);
  } catch {
    // A typed ticket code or raw share token is also accepted.
  }

  return {
    OR: [
      { code: rawCode.toLocaleUpperCase("pt-BR") },
      { shareToken },
    ],
  };
}

function ticketResult(
  outcome: "accepted" | "used" | "cancelled",
  message: string,
  ticket: TicketSnapshot,
): GatekeeperValidationState {
  return {
    outcome,
    message,
    ticket: {
      code: ticket.code,
      status: ticket.status,
      checkedInAt: ticket.checkedInAt?.toISOString() ?? null,
      event: {
        ...ticket.event,
        startsAt: ticket.event.startsAt.toISOString(),
      },
      seat: ticket.seat,
    },
  };
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
