import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { FloatingActions } from "@/components/floating-actions";
import { PageTransition, RevealSection } from "@/components/page-transition";
import { SkeletonLine } from "@/components/skeleton";
import { formatINR, formatKm } from "@/lib/format";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Car,
  Palette,
  Users,
  MapPin,
  ArrowLeft,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Share2,
  Phone,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/inventory/$slug")({
  component: CarDetailPage,
  head: () => ({
    meta: [{ title: "Car Detail — SHYN RIDE" }],
  }),
});

function CarDetailPage() {
  const { slug } = Route.useParams();
  const car = useQuery(api.cars.getBySlug, { slug });

  if (car === undefined) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <div className="mx-auto max-w-7xl px-6 py-16">
            <SkeletonLine className="h-4 w-20" />
            <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="aspect-[4/3] animate-pulse rounded-2xl bg-card/40" />
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-card/30" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="h-10 w-64" />
                <SkeletonLine className="h-8 w-32" />
                <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-border/20 bg-card/10 p-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <SkeletonLine className="h-2 w-12" />
                      <SkeletonLine className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (car === null) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <div className="mx-auto max-w-2xl px-6 py-32 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border/20 bg-card/20">
              <Car className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="mt-6 font-display text-4xl">
              Sold, <span className="text-gradient-gold">perhaps.</span>
            </div>
            <p className="mt-4 text-muted-foreground/60">
              We couldn't find that car. It may have found a new home already.
            </p>
            <Link
              to="/inventory"
              className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-champagne transition-colors hover:text-champagne/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to inventory
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <CarDetailContent car={car} />
        <Footer />
        <FloatingActions />
      </div>
    </PageTransition>
  );
}

function CarDetailContent({ car }: { car: any }) {
  const [active, setActive] = useState(0);
  const img = car.images[active] ?? car.images[0];
  const title = `${car.year} ${car.make} ${car.model}`;

  const specs = [
    { icon: Calendar, label: "Year", value: String(car.year) },
    { icon: Gauge, label: "Odometer", value: formatKm(car.km) },
    { icon: Fuel, label: "Fuel", value: car.fuel_type },
    { icon: Cog, label: "Transmission", value: car.transmission },
    { icon: Car, label: "Body", value: car.body_type },
    { icon: Palette, label: "Color", value: car.color },
    { icon: Users, label: "Owners", value: String(car.owners) },
    { icon: MapPin, label: "Registration", value: car.reg_state ?? "—" },
  ];

  const prev = () => setActive((v) => (v === 0 ? car.images.length - 1 : v - 1));
  const next = () => setActive((v) => (v === car.images.length - 1 ? 0 : v + 1));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link
        to="/inventory"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-champagne"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Inventory
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Gallery */}
        <div className="lg:col-span-3">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-card">
            {img && (
              <img
                src={img.url}
                alt={img.alt ?? `${title} — photo ${active + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            {/* Nav arrows */}
            {car.images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full glass text-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-card/80"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full glass text-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-card/80"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/80">
              {active + 1} / {car.images.length}
            </div>

            {/* Status badge */}
            {car.status !== "available" && (
              <div className="absolute left-4 top-4 z-10 rounded-lg glass px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-champagne">
                {car.status}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {car.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {car.images.map((im: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                    i === active
                      ? "border-champagne shadow-md shadow-champagne/15 ring-1 ring-champagne/20"
                      : "border-border/20 opacity-60 hover:opacity-100 hover:border-foreground/20"
                  }`}
                >
                  <img
                    src={im.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <aside className="lg:col-span-2">
          <RevealSection direction="right">
            <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
              {car.make}
            </div>
            <h1 className="mt-3 font-display text-4xl leading-tight">
              {car.model}
              {car.variant && (
                <span className="mt-1 block text-lg font-normal text-muted-foreground/60">
                  {car.variant}
                </span>
              )}
            </h1>

            <div className="mt-8 flex items-end gap-4">
              <div className="tabular font-display text-4xl text-gradient-gold">
                {formatINR(car.price_inr)}
              </div>
              {car.price_negotiable && (
                <div className="mb-1 rounded-md bg-champagne/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-champagne/70">
                  Negotiable
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="mt-6 flex gap-2">
              <a
                href="tel:+910000000000"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-champagne px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-champagne/20 btn-shine"
              >
                <Phone className="h-3.5 w-3.5" />
                Call now
              </a>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/30 text-muted-foreground transition-all duration-300 hover:border-champagne/30 hover:text-champagne"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Specs grid */}
            <dl className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-border/20 bg-card/10 p-6">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-champagne/8 text-champagne/60">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <dt className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-sm text-foreground tabular">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <EnquiryForm carId={car._id} carTitle={title} />
          </RevealSection>
        </aside>
      </div>

      {/* Description */}
      {car.description && (
        <RevealSection>
          <section className="mt-24 grid grid-cols-1 gap-12 border-t border-border/20 pt-16 md:grid-cols-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
              About this car
            </div>
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground/70 md:col-span-2">
              {car.description}
            </p>
          </section>
        </RevealSection>
      )}

      {/* Features */}
      {car.features.length > 0 && (
        <RevealSection delay={100}>
          <section className="mt-16 grid grid-cols-1 gap-12 border-t border-border/20 pt-16 md:grid-cols-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
              Features & equipment
            </div>
            <ul className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2">
              {car.features.map((f: string, i: number) => (
                <li
                  key={f}
                  className="flex items-start gap-3 rounded-lg border border-border/10 bg-card/10 px-4 py-3 text-sm text-foreground/80 transition-colors duration-300 hover:border-champagne/10 hover:bg-card/20"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-champagne/50" />
                  {f}
                </li>
              ))}
            </ul>
          </section>
        </RevealSection>
      )}
    </main>
  );
}

function EnquiryForm({
  carId,
  carTitle,
}: {
  carId: Id<"cars">;
  carTitle: string;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitEnquiry = useMutation(api.enquiries.submit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await submitEnquiry({
        type: "car_enquiry",
        car_id: carId,
        car_details: { car: carTitle },
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        message: form.message || undefined,
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mt-8 rounded-2xl border border-champagne/20 bg-card/20 p-6 text-center animate-fade-in-scale">
        <CheckCircle2 className="mx-auto h-8 w-8 text-champagne" />
        <div className="mt-4 font-display text-xl">We'll be in touch.</div>
        <p className="mt-2 text-xs text-muted-foreground/60">
          Your enquiry for the {carTitle} has been received.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-8 space-y-4 rounded-2xl border border-border/20 bg-card/10 p-6"
      onSubmit={handleSubmit}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
        Enquire about this car
      </div>
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
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          Message (optional)
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-2 w-full rounded-xl border border-border/30 bg-card/30 px-4 py-3 text-sm text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none resize-none"
          placeholder="I'd like to schedule a test drive…"
        />
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={sending}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-champagne px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-champagne/20 btn-shine disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        {sending ? "Sending…" : "Send enquiry"}
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
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
        {label}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border/30 bg-card/30 px-4 py-3 text-sm text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none"
      />
    </div>
  );
}
