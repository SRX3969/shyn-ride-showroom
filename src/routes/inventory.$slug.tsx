import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/site-chrome";
import { FloatingActions } from "@/components/floating-actions";
import { PageTransition, RevealSection } from "@/components/page-transition";
import { SkeletonLine } from "@/components/skeleton";
import { formatINR, formatKm } from "@/lib/format";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CarCard } from "@/components/car-card";
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
  MessageCircle,
  Tag,
  FileText,
  Heart,
  Key,
  ShieldCheck,
  FileCheck,
  X,
  Maximize2
} from "lucide-react";
import { SEO, getCarVehicleSchema } from "@/components/seo";
import { BookingModal } from "@/components/booking-modal";
import { getWhatsAppUrl } from "@/lib/whatsapp";
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
            <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="aspect-[16/9] animate-pulse rounded-2xl bg-card/40" />
                <div className="grid grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-card/30" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1 space-y-4">
                <SkeletonLine className="h-10 w-64" />
                <SkeletonLine className="h-6 w-32" />
                <SkeletonLine className="h-12 w-full mt-6" />
                <SkeletonLine className="h-12 w-full" />
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
      <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
        <Header />
        <CarDetailContent car={car} />
        <Footer />
        <FloatingActions hasStickyBottomBar hideWhatsApp />
      </div>
    </PageTransition>
  );
}

