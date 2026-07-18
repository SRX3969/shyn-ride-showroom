import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAdminCars } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/cars")({
  component: AdminCars,
  head: () => ({ meta: [{ title: "Cars — SHYN RIDE Admin" }, { name: "robots", content: "noindex" }] }),
});

function AdminCars() {
  const q = useQuery({ queryKey: ["admin-cars"], queryFn: () => listAdminCars() });
  return (
    <div className="p-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-champagne">Inventory</div>
          <h1 className="mt-3 font-display text-4xl">Cars.</h1>
        </div>
        <button
          disabled
          className="rounded-sm border border-champagne/50 px-4 py-2 text-xs uppercase tracking-widest text-champagne/70"
          title="CRUD forms coming next"
        >
          + Add car (soon)
        </button>
      </div>

      <div className="mt-10 overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Car</th>
              <th className="px-4 py-3 text-left">Year</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Featured</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {q.data?.map((c) => (
              <tr key={c.id} className="hover:bg-card/50">
                <td className="px-4 py-3 font-display">{c.make} {c.model}</td>
                <td className="px-4 py-3 tabular">{c.year}</td>
                <td className="px-4 py-3 tabular text-champagne">{formatINR(Number(c.price_inr))}</td>
                <td className="px-4 py-3 text-xs uppercase tracking-widest">{c.status}</td>
                <td className="px-4 py-3">{c.featured ? "★" : ""}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(c.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link to="/inventory/$slug" params={{ slug: c.slug }} className="text-xs text-champagne hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {q.data?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No cars yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
