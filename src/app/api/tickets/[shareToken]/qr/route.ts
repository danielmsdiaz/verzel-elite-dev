import QRCode from "qrcode";

import { getPublicTicket } from "@/server/tickets/queries";

type TicketQrRouteContext = {
  params: Promise<{ shareToken: string }>;
};

export async function GET(request: Request, context: TicketQrRouteContext) {
  const { shareToken } = await context.params;
  const ticket = await getPublicTicket(shareToken);

  if (!ticket) return new Response("Ingresso não encontrado.", { status: 404 });

  const ticketUrl = new URL(`/tickets/${shareToken}`, request.url).toString();
  const svg = await QRCode.toString(ticketUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: {
      dark: "#18181b",
      light: "#ffffff",
    },
  });

  return new Response(svg, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
