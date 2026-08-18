"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareTicketButton({
  shareToken,
  title,
}: {
  shareToken: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function shareTicket() {
    const url = new URL(`/tickets/${shareToken}`, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Ingresso — ${title}`,
          text: `Meu ingresso para ${title}`,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      showCopiedState();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      try {
        await navigator.clipboard.writeText(url);
        showCopiedState();
      } catch {
        window.prompt("Copie o link do ingresso:", url);
      }
    }
  }

  function showCopiedState() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={shareTicket}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 text-xs font-bold text-white transition hover:-translate-y-0.5"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Share2 aria-hidden="true" className="size-4" />
      )}
      {copied ? "Link copiado" : "Compartilhar"}
    </button>
  );
}
