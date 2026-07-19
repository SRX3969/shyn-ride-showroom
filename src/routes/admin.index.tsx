import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatINR } from "@/lib/utils";
import { 
  CarFront, 
  CircleDollarSign, 
  MessageSquare, 
  Timer,
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useQuery(api.dashboard.getStats);
  const activity = useQuery(api.dashboard.getRecentActivity);

  if (stats === undefined || activity === undefined) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-ui border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Cars in Stock",
      value: stats.inStock.toString(),
      icon: CarFront,
      trend: null,
    },
    {
      title: "Sold This Month",
      value: `${stats.soldThisMonth.count} (${formatINR(stats.soldThisMonth.value)})`,
      icon: CircleDollarSign,
      trend: null,
    },
    {
      title: "New Enquiries",
      value: stats.newEnquiriesThisWeek.toString(),
      subtext: "This week",
      icon: MessageSquare,
      trend: null,
    },
    {
      title: "Avg Days to Sell",
      value: stats.avgDaysToSell > 0 ? stats.avgDaysToSell.toString() : "N/A",
      icon: Timer,
      trend: null,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Overview of your showroom's performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{stat.title}</p>
                <h3 className="mt-2 text-2xl font-bold text-text-primary">{stat.value}</h3>
                {stat.subtext && (
                  <p className="mt-1 text-xs text-text-tertiary">{stat.subtext}</p>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-ui/10 text-gold-ui">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gold-ui" />
              Revenue (Last 6 Months)
            </h2>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            {stats.revenueData.every((d: any) => d.revenue === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
                <CircleDollarSign className="h-12 w-12 mb-3 opacity-20" />
                <p>No sales data recorded yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 12 }}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#17181B', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#E4BE85' }}
                    formatter={(val: number) => [formatINR(val), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#8C6329" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Needs Attention */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Needs Attention
            </h2>
            <div className="space-y-4">
              {stats.needsAttention.length === 0 ? (
                <p className="text-sm text-text-tertiary">All listings are performing well.</p>
              ) : (
                stats.needsAttention.map((car: any) => (
                  <div key={car.id} className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{car.make} {car.model}</p>
                      <p className="text-xs text-text-secondary mt-1">Listed for {car.daysListed} days • 0 enquiries</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-gold-ui" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {activity.length === 0 ? (
                <p className="text-sm text-text-tertiary">No recent activity.</p>
              ) : (
                activity.map((log: any) => (
                  <div key={log._id} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-gold-ui shrink-0" />
                    <div>
                      <p className="text-sm text-text-primary">
                        <span className="font-medium text-gold-ui">{log.admin_user}</span> {log.action} {log.entity}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        {formatDistanceToNow(log._creationTime, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
