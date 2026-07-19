import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { FloatingActions } from "@/components/floating-actions";
import { PageTransition, RevealSection } from "@/components/page-transition";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Send, CheckCircle2, Shield, Banknote, FileCheck, Clock } from "lucide-react";

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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitEnquiry = useMutation(api.enquiries.submit);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await submitEnquiry({
        type: "sell_request",
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        message: form.message || undefined,
        car_details: {
          make: form.make,
          model: form.model,
          year: form.year,
          km: form.km,
        },
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const benefits = [
    { icon: Shield, title: "Free Inspection", desc: "At your home or office, on your schedule." },
    { icon: Banknote, title: "Same-Day Payment", desc: "Once you accept, money hits your account the same day." },
    { icon: FileCheck, title: "Paperwork Handled", desc: "RC transfer, insurance, NOC — we do it all." },
    { icon: Clock, title: "Quick Turnaround", desc: "From quote to closure in as little as 48 hours." },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-20">
          <div
            ref={ref}
            className={`sr-hidden ${isVisible ? "sr-visible" : ""}`}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
              Sell your car
            </div>
            <h1 className="mt-4 font-display text-5xl md:text-6xl">
              A fair number, without the{" "}
              <span className="text-gradient-gold">theatre.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground/70">
              Share a few details. We will call you back within a business day
              with a considered quote. No obligations, no pressure.
            </p>
          </div>

          {/* Benefits strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {benefits.map((b, i) => (
              <RevealSection key={b.title} direction="scale" delay={i * 100}>
                <div className="group rounded-xl border border-border/20 bg-card/10 p-5 transition-all duration-500 hover:border-champagne/15 hover:bg-card/30">
                  <b.icon className="h-5 w-5 text-champagne transition-transform duration-500 group-hover:scale-110" />
                  <div className="mt-3 text-sm font-medium text-foreground">{b.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground/50">{b.desc}</div>
                </div>
              </RevealSection>
            ))}
          </div>

          {done ? (
            <div className="mt-20 rounded-2xl border border-champagne/20 bg-card/30 p-12 text-center animate-fade-in-scale max-w-2xl mx-auto">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-champagne/10">
                <CheckCircle2 className="h-10 w-10 text-champagne" />
              </div>
              <div className="mt-6 font-display text-3xl">Thank you.</div>
              <p className="mt-4 max-w-md mx-auto text-muted-foreground/70">
                We've received your details for the {form.year} {form.make} {form.model} and
                will be in touch shortly to schedule an inspection.
              </p>
            </div>
          ) : (
            <RevealSection delay={200}>
              <form
                className="mt-16 rounded-2xl border border-border/20 bg-card/10 p-8 md:p-10"
                onSubmit={handleSubmit}
              >
                <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
                  Your details
                </div>
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Your name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    required
                  />
                  <Field
                    label="Phone"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    required
                  />
                  <Field
                    label="Email (optional)"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    className="md:col-span-2"
                  />
                </div>

                <div className="mt-10 hair" />

                <div className="mt-8 text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
                  Your car
                </div>
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Make (e.g. Mercedes-Benz)"
                    value={form.make}
                    onChange={(v) => setForm({ ...form, make: v })}
                    required
                  />
                  <Field
                    label="Model (e.g. E-Class)"
                    value={form.model}
                    onChange={(v) => setForm({ ...form, model: v })}
                    required
                  />
                  <Field
                    label="Year"
                    value={form.year}
                    onChange={(v) => setForm({ ...form, year: v })}
                    inputMode="numeric"
                    required
                  />
                  <Field
                    label="Approximate km driven"
                    value={form.km}
                    onChange={(v) => setForm({ ...form, km: v })}
                    inputMode="numeric"
                    required
                  />
                </div>
                <div className="mt-5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Anything else we should know (optional)
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-border/30 bg-card/30 px-4 py-3 text-sm text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none focus:shadow-lg focus:shadow-champagne/5 resize-none"
                    placeholder="Service history, modifications, specific concerns…"
                  />
                </div>
                {error && (
                  <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                    {error}
                  </div>
                )}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2.5 rounded-xl bg-champagne px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-champagne/20 btn-shine disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sending ? "Sending…" : "Request a quote"}
                  </button>
                </div>
              </form>
            </RevealSection>
          )}
        </main>
        <Footer />
        <FloatingActions />
      </div>
    </PageTransition>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  inputMode,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  inputMode?: "tel" | "email" | "text" | "numeric";
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
        {label}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border/30 bg-card/30 px-4 py-3 text-sm text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none focus:shadow-lg focus:shadow-champagne/5"
      />
    </div>
  );
}
