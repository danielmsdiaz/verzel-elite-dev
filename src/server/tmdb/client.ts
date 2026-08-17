import "server-only";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";
const CACHE_TTL_SECONDS = 60 * 60;

type TmdbMovieResult = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genre_ids: number[];
};

type TmdbMoviePageResponse = {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
};

type TmdbMovieBaseResult = Omit<TmdbMovieResult, "genre_ids">;

type TmdbMovieDetailsResponse = TmdbMovieBaseResult & {
  genres: Array<{
    id: number;
    name: string;
  }>;
  runtime: number | null;
  status: string;
  tagline: string;
};

export type TmdbMovie = {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  rating: number;
  voteCount: number;
  popularity: number;
  originalLanguage: string;
  genreIds: number[];
};

export type TmdbMoviePage = {
  page: number;
  results: TmdbMovie[];
  totalPages: number;
  totalResults: number;
};

export type TmdbMovieDetails = Omit<TmdbMovie, "genreIds"> & {
  genres: Array<{
    id: number;
    name: string;
  }>;
  runtime: number | null;
  status: string;
  tagline: string;
};

export class TmdbApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TmdbApiError";
  }
}

export async function getMovies(page = 1) {
  const response = await tmdbFetch<TmdbMoviePageResponse>("/discover/movie", {
    include_adult: "false",
    include_video: "false",
    language: "pt-BR",
    page: String(page),
    region: "BR",
    sort_by: "popularity.desc",
  });

  return mapMoviePage(response);
}

export async function searchMovies(query: string, page = 1) {
  const response = await tmdbFetch<TmdbMoviePageResponse>("/search/movie", {
    include_adult: "false",
    language: "pt-BR",
    page: String(page),
    query,
  });

  return mapMoviePage(response);
}

export async function getMovieById(movieId: number) {
  const movie = await tmdbFetch<TmdbMovieDetailsResponse>(`/movie/${movieId}`, {
    language: "pt-BR",
  });

  return {
    ...mapMovieBase(movie),
    genres: movie.genres,
    runtime: movie.runtime,
    status: movie.status,
    tagline: movie.tagline,
  } satisfies TmdbMovieDetails;
}

async function tmdbFetch<T>(
  pathname: string,
  params: Record<string, string>,
): Promise<T> {
  const accessToken = process.env.TMDB_API_READ_ACCESS_TOKEN;

  if (!accessToken) {
    throw new TmdbApiError(
      "TMDB_API_READ_ACCESS_TOKEN is not configured.",
      500,
    );
  }

  const url = new URL(`${TMDB_API_URL}${pathname}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    next: {
      revalidate: CACHE_TTL_SECONDS,
    },
  });

  if (!response.ok) {
    throw new TmdbApiError(
      `TMDB request failed with status ${response.status}.`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

function mapMoviePage(response: TmdbMoviePageResponse): TmdbMoviePage {
  return {
    page: response.page,
    results: response.results.map(mapMovie),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

function mapMovie(movie: TmdbMovieResult): TmdbMovie {
  return {
    ...mapMovieBase(movie),
    genreIds: movie.genre_ids,
  };
}

function mapMovieBase(movie: TmdbMovieBaseResult): Omit<TmdbMovie, "genreIds"> {
  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    overview: movie.overview,
    posterUrl: getImageUrl(movie.poster_path, "w500"),
    backdropUrl: getImageUrl(movie.backdrop_path, "w1280"),
    releaseDate: movie.release_date,
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    originalLanguage: movie.original_language,
  };
}

function getImageUrl(path: string | null, size: "w500" | "w1280") {
  return path ? `${TMDB_IMAGE_URL}/${size}${path}` : null;
}
