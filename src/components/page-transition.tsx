import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { ReactNode } from "react";

/**
 * Wraps page content with a fade-in entrance animation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div
      className="animate-fade-in"
      style={{ animationDuration: "500ms" }}
    >
      {children}
    </div>
  );
}

/**
 * Section wrapper that fades-in on scroll.
 */
export function RevealSection({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right" | "scale";
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const hiddenClass =
    direction === "left"
      ? "sr-left-hidden"
      : direction === "right"
        ? "sr-right-hidden"
        : direction === "scale"
          ? "sr-scale-hidden"
          : "sr-hidden";

  const visibleClass =
    direction === "left"
      ? "sr-left-visible"
      : direction === "right"
        ? "sr-right-visible"
        : direction === "scale"
          ? "sr-scale-visible"
          : "sr-visible";

  return (
    <div
      ref={ref}
      className={`${hiddenClass} ${isVisible ? visibleClass : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
