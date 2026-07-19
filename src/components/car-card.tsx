import { Link } from "@tanstack/react-router";
import { formatINR, formatKm } from "@/lib/format";
import { Fuel, Gauge, Calendar } from "lucide-react";

export type CarCardData = {
  _id: string;
  slug: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  price_inr: number;
  price_negotiable: boolean;
  km: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  status: string;
  featured: boolean;
  cover_url: string | null;
};

export function CarCard({ car, className = "" }: { car: CarCardData; className?: string }) {
  const title = `${car.year} ${car.make} ${car.model}`;
  return (
    <Link
      to="/inventory/$slug"
      params={{ slug: car.slug }}
      className={`group block hover-lift rounded-lg overflow-hidden ${className}`}
    >
      <div className="chrome-sweep aspect-[4/3] w-full overflow-hidden rounded-lg bg-card">
        {car.cover_url ? (
          <img
            src={car.cover_url}
            alt={`${title} — sample photo`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card to-secondary text-muted-foreground text-sm">
            <span className="font-display text-lg opacity-40">SHYN RIDE</span>
          </div>
        )}
        <div className="chrome-sweep-inner" />

        {/* Status badge */}
        {car.status !== "available" && (
          <div className="absolute right-3 top-3 z-10 glass rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-champagne">
            {car.status}
          </div>
        )}

        {/* Featured badge */}
        {car.featured && car.status === "available" && (
          <div className="absolute left-3 top-3 z-10 rounded-md bg-champagne/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
            Featured
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-champagne">
            {car.make}
          </div>
          <div className="mt-1 font-display text-xl leading-tight text-foreground">
            {car.model}{" "}
            {car.variant && (
              <span className="text-sm text-muted-foreground">· {car.variant}</span>
            )}
          </div>
        </div>

        {/* Specs row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-champagne/60" />
            {car.year}
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1">
            <Gauge className="h-3 w-3 text-champagne/60" />
            {formatKm(car.km)}
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1">
            <Fuel className="h-3 w-3 text-champagne/60" />
            {car.fuel_type}
          </span>
          <span className="h-3 w-px bg-border" />
          <span>{car.transmission}</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between border-t border-border/40 pt-3">
          <div className="tabular font-display text-xl text-gradient-gold">
            {formatINR(car.price_inr)}
          </div>
          {car.price_negotiable && (
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Negotiable
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
