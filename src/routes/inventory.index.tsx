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
import { Search, SlidersHorizontal } from "lucide-react";

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
const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"];
const TRANSMISSIONS = ["Automatic", "Manual"];

function InventoryPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

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

  const hasFilters = search.bodyType || search.fuelType || search.transmission;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-7xl px-6 py-16">
          <div
            ref={headerRef}
            className={`sr-hidden ${headerVisible ? "sr-visible" : ""}`}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
              Inventory
            </div>
            <h1 className="mt-4 font-display text-5xl md:text-6xl">
              The <span className="text-gradient-gold">floor.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground/70">
              {cars === undefined
                ? "Loading inventory…"
                : `${cars.length} car${cars.length === 1 ? "" : "s"} available. Every listing is inspected, certified and honestly priced.`}
            </p>
          </div>

          {/* Filters */}
          <div className="mt-12 rounded-2xl border border-border/30 bg-card/20 p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 text-muted-foreground/50 mr-1">
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
              <div className="mx-1 h-5 w-px bg-border/30" />
              <select
                value={search.fuelType ?? ""}
                onChange={(e) =>
                  update({ fuelType: e.target.value || undefined })
                }
                className="rounded-lg border border-border/30 bg-card/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none hover:border-foreground/20"
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
                className="rounded-lg border border-border/30 bg-card/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none hover:border-foreground/20"
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
                  className="rounded-lg border border-border/30 bg-card/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none hover:border-foreground/20"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price · low to high</option>
                  <option value="price_desc">Price · high to low</option>
                  <option value="year_desc">Year · newest</option>
                </select>
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
      className={`rounded-lg border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
        active
          ? "border-champagne bg-champagne text-primary-foreground shadow-md shadow-champagne/20"
          : "border-border/30 text-muted-foreground/60 hover:border-foreground/20 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
