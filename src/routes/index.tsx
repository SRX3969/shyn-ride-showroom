import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { CarCard } from "@/components/car-card";
import { listCars, getBodyTypeCounts, getSiteContent } from "@/lib/cars.functions";
import heroImg from "@/assets/hero-showroom.jpg";

const homeDataQuery = queryOptions({
  queryKey: ["home-data"],
  queryFn: async () => {
    const [featured, counts, content] = await Promise.all([
      listCars({ data: { featured: true, limit: 6, sort: "newest" } }),
      getBodyTypeCounts(),
      getSiteContent(),
    ]);
    return { featured, counts, content };
  },
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeDataQuery),
  component: HomePage,
  head: () => ({
    meta: [
      { title: "SHYN RIDE — Pre-Owned Luxury Cars, Bangalore" },
      {
        name: "description",
        content:
          "Bangalore's curated pre-owned luxury car showroom. Mercedes-Benz, BMW, Audi, Land Rover, Porsche. Certified. Transparent. Unhurried.",
      },
      { property: "og:title", content: "SHYN RIDE — Pre-Owned Luxury Cars, Bangalore" },
      {
        property: "og:description",
        content: "A curated pre-owned luxury car showroom in Bangalore.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Suspense fallback={<div className="h-screen" />}>
        <HomeContent />
      </Suspense>
      <Footer />
    </div>
  );
}

const BUDGET_BANDS = [
  { label: "₹15L – 25L", min: 1500000, max: 2500000 },
  { label: "₹25L – 50L", min: 2500000, max: 5000000 },
  { label: "₹50L – 1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr +", min: 10000000, max: undefined },
];

function HomeContent() {
  const { data } = useSuspenseQuery(homeDataQuery);
  const hero = data.content.hero ?? {};
  const stats = data.content.trust_stats ?? [];
  const testimonials = data.content.testimonials ?? [];

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="A black luxury sedan in a dark showroom"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-champagne">
              Curated in Bangalore
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
              {hero.headline ?? "Own the Extraordinary."}
            </h1>
            <p className="mt-6 max-w-lg text-base text-muted-foreground md:text-lg">
              {hero.subhead ??
                "A curated pre-owned luxury showroom. Certified. Transparent. Unhurried."}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/inventory"
                className="rounded-sm bg-champagne px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-champagne/90"
              >
                {hero.cta ?? "View Inventory"}
              </Link>
              <Link
                to="/sell-your-car"
                className="rounded-sm border border-foreground/30 px-6 py-3 text-xs uppercase tracking-widest text-foreground transition-colors hover:border-foreground"
              >
                Sell Your Car
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
          {stats.map((s: any, i: number) => (
            <div key={i}>
              <div className="tabular font-display text-2xl text-champagne">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by body type */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionEyebrow>Browse</SectionEyebrow>
        <h2 className="mt-3 font-display text-4xl">By body style.</h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {["Sedan", "SUV", "Coupe", "Convertible"].map((bt) => (
            <Link
              key={bt}
              to="/inventory"
              search={{ bodyType: bt } as any}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-card p-6 transition-colors hover:bg-secondary"
            >
              <div className="font-display text-2xl text-foreground">{bt}</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                {data.counts[bt] ?? 0} available
              </div>
              <div className="mt-4 h-px w-8 bg-champagne transition-all duration-500 group-hover:w-20" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured inventory */}
      <section className="border-t border-border/60 bg-card/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <SectionEyebrow>Featured</SectionEyebrow>
              <h2 className="mt-3 font-display text-4xl">On the floor now.</h2>
            </div>
            <Link
              to="/inventory"
              className="hidden text-xs uppercase tracking-widest text-champagne hover:text-champagne/80 md:block"
            >
              View all →
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {data.featured.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* Why SHYN RIDE */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionEyebrow>The showroom</SectionEyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-4xl">
          A quieter way to buy a serious car.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
          {[
            {
              t: "Certified inspection",
              d: "Every car passes a 180-point mechanical, cosmetic and paperwork inspection before it is listed.",
            },
            {
              t: "Transparent pricing",
              d: "Honest, researched prices. If a car is marked negotiable, there is room. If not, the number is the number.",
            },
            {
              t: "Concierge service",
              d: "Doorstep test drives, RTO paperwork, finance liaison, and a delivery experience worthy of the car.",
            },
          ].map((f) => (
            <div key={f.t} className="border-t border-border pt-8">
              <div className="text-xs uppercase tracking-widest text-champagne">
                {f.t}
              </div>
              <p className="mt-4 text-base leading-relaxed text-foreground/90">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Budget bands */}
      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionEyebrow>By budget</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl">Find your range.</h2>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {BUDGET_BANDS.map((b) => (
              <Link
                key={b.label}
                to="/inventory"
                search={{ minPrice: b.min, maxPrice: b.max } as any}
                className="group flex items-center justify-between border border-border p-6 transition-colors hover:border-champagne/60"
              >
                <span className="tabular font-display text-lg text-foreground">{b.label}</span>
                <span className="text-champagne transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sell CTA — emerald surface */}
      <section className="bg-emerald-deep py-24" style={{ backgroundColor: "var(--emerald-deep)" }}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2">
          <div>
            <SectionEyebrow>Sell your car</SectionEyebrow>
            <h2 className="mt-3 font-display text-4xl">A fair number, without the theatre.</h2>
            <p className="mt-6 max-w-lg text-base text-muted-foreground">
              Share a few details and we will call you back with a considered quote. If we buy your
              car, you get paid the same day.
            </p>
            <Link
              to="/sell-your-car"
              className="mt-8 inline-block rounded-sm bg-champagne px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-champagne/90"
            >
              Get a quote
            </Link>
          </div>
          <ul className="space-y-6 text-sm text-foreground/85">
            <li className="border-t border-foreground/10 pt-6"><span className="text-champagne">01</span> — Free inspection at your home or office.</li>
            <li className="border-t border-foreground/10 pt-6"><span className="text-champagne">02</span> — Transparent quote against current market.</li>
            <li className="border-t border-foreground/10 pt-6"><span className="text-champagne">03</span> — RTO paperwork handled end to end.</li>
            <li className="border-t border-foreground/10 pt-6"><span className="text-champagne">04</span> — Same-day payment on acceptance.</li>
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <SectionEyebrow>Owners</SectionEyebrow>
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
            {testimonials.map((t: any, i: number) => (
              <figure key={i} className="border-t border-border pt-8">
                <blockquote className="font-display text-xl leading-snug text-foreground">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
                  {t.name} · {t.car}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-[0.3em] text-champagne">{children}</div>
  );
}
