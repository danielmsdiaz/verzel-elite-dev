import { CircleAlert, CircleCheckBig, Clock3 } from "lucide-react";
import Link from "next/link";

type CheckoutStateCardProps = {
  status: "FULFILLED" | "REFUNDED" | "EXPIRED" | "PROCESSING" | "error";
  eventId: string;
  message?: string;
};

export function CheckoutStateCard({
  status,
  eventId,
  message,
}: CheckoutStateCardProps) {
  const content = getContent(status, message);
  const Icon = content.icon;

  return (
    <div className="rounded-[2rem] border-2 border-zinc-950 bg-white p-8 text-center shadow-[7px_7px_0_#a1a1aa] sm:p-12">
      <span className="mx-auto grid size-16 place-items-center rounded-full border-2 border-zinc-950 bg-zinc-950 text-white">
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <p className="mt-6 text-[10px] font-bold tracking-[0.24em] text-zinc-500 uppercase">
        {content.eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-4xl font-bold">{content.title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
        {content.description}
      </p>
      <Link
        href={`/events/${eventId}#assentos`}
        className="mt-7 inline-flex min-h-11 items-center rounded-full border-2 border-zinc-950 bg-white px-6 text-sm font-bold shadow-[4px_4px_0_#18181b] transition-transform hover:-translate-y-0.5"
      >
        Voltar para a sessão
      </Link>
    </div>
  );
}

function getContent(status: CheckoutStateCardProps["status"], message?: string) {
  if (status === "FULFILLED") {
    return {
      icon: CircleCheckBig,
      eyebrow: "Pagamento confirmado",
      title: "Lugares garantidos!",
      description: "Seus assentos foram reservados e já aparecem ocupados no mapa.",
    };
  }

  if (status === "REFUNDED") {
    return {
      icon: CircleAlert,
      eyebrow: "Reembolso iniciado",
      title: "O lugar ficou indisponível",
      description:
        "Outro pagamento confirmou esse assento primeiro. O Stripe iniciou automaticamente o reembolso integral.",
    };
  }

  if (status === "EXPIRED") {
    return {
      icon: Clock3,
      eyebrow: "Checkout expirado",
      title: "O tempo acabou",
      description: "Escolha os assentos novamente para iniciar um novo checkout.",
    };
  }

  if (status === "PROCESSING") {
    return {
      icon: Clock3,
      eyebrow: "Processando",
      title: "Só mais um instante",
      description: "Estamos confirmando o pagamento e os assentos escolhidos.",
    };
  }

  return {
    icon: CircleAlert,
    eyebrow: "Configuração necessária",
    title: "Checkout indisponível",
    description: message ?? "Não foi possível carregar o checkout agora.",
  };
}
