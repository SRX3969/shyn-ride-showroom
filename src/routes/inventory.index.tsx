import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { z } from "zod";
import { Header, Footer } from "@/components/site-chrome";
import { CarCard } from "@/components/car-card";
import { FloatingActions } from "@/components/floating-actions";
import { SkeletonCard } from "@/components/skeleton";
import { PageTransition } from "@/components/page-transition";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, RotateCw, MapPin, X, Filter, Check } from "lucide-react";

const searchSchema = z.object({
  bodyType: z.string().optional(),
  make: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "year_desc"])
    .optional(),
});

export const Route = createFileRoute("/inventory/")(
  {
    validateSearch: searchSchema,
    component: InventoryPage,
    head: () => ({
      meta: [
        { title: "Inventory — SHYN RIDE" },
        {
          name: "description",
          content:
            "Browse our curated pre-owned luxury inventory in Bangalore. Filter by make, body style, fuel and budget.",
        },
        { property: "og:title", content: "Inventory — SHYN RIDE" },
        { property: "og:url", content: "/inventory" },
      ],
      links: [{ rel: "canonical", href: "/inventory" }],
    }),
  },
);

const BODY_TYPES = ["Sedan", "SUV", "Coupe", "Convertible"];
const MAKES = ["BMW", "Mercedes-Benz", "Porsche", "Land Rover", "Audi"];
const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"];
const TRANSMISSIONS = ["Automatic", "Manual"];

function InventoryPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const cars = useQuery(api.cars.list, {
    bodyType: search.bodyType,
    make: search.make,
    fuelType: search.fuelType,
    transmission: search.transmission,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    sort: search.sort,
  });

  const { ref: headerRef, isVisible: headerVisible } =
    useScrollReveal<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggerReveal(
    cars?.length ?? 0,
  );

  const update = (patch: Partial<z.infer<typeof searchSchema>>) => {
    navigate({ search: (s: any) => ({ ...s, ...patch }) as any });
  };

  const hasFilters = search.bodyType || search.make || search.fuelType || search.transmission;

  // Touch Pull-To-Refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      if (diff > 0) {
        setPullY(Math.min(diff * 0.4, 80));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 50) {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
        setPullY(0);
      }, 1000);
    } else {
      setPullY(0);
    }
    setTouchStartY(null);
  };

  return (
    <PageTransition>
      <div 
        className="min-h-screen bg-background text-foreground relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to refresh indicator */}
        {(pullY > 0 || refreshing) && (
          <div 
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full glass bg-card/80 border border-gold-ui/30 px-4 py-2 text-xs font-bold text-champagne shadow-xl transition-all duration-200"
            style={{ transform: `translate(-50%, ${pullY}px)` }}
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? "animate-spin text-gold-ui" : ""}`} />
            {refreshing ? "Refreshing inventory..." : pullY > 50 ? "Release to refresh" : "Pull to refresh"}
          </div>
        )}

        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-16">
          <div
            ref={headerRef}
            className={`sr-hidden ${headerVisible ? "sr-visible" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
                  Inventory
                </div>
                <h1 className="mt-1 md:mt-4 font-display text-3xl md:text-6xl font-bold">
                  The <span className="text-gradient-gold">floor.</span>
                </h1>
              </div>

              {/* Mobile Bottom Sheet Filter Trigger */}
              <button
                onClick={() => setShowMobileFilter(true)}
                className="flex lg:hidden items-center gap-2 rounded-xl bg-gold-ui/10 border border-gold-ui/30 px-3.5 py-2 text-xs font-bold text-gold-ui hover:bg-gold-ui/20 transition-all active:scale-95"
              >
                <Filter className="w-4 h-4" />
                Filter ({[search.bodyType, search.make, search.fuelType, search.transmission].filter(Boolean).length})
              </button>
            </div>

            <p className="mt-2 md:mt-4 max-w-xl text-xs md:text-sm text-muted-foreground/70">
              {cars === undefined
                ? "Loading inventory…"
                : `${cars.length} car${cars.length === 1 ? "" : "s"} available. Every listing is inspected, certified and honestly priced.`}
            </p>
          </div>

          {/* Filters */}
          <div className="mt-4 md:mt-12 rounded-2xl border border-border/30 bg-card/20 p-3 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="flex items-center gap-2 text-muted-foreground/50 shrink-0 mr-1">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <FilterChip
                  label="All"
                  active={!search.bodyType}
                  onClick={() => update({ bodyType: undefined })}
                />
                {BODY_TYPES.map((bt) => (
                  <FilterChip
                    key={bt}
                    label={bt}
                    active={search.bodyType === bt}
                    onClick={() => update({ bodyType: bt })}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t border-border/20 lg:border-0">
                <select
                  value={search.fuelType ?? ""}
                  onChange={(e) =>
                    update({ fuelType: e.target.value || undefined })
                  }
                  className="rounded-lg border border-border/30 bg-card/40 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none hover:border-foreground/20"
                >
                  <option value="">Any fuel</option>
                  {FUELS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <select
                  value={search.transmission ?? ""}
                  onChange={(e) =>
                    update({ transmission: e.target.value || undefined })
                  }
                  className="rounded-lg border border-border/30 bg-card/40 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none hover:border-foreground/20"
                >
                  <option value="">Any transmission</option>
                  {TRANSMISSIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Sort
                  </span>
                  <select
                    value={search.sort ?? "newest"}
                    onChange={(e) => update({ sort: e.target.value as any })}
                    className="rounded-lg border border-border/30 bg-card/40 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none hover:border-foreground/20"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price · low to high</option>
                    <option value="price_desc">Price · high to low</option>
                    <option value="year_desc">Year · newest</option>
                  </select>
                </div>
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={() =>
                  navigate({
                    search: { sort: search.sort } as any,
                  })
                }
                className="mt-3 text-[10px] font-bold uppercase tracking-widest text-champagne/60 transition-colors hover:text-champagne"
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          {cars === undefined ? (
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="mt-28 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border/30 bg-card/30">
                <Search className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="mt-6 font-display text-2xl">
                No cars match those filters.
              </div>
              <p className="mt-3 text-sm text-muted-foreground/70">
                Try widening the search, or{" "}
                <Link
                  to="/contact"
                  className="text-champagne transition-colors hover:text-champagne/80 hover:underline"
                >
                  tell us what you are looking for
                </Link>
                .
              </p>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3"
            >
              {cars.map((car, i) => (
                <div
                  key={car._id}
                  className={`sr-scale-hidden ${visibleItems[i] ? "sr-scale-visible" : ""}`}
                >
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Mobile Bottom Sheet Filter Modal */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in">
            <div className="bg-card border-t border-border rounded-t-3xl p-6 space-y-6 max-h-[85vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2 font-display text-xl">
                  <Filter className="w-5 h-5 text-gold-ui" /> Filter Showroom
                </div>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brand Chips */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Brand / Make
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="All Makes"
                    active={!search.make}
                    onClick={() => update({ make: undefined })}
                  />
                  {MAKES.map((m) => (
                    <FilterChip
                      key={m}
                      label={m}
                      active={search.make === m}
                      onClick={() => update({ make: search.make === m ? undefined : m })}
                    />
                  ))}
                </div>
              </div>

              {/* Body Type Chips */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Body Style
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="All Styles"
                    active={!search.bodyType}
                    onClick={() => update({ bodyType: undefined })}
                  />
                  {BODY_TYPES.map((bt) => (
                    <FilterChip
                      key={bt}
                      label={bt}
                      active={search.bodyType === bt}
                      onClick={() => update({ bodyType: search.bodyType === bt ? undefined : bt })}
                    />
                  ))}
                </div>
              </div>

              {/* Fuel Type Chips */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Fuel Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Any Fuel"
                    active={!search.fuelType}
                    onClick={() => update({ fuelType: undefined })}
                  />
                  {FUELS.map((f) => (
                    <FilterChip
                      key={f}
                      label={f}
                      active={search.fuelType === f}
                      onClick={() => update({ fuelType: search.fuelType === f ? undefined : f })}
                    />
                  ))}
                </div>
              </div>

              {/* Transmission Chips */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Transmission
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Any Transmission"
                    active={!search.transmission}
                    onClick={() => update({ transmission: undefined })}
                  />
                  {TRANSMISSIONS.map((t) => (
                    <FilterChip
                      key={t}
                      label={t}
                      active={search.transmission === t}
                      onClick={() => update({ transmission: search.transmission === t ? undefined : t })}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                {hasFilters && (
                  <button
                    onClick={() => {
                      navigate({ search: { sort: search.sort } as any });
                    }}
                    className="w-1/3 border border-border rounded-xl py-3 text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="flex-1 bg-gold-ui text-white rounded-xl py-3 text-xs font-bold shadow-lg shadow-gold-ui/20"
                >
                  Show Cars ({cars?.length ?? 0})
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
        <FloatingActions />
      </div>
    </PageTransition>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-lg border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
        active
          ? "border-champagne bg-champagne text-primary-foreground shadow-md shadow-champagne/20"
          : "border-border/30 text-muted-foreground/60 hover:border-foreground/20 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
