import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        href="https://wa.me/910000000000?text=Hi%2C%20I%27m%20interested%20in%20a%20car%20from%20SHYN%20RIDE"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40"
      >
        <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
      </a>
    </div>
  );
}
