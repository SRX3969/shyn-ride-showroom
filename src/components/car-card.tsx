import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Calendar, ArrowRight, Tag } from "lucide-react";
import { formatINR, formatKm } from "@/lib/format";
import { calculateEMI } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export type CarCardData = {
  _id: string;
  slug: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  price_inr: number;
  original_price?: number | null;
  price_negotiable: boolean;
  km: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  reg_state?: string | null;
  status: string;
  featured: boolean;
  cover_url: string | null;
};

export function CarCard({ car, className = "" }: { car: CarCardData; className?: string }) {
  const title = `${car.year} ${car.make} ${car.model}`;
  const settings = useQuery(api.settings.get);
  const isLimitedOffer = car.original_price && car.original_price > car.price_inr;
  const emi = settings ? calculateEMI(car.price_inr, settings.emiDownPaymentPct, settings.emiAnnualRatePct, settings.emiTenureMonths) : 0;

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

        {/* Limited Offer Badge */}
        {isLimitedOffer && car.status === "available" && (
          <div className="absolute left-3 bottom-3 z-10 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg flex items-center gap-1">
            <Tag className="w-3 h-3" /> Limited Offer
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <div className="text-[13px] font-semibold text-text-secondary">
            {car.make}
          </div>
          <div className="mt-1 font-bold text-xl leading-tight text-text-primary">
            {car.model}{" "}
            {car.variant && (
              <span className="text-[15px] font-medium text-text-secondary">
                {car.variant}
              </span>
            )}
          </div>
        </div>

        {/* Specs row (Cars24 style - simple grey text) */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-text-secondary bg-surface rounded-md px-3 py-2 border border-border/50">
          <span>{formatKm(car.km)}</span>
          <span className="text-border px-1">•</span>
          <span className="capitalize">{car.fuel_type}</span>
          <span className="text-border px-1">•</span>
          <span className="capitalize">{car.transmission}</span>
          <span className="text-border px-1">•</span>
          <span>{car.year}</span>
          {car.reg_state && (
            <>
              <span className="text-border px-1">•</span>
              <span className="uppercase text-text-primary bg-background border border-border/50 px-1.5 py-0.5 rounded text-[11px] font-bold">{car.reg_state}</span>
            </>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col">
          <div className="text-[13px] font-medium text-text-tertiary mb-1 flex items-center justify-between">
            <span>Price</span>
            {isLimitedOffer && car.original_price && (
              <span className="line-through text-text-secondary text-xs">{formatINR(car.original_price)}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <div className="font-bold text-[22px] tracking-tight text-text-primary">
                {formatINR(car.price_inr)}
              </div>
            </div>
            {car.price_negotiable && (
              <div className="text-[12px] font-medium text-text-secondary bg-surface px-2 py-1 rounded-sm border border-border">
                Negotiable
              </div>
            )}
          </div>
          {emi > 0 && (
            <div className="mt-2 text-xs font-medium text-text-secondary">
              EMI from <span className="text-gold-ui">{formatINR(emi)}/m*</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
