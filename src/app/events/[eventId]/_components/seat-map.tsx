import { cn } from "@/lib/utils";
import type { EventDetails } from "@/server/events/queries";

type Seat = EventDetails["seats"][number];

type SeatMapProps = {
  seats: Seat[];
  selectedSeatIds: Set<string>;
  onSeatToggle: (seatId: string) => void;
};

export function SeatMap({
  seats,
  selectedSeatIds,
  onSeatToggle,
}: SeatMapProps) {
  const seatsByRow = seats.reduce<Record<string, Seat[]>>((rows, seat) => {
    rows[seat.row] ??= [];
    rows[seat.row].push(seat);
    return rows;
  }, {});

  return (
    <div className="overflow-hidden rounded-[2rem] border-2 border-zinc-950 bg-white p-5 shadow-[7px_7px_0_#18181b] sm:p-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <div className="h-7 rounded-[50%_50%_0_0/100%_100%_0_0] border-t-4 border-zinc-950 bg-gradient-to-b from-zinc-200 to-transparent" />
        <p className="-mt-1 text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase">
          Tela
        </p>
      </div>

      <div className="space-y-4 overflow-x-auto pb-2">
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div
            key={row}
            className="grid min-w-[440px] grid-cols-[28px_1fr_28px] items-center gap-3"
          >
            <RowLabel row={row} />
            <div className="flex justify-center gap-2">
              {rowSeats.map((seat) => (
                <button
                  key={seat.id}
                  type="button"
                  disabled={seat.status === "RESERVED"}
                  aria-pressed={selectedSeatIds.has(seat.id)}
                  title={`${seat.label} — ${seatStatusLabel(seat.status)}`}
                  aria-label={`${seat.label}, ${seatStatusLabel(seat.status)}`}
                  onClick={() => onSeatToggle(seat.id)}
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-t-[1rem] rounded-b-md border-2 text-[10px] font-bold transition",
                    seat.status === "AVAILABLE" &&
                      !selectedSeatIds.has(seat.id) &&
                      "border-zinc-950 bg-white text-zinc-950 hover:-translate-y-1 hover:bg-zinc-100",
                    seat.status === "AVAILABLE" &&
                      selectedSeatIds.has(seat.id) &&
                      "-translate-y-1 border-zinc-950 bg-zinc-950 text-white shadow-[0_4px_0_#a1a1aa]",
                    seat.status === "RESERVED" &&
                      "cursor-not-allowed border-zinc-400 bg-zinc-300 text-zinc-600 line-through",
                  )}
                >
                  {seat.number}
                </button>
              ))}
            </div>
            <RowLabel row={row} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RowLabel({ row }: { row: string }) {
  return (
    <span className="text-center font-serif text-sm font-bold">{row}</span>
  );
}

function seatStatusLabel(status: Seat["status"]) {
  const labels = {
    AVAILABLE: "disponível",
    RESERVED: "reservado",
  } as const;

  return labels[status];
}
