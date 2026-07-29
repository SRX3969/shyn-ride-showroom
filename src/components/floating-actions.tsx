import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle, MapPin } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { WHATSAPP_NUMBER, getWhatsAppUrl } from "../lib/whatsapp";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const logAnalytics = useMutation(api.analytics.logEvent);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleWhatsAppClick = () => {
    try {
      logAnalytics({ event_type: "whatsapp_click", metadata: "floating_widget" });
    } catch (e) {
      // ignore offline/uncaught
    }
  };

  const whatsappUrl = getWhatsAppUrl("general");
  const mapsUrl = "https://www.google.com/maps/dir/?api=1&destination=SHYN+RIDE+Bangalore+Karnataka+India";

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-center gap-2.5">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/40 bg-surface/90 text-muted-foreground backdrop-blur-md transition-all duration-500 hover:border-champagne hover:text-champagne hover:shadow-lg ${
          showTop
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-90 opacity-0 pointer-events-none"
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      {/* Navigate to Showroom */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Navigate to Showroom"
        className="group flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gold-ui/30 bg-surface/90 text-gold-ui shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-gold-ui hover:bg-gold-ui hover:text-white"
        title="Get Showroom Directions"
      >
        <MapPin className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
      </a>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        aria-label="Chat on WhatsApp"
        className="group relative flex h-12 w-12 sm:h-14 sm:w-14 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#25D366]/40"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-500"></span>
        </span>
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:scale-110" />
      </a>
    </div>
  );
}
