import { Link } from "@tanstack/react-router";
import type { CarSummary } from "@/lib/cars.functions";
import { formatINR, formatKm } from "@/lib/format";

export function CarCard({ car }: { car: CarSummary }) {
  const title = `${car.year} ${car.make} ${car.model}`;
  return (
    <Link
      to="/inventory/$slug"
      params={{ slug: car.slug }}
      className="group block"
    >
      <div className="chrome-sweep aspect-[4/3] w-full overflow-hidden bg-card">
        {car.cover_url ? (
          <img
            src={car.cover_url}
            alt={`${title} — sample photo`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            No photo
          </div>
        )}
        <div className="chrome-sweep-inner" />
        {car.status !== "available" && (
          <div className="absolute right-3 top-3 z-10 rounded-sm bg-background/85 px-2.5 py-1 text-[10px] uppercase tracking-widest text-champagne backdrop-blur">
            {car.status}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {car.make}
          </div>
          <div className="mt-1 font-display text-lg leading-tight">
            {car.model} {car.variant && <span className="text-muted-foreground">· {car.variant}</span>}
          </div>
          <div className="mt-2 text-xs text-muted-foreground tabular">
            {car.year} · {formatKm(car.km)} · {car.fuel_type} · {car.transmission}
          </div>
        </div>
        <div className="text-right">
          <div className="tabular font-display text-lg text-champagne">
            {formatINR(car.price_inr)}
          </div>
          {car.price_negotiable && (
            <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              Negotiable
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
