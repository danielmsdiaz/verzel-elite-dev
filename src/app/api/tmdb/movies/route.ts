import {
  getMovies,
  searchMovies,
  TmdbApiError,
} from "@/server/tmdb/client";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("query")?.trim();
  const page = parsePage(searchParams.get("page"));

  if (page === null) {
    return Response.json(
      { error: "O parâmetro page deve ser um inteiro entre 1 e 500." },
      { status: 400 },
    );
  }

  try {
    const movies = query
      ? await searchMovies(query, page)
      : await getMovies(page);

    return Response.json(movies);
  } catch (error) {
    console.error("TMDB movies request failed:", error);

    return Response.json(
      { error: "Não foi possível consultar os filmes no momento." },
      { status: getErrorStatus(error) },
    );
  }
}

function parsePage(value: string | null) {
  if (value === null) return 1;

  const page = Number(value);

  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : null;
}

function getErrorStatus(error: unknown) {
  if (error instanceof TmdbApiError && error.status === 500) return 500;

  return 502;
}
