import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, CarFront, MessageSquare, LogOut } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin — SHYN RIDE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminLayout() {
  const nav = [
    { label: "Inventory", to: "/admin/inventory", icon: CarFront },
    { label: "Enquiries", to: "/admin/enquiries", icon: MessageSquare },
  ];

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col md:flex-row bg-background text-foreground">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/20 bg-background/80 px-6 py-4 backdrop-blur-xl md:hidden">
          <Link to="/" className="font-display text-xl tracking-tight">
            SHYN <span className="text-gradient-gold">RIDE</span>
          </Link>
          <div className="flex gap-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted-foreground transition-colors hover:text-champagne"
                activeProps={{ className: "text-champagne" }}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-border/20 bg-card/10 flex-col">
          <div className="p-6">
            <Link to="/" className="font-display text-xl tracking-tight">
              SHYN <span className="text-gradient-gold">RIDE</span>
            </Link>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Showroom Admin
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 px-4 py-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-champagne/5 hover:text-foreground"
                activeProps={{
                  className: "bg-champagne/10 text-champagne hover:bg-champagne/15 hover:text-champagne",
                }}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border/20">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4.5 w-4.5" />
              Exit to site
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </PageTransition>
  );
}
