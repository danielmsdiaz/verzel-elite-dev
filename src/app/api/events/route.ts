import { getPublishedEventPage } from "@/server/events/queries";

const MAX_FILTER_VALUES = 20;

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const cursor = searchParams.get("cursor")?.trim() || undefined;
  const query = searchParams.get("query")?.trim() ?? "";
  const venues = cleanFilterValues(searchParams.getAll("venue"));
  const genres = cleanFilterValues(searchParams.getAll("genre"));

  if (
    (cursor && cursor.length > 200) ||
    query.length > 100 ||
    venues === null ||
    genres === null
  ) {
    return Response.json({ error: "Filtros inválidos." }, { status: 400 });
  }

  try {
    const page = await getPublishedEventPage({
      cursor,
      query,
      venues,
      genres,
    });

    return Response.json(
      {
        ...page,
        events: page.events.map((event) => ({
          ...event,
          startsAt: event.startsAt.toISOString(),
        })),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Published events request failed:", error);
    return Response.json(
      { error: "Não foi possível carregar as sessões." },
      { status: 500 },
    );
  }
}

function cleanFilterValues(values: string[]) {
  const cleaned = [...new Set(values.map((value) => value.trim()))].filter(
    Boolean,
  );

  if (
    cleaned.length > MAX_FILTER_VALUES ||
    cleaned.some((value) => value.length > 80)
  ) {
    return null;
  }

  return cleaned;
}
