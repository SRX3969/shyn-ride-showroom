import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header, Footer } from "@/components/site-chrome";
import { CarCard } from "@/components/car-card";
import { DeliveryTestimonials } from "@/components/delivery-testimonials";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  FileCheck,
  Truck,
  Search,
  ClipboardCheck,
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
        content: "Curated luxury pre-owned cars in Bangalore. Certified, 150-point inspection, transparent pricing, door-step test drive.",
      },
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
          <DeliveryTestimonials />
          <WhyShynRide />
          <HowItWorks />
          <BudgetBands />
          <SellCTA />
          <LifestyleGallery />
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
    alt: "Luxury showroom display in Bangalore",
  },
  {
    src: sedanImg,
    alt: "Executive sedan showcase",
  },
  {
    src: suvImg,
    alt: "Luxury SUV showcase",
  },
  {
    src: coupeImg,
    alt: "Grand tourer sports coupe",
  },
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
      className="relative h-[65vh] min-h-[480px] md:h-[95vh] md:min-h-[650px] w-full overflow-hidden bg-foreground/5"
    >
      <div className="absolute inset-0 h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full touch-pan-y">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className="relative min-w-0 flex-[0_0_100%] h-full w-full overflow-hidden"
            >
              <div 
                className="h-full w-full"
                style={{ transform: `translateY(${offset}px)` }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  width={1920}
                  height={1080}
                  className="h-full w-full object-cover transition-transform duration-[10000ms] ease-linear"
                  style={{
                    transform: `scale(${selectedIndex === index ? 1.05 : 1})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Multi-layer gradient for cinematic depth (Forced dark for image contrast) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />

      {/* Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-12 right-5 sm:right-6 flex gap-2 z-10 md:right-12">
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

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 sm:px-6 pb-12 sm:pb-24 pointer-events-none">
        <div className="max-w-2xl pointer-events-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-black/40 px-3.5 py-1 text-xs sm:text-sm font-medium text-white backdrop-blur-md animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-gold-ui" />
            Curated in Bangalore
          </div>
          <h1
            className="mt-3 sm:mt-6 font-display text-4xl sm:text-6xl leading-[1.05] text-white drop-shadow-lg lg:text-8xl animate-slide-up"
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
            className="mt-3 sm:mt-6 max-w-lg text-sm sm:text-base leading-relaxed text-white/90 drop-shadow md:text-lg animate-slide-up"
            style={{ animationDelay: "600ms" }}
          >
            {hero.subhead ??
              "A curated pre-owned luxury showroom in Bangalore. Certified. Transparent. Unhurried."}
          </p>
          <div
            className="mt-6 sm:mt-10 flex flex-wrap items-center gap-4 animate-slide-up"
            style={{ animationDelay: "800ms" }}
          >
            <Link
              to="/inventory"
              className="group inline-flex items-center gap-2.5 rounded-lg bg-gold-ui px-6 py-3.5 text-sm sm:text-[15px] font-bold text-white transition-all duration-300 hover:shadow-2xl hover:shadow-gold-ui/25 min-h-[44px]"
            >
              {hero.cta ?? "View Inventory"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/sell-your-car"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-champagne transition-colors py-2 px-2 min-h-[44px]"
            >
              Sell Your Car
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float pointer-events-none hidden md:block">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-px bg-gradient-to-b from-white/50 to-transparent" />
          <div className="text-[11px] font-bold text-white/80 drop-shadow">
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
            className="mx-10 inline-flex items-center gap-3 font-bold text-lg text-text-secondary transition-colors duration-500 hover:text-text-primary"
          >
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
    <section ref={ref} className="relative bg-background py-10 sm:py-16 overflow-hidden">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <div className={`sr-hidden ${isVisible ? "sr-visible" : ""}`}>
          <SectionEyebrow>The Destination</SectionEyebrow>
          <h2 className="mt-3 font-display text-3xl md:text-5xl leading-tight text-foreground">
            A space for <span className="text-gradient-gold">automotive excellence.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Located in Bangalore, our curated showroom presents certified luxury vehicles in an unhurried, transparent environment.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 border-t border-border/40 pt-6">
            <div className="rounded-xl border border-border/40 bg-surface/50 p-4">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gold-ui">Hours</div>
              <div className="mt-1 text-xs sm:text-sm font-bold text-foreground">Mon – Sat: 10AM – 8PM</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground">Sunday by appointment</div>
            </div>
            <div className="rounded-xl border border-border/40 bg-surface/50 p-4">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gold-ui">Experience</div>
              <div className="mt-1 text-xs sm:text-sm font-bold text-foreground">Private Viewing Room</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground">Valet Parking Available</div>
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
    <section ref={ref} className="relative border-y border-border/40 bg-surface py-10 sm:py-16 overflow-hidden">
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 sm:px-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <StatItem
            key={i}
            value={s.value}
            label={s.label}
            delay={i * 100}
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
      <div className="tabular font-bold text-3xl sm:text-4xl text-text-primary md:text-5xl">
        {displayValue}
      </div>
      <div className="mt-2 text-xs sm:text-[15px] font-semibold text-text-secondary">
        {label}
      </div>
    </div>
  );
}

/* ─── Featured Inventory ─── */
function FeaturedInventory() {
  const featured = useQuery(api.cars.list, {
    featured: true,
    limit: 8,
    sort: "newest",
  });
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-14 sm:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={ref}
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 sr-hidden ${isVisible ? "sr-visible" : ""}`}
        >
          <div>
            <SectionEyebrow>Featured</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">
              On the floor <span className="text-gradient-gold">now.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground/70">
              Hand-picked from our current collection. Swipe or use controls to view.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Previous featured car"
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border/50 bg-card/60 text-foreground transition-all duration-300 hover:border-gold-ui hover:bg-gold-ui/10 hover:text-gold-ui disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Next featured car"
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border/50 bg-card/60 text-foreground transition-all duration-300 hover:border-gold-ui hover:bg-gold-ui/10 hover:text-gold-ui disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <Link
              to="/inventory"
              className="flex items-center gap-2 rounded-lg border border-border/50 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-[14px] font-bold text-text-secondary transition-all duration-300 hover:border-gold-ui hover:text-gold-ui hover:bg-gold-ui/5"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div className="mt-6 sm:mt-10 overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4 touch-pan-y">
            {featured === undefined
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="pl-4 min-w-0 flex-[0_0_100%] sm:flex-[0_0_48%] lg:flex-[0_0_33.333%] shrink-0">
                    <SkeletonCard />
                  </div>
                ))
              : featured.map((car) => (
                  <div
                    key={car._id}
                    className="pl-4 min-w-0 flex-[0_0_100%] sm:flex-[0_0_48%] lg:flex-[0_0_33.333%] shrink-0"
                  >
                    <CarCard car={car} />
                  </div>
                ))}
          </div>
        </div>

        {/* Slide Indicators / Dots */}
        {scrollSnaps.length > 1 && (
          <div className="mt-6 sm:mt-8 flex justify-center items-center gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  selectedIndex === index
                    ? "w-8 bg-gold-ui"
                    : "w-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        )}
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
      desc: "180-point mechanical, cosmetic and paperwork check.",
      accent: "from-champagne/10 to-champagne/5",
    },
    {
      icon: TrendingUp,
      title: "Transparent Pricing",
      desc: "Honest, researched prices with clear room for negotiation.",
      accent: "from-emerald-deep/30 to-emerald-deep/10",
    },
    {
      icon: Headset,
      title: "Concierge Service",
      desc: "Doorstep test drives, RTO finance liaison, and white-glove delivery.",
      accent: "from-champagne/10 to-champagne/5",
    },
  ];

  return (
    <section ref={ref} className="py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className={`max-w-2xl sr-hidden ${isVisible ? "sr-visible" : ""}`}>
          <SectionEyebrow>The Showroom</SectionEyebrow>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl md:text-5xl">
            A quieter way to buy a <span className="text-gradient-gold">serious car.</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground/80">
            No pressure. Just honest information and cars that deserve your attention.
          </p>
        </div>
        <div className="mt-6 sm:mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group rounded-xl border border-border/40 bg-surface p-3.5 sm:p-6 transition-all hover:border-gold-ui/30 sr-hidden ${isVisible ? "sr-visible" : ""}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-ui/10 text-gold-ui mb-3">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight">
                {f.title}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {f.desc}
              </p>
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
      title: "Browse digitally",
      desc: "Explore high-res imagery & transparent vehicle history.",
      icon: Search,
    },
    {
      title: "Schedule viewing",
      desc: "Book a showroom appointment or home visit.",
      icon: Eye,
    },
    {
      title: "150-Point check",
      desc: "Rigorous quality and mechanical inspection.",
      icon: ClipboardCheck,
    },
    {
      title: "Doorstep delivery",
      desc: "Seamless paperwork & direct delivery.",
      icon: Truck,
    },
  ];

  return (
    <section ref={ref} className="relative border-y border-border/20 bg-card/10 py-10 sm:py-16 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div
          className={`text-center sr-hidden ${isVisible ? "sr-visible" : ""}`}
        >
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl md:text-5xl">
            Four simple <span className="text-gradient-gold">steps.</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-muted-foreground/80">
            From first glance to first drive — we make every step effortless.
          </p>
        </div>
        <div className="mt-6 sm:mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`group rounded-xl border border-border/40 bg-surface p-3.5 sm:p-6 transition-all hover:border-gold-ui/30 sr-hidden ${isVisible ? "sr-visible" : ""}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-ui/10 text-gold-ui mb-2.5">
                <step.icon className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-text-primary leading-tight">
                {step.title}
              </h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed line-clamp-2">
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
        <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-4">
          {BUDGET_BANDS.map((b, i) => (
            <Link
              key={b.label}
              to="/inventory"
              search={{ minPrice: b.min, maxPrice: b.max } as any}
              className={`group flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 sm:px-6 sm:py-5 transition-all hover:border-text-primary hover:shadow-lg sr-hidden ${isVisible ? "sr-visible" : ""}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div>
                <span className="relative block tabular font-bold text-xl sm:text-2xl text-text-primary">
                  {b.label}
                </span>
                <span className="relative mt-1 block text-xs sm:text-sm font-medium text-text-secondary">
                  {b.desc}
                </span>
              </div>
              <ArrowRight className="relative h-5 w-5 text-text-tertiary transition-all duration-300 group-hover:translate-x-1 group-hover:text-text-primary shrink-0 ml-2" />
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
      <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-champagne/[0.04] blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 md:grid-cols-2">
        <div className={`sr-left-hidden ${isVisible ? "sr-left-visible" : ""}`}>
          <SectionEyebrow>Sell your car</SectionEyebrow>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl text-white">
            A fair number, without the theatre.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-[1.6] text-white/80">
            Share a few details and we will call you back with a considered
            quote. If we buy your car, you get paid the same day.
          </p>
          <Link
            to="/sell-your-car"
            className="mt-10 inline-flex items-center gap-2.5 rounded-lg bg-gold-ui px-8 py-4 text-[15px] font-bold text-white transition-all duration-300 hover:shadow-2xl hover:shadow-gold-ui/25 btn-shine"
          >
            Get a quote
            <ArrowRight className="h-4 w-4" />
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
              className="flex items-start gap-5 border-t border-white/10 py-6"
            >
              <span className="tabular font-display text-3xl text-gold-display">
                0{i + 1}
              </span>
              <span className="mt-1.5 text-base leading-[1.6] text-white">{step}</span>
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
                      className="h-3.5 w-3.5 fill-gold-ui/80 text-gold-ui/80"
                    />
                  ))}
                </div>
                <blockquote className="mt-6 font-display text-lg leading-snug text-foreground/90">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-ui/10 font-display text-sm text-gold-ui">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gold-ui/70">
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
              className="group flex items-center gap-2.5 rounded-lg border border-border/40 px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-primary transition-all duration-300 hover:border-gold-ui/40 hover:text-gold-ui"
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
    <div className="text-[14px] font-bold text-text-secondary">
      {children}
    </div>
  );
}
