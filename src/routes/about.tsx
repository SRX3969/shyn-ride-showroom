import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { FloatingActions } from "@/components/floating-actions";
import { PageTransition, RevealSection } from "@/components/page-transition";
import { DeliveryTestimonials } from "@/components/delivery-testimonials";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUpString } from "@/hooks/useCountUp";
import heroImg from "@/assets/hero-showroom.jpg";
import suvImg from "@/assets/car-suv-1.jpg";
import {
  Shield,
  Users,
  Eye,
  Heart,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — SHYN RIDE" },
      {
        name: "description",
        content:
          "SHYN RIDE is a Bangalore-based curated pre-owned luxury car showroom. Fewer, better cars. Certified, transparent, unhurried.",
      },
      { property: "og:title", content: "About — SHYN RIDE" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  const { ref: headerRef, isVisible: headerVisible } =
    useScrollReveal<HTMLDivElement>();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={heroImg}
                alt="SHYN RIDE showroom"
                className="h-full w-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
            </div>
            <div
              ref={headerRef}
              className="relative mx-auto max-w-4xl px-6 py-32 md:py-40"
            >
              <div className={`sr-hidden ${headerVisible ? "sr-visible" : ""}`}>
                <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
                  About
                </div>
                <h1 className="mt-4 font-display text-5xl leading-tight md:text-7xl">
                  Fewer cars, chosen{" "}
                  <span className="text-gradient-gold">carefully.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/60">
                  A small, deliberate showroom for people who care about the car
                  they drive and the experience of buying it.
                </p>
              </div>
            </div>
          </section>

          {/* Story */}
          <section className="py-28">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 md:grid-cols-2">
              <RevealSection direction="left">
                <div className="space-y-6 text-base leading-relaxed text-foreground/80">
                  <p>
                    SHYN RIDE started in 2019 from a simple idea: pre-owned luxury
                    cars in India deserve better. Better curation, better
                    inspection, better presentation, and above all — a better
                    buying experience.
                  </p>
                  <p>
                    We keep a tight floor of handpicked cars — Mercedes-Benz, BMW,
                    Audi, Land Rover, Porsche, Jaguar. Every car undergoes a
                    180-point mechanical, cosmetic and paperwork inspection. Service
                    history is verified. Odometers are audited. Anything that isn't
                    right is fixed, or the car doesn't make it to the floor.
                  </p>
                  <p>
                    We price honestly against the current market, and we tell you
                    what's on the price tag. No theatre. No pressure. Come in, sit
                    in the car, drive it. Take your time.
                  </p>
                </div>
              </RevealSection>
              <RevealSection direction="right" delay={200}>
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={suvImg}
                    alt="Premium SUV at SHYN RIDE"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealSection>
            </div>
          </section>

          {/* Values */}
          <section className="border-y border-border/20 bg-card/10 py-28">
            <div className="mx-auto max-w-6xl px-6">
              <RevealSection>
                <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
                  Our values
                </div>
                <h2 className="mt-3 font-display text-4xl md:text-5xl">
                  What we <span className="text-gradient-gold">stand for.</span>
                </h2>
              </RevealSection>
              <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: Shield,
                    title: "Integrity",
                    desc: "Every car, every price, every detail — exactly as represented. No exceptions.",
                  },
                  {
                    icon: Eye,
                    title: "Transparency",
                    desc: "Full inspection reports, service history, and honest pricing. Ask us anything.",
                  },
                  {
                    icon: Heart,
                    title: "Care",
                    desc: "We treat every car and every client with the attention they deserve.",
                  },
                  {
                    icon: Users,
                    title: "Community",
                    desc: "Building a community of car enthusiasts who value quality over quantity.",
                  },
                ].map((v, i) => (
                  <RevealSection key={v.title} direction="scale" delay={i * 120}>
                    <div className="group rounded-2xl border border-border/20 bg-card/20 p-7 transition-all duration-500 hover:border-champagne/15 hover:bg-card/40">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-champagne/10 text-champagne transition-transform duration-500 group-hover:scale-110">
                        <v.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-display text-lg">{v.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                        {v.desc}
                      </p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-28">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                {[
                  { k: "Since", v: "2019" },
                  { k: "Cars sold", v: "300+" },
                  { k: "Return rate", v: "0.4%" },
                ].map((s, i) => (
                  <AboutStat key={s.k} value={s.v} label={s.k} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="border-t border-border/20 py-28">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <RevealSection>
                <h2 className="font-display text-4xl md:text-5xl">
                  Come <span className="text-gradient-gold">visit.</span>
                </h2>
                <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground/70">
                  We're in Indiranagar, Bangalore. Walk in, or schedule an
                  appointment — we'll have your favourite ready.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/inventory"
                    className="group flex items-center gap-2.5 rounded-lg bg-champagne px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-2xl hover:shadow-champagne/25 btn-shine"
                  >
                    View inventory
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/contact"
                    className="group flex items-center gap-2.5 rounded-lg border border-border/40 px-8 py-4 text-xs font-bold uppercase tracking-widest text-foreground transition-all duration-300 hover:border-champagne/40 hover:text-champagne"
                  >
                    Contact us
                  </Link>
                </div>
              </RevealSection>
            </div>
          </section>
          <DeliveryTestimonials />
        </main>
        <Footer />
        <FloatingActions />
      </div>
    </PageTransition>
  );
}

function AboutStat({ value, label, index }: { value: string; label: string; index: number }) {
  const { ref: sRef, isVisible } = useScrollReveal<HTMLDivElement>();
  const { ref, displayValue } = useCountUpString(value, { duration: 2200 });

  return (
    <div
      ref={(el) => {
        (sRef as any).current = el;
        (ref as any).current = el;
      }}
      className={`text-center sr-hidden ${isVisible ? "sr-visible" : ""}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="tabular font-display text-5xl text-gradient-gold md:text-6xl">
        {displayValue}
      </div>
      <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
        {label}
      </div>
    </div>
  );
}
