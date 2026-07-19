import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { FloatingActions } from "@/components/floating-actions";
import { PageTransition, RevealSection } from "@/components/page-transition";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/faqs")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQs — SHYN RIDE" },
      {
        name: "description",
        content:
          "Answers about buying and selling pre-owned luxury cars with SHYN RIDE in Bangalore — inspections, finance, RTO paperwork.",
      },
      { property: "og:title", content: "FAQs — SHYN RIDE" },
      { property: "og:url", content: "/faqs" },
    ],
    links: [{ rel: "canonical", href: "/faqs" }],
  }),
});

function FaqPage() {
  const siteContent = useQuery(api.siteContent.getAll);
  const faqs: { q: string; a: string }[] =
    (siteContent?.faqs as any) ?? [];
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-24">
          <div
            ref={ref}
            className={`sr-hidden ${isVisible ? "sr-visible" : ""}`}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
              FAQs
            </div>
            <h1 className="mt-4 font-display text-5xl md:text-6xl">
              Common <span className="text-gradient-gold">questions.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground/70">
              Everything you need to know about buying, selling, and owning a
              car from SHYN RIDE.
            </p>
          </div>

          {faqs.length === 0 ? (
            <div className="mt-24 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/20 bg-card/20">
                <HelpCircle className="h-7 w-7 text-muted-foreground/30" />
              </div>
              <p className="mt-6 text-sm text-muted-foreground/50 animate-pulse">
                Loading FAQs…
              </p>
            </div>
          ) : (
            <div className="mt-16 space-y-0 rounded-2xl border border-border/20 bg-card/10 overflow-hidden">
              {faqs.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} index={i} isLast={i === faqs.length - 1} />
              ))}
            </div>
          )}

          {/* Still have questions CTA */}
          <RevealSection delay={300}>
            <div className="mt-20 rounded-2xl border border-border/20 bg-card/10 p-10 text-center">
              <h3 className="font-display text-2xl">
                Still have <span className="text-gradient-gold">questions?</span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground/60">
                We're happy to help. Reach out and we'll get back to you within a few hours.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center gap-2.5 rounded-lg bg-champagne px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-champagne/20 btn-shine"
              >
                Contact us
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </RevealSection>
        </main>
        <Footer />
        <FloatingActions />
      </div>
    </PageTransition>
  );
}

function FaqItem({ q, a, index, isLast }: { q: string; a: string; index: number; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${!isLast ? "border-b border-border/15" : ""} sr-hidden ${isVisible ? "sr-visible" : ""}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-6 px-8 py-6 text-left group transition-colors duration-300 hover:bg-card/20"
      >
        <span className="flex items-start gap-4">
          <span className="mt-0.5 tabular text-sm font-bold text-champagne/30">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-display text-lg text-foreground transition-colors group-hover:text-champagne">
            {q}
          </span>
        </span>
        <ChevronDown
          className={`mt-1.5 h-5 w-5 shrink-0 text-champagne/40 transition-all duration-400 ${
            open ? "rotate-180 text-champagne" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-8 pb-8 pl-[4.5rem] text-sm leading-relaxed text-foreground/60">
          {a}
        </div>
      </div>
    </div>
  );
}
