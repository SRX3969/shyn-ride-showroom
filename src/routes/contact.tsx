import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { submitEnquiry } from "@/lib/enquiries.functions";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — SHYN RIDE" },
      { name: "description", content: "Visit our showroom in Bangalore, or send us a note." },
      { property: "og:title", content: "Contact — SHYN RIDE" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mut = useMutation({
    mutationFn: () =>
      submitEnquiry({
        data: { type: "car_enquiry", ...form },
      }),
    onSuccess: () => setDone(true),
    onError: (e: any) => setError(e?.message ?? "Something went wrong"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-xs uppercase tracking-[0.3em] text-champagne">Contact</div>
        <h1 className="mt-4 font-display text-5xl">Come by, or send a note.</h1>

        <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
          <div className="space-y-10 text-sm text-foreground/90">
            <div>
              <div className="text-xs uppercase tracking-widest text-champagne">Showroom</div>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Indiranagar, Bangalore, Karnataka<br />
                By appointment · Mon – Sat · 10am – 8pm
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-champagne">Reach us</div>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                hello@shynride.example<br />
                +91 00000 00000
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-champagne">Whatsapp</div>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Available for enquiries at the number above.
              </p>
            </div>
          </div>

          <div>
            {done ? (
              <div className="border border-champagne/60 bg-card p-8">
                <div className="font-display text-2xl">Note received.</div>
                <p className="mt-2 text-sm text-muted-foreground">We'll respond within a business day.</p>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setError(null);
                  mut.mutate();
                }}
              >
                <Row label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Row label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                <Row label="Email (optional)" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Message</label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-2 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-champagne focus:outline-none"
                  />
                </div>
                {error && <div className="text-xs text-destructive">{error}</div>}
                <button
                  type="submit"
                  disabled={mut.isPending}
                  className="rounded-sm bg-champagne px-6 py-3 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-champagne/90 disabled:opacity-60"
                >
                  {mut.isPending ? "Sending…" : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-champagne focus:outline-none"
      />
    </div>
  );
}
