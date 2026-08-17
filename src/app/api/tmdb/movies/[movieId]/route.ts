import { getMovieById, TmdbApiError } from "@/server/tmdb/client";

type MovieRouteContext = {
  params: Promise<{
    movieId: string;
  }>;
};

export async function GET(_request: Request, context: MovieRouteContext) {
  const { movieId: rawMovieId } = await context.params;
  const movieId = Number(rawMovieId);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return Response.json(
      { error: "O ID do filme deve ser um inteiro positivo." },
      { status: 400 },
    );
  }

  try {
    return Response.json(await getMovieById(movieId));
  } catch (error) {
    console.error(`TMDB movie ${movieId} request failed:`, error);

    if (error instanceof TmdbApiError && error.status === 404) {
      return Response.json({ error: "Filme não encontrado." }, { status: 404 });
    }

    return Response.json(
      { error: "Não foi possível consultar o filme no momento." },
      {
        status:
          error instanceof TmdbApiError && error.status === 500 ? 500 : 502,
      },
    );
  }
}
