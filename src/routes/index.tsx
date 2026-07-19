import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header, Footer } from "@/components/site-chrome";
import { CarCard } from "@/components/car-card";
import { FloatingActions } from "@/components/floating-actions";
import { SkeletonCard } from "@/components/skeleton";
import { PageTransition, RevealSection } from "@/components/page-transition";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import { useParallax } from "@/hooks/useParallax";
import { useCountUpString } from "@/hooks/useCountUp";
import heroImg from "@/assets/hero-showroom.jpg";
import sedanImg from "@/assets/car-sedan-1.jpg";
import suvImg from "@/assets/car-suv-1.jpg";
import coupeImg from "@/assets/car-coupe-1.jpg";
import sedan2Img from "@/assets/car-sedan-2.jpg";
import suv2Img from "@/assets/car-suv-2.jpg";
import {
  Shield,
  Headset,
  TrendingUp,
  ArrowRight,
  Star,
  ChevronRight,
  Sparkles,
  Eye,
  FileCheck,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "SHYN RIDE — Pre-Owned Luxury Cars, Bangalore" },
      {
        name: "description",
        content:
          "Bangalore's curated pre-owned luxury car showroom. Mercedes-Benz, BMW, Audi, Land Rover, Porsche. Certified. Transparent. Unhurried.",
      },
      {
        property: "og:title",
        content: "SHYN RIDE — Pre-Owned Luxury Cars, Bangalore",
      },
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
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <HeroSection />
          <BrandMarquee />
          <TheShowroom />
          <TrustStrip />
          <FeaturedInventory />
          <LifestyleGallery />
          <WhyShynRide />
          <HowItWorks />
          <BudgetBands />
          <SellCTA />
          <Testimonials />
          <FinalCTA />
        </main>
        <Footer />
        <FloatingActions />
      </div>
    </PageTransition>
  );
}

/* ─── Hero ─── */
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";

const HERO_SLIDES = [
  {
    src: heroImg,
    alt: "A black luxury sedan in a dark showroom",
  },
  {
    src: "https://images.unsplash.com/photo-1562141989-c5c79ac8f576?q=80&w=1920&auto=format&fit=crop",
    alt: "Modern luxury car showroom interior",
  },
  {
    src: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920&auto=format&fit=crop",
    alt: "Mercedes S-Class side profile",
  },
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1920&auto=format&fit=crop",
    alt: "Elegant dealership showcase floor",
  }
];

