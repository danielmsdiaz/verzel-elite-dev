import { MovieCard } from "@/components/movie-card";
import { buttonVariants } from "@/components/ui/button";
import { CrowdCanvas } from "@/components/ui/skiper-ui/skiper39";
import { getPublishedEvents } from "@/server/events/queries";

export default async function Home() {
  const events = await getPublishedEvents();

  return (
    <main className="flex-1">
      <section className="relative isolate min-h-svh overflow-hidden border-b bg-white text-black">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-75"
        >
          <CrowdCanvas
            src="https://skiper-ui.com/images/peeps/all-peeps.png"
            rows={15}
            cols={7}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-7xl flex-col items-center px-4 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8">
          <span className="mb-5 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] backdrop-blur">
            Sessões especiais
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Cinema é melhor quando a sala está cheia.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-base text-black/60 sm:text-lg">
            Descubra as próximas sessões, escolha seu lugar e viva o filme com
            quem também ama cinema.
          </p>
          <a
            href="#eventos"
            className={buttonVariants({ className: "mt-7", size: "lg" })}
          >
            Explorar sessões
          </a>
        </div>

        <a
          href="https://skiper-ui.com/v1/skiper39"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-4 z-20 text-[10px] text-black/40 transition-colors hover:text-black/70"
        >
          Animação por Skiper UI
        </a>
      </section>

      <section
        id="eventos"
        className="mx-auto w-full max-w-7xl scroll-mt-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            Eventos disponíveis
          </h2>
          <p className="text-muted-foreground">
            Escolha uma sessão e garanta o seu lugar.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <MovieCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Nenhum evento disponível no momento.
          </div>
        )}
      </section>
    </main>
  );
}
