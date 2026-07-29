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
  const updateLead = useMutation(api.enquiries.updateLead);
  const [filter, setFilter] = useState("all");

  if (enquiries === undefined) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-ui border-t-transparent" />
    </div>
  );

  const filtered = enquiries.filter(e => {
    if (filter === "all") return true;
    if (filter === "new") return e.status === "new";
    if (filter === "contacted") return e.status === "contacted";
    if (filter === "booking") return e.type === "booking" || e.source?.includes("booking");
    if (filter === "sell") return e.type === "sell_request";
    return true;
  });

  const handleStatusChange = (id: any, newStatus: string) => {
    updateLead({ token, id, status: newStatus });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Lead Management CRM</h1>
          <p className="mt-1 text-sm text-text-secondary">Track, contact, and close inquiries from all channels.</p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
          {[
            { id: "all", label: "All Leads" },
            { id: "new", label: "New" },
            { id: "contacted", label: "Contacted" },
            { id: "booking", label: "Bookings" },
            { id: "sell", label: "Sell Inquiries" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.id
                  ? "bg-gold-ui text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 block md:hidden rounded-lg bg-gold-ui/10 border border-gold-ui/20 p-2.5 text-center text-xs font-semibold text-gold-ui">
        💡 Mobile Quick Actions: Swipe right to Call client, swipe left to Mark Contacted!
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((enquiry) => (
          <EnquiryCard
            key={enquiry._id}
            enquiry={enquiry}
            handleStatusChange={handleStatusChange}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-surface rounded-2xl border border-border">
            <MessageSquare className="h-12 w-12 text-border mx-auto mb-3" />
            <p className="text-text-primary font-medium">No leads found in this view.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EnquiryCard({
  enquiry,
  handleStatusChange,
}: {
  enquiry: any;
  handleStatusChange: (id: any, status: string) => void;
}) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const cleanPhone = enquiry.phone.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hi ${enquiry.name}, thank you for contacting SHYN RIDE luxury pre-owned showroom.`)}`;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      const currentX = e.touches[0].clientX;
      const diff = currentX - touchStartX;
      setSwipeOffset(diff);
      setTouchEndX(currentX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const diff = touchEndX - touchStartX;
      if (diff > 80) {
        // Swipe Right -> Call client
        window.location.href = `tel:${enquiry.phone}`;
      } else if (diff < -80) {
        // Swipe Left -> Mark contacted
        handleStatusChange(enquiry._id, "contacted");
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
    setSwipeOffset(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${swipeOffset * 0.3}px)`,
        transition: swipeOffset === 0 ? "transform 0.3s ease" : "none",
      }}
      className={`flex flex-col justify-between rounded-2xl border p-6 transition-all shadow-md relative overflow-hidden select-none ${
        enquiry.status === "new" ? "border-gold-ui/50 bg-gold-ui/5" : "border-border bg-surface"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-background border border-border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold-ui">
              {enquiry.source || enquiry.type}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
              enquiry.status === "new" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
            }`}>
              {enquiry.status}
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(enquiry._creationTime, { addSuffix: true })}
          </span>
        </div>

        <div className="mt-4">
          <div className="text-lg font-bold text-text-primary">{enquiry.name}</div>
          <div className="mt-2 flex flex-col gap-1.5 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gold-ui" />
              <span>{enquiry.phone}</span>
            </div>
            {enquiry.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gold-ui" />
                <span className="truncate">{enquiry.email}</span>
              </div>
            )}
          </div>
        </div>

        {enquiry.car_details && (
          <div className="mt-4 rounded-xl bg-background border border-border/50 p-3 text-xs">
            <div className="flex items-center gap-1.5 text-gold-ui font-bold mb-1">
              <Car className="h-3.5 w-3.5" /> Vehicle Reference
            </div>
            <div className="font-medium text-text-primary">
              {enquiry.car_details.title || enquiry.car_details.car || `${enquiry.car_details.year || ""} ${enquiry.car_details.make || ""} ${enquiry.car_details.model || ""}`.trim()}
            </div>
          </div>
        )}

        {enquiry.message && (
          <div className="mt-3 text-xs text-text-secondary bg-background/60 rounded-lg p-2.5 italic border border-border/30">
            "{enquiry.message}"
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-border/50 pt-4 flex flex-col gap-3">
        {/* Direct Action Row */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 rounded-lg bg-[#25D366]/10 py-2 text-xs font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
          </a>
          <a
            href={`tel:${enquiry.phone}`}
            className="flex items-center justify-center gap-1 rounded-lg bg-blue-500/10 py-2 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          {enquiry.email ? (
            <a
              href={`mailto:${enquiry.email}`}
              className="flex items-center justify-center gap-1 rounded-lg bg-amber-500/10 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          ) : (
            <div className="flex items-center justify-center rounded-lg bg-card/20 py-2 text-xs text-text-tertiary">
              No Email
            </div>
          )}
        </div>

        {/* Pipeline Status Selector */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-semibold uppercase text-text-tertiary">Status</span>
          <select
            value={enquiry.status}
            onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
            className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-text-primary focus:border-gold-ui focus:outline-none"
          >
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="scheduled">Test Drive Scheduled</option>
            <option value="won">Closed Won</option>
            <option value="lost">Closed Lost</option>
          </select>
        </div>
      </div>
    </div>
  );
}
