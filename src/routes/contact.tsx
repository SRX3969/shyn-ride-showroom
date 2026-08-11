import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { FloatingActions } from "@/components/floating-actions";
import { PageTransition, RevealSection } from "@/components/page-transition";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MapPin, Clock, Phone, Mail, MessageCircle, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — SHYN RIDE" },
      {
        name: "description",
        content: "Visit our showroom in Bangalore, or send us a note.",
      },
      { property: "og:title", content: "Contact — SHYN RIDE" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
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
  const settings = useQuery(api.settings.get);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await submitEnquiry({
        type: "contact",
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

  const contactInfo = [
    {
      icon: MapPin,
      title: "Showroom",
      lines: settings?.address 
        ? settings.address.split("\n")
        : ["123 Main Street, Indiranagar", "Bangalore, Karnataka 560038"],
    },
    {
      icon: Clock,
      title: "Hours",
      lines: settings?.workingHours 
        ? settings.workingHours.split("\n")
        : ["Mon – Sat · 10am – 8pm", "Sunday by appointment"],
    },
    {
      icon: Phone,
      title: "Phone",
      lines: [settings?.phone || "+91 99025 00649"],
      action: "tel:+919902500649",
    },
    {
      icon: Mail,
      title: "Email",
      lines: [settings?.email || "shreeram.prakasan23@gmail.com"],
      action: "mailto:shreeram.prakasan23@gmail.com",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      lines: ["+91 99025 00649", "Quick enquiries welcome"],
      action: "https://wa.me/919902500649?text=Hi%20SHYN%20RIDE%2C%20I%20have%20an%20enquiry",
    },
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
              Contact
            </div>
            <h1 className="mt-4 font-display text-5xl md:text-6xl">
              Come by, or send a{" "}
              <span className="text-gradient-gold">note.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground/70">
              Whether you want to see a car, sell a car, or just talk cars — we'd love to hear from you.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
            {/* Contact info */}
            <div className="space-y-6">
              {contactInfo.map((item, i) => (
                <RevealSection key={item.title} direction="left" delay={i * 80}>
                  <div className="group flex gap-5 rounded-xl border border-border/20 bg-card/10 p-5 transition-all duration-500 hover:border-champagne/15 hover:bg-card/30">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-champagne/10 text-champagne transition-transform duration-500 group-hover:scale-110">
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-champagne">
                        {item.title}
                      </div>
                      {item.lines.map((line, j) => (
                        <p
                          key={j}
                          className="mt-1.5 text-sm leading-relaxed text-foreground/70"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </RevealSection>
              ))}

              {/* Map embed */}
              <RevealSection direction="left" delay={400}>
                <div className="mt-6 overflow-hidden rounded-xl border border-border/20 bg-card/10 h-64 md:h-80">
                  {(settings as any)?.showroomMapIframe ? (
                    <div 
                      className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                      dangerouslySetInnerHTML={{ __html: (settings as any).showroomMapIframe }}
                    />
                  ) : (
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124415.71963953531!2d77.50293141517521!3d12.97304193551522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                      className="h-full w-full border-0 grayscale invert opacity-70"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  )}
                </div>
              </RevealSection>
            </div>

            {/* Form */}
            <RevealSection direction="right" delay={200}>
              {done ? (
                <div className="rounded-2xl border border-champagne/20 bg-card/30 p-10 text-center animate-fade-in-scale">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-champagne/10">
                    <CheckCircle2 className="h-8 w-8 text-champagne" />
                  </div>
                  <div className="mt-6 font-display text-2xl">
                    Note received.
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground/70">
                    We'll respond within a business day.
                  </p>
                </div>
              ) : (
                <form
                  className="rounded-2xl border border-border/20 bg-card/10 p-8 space-y-5"
                  onSubmit={handleSubmit}
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
                    Send a message
                  </div>
                  <InputField
                    label="Name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    required
                  />
                  <InputField
                    label="Phone"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    required
                  />
                  <InputField
                    label="Email (optional)"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                  />
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="mt-2 w-full rounded-xl border border-border/30 bg-card/30 px-4 py-3 text-sm text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none focus:shadow-lg focus:shadow-champagne/5 resize-none"
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
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-champagne px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-champagne/20 btn-shine disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sending ? "Sending…" : "Send message"}
                  </button>
                </form>
              )}
            </RevealSection>
          </div>
        </main>
        <Footer />
        <FloatingActions />
      </div>
    </PageTransition>
  );
}

function InputField({
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
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border/30 bg-card/30 px-4 py-3 text-sm text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none focus:shadow-lg focus:shadow-champagne/5"
      />
    </div>
  );
}
