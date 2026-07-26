import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatINR } from "@/lib/utils";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getSessionToken } from "@/lib/auth";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReportsPage,
});

const COLORS = ['#8C6329', '#A67C40', '#C09557', '#DAAE6E', '#F4C785'];

function AdminReportsPage() {
  const token = getSessionToken() || "";
  const analytics = useQuery(api.reports.getAnalytics, { token });
  const metrics = useQuery(api.analytics.getMetrics, { token });

  if (analytics === undefined || metrics === undefined) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-ui border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports & Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">Track live traffic, customer conversion metrics, and financial performance.</p>
      </div>

      {/* Live Web Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-text-tertiary">Total Vehicle Views</div>
          <div className="mt-2 text-2xl font-bold text-text-primary">{metrics.totalViews}</div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-text-tertiary">WhatsApp Clicks</div>
          <div className="mt-2 text-2xl font-bold text-[#25D366]">{metrics.totalWhatsappClicks}</div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-text-tertiary">Test Drive Bookings</div>
          <div className="mt-2 text-2xl font-bold text-gold-ui">{metrics.totalBookings}</div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-text-tertiary">Total CRM Leads</div>
          <div className="mt-2 text-2xl font-bold text-blue-400">{metrics.totalEnquiries}</div>
        </div>
      </div>

      {/* Financial Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">YTD Revenue</p>
              <h3 className="mt-2 text-3xl font-bold text-text-primary">{formatINR(analytics.ytd.revenue)}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-ui/10 text-gold-ui">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">YTD Profit</p>
              <h3 className={`mt-2 text-3xl font-bold ${analytics.ytd.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {analytics.ytd.profit >= 0 ? "+" : ""}{formatINR(analytics.ytd.profit)}
              </h3>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${analytics.ytd.profit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Avg Profit Margin</p>
              <h3 className="mt-2 text-3xl font-bold text-gold-ui">{analytics.ytd.margin.toFixed(1)}%</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-ui/10 text-gold-ui">
              <PieChart className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Viewed Cars Table */}
      {metrics.topCars && metrics.topCars.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-4">Top Viewed Luxury Vehicles</h2>
          <div className="divide-y divide-border/40">
            {metrics.topCars.map((car, idx) => (
              <div key={car.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gold-ui w-5">#{idx + 1}</span>
                  <div>
                    <div className="font-semibold text-sm text-text-primary">{car.title}</div>
                    <div className="text-xs text-text-tertiary">{formatINR(car.price_inr)}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-text-primary bg-background border border-border px-3 py-1 rounded-lg">
                  {car.views} Views
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
