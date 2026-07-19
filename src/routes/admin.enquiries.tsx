import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { MessageSquare, Car, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/enquiries")({
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  const enquiries = useQuery(api.enquiries.list);
  const updateStatus = useMutation(api.enquiries.updateStatus);
  const [filter, setFilter] = useState("all");

  if (enquiries === undefined) return <div className="p-8 text-muted-foreground animate-pulse">Loading enquiries...</div>;

  const filtered = enquiries.filter(e => {
    if (filter === "new") return e.status === "new";
    if (filter === "read") return e.status === "read";
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl">Enquiries</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage customer messages and leads.</p>
        </div>
        <div className="flex rounded-lg border border-border/20 bg-card/40 p-1">
          {["all", "new", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                filter === f
                  ? "bg-champagne text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((enquiry) => (
          <div key={enquiry._id} className={`flex flex-col justify-between rounded-xl border p-6 transition-colors ${
            enquiry.status === "new" ? "border-champagne/40 bg-champagne/5" : "border-border/20 bg-card/20"
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                  enquiry.type === "sell_request" 
                    ? "bg-emerald-deep/20 text-emerald-deep"
                    : enquiry.type === "car_enquiry"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-card text-muted-foreground"
                }`}>
                  {enquiry.type.replace("_", " ")}
                </span>
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(enquiry._creationTime).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-5">
                <div className="font-display text-xl">{enquiry.name}</div>
                <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                  <a href={`tel:${enquiry.phone}`} className="flex items-center gap-2 hover:text-champagne transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                    {enquiry.phone}
                  </a>
                  {enquiry.email && (
                    <a href={`mailto:${enquiry.email}`} className="flex items-center gap-2 hover:text-champagne transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                      {enquiry.email}
                    </a>
                  )}
                </div>
              </div>

              {enquiry.car_details && (
                <div className="mt-4 rounded-lg bg-background/50 p-3 text-sm">
                  <div className="flex items-center gap-2 text-champagne mb-1">
                    <Car className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Car Details</span>
                  </div>
                  {enquiry.car_details.car ? (
                    <div className="font-medium text-foreground">{enquiry.car_details.car}</div>
                  ) : (
                    <div className="font-medium text-foreground">
                      {enquiry.car_details.year} {enquiry.car_details.make} {enquiry.car_details.model} <span className="text-muted-foreground">({enquiry.car_details.km} km)</span>
                    </div>
                  )}
                </div>
              )}

              {enquiry.message && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Message</span>
                  </div>
                  <p className="text-sm italic text-foreground/80 leading-relaxed border-l-2 border-champagne/30 pl-3">
                    "{enquiry.message}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border/10 flex justify-end">
              {enquiry.status === "new" ? (
                <button
                  onClick={() => updateStatus({ id: enquiry._id, status: "read" })}
                  className="flex items-center gap-2 rounded-md bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-all hover:bg-card/80 hover:text-foreground"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as read
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">
                  <CheckCircle2 className="h-4 w-4" />
                  Read
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No enquiries found.
          </div>
        )}
      </div>
    </div>
  );
}
