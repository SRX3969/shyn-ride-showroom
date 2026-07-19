import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, CarFront, MessageSquare, LogOut, FileText, BarChart3, Settings } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { getSessionToken, clearSessionToken } from "@/lib/auth";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const token = getSessionToken();
      if (!token && location.pathname !== "/admin/login") {
        throw redirect({
          to: "/admin/login",
          search: { redirect: location.pathname },
        });
      }
    }
  },
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin — SHYN RIDE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminLayout() {
  const navigate = useNavigate();
  const logoutMutation = useMutation(api.admin.logout);

  const nav = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Inventory", to: "/admin/inventory", icon: CarFront },
    { label: "Sales Ledger", to: "/admin/ledger", icon: FileText },
    { label: "Reports", to: "/admin/reports", icon: BarChart3 },
    { label: "Enquiries", to: "/admin/enquiries", icon: MessageSquare },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    const token = getSessionToken();
    if (token) {
      try {
        await logoutMutation({ token });
      } catch (err) {
        console.error("Logout error", err);
      }
    }
    clearSessionToken();
    toast.success("Logged out successfully");
    navigate({ to: "/admin/login" });
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col md:flex-row bg-background text-foreground">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/20 bg-background/80 px-6 py-4 backdrop-blur-xl md:hidden">
          <Link to="/" className="text-xl font-bold tracking-tight text-text-primary">
            SHYN <span className="text-gold-ui">RIDE</span>
          </Link>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="shrink-0 text-text-tertiary transition-colors hover:text-gold-ui"
                activeProps={{ className: "text-gold-ui" }}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-border/20 bg-surface flex-col">
          <div className="p-6">
            <Link to="/" className="text-xl font-bold tracking-tight text-text-primary">
              SHYN <span className="text-gold-ui">RIDE</span>
            </Link>
            <div className="mt-1 text-[13px] font-semibold text-text-tertiary">
              Showroom Admin
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 px-4 py-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-medium text-text-secondary transition-all duration-200 hover:bg-border/50 hover:text-text-primary"
                activeProps={{
                  className: "bg-gold-ui/10 text-gold-ui hover:bg-gold-ui/15 hover:text-gold-ui",
                }}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border/20">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-medium text-text-secondary transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 w-full overflow-x-hidden min-h-screen">
          <Outlet />
        </main>
      </div>
    </PageTransition>
  );
}
