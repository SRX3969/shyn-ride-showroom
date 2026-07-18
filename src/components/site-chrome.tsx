import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-display text-xl tracking-tight">
          SHYN <span className="text-champagne">RIDE</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/inventory" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Inventory
          </Link>
          <Link to="/sell-your-car" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Sell Your Car
          </Link>
          <Link to="/about" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            About
          </Link>
          <Link to="/faqs" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            FAQs
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <Link
              to="/admin"
              className="rounded-sm border border-champagne/40 px-4 py-2 text-xs uppercase tracking-widest text-champagne transition-colors hover:bg-champagne hover:text-primary-foreground"
            >
              Admin
            </Link>
          ) : (
            <Link
              to="/inventory"
              className="rounded-sm bg-champagne px-4 py-2 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-champagne/90"
            >
              View Inventory
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">
            SHYN <span className="text-champagne">RIDE</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A curated pre-owned luxury car showroom in Bangalore. Certified, transparent, unhurried.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-champagne">Explore</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/inventory" className="hover:text-foreground">Inventory</Link></li>
            <li><Link to="/sell-your-car" className="hover:text-foreground">Sell Your Car</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/faqs" className="hover:text-foreground">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-champagne">Visit</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Bangalore, India</li>
            <li>Mon – Sat, 10am – 8pm</li>
            <li>By appointment</li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-champagne">Reach us</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>hello@shynride.example</li>
            <li>+91 00000 00000</li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} SHYN RIDE. All rights reserved.</span>
          <span className="tracking-widest">Bangalore</span>
        </div>
      </div>
    </footer>
  );
}
