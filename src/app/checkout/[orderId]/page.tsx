import { LockKeyhole, ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import {
  getStripePublishableKey,
  StripeConfigurationError,
} from "@/lib/stripe";
import { getCurrentUser } from "@/server/auth/user";
import { getCheckoutOrderDetails } from "@/server/checkout/queries";
import {
  CheckoutSessionError,
  getOrCreateEmbeddedCheckoutSession,
} from "@/server/checkout/stripe-session";

import { CheckoutHeader } from "./_components/checkout-header";
import { CheckoutOrderSummary } from "./_components/checkout-order-summary";
import { CheckoutStateCard } from "./_components/checkout-state-card";
import { EmbeddedCheckoutPanel } from "./_components/embedded-checkout-panel";

type CheckoutPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { orderId } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const order = await getCheckoutOrderDetails(orderId, user.id);

  if (!order) notFound();

  let publishableKey: string | null = null;
  let clientSecret: string | null = null;
  let checkoutError: string | null = null;

  if (order.status === "PENDING") {
    try {
      publishableKey = getStripePublishableKey();
      clientSecret = await getOrCreateEmbeddedCheckoutSession(order.id, user.id);
    } catch (error) {
      if (
        error instanceof StripeConfigurationError ||
        error instanceof CheckoutSessionError
      ) {
        checkoutError = error.message;
      } else {
        console.error("Embedded checkout initialization failed:", error);
        checkoutError = "Não foi possível carregar o checkout agora.";
      }
    }
  }

  const checkoutState = checkoutError
    ? "error"
    : order.status === "PENDING"
      ? "PROCESSING"
      : order.status;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] text-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(24,24,27,.16) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <CheckoutHeader eventId={order.eventId} />

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-zinc-950 bg-white px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase shadow-[3px_3px_0_#18181b]">
              <LockKeyhole className="size-3.5" aria-hidden="true" />
              Checkout seguro
            </span>
            <h1 className="mt-5 max-w-2xl font-serif text-4xl leading-none font-bold tracking-tight sm:text-6xl">
              Falta só o pagamento.
            </h1>
            <p className="mt-4 max-w-xl text-zinc-600">
              Confira seu pedido e finalize pelo ambiente seguro do Stripe.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-white uppercase">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Stripe · modo teste
          </span>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
          <CheckoutOrderSummary order={order} />

          {publishableKey && clientSecret ? (
            <EmbeddedCheckoutPanel
              publishableKey={publishableKey}
              clientSecret={clientSecret}
            />
          ) : (
            <CheckoutStateCard
              status={checkoutState}
              eventId={order.eventId}
              message={checkoutError ?? undefined}
            />
          )}
        </div>
      </section>
    </main>
  );
}
