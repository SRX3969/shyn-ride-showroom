import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatINR } from "@/lib/utils";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReportsPage,
});

const COLORS = ['#8C6329', '#A67C40', '#C09557', '#DAAE6E', '#F4C785'];

function AdminReportsPage() {
  const analytics = useQuery(api.reports.getAnalytics);

  if (analytics === undefined) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-ui border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-text-secondary">Year-to-date performance and insights.</p>
      </div>

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
              <p className="text-sm font-medium text-text-secondary">Avg Margin</p>
              <h3 className="mt-2 text-3xl font-bold text-gold-ui">{analytics.ytd.margin.toFixed(1)}%</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-ui/10 text-gold-ui">
              <PieChart className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold text-text-primary mb-6">Popular Makes (All Time)</h2>
          <div className="flex-1">
            {analytics.popularMakes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                <BarChart3 className="h-12 w-12 mb-3 opacity-20" />
                <p>No sales data to generate charts.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={analytics.popularMakes}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.popularMakes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#17181B', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#E4BE85' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
