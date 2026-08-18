"use client";

import { LoaderCircle, Search } from "lucide-react";
import Image from "next/image";
import { FormEvent, useActionState, useState } from "react";

import {
  EVENT_CAPACITIES,
  EVENT_ROOMS,
  EVENT_VENUES,
} from "@/lib/event-options";
import {
  createOrganizerEventAction,
  type CreateOrganizerEventState,
} from "@/server/organizer/actions";

type MovieResult = {
  id: number;
  title: string;
  posterUrl: string | null;
  releaseDate: string;
};

const initialState: CreateOrganizerEventState = {};

export function OrganizerEventForm() {
  const [state, formAction, isPending] = useActionState(
    createOrganizerEventAction,
    initialState,
  );
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function searchMovies(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setSearchError("Digite pelo menos 2 caracteres.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/tmdb/movies?query=${encodeURIComponent(normalizedQuery)}`,
      );
      const payload = (await response.json()) as {
        results?: MovieResult[];
        error?: string;
      };

      if (!response.ok) throw new Error(payload.error);

      setMovies(payload.results?.slice(0, 5) ?? []);
      if (!payload.results?.length) setSearchError("Nenhum filme encontrado.");
    } catch {
      setMovies([]);
      setSearchError("Não foi possível consultar o catálogo agora.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#a1a1aa] sm:p-6">
      <div>
        <p className="text-[10px] font-black tracking-[0.18em] text-zinc-500 uppercase">
          Novo evento
        </p>
        <h2 className="mt-1 font-serif text-3xl font-bold">Montar sessão</h2>
      </div>

      <form onSubmit={searchMovies} className="mt-6 flex gap-2">
        <label className="sr-only" htmlFor="movie-search">
          Buscar filme
        </label>
        <input
          id="movie-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busque um filme"
          className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-950"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white disabled:opacity-50"
          aria-label="Buscar no catálogo"
        >
          {isSearching ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Search aria-hidden="true" className="size-4" />
          )}
        </button>
      </form>

      {searchError ? (
        <p className="mt-2 text-xs text-red-700">{searchError}</p>
      ) : null}

      {movies.length > 0 && !selectedMovie ? (
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 p-2">
          {movies.map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => {
                setSelectedMovie(movie);
                setMovies([]);
              }}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-zinc-100"
            >
              <MovieThumb movie={movie} />
              <span className="min-w-0">
                <strong className="block truncate text-sm">{movie.title}</strong>
                <span className="text-xs text-zinc-500">
                  {movie.releaseDate?.slice(0, 4) || "Ano não informado"}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedMovie ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-zinc-950 bg-zinc-50 p-3">
          <MovieThumb movie={selectedMovie} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{selectedMovie.title}</p>
            <p className="text-xs text-zinc-500">Filme selecionado</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMovie(null)}
            className="text-xs font-bold underline underline-offset-4"
          >
            Trocar
          </button>
        </div>
      ) : null}

      <form action={formAction} className="mt-6 space-y-4">
        <input
          type="hidden"
          name="tmdbMovieId"
          value={selectedMovie?.id ?? ""}
        />
        <FieldError message={state.fieldErrors?.movie} />

        <Field label="Data e horário" error={state.fieldErrors?.startsAt}>
          <input
            type="datetime-local"
            name="startsAt"
            required
            className={inputClassName}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Local" error={state.fieldErrors?.venue}>
            <select
              name="venue"
              required
              defaultValue=""
              className={inputClassName}
            >
              <option value="" disabled>
                Selecione o local
              </option>
              {EVENT_VENUES.map((venue) => (
                <option key={venue} value={venue}>
                  {venue}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sala" error={state.fieldErrors?.room}>
            <select
              name="room"
              required
              defaultValue=""
              className={inputClassName}
            >
              <option value="" disabled>
                Selecione a sala
              </option>
              {EVENT_ROOMS.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Capacidade" error={state.fieldErrors?.capacity}>
            <select
              name="capacity"
              required
              defaultValue=""
              className={inputClassName}
            >
              <option value="" disabled>
                Selecione
              </option>
              {EVENT_CAPACITIES.map((capacity) => (
                <option key={capacity} value={capacity}>
                  {capacity} lugares
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preço por ingresso" error={state.fieldErrors?.price}>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-500">
                R$
              </span>
              <input
                type="number"
                name="price"
                required
                min={1}
                max={10000}
                step="0.01"
                placeholder="25,00"
                className={`${inputClassName} pl-10`}
              />
            </div>
          </Field>
        </div>

        {state.message ? (
          <p
            role="status"
            className={`rounded-xl px-3 py-2.5 text-sm ${
              state.status === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <div className="grid gap-2 pt-1 sm:grid-cols-2">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={isPending || !selectedMovie}
            className="min-h-11 rounded-full border-2 border-zinc-950 px-4 text-sm font-bold transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvar rascunho
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={isPending || !selectedMovie}
            className="min-h-11 rounded-full border-2 border-zinc-950 bg-zinc-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {isPending ? "Salvando..." : "Publicar evento"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MovieThumb({ movie }: { movie: MovieResult }) {
  return movie.posterUrl ? (
    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-200">
      <Image
        src={movie.posterUrl}
        alt=""
        fill
        sizes="40px"
        className="object-cover"
      />
    </span>
  ) : (
    <span className="grid h-14 w-10 shrink-0 place-items-center rounded-md bg-zinc-200 text-[9px] font-bold text-zinc-500">
      FILME
    </span>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold">{label}</span>
      {children}
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-xs text-red-700">{message}</span> : null;
}

const inputClassName =
  "min-h-11 w-full rounded-xl border-2 border-zinc-300 bg-white px-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950";
