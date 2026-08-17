import { CalendarDays, Film, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type MovieCardProps = {
  id: string;
  title: string;
  posterUrl: string | null;
  genres: string[];
  venue: string;
  room: string;
  startsAt: Date | string;
  priceCents: number;
  className?: string;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function MovieCard({
  id,
  title,
  posterUrl,
  genres,
  venue,
  room,
  startsAt,
  priceCents,
  className,
}: MovieCardProps) {
  const eventDate =
    typeof startsAt === "string" ? new Date(startsAt) : startsAt;

  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden border-2 border-zinc-950 py-0 shadow-[5px_5px_0_#d4d4d8] transition duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_#18181b]",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`Pôster do filme ${title}`}
            fill
            sizes="300px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Film aria-hidden="true" className="size-12" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Pôster indisponível
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pt-4">
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
        <CardDescription className="flex items-start gap-2">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {venue} · {room}
          </span>
        </CardDescription>
        {genres.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-zinc-300 px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase"
              >
                {genre}
              </span>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-4" />
          <time dateTime={eventDate.toISOString()}>
            {dateFormatter.format(eventDate)}
          </time>
        </div>
      </CardContent>

      <CardFooter className="mt-auto justify-between gap-3">
        <div>
          <span className="block text-xs text-muted-foreground">A partir de</span>
          <strong className="text-base">
            {priceFormatter.format(priceCents / 100)}
          </strong>
        </div>

        <Link
          href={`/events/${id}`}
          className={buttonVariants({ size: "lg" })}
        >
          Ver sessão
        </Link>
      </CardFooter>
    </Card>
  );
}
