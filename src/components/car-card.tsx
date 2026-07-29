import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatINR, formatKm } from "@/lib/format";
import { calculateEMI } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import fallbackCarImg from "@/assets/car-sedan-1.jpg";

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
  const emi = settings ? calculateEMI(car.price_inr, settings.emiDownPaymentPct, settings.emiAnnualRatePct, settings.emiTenureMonths) : 0;
  const [imgSrc, setImgSrc] = useState<string>(car.cover_url || fallbackCarImg);

  const specParts = [
    car.year,
    formatKm(car.km),
    car.fuel_type,
    car.transmission,
    car.reg_state ? car.reg_state.toUpperCase() : null,
  ].filter(Boolean);

  return (
    <Link
      to="/inventory/$slug"
      params={{ slug: car.slug }}
      className={`group block rounded-xl overflow-hidden bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-xl ${className}`}
    >
      {/* 1. Image container (4:3 aspect ratio, rounded-t-xl, no border) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-card">
        <img
          src={imgSrc}
          alt={`${title} — photo`}
          loading="lazy"
          onError={() => setImgSrc(fallbackCarImg)}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="chrome-sweep-inner" />

        {/* On-image status / featured badge top-left */}
        {car.status !== "available" ? (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-champagne">
            {car.status}
          </div>
        ) : car.featured ? (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Featured
          </div>
        ) : null}

        {/* On-image price bold pill bottom-right */}
        <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-xs sm:text-sm font-bold text-white shadow-md">
          {formatINR(car.price_inr)}
          {car.price_negotiable && (
            <span className="ml-1 text-[10px] font-normal text-white/80">· Neg.</span>
          )}
        </div>
      </div>

      {/* 2. Below image: max 3 clean text elements without boxes/borders */}
      <div className="p-4 space-y-1.5">
        {/* Line 1: Model name */}
        <div className="font-bold text-base text-text-primary truncate leading-tight">
          {car.make} {car.model}{" "}
          {car.variant && (
            <span className="font-normal text-text-secondary text-sm">
              {car.variant}
            </span>
          )}
        </div>

        {/* Line 2: Compact spec line using middot separators */}
        <div className="text-xs text-text-secondary font-medium truncate capitalize">
          {specParts.join(" · ")}
        </div>

        {/* Line 3: EMI & View Details link */}
        <div className="pt-1 flex items-center justify-between text-xs">
          {emi > 0 ? (
            <span className="text-text-tertiary">
              EMI from <span className="font-medium text-text-secondary">{formatINR(emi)}/mo</span>
            </span>
          ) : (
            <span className="text-text-tertiary">Certified luxury</span>
          )}
          <span className="font-bold text-gold-ui group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            View details <ArrowRight className="h-3 w-3 inline" />
          </span>
        </div>
      </div>
    </Link>
  );
}
