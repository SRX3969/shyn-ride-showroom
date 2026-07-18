import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { submitEnquiry } from "@/lib/enquiries.functions";

export const Route = createFileRoute("/sell-your-car")({
  component: SellPage,
  head: () => ({
    meta: [
      { title: "Sell Your Car — SHYN RIDE" },
      {
        name: "description",
        content:
          "Sell your pre-owned luxury car in Bangalore. Free home inspection, transparent quote, same-day payment.",
      },
      { property: "og:title", content: "Sell Your Car — SHYN RIDE" },
      { property: "og:url", content: "/sell-your-car" },
    ],
    links: [{ rel: "canonical", href: "/sell-your-car" }],
  }),
});

function SellPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    make: "",
    model: "",
    year: "",
    km: "",
    message: "",
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mut = useMutation({
    mutationFn: () =>
      submitEnquiry({
        data: {
          type: "sell_request",
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
          car_details: {
            make: form.make,
            model: form.model,
            year: form.year,
            km: form.km,
          },
        },
      }),
    onSuccess: () => setDone(true),
    onError: (e: any) => setError(e?.message ?? "Something went wrong"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-xs uppercase tracking-[0.3em] text-champagne">Sell your car</div>
        <h1 className="mt-4 font-display text-5xl">A fair number, without the theatre.</h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground">
          Share a few details. We will call you back within a business day with a considered quote.
        </p>

        {done ? (
          <div className="mt-16 border border-champagne/60 bg-card p-10">
            <div className="font-display text-3xl">Thank you.</div>
            <p className="mt-3 max-w-md text-muted-foreground">
              We've received your details and will be in touch shortly to schedule an inspection.
            </p>
          </div>
        ) : (
          <form
            className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              mut.mutate();
            }}
          >
            <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
            <Field label="Email (optional)" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <div />
            <Field label="Make" value={form.make} onChange={(v) => setForm({ ...form, make: v })} required />
            <Field label="Model" value={form.model} onChange={(v) => setForm({ ...form, model: v })} required />
            <Field label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} inputMode="numeric" required />
            <Field label="Odometer (km)" value={form.km} onChange={(v) => setForm({ ...form, km: v })} inputMode="numeric" required />
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Anything else we should know
              </label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-2 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-champagne focus:outline-none"
              />
            </div>
            {error && <div className="text-xs text-destructive md:col-span-2">{error}</div>}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={mut.isPending}
                className="rounded-sm bg-champagne px-8 py-3 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-champagne/90 disabled:opacity-60"
              >
                {mut.isPending ? "Sending…" : "Request a quote"}
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Field({
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
  inputMode?: "tel" | "email" | "text" | "numeric";
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
