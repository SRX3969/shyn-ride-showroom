import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { MessageSquare, Car, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getSessionToken } from "@/lib/auth";

export const Route = createFileRoute("/admin/enquiries")({
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  const token = getSessionToken() || "";
  const enquiries = useQuery(api.enquiries.list, { token });
  const updateStatus = useMutation(api.enquiries.updateStatus);
  const [filter, setFilter] = useState("all");

  if (enquiries === undefined) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-ui border-t-transparent" />
    </div>
  );

  const filtered = enquiries.filter(e => {
    if (filter === "new") return e.status === "new";
    if (filter === "read") return e.status === "read";
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Enquiries</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage customer messages and leads.</p>
        </div>
        <div className="flex rounded-lg border border-border bg-surface p-1">
          {["all", "new", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-gold-ui/10 text-gold-ui"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((enquiry) => (
          <div key={enquiry._id} className={`flex flex-col justify-between rounded-2xl border p-6 transition-colors shadow-sm ${
            enquiry.status === "new" ? "border-gold-ui/40 bg-gold-ui/5" : "border-border bg-surface"
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  enquiry.type === "sell_request" 
                    ? "bg-emerald-500/10 text-emerald-500"
                    : enquiry.type === "car_enquiry"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-background border border-border text-text-secondary"
                }`}>
                  {enquiry.type.replace("_", " ")}
                </span>
                <span className="text-xs text-text-tertiary flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(enquiry._creationTime, { addSuffix: true })}
                </span>
              </div>

              <div className="mt-5">
                <div className="text-xl font-bold text-text-primary">{enquiry.name}</div>
                <div className="mt-3 flex flex-col gap-2 text-sm text-text-secondary">
                  <a href={`tel:${enquiry.phone}`} className="flex items-center gap-2 hover:text-gold-ui transition-colors w-fit">
                    <Phone className="h-4 w-4" />
                    {enquiry.phone}
                  </a>
                  {enquiry.email && (
                    <a href={`mailto:${enquiry.email}`} className="flex items-center gap-2 hover:text-gold-ui transition-colors w-fit">
                      <Mail className="h-4 w-4" />
                      {enquiry.email}
                    </a>
                  )}
                </div>
              </div>

              {enquiry.car_details && (
                <div className="mt-4 rounded-xl bg-background border border-border/50 p-3 text-sm">
                  <div className="flex items-center gap-2 text-gold-ui mb-1.5">
                    <Car className="h-4 w-4" />
                    <span className="text-xs font-semibold">Car Details</span>
                  </div>
                  {enquiry.car_details.car ? (
                    <div className="font-medium text-text-primary">{enquiry.car_details.car}</div>
                  ) : (
                    <div className="font-medium text-text-primary">
                      {enquiry.car_details.year} {enquiry.car_details.make} {enquiry.car_details.model} <span className="text-text-tertiary font-normal">({enquiry.car_details.km} km)</span>
                    </div>
                  )}
                </div>
              )}

              {enquiry.message && (
                <div className="mt-4 text-sm text-text-secondary bg-background/50 rounded-lg p-3 italic">
                  "{enquiry.message}"
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
              <span className={`text-xs font-semibold uppercase ${
                enquiry.status === "new" ? "text-gold-ui" : "text-text-tertiary"
              }`}>
                {enquiry.status}
              </span>
              {enquiry.status === "new" && (
                <button
                  onClick={() => updateStatus({ token, id: enquiry._id, status: "read" })}
                  className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-gold-ui transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  MARK AS READ
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-surface rounded-2xl border border-border">
            <MessageSquare className="h-12 w-12 text-border mx-auto mb-3" />
            <p className="text-text-primary font-medium">No {filter !== "all" ? filter : ""} enquiries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
