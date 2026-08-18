import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth/user";
import {
  CheckoutReturnError,
  getCheckoutReturnData,
} from "@/server/checkout/return-session";

import { CheckoutHeader } from "../[orderId]/_components/checkout-header";
import { CheckoutOrderSummary } from "../[orderId]/_components/checkout-order-summary";
import { CheckoutStateCard } from "../[orderId]/_components/checkout-state-card";

type CheckoutReturnPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutReturnPage({
  searchParams,
}: CheckoutReturnPageProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { session_id: sessionId } = await searchParams;

  if (!sessionId) redirect("/");

  let result: Awaited<ReturnType<typeof getCheckoutReturnData>>;

  try {
    result = await getCheckoutReturnData(sessionId, user.id);
  } catch (error) {
    if (error instanceof CheckoutReturnError) redirect("/");

    console.error("Checkout return failed:", error);
    throw error;
  }

  if (result.sessionStatus === "open") {
    redirect(`/checkout/${result.order.id}`);
  }

  const state =
    result.order.status === "PENDING"
      ? "PROCESSING"
      : result.order.status === "PROCESSING"
        ? "PROCESSING"
        : result.order.status;

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

      <CheckoutHeader eventId={result.order.eventId} />

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid items-start gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
          <CheckoutOrderSummary order={result.order} />
          <CheckoutStateCard
            status={state}
            eventId={result.order.eventId}
          />
        </div>
      </section>
    </main>
  );
}