function CarDetailContent({ car }: { car: any }) {
  const [active, setActive] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isEnquiryDrawerOpen, setIsEnquiryDrawerOpen] = useState(false);

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const logAnalytics = useMutation(api.analytics.logEvent);

  useEffect(() => {
    try {
      logAnalytics({ event_type: "page_view", car_id: car._id, car_slug: car.slug });
    } catch (e) {}
  }, [car._id]);
  
  const relatedCars = useQuery(api.cars.getRelatedCars, { slug: car.slug, body_type: car.body_type });

  const img = car.images[active] ?? car.images[0];
  const title = `${car.year} ${car.make} ${car.model} ${car.variant || ""}`.trim();
  const isLimitedOffer = car.original_price && car.original_price > car.price_inr;

  useEffect(() => {
    const saved = localStorage.getItem(`wishlist_${car._id}`);
    if (saved === "true") {
      setIsWishlisted(true);
    }
  }, [car._id]);

  const toggleWishlist = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    if (next) {
      localStorage.setItem(`wishlist_${car._id}`, "true");
    } else {
      localStorage.removeItem(`wishlist_${car._id}`);
    }
  };

  const prev = () => setActive((v) => (v === 0 ? car.images.length - 1 : v - 1));
  const next = () => setActive((v) => (v === car.images.length - 1 ? 0 : v + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      next();
    } else if (distance < -50) {
      prev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Spec Grid (12 fields)
  const specGrid = [
    { label: "Make Year", value: String(car.year), icon: Calendar },
    { label: "Registration Year", value: String(car.reg_year || car.year), icon: Calendar },
    { label: "Ownership", value: `${car.owners} Owner${car.owners > 1 ? 's' : ''}`, icon: Users },
    { label: "Fuel Type", value: car.fuel_type, icon: Fuel },
    { label: "Kilometers Driven", value: formatKm(car.km), icon: Gauge },
    { label: "Registration State", value: car.reg_state || "Not Specified", icon: MapPin },
    { label: "Transmission", value: car.transmission, icon: Cog },
    { label: "Color", value: car.color, icon: Palette },
    { label: "Body Type", value: car.body_type, icon: Car },
    { label: "RC Status", value: car.rc_status || "Valid", icon: FileCheck },
    { label: "Insurance Validity", value: car.insurance_validity || "Not Specified", icon: ShieldCheck },
    { label: "Number of Keys", value: car.keys ? `${car.keys} ${car.keys === 1 ? 'Key' : 'Keys'}` : "Not Specified", icon: Key },
  ];

  // Special badges
  const specialBadges = [];
  if (car.owners === 1) specialBadges.push({ icon: Users, label: "Single Owner", desc: "Carefully maintained by a single owner." });
  if (car.km < 40000) specialBadges.push({ icon: Gauge, label: "Low Mileage", desc: "Driven significantly less than segment average." });
  if (car.featured) specialBadges.push({ icon: Tag, label: "Featured Listing", desc: "Handpicked by our experts for its exceptional quality." });
  specialBadges.push({ icon: ShieldCheck, label: "Certified Inspection Passed", desc: "Passed our rigorous 150-point quality check." });

  // WhatsApp predefined message
  const whatsappLink = getWhatsAppUrl("car", car);

  const scrollToEnquiry = () => {
    setShowEnquiry(true);
    setTimeout(() => {
      document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -110;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-6 md:py-10 relative">
      <SEO title={`${title} — SHYN RIDE`} description={`Explore this ${title} with ${formatKm(car.km)} driven. Certified and ready.`} jsonLd={getCarVehicleSchema(car)} />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} carId={car._id} carTitle={title} />
      
      <Link
        to="/inventory"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-champagne mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Inventory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        {/* Left Column - Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery - MEDIA FIRST ON BOTH MOBILE AND DESKTOP */}
          <div>
            <div 
              className="group relative aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-2xl bg-card cursor-pointer touch-pan-y shadow-xl border border-border/30"
              onClick={() => setShowLightbox(true)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {img && (
                <img
                  src={img.url}
                  alt={img.alt ?? `${title} — photo ${active + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              )}
              {/* Gradient overlay for badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-black/30 pointer-events-none" />
              
              {/* Expand Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                <div className="glass bg-background/50 backdrop-blur-md rounded-full p-4">
                  <Maximize2 className="h-6 w-6 text-white" />
                </div>
              </div>
              
              {/* Wishlist Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist();
                }}
                className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full glass bg-background/60 backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-md"
              >
                <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-white"}`} />
              </button>

              {/* Status badge */}
              {car.status !== "available" && (
                <div className="absolute left-4 top-4 z-10 rounded-lg glass bg-background/60 backdrop-blur-md px-4 py-2 text-[13px] font-bold text-text-primary">
                  {car.status}
                </div>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 glass bg-background/60 backdrop-blur-md rounded-lg px-3 py-1.5 text-[12px] font-bold text-white shadow-md">
                {active + 1} / {car.images.length}
              </div>

              {/* Nav arrows */}
              {car.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full glass bg-background/50 backdrop-blur-md text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-card/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full glass bg-background/50 backdrop-blur-md text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-card/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {car.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {car.images.map((im: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`shrink-0 h-20 md:h-24 aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                      i === active
                        ? "border-champagne shadow-md shadow-champagne/15 ring-1 ring-champagne/20 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={im.url}
                      alt=""
                      className="h-full w-full object-cover rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Title & Price Block (Immediately Below Media) */}
          <div className="block lg:hidden space-y-4 pt-1 pb-4 border-b border-border/30">
            <div>
              <h1 className="font-bold text-2xl leading-tight text-text-primary font-display">
                {car.year} {car.make} {car.model}
              </h1>
              {car.variant && (
                <div className="mt-1 text-sm font-medium text-text-secondary">
                  {car.variant}
                </div>
              )}
            </div>

            {/* Price & Badges */}
            <div className="flex items-center justify-between gap-2 bg-card/40 border border-border/30 p-3.5 rounded-xl">
              <div>
                {isLimitedOffer && (
                  <div className="flex items-center gap-2 text-xs text-text-tertiary line-through mb-0.5">
                    {formatINR(car.original_price)}
                    <span className="bg-red-600/10 text-red-500 text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-600/20">LIMITED OFFER</span>
                  </div>
                )}
                <div className="font-bold text-2.5xl text-gradient-gold font-display">
                  {formatINR(car.price_inr)}
                </div>
              </div>
              {car.price_negotiable && (
                <span className="rounded-md bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary border border-border">
                  Negotiable
                </span>
              )}
            </div>

            {/* Quick Spec Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px] font-medium text-text-secondary scrollbar-hide">
              <span className="bg-surface px-3 py-1.5 rounded-lg border border-border/50 shrink-0">{formatKm(car.km)}</span>
              <span className="bg-surface px-3 py-1.5 rounded-lg border border-border/50 capitalize shrink-0">{car.fuel_type}</span>
              <span className="bg-surface px-3 py-1.5 rounded-lg border border-border/50 capitalize shrink-0">{car.transmission}</span>
              <span className="bg-surface px-3 py-1.5 rounded-lg border border-border/50 uppercase shrink-0">{car.reg_state || "KA"}</span>
              <span className="bg-surface px-3 py-1.5 rounded-lg border border-border/50 shrink-0">{car.owners} Owner{car.owners > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Sticky Mobile Section Quick Nav Tabs */}
          <div className="sticky top-[60px] z-30 -mx-6 px-6 py-3 bg-background/90 backdrop-blur-xl border-y border-border/30 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: "overview", label: "Overview" },
              { id: "highlights", label: "Highlights" },
              { id: "history", label: "History" },
              { id: "features", label: "Features" },
              { id: "similar", label: "Similar" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gold-ui text-white shadow-md shadow-gold-ui/20"
                    : "bg-surface/80 text-text-secondary border border-border/40 hover:bg-card"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Spec Grid */}
          <RevealSection>
            <div id="overview" className="scroll-mt-36">
              <div className="text-[15px] font-bold text-text-secondary mb-4">Overview</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 rounded-2xl border border-border/20 bg-card/10 p-5 md:p-6">
                {specGrid.map((spec, i) => (
                  <div key={i} className="flex flex-col bg-surface/50 border border-border/30 rounded-xl p-3.5">
                    <span className="text-[11px] font-medium text-text-tertiary mb-1 flex items-center gap-1.5">
                      <spec.icon className="h-3.5 w-3.5 text-gold-ui" />
                      {spec.label}
                    </span>
                    <span className="text-[14px] font-semibold text-text-primary capitalize">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* Special About This Car */}
          {specialBadges.length > 0 && (
            <RevealSection>
              <div id="highlights" className="scroll-mt-36">
                <div className="text-[15px] font-bold text-text-secondary mb-4">Special About This Car</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {specialBadges.map((badge, i) => (
                    <div key={i} className="flex items-start gap-3.5 rounded-xl border border-border/20 bg-surface p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-ui/10 text-gold-ui">
                        <badge.icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">{badge.label}</div>
                        <div className="text-[12.5px] text-text-secondary mt-0.5 leading-snug">{badge.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          )}

          {/* Vehicle History Report Section */}
          <RevealSection>
            <div id="history" className="scroll-mt-36">
              <section className="rounded-2xl border border-border/20 bg-card/10 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <FileText className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-ui/10 text-gold-ui">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">Vehicle History Summary</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Verified and inspected by SHYN RIDE experts.</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-background rounded-xl p-4 border border-border/50">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Accident</div>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="mt-1.5 text-sm font-bold text-text-primary">None Reported</div>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border/50">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Service</div>
                        <FileCheck className="h-4 w-4 text-gold-ui" />
                      </div>
                      <div className="mt-1.5 text-sm font-bold text-text-primary">Auth. Dealer</div>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border/50">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Insurance</div>
                        <ShieldCheck className="h-4 w-4 text-text-tertiary" />
                      </div>
                      <div className="mt-1.5 text-sm font-bold text-text-primary">Not Specified</div>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border/50">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">RC Status</div>
                        <FileCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="mt-1.5 text-sm font-bold text-text-primary">Original / Valid</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </RevealSection>

          {/* Description */}
          {car.description && (
            <RevealSection>
              <div className="text-[15px] font-bold text-text-secondary mb-4">Description</div>
              <div className="text-sm leading-relaxed text-text-secondary max-w-[70ch] whitespace-pre-line bg-card/10 p-5 rounded-2xl border border-border/20">
                {car.description}
              </div>
            </RevealSection>
          )}

          {/* Features */}
          {car.features.length > 0 && (
            <RevealSection>
              <div id="features" className="scroll-mt-36">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[15px] font-bold text-text-secondary">Features & Equipment</div>
                  <span className="text-xs font-semibold text-text-tertiary">{car.features.length} Items</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(showAllFeatures ? car.features : car.features.slice(0, 8)).map((f: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-full border border-border/30 bg-surface px-3.5 py-1.5 text-xs font-medium text-text-primary"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold-ui" />
                      {f}
                    </div>
                  ))}
                </div>
                {car.features.length > 8 && (
                  <button
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-champagne hover:underline transition-all"
                  >
                    {showAllFeatures ? "Show Less" : `View All ${car.features.length} Features (+${car.features.length - 8} more)`}
                  </button>
                )}
              </div>
            </RevealSection>
          )}
          
          {/* Enquiry Form */}
          {showEnquiry && (
            <RevealSection>
              <div id="enquiry-form" className="scroll-mt-36">
                <EnquiryForm carId={car._id} carTitle={title} />
              </div>
            </RevealSection>
          )}
        </div>

        {/* Right Column - Sticky Rail (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28 bg-card/10 border border-border/20 rounded-2xl p-8 backdrop-blur-sm">
            <h1 className="font-bold text-3xl leading-tight text-text-primary font-display">
              {car.year} {car.make} {car.model}
            </h1>
            {car.variant && (
              <div className="mt-2 text-lg text-text-secondary">
                {car.variant}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2 text-[12px] font-medium text-text-secondary">
              <span className="bg-surface px-2.5 py-1 rounded-md border border-border/50">{formatKm(car.km)}</span>
              <span className="bg-surface px-2.5 py-1 rounded-md border border-border/50 capitalize">{car.fuel_type}</span>
              <span className="bg-surface px-2.5 py-1 rounded-md border border-border/50 capitalize">{car.transmission}</span>
              {car.reg_state && (
                <span className="bg-surface px-2.5 py-1 rounded-md border border-border/50 uppercase">{car.reg_state}</span>
              )}
            </div>

            <div className="mt-8 border-t border-border/20 pt-8">
              <div className="flex flex-col">
                {isLimitedOffer && (
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-text-tertiary line-through">
                      {formatINR(car.original_price)}
                    </span>
                    <span className="bg-red-600/10 text-red-500 border border-red-600/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Limited Offer
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="tabular font-bold text-4xl text-text-primary text-gradient-gold font-display">
                    {formatINR(car.price_inr)}
                  </div>
                  {car.price_negotiable && (
                    <div className="rounded-md bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary border border-border">
                      Negotiable
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={scrollToEnquiry}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-ui px-4 py-3.5 text-[14px] font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-gold-ui/20 btn-shine"
              >
                Enquire About This Car
              </button>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface border border-border/50 px-4 py-3.5 text-[14px] font-bold text-text-primary transition-all duration-300 hover:bg-card/80 hover:border-border"
              >
                Schedule a Test Drive
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 px-4 py-3.5 text-[14px] font-bold text-[#25D366] transition-all duration-300 hover:bg-[#25D366]/20"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-text-tertiary">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex items-center gap-2 text-sm hover:text-champagne transition-colors"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Cars */}
      {relatedCars && relatedCars.length > 0 && (
        <RevealSection>
          <div id="similar" className="mt-20 border-t border-border/20 pt-12 scroll-mt-36">
            <h2 className="font-display text-2xl md:text-3xl mb-6">Related <span className="text-gradient-gold">Cars.</span></h2>
            <div className="flex overflow-x-auto gap-5 pb-6 scrollbar-hide snap-x">
              {relatedCars.map((relatedCar) => (
                <div key={relatedCar._id} className="w-[280px] md:w-[350px] shrink-0 snap-start">
                  <CarCard car={relatedCar as any} />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* Mobile Bottom Sticky Bar - Non-overlapping sleek footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border/60 p-3.5 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] flex items-center justify-between slide-up-fade">
        <div>
          {isLimitedOffer && (
            <div className="text-[10px] font-medium text-text-tertiary line-through">
              {formatINR(car.original_price)}
            </div>
          )}
          <div className="font-bold text-lg text-gradient-gold font-display leading-tight">
            {formatINR(car.price_inr)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] active:scale-95 transition-transform"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <button
            onClick={() => setIsEnquiryDrawerOpen(true)}
            className="rounded-xl bg-gold-ui px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-gold-ui/20 active:scale-95 transition-transform btn-shine"
          >
            Enquire Now
          </button>
        </div>
      </div>

      {/* Mobile Enquiry Bottom Drawer */}
      {isEnquiryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t border-border/40 bg-surface p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-2">
              <div>
                <h3 className="font-bold text-lg text-text-primary font-display">Enquire About Vehicle</h3>
                <p className="text-xs text-text-secondary">{title}</p>
              </div>
              <button
                onClick={() => setIsEnquiryDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card/60 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <EnquiryForm carId={car._id} carTitle={title} />
          </div>
        </div>
      )}


      {/* Fullscreen Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in">
          <div className="absolute top-4 right-4 z-[110] flex gap-4">
            <div className="glass bg-white/10 text-white rounded-lg px-4 py-2 font-bold text-sm">
              {active + 1} / {car.images.length}
            </div>
            <button 
              onClick={() => setShowLightbox(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full glass bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div 
            className="flex-1 relative flex items-center justify-center p-4 md:p-12 touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              src={img?.url} 
              alt={img?.alt ?? "Fullscreen car view"} 
              onClick={() => setIsZoomed((v) => !v)}
              className={`max-h-full max-w-full object-contain select-none transition-transform duration-300 ${
                isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
              }`}
            />
            {car.images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full glass bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full glass bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          
          {/* Lightbox Thumbnails */}
          {car.images.length > 1 && (
            <div className="h-24 bg-black/50 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto px-4 py-2">
              {car.images.map((im: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`shrink-0 h-full aspect-[4/3] rounded border-2 transition-all ${
                    i === active ? "border-champagne opacity-100" : "border-transparent opacity-40 hover:opacity-100"
                  }`}
                >
                  <img src={im.url} alt="" className="w-full h-full object-cover rounded-sm" />
                </button>
              ))}
            </div>
          )}
        </div>
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
      <div className="mt-8 rounded-2xl border border-champagne/20 bg-card/20 p-8 text-center animate-fade-in-scale">
        <CheckCircle2 className="mx-auto h-10 w-10 text-champagne" />
        <div className="mt-4 font-display text-2xl">We'll be in touch.</div>
        <p className="mt-2 text-sm text-muted-foreground/70">
          Your enquiry for the {carTitle} has been received.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-8 space-y-4 rounded-2xl border border-border/20 bg-card/10 p-8 md:p-10"
      onSubmit={handleSubmit}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-champagne mb-6">
        Enquire about this car
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          className="md:col-span-2"
        />
      </div>
      <div className="mt-4">
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
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-champagne px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-champagne/20 btn-shine disabled:opacity-50"
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
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  inputMode?: "tel" | "email" | "text";
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
        className="mt-2 w-full rounded-xl border border-border/30 bg-card/30 px-4 py-3 text-sm text-foreground transition-all duration-300 focus:border-champagne/40 focus:outline-none"
      />
    </div>
  );
}
