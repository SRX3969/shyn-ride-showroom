import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { WHATSAPP_NUMBER, getWhatsAppUrl } from "../lib/whatsapp";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const logAnalytics = useMutation(api.analytics.logEvent);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-card/80 text-muted-foreground backdrop-blur-md transition-all duration-500 hover:border-champagne hover:text-champagne hover:shadow-lg hover:shadow-champagne/10 ${
          showTop
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-90 opacity-0 pointer-events-none"
        }`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </span>
        <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
      </a>
    </div>
  );
}