function HeroSection() {
  const { ref: parallaxRef, offset } = useParallax(0.15);
  const siteContent = useQuery(api.siteContent.getAll);
  const hero = (siteContent?.hero ?? {}) as any;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section
      ref={parallaxRef}
      className="relative h-[95vh] min-h-[650px] w-full overflow-hidden bg-foreground/5"
    >
      <div className="absolute inset-0 h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full touch-pan-y">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className="relative min-w-0 flex-[0_0_100%] h-full w-full"
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={1920}
                height={1080}
                className="h-full w-full object-cover transition-transform duration-[10000ms] ease-linear"
                style={{
                  transform: `translateY(${offset}px) scale(${selectedIndex === index ? 1.05 : 1})`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Multi-layer gradient for cinematic depth (Forced dark for image contrast) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Slide Indicators */}
      <div className="absolute bottom-12 right-6 flex gap-2 z-10 md:right-12">
        {HERO_SLIDES.map((_, index) => (
           <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              selectedIndex === index
                ? "w-8 bg-champagne"
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24 pointer-events-none">
        <div className="max-w-2xl pointer-events-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-champagne/30 bg-black/20 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-champagne backdrop-blur-md animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <Sparkles className="h-3 w-3" />
            Curated in Bangalore
          </div>
          <h1
            className="mt-6 font-display text-5xl leading-[1.05] text-white drop-shadow-lg md:text-7xl lg:text-8xl animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            {hero.headline ? (
              hero.headline
            ) : (
              <>
                Own the{" "}
                <span className="text-gradient-gold">Extraordinary.</span>
              </>
            )}
          </h1>
          <p
            className="mt-6 max-w-lg text-base leading-relaxed text-white/90 drop-shadow md:text-lg animate-slide-up"
            style={{ animationDelay: "600ms" }}
          >
            {hero.subhead ??
              "A curated pre-owned luxury showroom in Bangalore. Certified. Transparent. Unhurried."}
          </p>
          <div
            className="mt-10 flex flex-wrap items-center gap-4 animate-slide-up"
            style={{ animationDelay: "800ms" }}
          >
            <Link
              to="/inventory"
              className="group flex items-center gap-2.5 rounded-lg bg-champagne px-7 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-2xl hover:shadow-champagne/25 btn-shine animate-pulse-glow"
            >
              {hero.cta ?? "View Inventory"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/sell-your-car"
              className="group flex items-center gap-2.5 rounded-lg border border-white/30 px-7 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:border-champagne hover:text-champagne hover:bg-black/20 backdrop-blur-sm"
            >
              Sell Your Car
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float pointer-events-none hidden md:block">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-px bg-gradient-to-b from-champagne/50 to-transparent" />
          <div className="text-[9px] font-bold uppercase tracking-[0.4em] text-champagne/80 drop-shadow">
            Scroll
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Brand Marquee ─── */
function BrandMarquee() {
  const brands = [
    "MERCEDES-BENZ",
    "BMW",
    "AUDI",
    "PORSCHE",
    "LAND ROVER",
    "JAGUAR",
    "VOLVO",
    "LEXUS",
  ];

  return (
    <section className="border-y border-border/20 bg-card/10 py-5 overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...brands, ...brands].map((brand, i) => (
          <span
            key={i}
            className="mx-10 inline-flex items-center gap-3 font-display text-base tracking-[0.15em] text-muted-foreground/30 transition-colors duration-500 hover:text-champagne/70 md:text-lg"
          >
            <span className="h-1 w-1 rounded-full bg-champagne/20" />
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─── The Showroom ─── */
function TheShowroom() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="relative bg-background py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className={`grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 items-center sr-hidden ${isVisible ? "sr-visible" : ""}`}>
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-champagne/5 blur-2xl rounded-full" />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                alt="SHYN RIDE Showroom Bangalore"
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 text-champagne">
                  <div className="h-px flex-1 bg-champagne/30" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Bangalore, India</span>
                  <div className="h-px flex-1 bg-champagne/30" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <SectionEyebrow>The Destination</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl leading-[1.1] md:text-5xl lg:text-6xl text-foreground">
              A space designed for <br />
              <span className="text-gradient-gold">automotive excellence.</span>
            </h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
              <p>
                Located in the heart of Bangalore, our facility is more than just a dealership. It is a curated gallery where the world's most exceptional pre-owned luxury vehicles are displayed exactly as they were intended to be seen.
              </p>
              <p>
                We believe that buying a luxury vehicle should be as refined an experience as driving one. There are no high-pressure salespeople here. Just passionate experts, a beautifully lit floor, and a collection of cars that speak for themselves.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-6 border-t border-border/40 pt-8">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-champagne">Hours</div>
                <div className="mt-2 text-sm font-medium text-foreground">Mon – Sat: 10AM – 8PM</div>
                <div className="text-sm text-muted-foreground">Sunday by appointment</div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-champagne">Experience</div>
                <div className="mt-2 text-sm font-medium text-foreground">Private Viewing Room</div>
                <div className="text-sm text-muted-foreground">Valet Parking Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Strip ─── */
function TrustStrip() {
  const siteContent = useQuery(api.siteContent.getAll);
  const stats: { value: string; label: string }[] =
    (siteContent?.trust_stats as any) ?? [];
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="relative border-b border-border/20 bg-card/20 overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-champagne/[0.02] via-transparent to-champagne/[0.02]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-20 md:grid-cols-4">
        {stats.map((s, i) => (
          <StatItem
            key={i}
            value={s.value}
            label={s.label}
            delay={i * 150}
            visible={isVisible}
          />
        ))}
      </div>
    </section>
  );
}

function StatItem({
  value,
  label,
  delay,
  visible,
}: {
  value: string;
  label: string;
  delay: number;
  visible: boolean;
}) {
  const { ref, displayValue } = useCountUpString(value, { duration: 2200 });
  return (
    <div
      ref={ref}
      className={`text-center md:text-left sr-hidden ${visible ? "sr-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="tabular font-display text-4xl text-gradient-gold md:text-5xl">
        {displayValue}
      </div>
      <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">
        {label}
      </div>
    </div>
  );
}

/* ─── Featured Inventory ─── */
function FeaturedInventory() {
  const featured = useQuery(api.cars.list, {
    featured: true,
    limit: 6,
    sort: "newest",
  });
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const { containerRef, visibleItems } = useStaggerReveal(
    featured?.length ?? 6,
  );

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={ref}
          className={`flex items-end justify-between sr-hidden ${isVisible ? "sr-visible" : ""}`}
        >
          <div>
            <SectionEyebrow>Featured</SectionEyebrow>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              On the floor <span className="text-gradient-gold">now.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground/70">
              Hand-picked from our current collection. Each one inspected, certified, and ready to drive.
            </p>
          </div>
          <Link
            to="/inventory"
            className="hidden items-center gap-2 rounded-lg border border-border/40 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-champagne transition-all duration-300 hover:border-champagne/40 hover:bg-champagne/5 md:flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div
          ref={containerRef}
          className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3"
        >
          {featured === undefined
            ? Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : featured.map((car, i) => (
                <div
                  key={car._id}
                  className={`sr-scale-hidden ${visibleItems[i] ? "sr-scale-visible" : ""}`}
                >
                  <CarCard car={car} />
                </div>
              ))}
        </div>
        <div className="mt-12 text-center md:hidden">
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 rounded-lg border border-border/40 px-6 py-3 text-xs font-bold uppercase tracking-widest text-champagne transition-all duration-300 hover:border-champagne/40"
          >
            View all inventory
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Lifestyle Gallery ─── */
function LifestyleGallery() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="py-4 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className={`sr-hidden ${isVisible ? "sr-visible" : ""}`}>
          <SectionEyebrow>Gallery</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            A closer <span className="text-gradient-gold">look.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted-foreground/70">
            From executive sedans to grand tourers — see what's on our floor right now.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2 md:gap-3">
          <GalleryImage
            src={sedanImg}
            alt="Luxury sedan showroom shot"
            className="col-span-2 row-span-2 aspect-[4/3] md:aspect-auto"
            visible={isVisible}
            delay={100}
          />
          <GalleryImage src={suvImg} alt="Premium SUV" visible={isVisible} delay={200} />
          <GalleryImage src={coupeImg} alt="Sports coupe" visible={isVisible} delay={300} />
          <GalleryImage src={sedan2Img} alt="Executive sedan" visible={isVisible} delay={400} />
          <GalleryImage src={suv2Img} alt="Luxury SUV rear" visible={isVisible} delay={500} />
        </div>
      </div>
    </section>
  );
}

function GalleryImage({
  src,
  alt,
  className = "",
  visible,
  delay,
}: {
  src: string;
  alt: string;
  className?: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl sr-scale-hidden ${visible ? "sr-scale-visible" : ""} ${className || "aspect-[4/3]"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute bottom-4 left-4 opacity-0 transition-all duration-500 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/90">{alt}</span>
      </div>
    </div>
  );
}

/* ─── Why SHYN RIDE ─── */
function WhyShynRide() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const features = [
    {
      icon: Shield,
      title: "Certified Inspection",
      desc: "Every car passes a 180-point mechanical, cosmetic and paperwork inspection before it is listed.",
      accent: "from-champagne/10 to-champagne/5",
    },
    {
      icon: TrendingUp,
      title: "Transparent Pricing",
      desc: "Honest, researched prices. If a car is marked negotiable, there is room. If not, the number is the number.",
      accent: "from-emerald-deep/30 to-emerald-deep/10",
    },
    {
      icon: Headset,
      title: "Concierge Service",
      desc: "Doorstep test drives, RTO paperwork, finance liaison, and a delivery experience worthy of the car.",
      accent: "from-champagne/10 to-champagne/5",
    },
  ];

  return (
    <section ref={ref} className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className={`max-w-2xl sr-hidden ${isVisible ? "sr-visible" : ""}`}>
          <SectionEyebrow>The showroom</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            A quieter way to buy a{" "}
            <span className="text-gradient-gold">serious car.</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground/70">
            No floor salespeople. No pressure. Just a beautiful space, honest information, and cars that deserve your attention.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative overflow-hidden rounded-2xl border border-border/30 bg-card/20 p-8 transition-all duration-500 hover:border-champagne/20 hover:bg-card/40 hover:shadow-xl hover:shadow-champagne/5 sr-hidden ${isVisible ? "sr-visible" : ""}`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              {/* Accent gradient */}
              <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${f.accent} opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100`} />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-champagne/10 text-champagne ring-1 ring-champagne/10 transition-all duration-500 group-hover:bg-champagne/15 group-hover:scale-110 group-hover:ring-champagne/20">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-xl text-foreground">
                  {f.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-foreground/60">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const steps = [
    {
      num: "01",
      icon: Eye,
      title: "Browse",
      desc: "Explore our curated inventory online. Filter by make, budget, or body style.",
    },
    {
      num: "02",
      icon: Sparkles,
      title: "Test Drive",
      desc: "Schedule a doorstep test drive. We bring the car to you, anywhere in Bangalore.",
    },
    {
      num: "03",
      icon: FileCheck,
      title: "Paperwork",
      desc: "We handle RC transfer, insurance, and all RTO formalities end to end.",
    },
    {
      num: "04",
      icon: Truck,
      title: "Drive Home",
      desc: "Same-day delivery with a handover experience worthy of your new car.",
    },
  ];

  return (
    <section ref={ref} className="relative border-y border-border/20 bg-card/10 py-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-champagne/[0.02] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div
          className={`text-center sr-hidden ${isVisible ? "sr-visible" : ""}`}
        >
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Four simple <span className="text-gradient-gold">steps.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground/70">
            From first glance to first drive — we make every step effortless.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`group relative text-center sr-hidden ${isVisible ? "sr-visible" : ""}`}
              style={{ transitionDelay: `${300 + i * 150}ms` }}
            >
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-10 hidden h-px w-full translate-x-1/2 md:block">
                  <div className="h-full w-full bg-gradient-to-r from-champagne/30 via-champagne/10 to-transparent" />
                </div>
              )}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border/30 bg-card/40 transition-all duration-500 group-hover:border-champagne/30 group-hover:bg-card/60 group-hover:shadow-xl group-hover:shadow-champagne/5">
                <step.icon className="h-7 w-7 text-champagne transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.3em] text-champagne/70">
                Step {step.num}
              </div>
              <h3 className="mt-3 font-display text-xl text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/60">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Budget Bands ─── */
const BUDGET_BANDS = [
  { label: "₹15L – 25L", min: 1500000, max: 2500000, desc: "Entry luxury" },
  { label: "₹25L – 50L", min: 2500000, max: 5000000, desc: "Premium range" },
  { label: "₹50L – 1Cr", min: 5000000, max: 10000000, desc: "High luxury" },
  { label: "₹1Cr +", min: 10000000, max: undefined, desc: "Exotic & rare" },
];

function BudgetBands() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className={`sr-hidden ${isVisible ? "sr-visible" : ""}`}>
          <SectionEyebrow>By budget</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Find your <span className="text-gradient-gold">range.</span>
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {BUDGET_BANDS.map((b, i) => (
            <Link
              key={b.label}
              to="/inventory"
              search={{ minPrice: b.min, maxPrice: b.max } as any}
              className={`group relative overflow-hidden rounded-xl border border-border/30 bg-card/20 p-6 transition-all duration-500 hover:border-champagne/30 hover:bg-card/40 hover:shadow-lg hover:shadow-champagne/5 sr-hidden ${isVisible ? "sr-visible" : ""}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-champagne/[0.03] blur-2xl transition-all duration-500 group-hover:bg-champagne/[0.08]" />
              <span className="relative block tabular font-display text-2xl text-foreground">
                {b.label}
              </span>
              <span className="relative mt-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                {b.desc}
              </span>
              <ArrowRight className="relative mt-4 h-4 w-4 text-champagne/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-champagne" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Sell CTA ─── */
function SellCTA() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16"
      style={{ backgroundColor: "var(--emerald-deep)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-transparent to-champagne/5 opacity-60" />
      <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-champagne/[0.04] blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 md:grid-cols-2">
        <div className={`sr-left-hidden ${isVisible ? "sr-left-visible" : ""}`}>
          <SectionEyebrow>Sell your car</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            A fair number, without the{" "}
            <span className="text-gradient-gold">theatre.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/60">
            Share a few details and we will call you back with a considered
            quote. If we buy your car, you get paid the same day.
          </p>
          <Link
            to="/sell-your-car"
            className="mt-10 inline-flex items-center gap-2.5 rounded-lg bg-champagne px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-2xl hover:shadow-champagne/25 btn-shine"
          >
            Get a quote
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul
          className={`space-y-0 sr-right-hidden ${isVisible ? "sr-right-visible" : ""}`}
        >
          {[
            "Free inspection at your home or office.",
            "Transparent quote against current market.",
            "RTO paperwork handled end to end.",
            "Same-day payment on acceptance.",
          ].map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-5 border-t border-foreground/8 py-6"
            >
              <span className="tabular font-display text-2xl text-champagne/60">
                0{i + 1}
              </span>
              <span className="mt-1 text-sm leading-relaxed text-foreground/80">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const siteContent = useQuery(api.siteContent.getAll);
  const testimonials: { quote: string; name: string; car: string }[] =
    (siteContent?.testimonials as any) ?? [];
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  if (testimonials.length === 0) return null;

  return (
    <section ref={ref} className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className={`sr-hidden ${isVisible ? "sr-visible" : ""}`}>
          <SectionEyebrow>What owners say</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Words from <span className="text-gradient-gold">our clients.</span>
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className={`group relative overflow-hidden rounded-2xl border border-border/20 bg-card/20 p-8 transition-all duration-500 hover:border-champagne/15 hover:bg-card/40 hover:shadow-xl hover:shadow-champagne/5 sr-hidden ${isVisible ? "sr-visible" : ""}`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-champagne/[0.03] blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
              <div className="relative">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-3.5 w-3.5 fill-champagne/80 text-champagne/80"
                    />
                  ))}
                </div>
                <blockquote className="mt-6 font-display text-lg leading-snug text-foreground/90">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-champagne/10 font-display text-sm text-champagne">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-champagne/70">
                      {t.car}
                    </div>
                  </div>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTA() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section ref={ref} className="border-t border-border/20 py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className={`sr-hidden ${isVisible ? "sr-visible" : ""}`}>
          <h2 className="font-display text-4xl md:text-5xl">
            Ready to find <span className="text-gradient-gold">your car?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground/70">
            Browse our collection or tell us what you are looking for. We will
            do the rest.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/inventory"
              className="group flex items-center gap-2.5 rounded-lg bg-champagne px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-2xl hover:shadow-champagne/25 btn-shine"
            >
              Browse inventory
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="group flex items-center gap-2.5 rounded-lg border border-border/40 px-8 py-4 text-xs font-bold uppercase tracking-widest text-foreground transition-all duration-300 hover:border-champagne/40 hover:text-champagne"
            >
              Contact us
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Shared ─── */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne">
      {children}
    </div>
  );
}
