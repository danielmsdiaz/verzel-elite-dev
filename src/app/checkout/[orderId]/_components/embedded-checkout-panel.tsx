"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";

export function EmbeddedCheckoutPanel({
  publishableKey,
  clientSecret,
}: {
  publishableKey: string;
  clientSecret: string;
}) {
  const [stripePromise] = useState(() => loadStripe(publishableKey));
  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

  return (
    <div className="overflow-hidden rounded-[2rem] border-2 border-zinc-950 bg-white p-2 shadow-[7px_7px_0_#a1a1aa] sm:p-4">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout className="min-h-[560px]" />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
