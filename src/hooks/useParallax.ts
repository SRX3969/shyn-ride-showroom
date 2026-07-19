import { useEffect, useRef, useState } from "react";

export function useParallax(speed: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Only compute when element is in or near viewport
      if (rect.bottom < -200 || rect.top > windowHeight + 200) return;
      const center = rect.top + rect.height / 2;
      const viewCenter = windowHeight / 2;
      setOffset((center - viewCenter) * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, offset };
}
