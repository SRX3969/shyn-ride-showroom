import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAdminEnquiries } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  component: AdminEnquiries,
  head: () => ({ meta: [{ title: "Enquiries — SHYN RIDE Admin" }, { name: "robots", content: "noindex" }] }),
});

function AdminEnquiries() {
  const q = useQuery({ queryKey: ["admin-enquiries"], queryFn: () => listAdminEnquiries() });
  return (
    <div className="p-10">
      <div className="text-xs uppercase tracking-[0.3em] text-champagne">Leads</div>
      <h1 className="mt-3 font-display text-4xl">Enquiries.</h1>

      <div className="mt-10 space-y-4">
        {q.data?.map((e) => (
          <div key={e.id} className="border border-border p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-champagne">
                  {e.type.replace("_", " ")} · {e.status}
                </div>
                <div className="mt-2 font-display text-xl">{e.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {e.phone}{e.email ? ` · ${e.email}` : ""}
                </div>
              </div>
              <div className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">
                {new Date(e.created_at).toLocaleString()}
              </div>
            </div>
            {e.message && (
              <p className="mt-4 max-w-3xl whitespace-pre-line text-sm text-foreground/85">{e.message}</p>
            )}
            {e.car_details && Object.keys(e.car_details).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {Object.entries(e.car_details).map(([k, v]) => (
                  <span key={k} className="rounded-sm border border-border px-2 py-1">
                    <span className="uppercase tracking-widest">{k}:</span> {String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {q.data?.length === 0 && (
          <div className="border border-border p-10 text-center text-muted-foreground">
            No enquiries yet.
          </div>
        )}
      </div>
    </div>
  );
}
