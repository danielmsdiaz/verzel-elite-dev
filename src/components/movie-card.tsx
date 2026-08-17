import { CalendarDays, Film, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MovieCardProps = {
  id: string;
  title: string;
  posterUrl: string | null;
  venue: string;
  room: string;
  startsAt: Date;
  priceCents: number;
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
  venue,
  room,
  startsAt,
  priceCents,
}: MovieCardProps) {
  return (
    <Card className="group gap-0 py-0 transition duration-200 hover:shadow-lg">
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`Pôster do filme ${title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-4" />
          <time dateTime={startsAt.toISOString()}>
            {dateFormatter.format(startsAt)}
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
