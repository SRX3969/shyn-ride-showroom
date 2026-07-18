import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={`block border-l-2 px-4 py-3 text-sm transition-colors ${
        pathname === to || (to !== "/admin" && pathname.startsWith(to))
          ? "border-champagne bg-card text-foreground"
          : "border-transparent text-muted-foreground hover:border-champagne/40 hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-border">
        <div className="border-b border-border px-6 py-6">
          <Link to="/" className="font-display text-lg">
            SHYN <span className="text-champagne">RIDE</span>
          </Link>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Admin</div>
        </div>
        <nav className="mt-6">
          <NavLink to="/admin" label="Dashboard" />
          <NavLink to="/admin/cars" label="Cars" />
          <NavLink to="/admin/enquiries" label="Enquiries" />
        </nav>
        <div className="mt-auto p-4">
          <button
            onClick={signOut}
            className="w-full rounded-sm border border-border px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:border-champagne hover:text-champagne"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
