import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Star, Quote, Award, Sparkles } from "lucide-react";

import sedanImg from "@/assets/car-sedan-1.jpg";
import suvImg from "@/assets/car-suv-1.jpg";
import coupeImg from "@/assets/car-coupe-1.jpg";

export function DeliveryTestimonials() {
  const testimonials = useQuery(api.testimonials.list);

  // Fallback high-res delivery stories if DB is being seeded or empty
  const defaultDeliveries = [
    {
      _id: "del-1",
      client_name: "Vikram & Ananya R.",
      location: "Indiranagar, Bangalore",
      car_title: "Porsche 911 Carrera S (992)",
      review: "SHYN RIDE made purchasing my dream 911 smooth and unhurried. The 150-point inspection report gave us total peace of mind!",
      rating: 5,
      image_url: coupeImg,
      delivery_date: "July 2026",
    },
    {
      _id: "del-2",
      client_name: "Rohan & Sneha Kapoor",
      location: "UB City, Bangalore",
      car_title: "BMW M4 Competition Coupe",
      review: "Outstanding white-glove service. From home test drive to instant paperwork, the experience was truly VIP grade.",
      rating: 5,
      image_url: sedanImg,
      delivery_date: "June 2026",
    },
    {
      _id: "del-3",
      client_name: "Dr. Siddharth Nair",
      location: "Koramangala, Bangalore",
      car_title: "Mercedes-AMG G63 V8 Biturbo",
      review: "Mint condition vehicle, transparent history, and seamless delivery directly to my doorstep. Highly recommended!",
      rating: 5,
      image_url: suvImg,
      delivery_date: "May 2026",
    },
  ];

  const list = testimonials && testimonials.length > 0 ? testimonials : defaultDeliveries;

  return (
    <section className="py-14 sm:py-24 bg-card/20 relative overflow-hidden noise-overlay">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-champagne/30 bg-champagne/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-champagne mb-4">
            <Award className="h-3.5 w-3.5" /> Happy Luxury Car Deliveries
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Stories of <span className="text-gradient-gold">Excellence.</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            Real handover moments and short reviews from our esteemed pre-owned luxury car owners in Bangalore.
          </p>
        </div>

        <div className="mt-8 sm:mt-16 flex md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x scrollbar-hide pb-4 md:pb-0">
          {list.map((item) => (
            <div
              key={item._id}
              className="w-[75%] sm:w-[60%] md:w-auto shrink-0 snap-center group relative flex flex-col justify-between rounded-xl border border-border/40 bg-surface p-4 sm:p-6 transition-all duration-500 hover:border-gold-ui/40 shadow-sm"
            >
              <div>
                {/* Handover Picture */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surface mb-4 sm:mb-6">
                  <img
                    src={item.image_url}
                    alt={`${item.car_title} delivery`}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white/90">
                    <span className="font-semibold px-2 py-0.5 rounded glass bg-black/40 backdrop-blur-md text-[10px] sm:text-[11px] truncate max-w-[70%]">
                      {item.car_title}
                    </span>
                    {item.delivery_date && (
                      <span className="text-[10px] opacity-80 shrink-0">{item.delivery_date}</span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2.5">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-gold-ui text-gold-ui" />
                  ))}
                </div>

                {/* Two Line Review */}
                <p className="text-xs sm:text-sm italic text-foreground/90 leading-relaxed font-light line-clamp-2">
                  "{item.review}"
                </p>
              </div>

              {/* Client Info */}
              <div className="mt-4 border-t border-border/30 pt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-text-primary">{item.client_name}</div>
                  {item.location && (
                    <div className="text-[11px] text-muted-foreground">{item.location}</div>
                  )}
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-ui/10 text-gold-ui">
                  <Quote className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
