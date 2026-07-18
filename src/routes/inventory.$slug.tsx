import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { getCarBySlug } from "@/lib/cars.functions";
import { submitEnquiry } from "@/lib/enquiries.functions";
import { formatINR, formatKm } from "@/lib/format";

const carQuery = (slug: string) =>
  queryOptions({
    queryKey: ["car", slug],
    queryFn: async () => {
      const car = await getCarBySlug({ data: { slug } });
      if (!car) throw notFound();
      return car;
    },
  });

export const Route = createFileRoute("/inventory/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(carQuery(params.slug)),
  component: CarDetailPage,
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Car not found — SHYN RIDE" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData;
    const title = `${c.year} ${c.make} ${c.model}${c.variant ? " " + c.variant : ""} — SHYN RIDE`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${c.year} ${c.make} ${c.model} — ${formatKm(c.km)}, ${c.fuel_type}, ${c.transmission}. ${formatINR(c.price_inr)}.`,
        },
        { property: "og:title", content: title },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/inventory/${params.slug}` },
        ...(c.cover_url ? [{ property: "og:image", content: c.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/inventory/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <div className="font-display text-5xl text-champagne">Sold, perhaps.</div>
        <p className="mt-4 text-muted-foreground">
          We couldn't find that car. It may have found a new home.
        </p>
        <Link to="/inventory" className="mt-8 inline-block text-xs uppercase tracking-widest text-champagne">
          Back to inventory →
        </Link>
      </div>
      <Footer />
    </div>
  ),
});

function CarDetailPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Suspense fallback={<div className="h-screen" />}>
        <CarDetailContent />
      </Suspense>
      <Footer />
    </div>
  );
}

function CarDetailContent() {
  const { slug } = Route.useParams();
  const { data: car } = useSuspenseQuery(carQuery(slug));
  const [active, setActive] = useState(0);
  const img = car.images[active] ?? car.images[0];
  const title = `${car.year} ${car.make} ${car.model}`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link to="/inventory" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-champagne">
        ← Inventory
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Gallery */}
        <div className="lg:col-span-3">
          <div className="chrome-sweep group aspect-[4/3] overflow-hidden bg-card">
            {img && (
              <img
                src={img.url}
                alt={img.alt ?? `${title} — photo ${active + 1}`}
                className="h-full w-full object-cover"
              />
            )}
            <div className="chrome-sweep-inner" />
          </div>
          {car.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-5">
              {car.images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`aspect-[4/3] overflow-hidden border transition-colors ${
                    i === active ? "border-champagne" : "border-border hover:border-foreground/60"
                  }`}
                >
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info + enquiry */}
        <aside className="lg:col-span-2">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne">{car.make}</div>
          <h1 className="mt-3 font-display text-4xl leading-tight">
            {car.model}
            {car.variant && (
              <span className="block text-lg text-muted-foreground">{car.variant}</span>
            )}
          </h1>
          <div className="mt-6 tabular font-display text-3xl text-champagne">
            {formatINR(car.price_inr)}
          </div>
          {car.price_negotiable && (
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              Negotiable
            </div>
          )}
          {car.status !== "available" && (
            <div className="mt-4 inline-block rounded-sm border border-champagne/60 px-3 py-1 text-[10px] uppercase tracking-widest text-champagne">
              {car.status}
            </div>
          )}

          <dl className="mt-10 grid grid-cols-2 gap-y-4 border-t border-border pt-8 text-sm">
            {[
              ["Year", String(car.year)],
              ["Odometer", formatKm(car.km)],
              ["Fuel", car.fuel_type],
              ["Transmission", car.transmission],
              ["Body", car.body_type],
              ["Color", car.color],
              ["Owners", String(car.owners)],
              ["Registration", car.reg_state ?? "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-foreground tabular">{v}</dd>
              </div>
            ))}
          </dl>

          <EnquiryForm carId={car.id} carTitle={title} />
        </aside>
      </div>

      {car.description && (
        <section className="mt-24 grid grid-cols-1 gap-12 border-t border-border pt-16 md:grid-cols-3">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne">The car</div>
          <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90 md:col-span-2">
            {car.description}
          </p>
        </section>
      )}

      {car.features.length > 0 && (
        <section className="mt-16 grid grid-cols-1 gap-12 border-t border-border pt-16 md:grid-cols-3">
          <div className="text-xs uppercase tracking-[0.3em] text-champagne">Features</div>
          <ul className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2">
            {car.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-foreground/90">
                <span className="mt-2 h-px w-4 bg-champagne" />
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function EnquiryForm({ carId, carTitle }: { carId: string; carTitle: string }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mut = useMutation({
    mutationFn: () =>
      submitEnquiry({
        data: {
          type: "car_enquiry",
          car_id: carId,
          car_details: { car: carTitle },
          ...form,
        },
      }),
    onSuccess: () => setDone(true),
    onError: (e: any) => setError(e?.message ?? "Something went wrong"),
  });

  if (done) {
    return (
      <div className="mt-10 border border-champagne/60 bg-card p-6">
        <div className="font-display text-xl">We'll be in touch.</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your enquiry for the {carTitle} has been received. We usually respond within a few hours.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-10 space-y-4 border-t border-border pt-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mut.mutate();
      }}
    >
      <div className="text-xs uppercase tracking-[0.3em] text-champagne">Enquire</div>
      <Input
        label="Name"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        required
      />
      <Input
        label="Phone"
        value={form.phone}
        onChange={(v) => setForm({ ...form, phone: v })}
        required
        inputMode="tel"
      />
      <Input
        label="Email (optional)"
        type="email"
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
      />
      <div>
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Message (optional)
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-2 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-champagne focus:outline-none"
        />
      </div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      <button
        type="submit"
        disabled={mut.isPending}
        className="w-full rounded-sm bg-champagne px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-champagne/90 disabled:opacity-60"
      >
        {mut.isPending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  inputMode?: "tel" | "email" | "text";
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-champagne focus:outline-none"
      />
    </div>
  );
}
