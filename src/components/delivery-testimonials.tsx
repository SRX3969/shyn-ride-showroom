import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Star, Quote, Award, Sparkles } from "lucide-react";

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
      image_url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop",
      delivery_date: "July 2026",
    },
    {
      _id: "del-2",
      client_name: "Rohan & Sneha Kapoor",
      location: "UB City, Bangalore",
      car_title: "BMW M4 Competition Coupe",
      review: "Outstanding white-glove service. From home test drive to instant paperwork, the experience was truly VIP grade.",
      rating: 5,
      image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop",
      delivery_date: "June 2026",
    },
    {
      _id: "del-3",
      client_name: "Dr. Siddharth Nair",
      location: "Koramangala, Bangalore",
      car_title: "Mercedes-AMG G63 V8 Biturbo",
      review: "Mint condition vehicle, transparent history, and seamless delivery directly to my doorstep. Highly recommended!",
      rating: 5,
      image_url: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?q=80&w=1200&auto=format&fit=crop",
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

        <div className="mt-12 sm:mt-16 flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x scrollbar-hide pb-4 md:pb-0">
          {list.map((item) => (
            <div
              key={item._id}
              className="w-[88%] sm:w-[70%] md:w-auto shrink-0 snap-center group relative flex flex-col justify-between rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-gold-ui/50 hover:shadow-2xl hover:shadow-gold-ui/10"
            >
              <div>
                {/* Handover Picture */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface mb-6">
                  <img
                    src={item.image_url}
                    alt={`${item.car_title} delivery`}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                    <span className="font-semibold px-2.5 py-1 rounded-md glass bg-black/40 backdrop-blur-md text-[11px] truncate max-w-[70%]">
                      {item.car_title}
                    </span>
                    {item.delivery_date && (
                      <span className="text-[11px] opacity-80 shrink-0">{item.delivery_date}</span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold-ui text-gold-ui" />
                  ))}
                </div>

                {/* Two Line Review */}
                <p className="text-sm italic text-foreground/90 leading-relaxed font-light">
                  "{item.review}"
                </p>
              </div>

              {/* Client Info */}
              <div className="mt-6 border-t border-border/30 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-text-primary">{item.client_name}</div>
                  {item.location && (
                    <div className="text-xs text-muted-foreground">{item.location}</div>
                  )}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-ui/10 text-gold-ui">
                  <Quote className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
