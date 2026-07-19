import { useEffect, useRef, useState } from "react";

export function useCountUp(
  end: number,
  options: { duration?: number; startOnView?: boolean } = {},
) {
  const { duration = 2000, startOnView = true } = options;
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!startOnView) {
      animateCount();
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          animateCount();
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration, startOnView]);

  function animateCount() {
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  return { ref, value };
}

export function useCountUpString(
  display: string,
  options: { duration?: number } = {},
) {
  // Extract numeric part from strings like "300+", "98%", "0.4%"
  const match = display.match(/^([\d.]+)/);
  const numericEnd = match ? parseFloat(match[1]) : 0;
  const suffix = display.replace(/^[\d.]+/, "");
  const isDecimal = display.includes(".");

  const { ref, value } = useCountUp(
    isDecimal ? Math.round(numericEnd * 10) : numericEnd,
    options,
  );

  const displayValue = isDecimal ? (value / 10).toFixed(1) : String(value);

  return { ref, displayValue: displayValue + suffix };
}
