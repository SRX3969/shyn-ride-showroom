import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { z } from "zod";
import { Header, Footer } from "@/components/site-chrome";
import { CarCard } from "@/components/car-card";
import { listCars } from "@/lib/cars.functions";

const searchSchema = z.object({
  bodyType: z.string().optional(),
  make: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "year_desc"]).optional(),
});

const inventoryQuery = (search: z.infer<typeof searchSchema>) =>
  queryOptions({
    queryKey: ["inventory", search],
    queryFn: () => listCars({ data: search }),
  });

export const Route = createFileRoute("/inventory/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(inventoryQuery(deps)),
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
});

const BODY_TYPES = ["Sedan", "SUV", "Coupe", "Convertible"];
const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"];
const TRANSMISSIONS = ["Automatic", "Manual"];

function InventoryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Suspense fallback={<div className="h-screen" />}>
        <InventoryContent />
      </Suspense>
      <Footer />
    </div>
  );
}

function InventoryContent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: cars } = useSuspenseQuery(inventoryQuery(search));

  const update = (patch: Partial<z.infer<typeof searchSchema>>) => {
    navigate({ search: (s: any) => ({ ...s, ...patch }) as any });
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] text-champagne">Inventory</div>
      <h1 className="mt-4 font-display text-5xl">The floor.</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        {cars.length} car{cars.length === 1 ? "" : "s"} available. Every listing is inspected,
        certified and honestly priced.
      </p>

      {/* Filters */}
      <div className="mt-12 flex flex-wrap items-center gap-3 border-y border-border py-6">
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
        <div className="mx-2 h-4 w-px bg-border" />
        <select
          value={search.fuelType ?? ""}
          onChange={(e) => update({ fuelType: e.target.value || undefined })}
          className="rounded-sm border border-border bg-card px-3 py-2 text-xs uppercase tracking-widest text-foreground"
        >
          <option value="">Any fuel</option>
          {FUELS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <select
          value={search.transmission ?? ""}
          onChange={(e) => update({ transmission: e.target.value || undefined })}
          className="rounded-sm border border-border bg-card px-3 py-2 text-xs uppercase tracking-widest text-foreground"
        >
          <option value="">Any transmission</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Sort</span>
          <select
            value={search.sort ?? "newest"}
            onChange={(e) => update({ sort: e.target.value as any })}
            className="rounded-sm border border-border bg-card px-3 py-2 text-xs uppercase tracking-widest text-foreground"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price · low to high</option>
            <option value="price_desc">Price · high to low</option>
            <option value="year_desc">Year · newest</option>
          </select>
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="mt-24 text-center">
          <div className="font-display text-2xl">No cars match those filters.</div>
          <p className="mt-3 text-sm text-muted-foreground">
            Try widening the search, or{" "}
            <Link to="/contact" className="text-champagne hover:underline">
              tell us what you are looking for
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </main>
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
      className={`rounded-sm border px-3 py-2 text-xs uppercase tracking-widest transition-colors ${
        active
          ? "border-champagne bg-champagne text-primary-foreground"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
