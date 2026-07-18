import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAdminDashboard, isAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminIndex,
  head: () => ({ meta: [{ title: "Dashboard — SHYN RIDE Admin" }, { name: "robots", content: "noindex" }] }),
});

function AdminIndex() {
  const navigate = useNavigate();
  const adminCheck = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdmin() });
  const dash = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getAdminDashboard(),
    enabled: adminCheck.data?.isAdmin === true,
  });

  useEffect(() => {
    if (adminCheck.data && !adminCheck.data.isAdmin) {
      // Not an admin — bounce.
    }
  }, [adminCheck.data]);

  if (adminCheck.isLoading) {
    return <div className="p-10 text-muted-foreground">Loading…</div>;
  }
  if (adminCheck.data && !adminCheck.data.isAdmin) {
    return (
      <div className="mx-auto max-w-lg p-16 text-center">
        <div className="font-display text-3xl">Not authorized.</div>
        <p className="mt-4 text-sm text-muted-foreground">
          Your account is not an admin. Ask a workspace admin to grant you the <code>admin</code> role in the <code>user_roles</code> table.
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-8 rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-widest"
        >
          Back to site
        </button>
      </div>
    );
  }

  const d = dash.data;
  return (
    <div className="p-10">
      <div className="text-xs uppercase tracking-[0.3em] text-champagne">Overview</div>
      <h1 className="mt-3 font-display text-4xl">Dashboard.</h1>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total cars" value={d?.totalCars ?? "—"} />
        <Stat label="Sold" value={d?.soldThisMonth ?? "—"} />
        <Stat label="New enquiries · 7d" value={d?.newEnquiries ?? "—"} />
        <Stat label="Open enquiries" value={d?.pendingSellRequests ?? "—"} />
      </div>

      <div className="mt-14">
        <div className="text-xs uppercase tracking-widest text-champagne">Recent enquiries</div>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {(d?.recent ?? []).map((e: any) => (
            <div key={e.id} className="flex items-start justify-between gap-6 py-4">
              <div>
                <div className="font-display text-lg">{e.name}</div>
                <div className="text-xs text-muted-foreground">{e.phone} · {e.type.replace("_", " ")}</div>
                {e.message && <div className="mt-2 max-w-xl text-sm text-foreground/80">{e.message}</div>}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {new Date(e.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          {(!d?.recent || d.recent.length === 0) && (
            <div className="py-8 text-sm text-muted-foreground">No enquiries yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-border p-6">
      <div className="tabular font-display text-3xl text-champagne">{value}</div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
