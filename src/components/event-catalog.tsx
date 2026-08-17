"use client";

import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { MovieCard, type MovieCardProps } from "@/components/movie-card";

type CatalogEvent = Omit<MovieCardProps, "startsAt" | "className"> & {
  startsAt: string;
};

type EventPage = {
  events: CatalogEvent[];
  nextCursor: string | null;
  totalCount: number | null;
};

type ActiveFilters = {
  query: string;
  venues: string[];
  genres: string[];
};

type EventCatalogProps = {
  initialEvents: CatalogEvent[];
  initialNextCursor: string | null;
  initialTotalCount: number;
  venues: string[];
  genres: string[];
};

export function EventCatalog({
  initialEvents,
  initialNextCursor,
  initialTotalCount,
  venues,
  genres,
}: EventCatalogProps) {
  const [query, setQuery] = useState("");
  const [selectedVenues, setSelectedVenues] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(
    () => new Set(),
  );
  const [events, setEvents] = useState(initialEvents);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const loadingRef = useRef(false);
  const requestVersionRef = useRef(0);
  const debouncedQuery = useDebouncedValue(query, 300);
  const activeFilters = useMemo<ActiveFilters>(
    () => ({
      query: debouncedQuery.trim(),
      venues: [...selectedVenues].sort(),
      genres: [...selectedGenres].sort(),
    }),
    [debouncedQuery, selectedGenres, selectedVenues],
  );
  const requestSignature = JSON.stringify([activeFilters, retryVersion]);
  const lastRequestSignatureRef = useRef(JSON.stringify([activeFilters, 0]));
  const activeFilterCount =
    selectedVenues.size + selectedGenres.size + (query.trim() ? 1 : 0);

  useEffect(() => {
    if (lastRequestSignatureRef.current === requestSignature) return;

    lastRequestSignatureRef.current = requestSignature;
    const controller = new AbortController();
    const requestVersion = ++requestVersionRef.current;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    setEvents([]);
    setNextCursor(null);
    setTotalCount(0);

    void fetchEventPage(activeFilters, undefined, controller.signal)
      .then((page) => {
        if (requestVersion !== requestVersionRef.current) return;

        setEvents(page.events);
        setNextCursor(page.nextCursor);
        setTotalCount(page.totalCount ?? page.events.length);
      })
      .catch((requestError: unknown) => {
        if (
          controller.signal.aborted ||
          requestVersion !== requestVersionRef.current
        ) {
          return;
        }

        console.error("Event filters request failed:", requestError);
        setError("Não foi possível aplicar os filtros. Tente novamente.");
      })
      .finally(() => {
        if (requestVersion !== requestVersionRef.current) return;

        loadingRef.current = false;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [activeFilters, requestSignature]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingRef.current) return;

    const requestVersion = requestVersionRef.current;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const page = await fetchEventPage(activeFilters, nextCursor);

      if (requestVersion !== requestVersionRef.current) return;

      setEvents((current) => appendUniqueEvents(current, page.events));
      setNextCursor(page.nextCursor);
      if (page.totalCount !== null) setTotalCount(page.totalCount);
    } catch (requestError) {
      if (requestVersion !== requestVersionRef.current) return;

      console.error("Next events page request failed:", requestError);
      setError("Não foi possível carregar mais sessões.");
    } finally {
      if (requestVersion !== requestVersionRef.current) return;

      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [activeFilters, nextCursor]);

  function clearFilters() {
    setQuery("");
    setSelectedVenues(new Set());
    setSelectedGenres(new Set());
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-6 hidden lg:block">
        <FilterPanel
          idPrefix="desktop"
          query={query}
          venues={venues}
          genres={genres}
          selectedVenues={selectedVenues}
          selectedGenres={selectedGenres}
          onQueryChange={setQuery}
          onVenueChange={(venue) => toggleSelection(venue, setSelectedVenues)}
          onGenreChange={(genre) => toggleSelection(genre, setSelectedGenres)}
          onClear={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </aside>

      <div className="min-w-0">
        <details className="group mb-6 rounded-2xl border-2 border-zinc-950 bg-white shadow-[4px_4px_0_#18181b] lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-bold">
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Filtrar sessões
            </span>
            {activeFilterCount > 0 ? (
              <span className="grid size-6 place-items-center rounded-full bg-zinc-950 text-xs text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </summary>
          <div className="border-t-2 border-zinc-950 p-4">
            <FilterControls
              idPrefix="mobile"
              query={query}
              venues={venues}
              genres={genres}
              selectedVenues={selectedVenues}
              selectedGenres={selectedGenres}
              onQueryChange={setQuery}
              onVenueChange={(venue) =>
                toggleSelection(venue, setSelectedVenues)
              }
              onGenreChange={(genre) =>
                toggleSelection(genre, setSelectedGenres)
              }
              onClear={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </details>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-zinc-500 uppercase">
              Em cartaz
            </p>
            <p className="mt-1 font-serif text-2xl font-bold" aria-live="polite">
              {isLoading && events.length === 0
                ? "Buscando sessões..."
                : totalCount === 1
                  ? "1 sessão encontrada"
                  : `${totalCount} sessões encontradas`}
            </p>
          </div>
          <p className="max-w-xs text-xs leading-5 text-zinc-500">
            Arraste para a direita; novas sessões são carregadas perto do fim.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-zinc-950 bg-zinc-100 px-4 py-3 text-sm font-semibold"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRetryVersion((version) => version + 1)}
              className="underline underline-offset-4"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {events.length > 0 ? (
          <PaginatedEventRow
            events={events}
            hasMore={nextCursor !== null}
            isLoading={isLoading}
            totalCount={totalCount}
            onLoadMore={loadMore}
          />
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </div>
    </div>
  );
}

function PaginatedEventRow({
  events,
  hasMore,
  isLoading,
  totalCount,
  onLoadMore,
}: {
  events: CatalogEvent[];
  hasMore: boolean;
  isLoading: boolean;
  totalCount: number;
  onLoadMore: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const sentinel = sentinelRef.current;

    if (!viewport || !sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      {
        root: viewport,
        rootMargin: "0px 480px 0px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  function scrollByCard(direction: -1 | 1) {
    viewportRef.current?.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      {events.length > 1 ? (
        <div className="absolute -top-14 right-0 hidden items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Ver sessões anteriores"
            onClick={() => scrollByCard(-1)}
            className="grid size-10 place-items-center rounded-full border-2 border-zinc-950 bg-white transition-transform hover:-translate-y-0.5"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Ver próximas sessões"
            onClick={() => scrollByCard(1)}
            className="grid size-10 place-items-center rounded-full border-2 border-zinc-950 bg-zinc-950 text-white transition-transform hover:-translate-y-0.5"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}

      <div
        ref={viewportRef}
        className="event-carousel snap-x snap-proximity overflow-x-auto overscroll-x-contain pt-2 pb-7"
        aria-label="Sessões disponíveis"
      >
        <div className="flex w-max items-stretch gap-5">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-carousel-card w-[270px] shrink-0 snap-start sm:w-[300px]"
            >
              <MovieCard {...event} className="h-full" />
            </div>
          ))}

          {hasMore ? (
            <button
              ref={sentinelRef}
              type="button"
              disabled={isLoading}
              onClick={onLoadMore}
              className="grid min-h-72 w-44 shrink-0 snap-start place-items-center rounded-[1.5rem] border-2 border-dashed border-zinc-400 bg-zinc-50 p-5 text-center text-sm font-bold disabled:cursor-wait"
            >
              <span>
                {isLoading ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="mx-auto mb-3 size-6 animate-spin"
                  />
                ) : (
                  <ChevronRight
                    aria-hidden="true"
                    className="mx-auto mb-3 size-6"
                  />
                )}
                {isLoading ? "Carregando..." : "Carregar mais"}
              </span>
            </button>
          ) : (
            <div className="grid min-h-72 w-44 shrink-0 snap-start place-items-center rounded-[1.5rem] border-2 border-dashed border-zinc-300 bg-zinc-50 p-5 text-center">
              <div>
                <span className="mx-auto mb-3 block h-px w-10 bg-zinc-400" />
                <p className="font-serif text-lg font-bold">Fim da lista</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Você viu todas as sessões.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-right text-xs font-medium text-zinc-500" aria-live="polite">
        {events.length} de {totalCount} carregadas
      </p>
    </div>
  );
}

type FilterControlsProps = {
  idPrefix: string;
  query: string;
  venues: string[];
  genres: string[];
  selectedVenues: Set<string>;
  selectedGenres: Set<string>;
  onQueryChange: (query: string) => void;
  onVenueChange: (venue: string) => void;
  onGenreChange: (genre: string) => void;
  onClear: () => void;
  activeFilterCount: number;
};

function FilterPanel(props: FilterControlsProps) {
  return (
    <div className="rounded-[1.5rem] border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#18181b]">
      <div className="mb-5 flex items-center justify-between gap-3 border-b-2 border-zinc-950 pb-4">
        <span className="inline-flex items-center gap-2 font-serif text-xl font-bold">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filtros
        </span>
        {props.activeFilterCount > 0 ? (
          <span className="grid size-6 place-items-center rounded-full bg-zinc-950 text-xs font-bold text-white">
            {props.activeFilterCount}
          </span>
        ) : null}
      </div>
      <FilterControls {...props} />
    </div>
  );
}

function FilterControls({
  idPrefix,
  query,
  venues,
  genres,
  selectedVenues,
  selectedGenres,
  onQueryChange,
  onVenueChange,
  onGenreChange,
  onClear,
  activeFilterCount,
}: FilterControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-movie-search`} className="text-sm font-bold">
          Nome do filme
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            id={`${idPrefix}-movie-search`}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar filme..."
            className="h-11 w-full rounded-xl border-2 border-zinc-950 bg-white pr-3 pl-10 text-sm outline-none transition-shadow placeholder:text-zinc-400 focus:shadow-[3px_3px_0_#18181b]"
          />
        </div>
      </div>

      <CheckboxGroup
        title="Cinemas"
        idPrefix={`${idPrefix}-venue`}
        options={venues}
        selected={selectedVenues}
        onChange={onVenueChange}
      />
      <CheckboxGroup
        title="Gêneros"
        idPrefix={`${idPrefix}-genre`}
        options={genres}
        selected={selectedGenres}
        onChange={onGenreChange}
      />

      {activeFilterCount > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 text-xs font-bold underline underline-offset-4"
        >
          <X aria-hidden="true" className="size-3.5" />
          Limpar todos
        </button>
      ) : null}
    </div>
  );
}

function CheckboxGroup({
  title,
  idPrefix,
  options,
  selected,
  onChange,
}: {
  title: string;
  idPrefix: string;
  options: string[];
  selected: Set<string>;
  onChange: (option: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold">{title}</legend>
      {options.length > 0 ? (
        <div className="space-y-2.5">
          {options.map((option, index) => {
            const id = `${idPrefix}-${index}`;

            return (
              <label
                key={id}
                htmlFor={id}
                className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-zinc-600 transition-colors hover:text-zinc-950"
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={selected.has(option)}
                  onChange={() => onChange(option)}
                  className="mt-0.5 size-4 shrink-0 accent-zinc-950"
                />
                {option}
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-zinc-400">Nenhuma opção disponível.</p>
      )}
    </fieldset>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-80 place-items-center rounded-[2rem] border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
      <div>
        <LoaderCircle
          aria-hidden="true"
          className="mx-auto size-8 animate-spin text-zinc-500"
        />
        <p className="mt-4 text-sm font-bold">Buscando sessões...</p>
      </div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="grid min-h-80 place-items-center rounded-[2rem] border-2 border-dashed border-zinc-400 bg-zinc-50 p-8 text-center">
      <div>
        <Search aria-hidden="true" className="mx-auto size-9 text-zinc-400" />
        <p className="mt-4 font-serif text-2xl font-bold">
          Nenhuma sessão por aqui.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Tente remover algum filtro para ampliar a busca.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-full border-2 border-zinc-950 bg-white px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#18181b]"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

async function fetchEventPage(
  filters: ActiveFilters,
  cursor?: string,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams();

  if (cursor) searchParams.set("cursor", cursor);
  if (filters.query) searchParams.set("query", filters.query);
  filters.venues.forEach((venue) => searchParams.append("venue", venue));
  filters.genres.forEach((genre) => searchParams.append("genre", genre));

  const response = await fetch(`/api/events?${searchParams.toString()}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) throw new Error(`Events request returned ${response.status}.`);

  return response.json() as Promise<EventPage>;
}

function appendUniqueEvents(current: CatalogEvent[], next: CatalogEvent[]) {
  const currentIds = new Set(current.map((event) => event.id));
  return [...current, ...next.filter((event) => !currentIds.has(event.id))];
}

function toggleSelection(
  value: string,
  setSelection: React.Dispatch<React.SetStateAction<Set<string>>>,
) {
  setSelection((current) => {
    const next = new Set(current);

    if (next.has(value)) next.delete(value);
    else next.add(value);

    return next;
  });
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}
