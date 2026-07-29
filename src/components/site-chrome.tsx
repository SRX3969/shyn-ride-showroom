import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Instagram, Phone, Mail, Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
      aria-label="Toggle theme"
    >
      <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-surface border-b border-border/60 shadow-sm transition-shadow duration-300"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4">
          <Link
            to="/"
            className="font-display text-xl tracking-tight transition-transform duration-300 hover:scale-105 min-h-[44px] flex items-center"
            onClick={() => setMobileOpen(false)}
          >
            SHYN <span className="text-gradient-gold">RIDE</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {[
              { to: "/inventory" as const, label: "Inventory" },
              { to: "/sell-your-car" as const, label: "Sell Your Car" },
              { to: "/about" as const, label: "About" },
              { to: "/faqs" as const, label: "FAQs" },
              { to: "/contact" as const, label: "Contact" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link font-medium transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/inventory"
              className="hidden rounded-md bg-gold-ui px-5 py-2.5 text-[14px] font-bold text-white transition-all duration-300 hover:bg-gold-ui/90 hover:shadow-lg hover:shadow-gold-ui/20 btn-shine md:block"
            >
              View Inventory
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="relative z-50 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-colors hover:bg-card md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <div className="relative h-5 w-5">
                <Menu
                  className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                    mobileOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                    mobileOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-surface/98 backdrop-blur-xl transition-all duration-500 md:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-7 px-6">
          {[
            { to: "/" as const, label: "Home" },
            { to: "/inventory" as const, label: "Inventory" },
            { to: "/sell-your-car" as const, label: "Sell Your Car" },
            { to: "/about" as const, label: "About" },
            { to: "/contact" as const, label: "Contact" },
          ].map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`font-display text-2xl text-foreground transition-all duration-500 hover:text-champagne py-1.5 min-h-[44px] flex items-center ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{
                transitionDelay: mobileOpen ? `${i * 80}ms` : "0ms",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export function Footer() {
  const settings = useQuery(api.settings.get);

  return (
    <footer className="border-t border-border/40 bg-card/30 noise-overlay">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">
            SHYN <span className="text-gradient-gold">RIDE</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A curated pre-owned luxury car showroom in Bangalore. Certified,
            transparent, unhurried.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-champagne hover:text-champagne hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="tel:+919902500649"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-champagne hover:text-champagne hover:scale-110"
              aria-label="Phone"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href="mailto:shreeram.prakasan23@gmail.com"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-champagne hover:text-champagne hover:scale-110"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-text-primary">
            Explore
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <Link
                to="/inventory"
                className="transition-colors duration-300 hover:text-foreground"
              >
                Inventory
              </Link>
            </li>
            <li>
              <Link
                to="/sell-your-car"
                className="transition-colors duration-300 hover:text-foreground"
              >
                Sell Your Car
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="transition-colors duration-300 hover:text-foreground"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/faqs"
                className="transition-colors duration-300 hover:text-foreground"
              >
                FAQs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-[15px] font-bold text-text-primary">
            Visit
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {settings?.address ? (
              settings.address.split("\n").map((line, i) => (
                <li key={`addr-${i}`}>{line}</li>
              ))
            ) : (
              <li>Bangalore, India</li>
            )}
            {settings?.workingHours ? (
              settings.workingHours.split("\n").map((line, i) => (
                <li key={`hour-${i}`}>{line}</li>
              ))
            ) : (
              <>
                <li>Mon – Sat, 10am – 8pm</li>
                <li>By appointment</li>
              </>
            )}
          </ul>
        </div>
        <div>
          <div className="text-[15px] font-bold text-text-primary">
            Reach us
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <a href="mailto:shreeram.prakasan23@gmail.com" className="hover:text-champagne transition-colors">
                shreeram.prakasan23@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+919902500649" className="hover:text-champagne transition-colors">
                {settings?.phone || "+91 99025 00649"}
              </a>
            </li>
            <li>
              <Link
                to="/contact"
                className="transition-colors duration-300 hover:text-foreground"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="hair mx-6" />
      <div className="border-t border-border/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} SHYN RIDE. All rights reserved.
          </span>
          <span className="font-medium tracking-wider">
            Powered BY <span className="text-champagne">SHYN</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
