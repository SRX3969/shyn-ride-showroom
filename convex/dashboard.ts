import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";
import { subMonths, startOfMonth, endOfMonth, subWeeks } from "date-fns";

export const getStats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const allCars = await ctx.db.query("cars").filter((q) => q.neq(q.field("is_deleted"), true)).collect();
    const allEnquiries = await ctx.db.query("enquiries").collect();

    // In Stock
    const inStock = allCars.filter(c => c.status === "available" || c.status === "draft");

    // Sold this month
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now).getTime();
    const soldThisMonth = allCars.filter(c => 
      c.status === "sold" && 
      c.sold_date && 
      new Date(c.sold_date).getTime() >= startOfCurrentMonth
    );

    const soldThisMonthValue = soldThisMonth.reduce((sum, c) => sum + (c.sold_price || c.price_inr || 0), 0);

    // New Enquiries this week
    const oneWeekAgo = subWeeks(now, 1).getTime();
    const newEnquiriesThisWeek = allEnquiries.filter(e => 
      e._creationTime >= oneWeekAgo
    );

    // Avg Days to sell (all time)
    const soldCars = allCars.filter(c => c.status === "sold" && c.purchase_date && c.sold_date);
    let avgDaysToSell = 0;
    if (soldCars.length > 0) {
      const totalDays = soldCars.reduce((sum, c) => {
        const pDate = new Date(c.purchase_date!).getTime();
        const sDate = new Date(c.sold_date!).getTime();
        return sum + (sDate - pDate) / (1000 * 60 * 60 * 24);
      }, 0);
      avgDaysToSell = Math.round(totalDays / soldCars.length);
    }

    // Revenue Chart Data (Last 6 months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate).getTime();
      const end = endOfMonth(monthDate).getTime();
      
      const salesInMonth = allCars.filter(c => 
        c.status === "sold" && 
        c.sold_date && 
        new Date(c.sold_date).getTime() >= start &&
        new Date(c.sold_date).getTime() <= end
      );

      const rev = salesInMonth.reduce((sum, c) => sum + (c.sold_price || c.price_inr || 0), 0);
      
      revenueData.push({
        name: monthDate.toLocaleString('default', { month: 'short' }),
        revenue: rev
      });
    }

    // Needs attention (Listed > 45 days, 0 enquiries)
    const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).getTime();
    const needsAttention = allCars.filter(c => {
      if (c.status !== "available") return false;
      const listedDate = c._creationTime;
      if (listedDate > fortyFiveDaysAgo) return false;
      
      // Check enquiries for this car
      const hasEnquiries = allEnquiries.some(e => e.car_id === c._id);
      return !hasEnquiries;
    });

    return {
      inStock: inStock.length,
      soldThisMonth: { count: soldThisMonth.length, value: soldThisMonthValue },
      newEnquiriesThisWeek: newEnquiriesThisWeek.length,
      avgDaysToSell,
      revenueData,
      needsAttention: needsAttention.map(c => ({
        id: c._id,
        make: c.make,
        model: c.model,
        daysListed: Math.round((now.getTime() - c._creationTime) / (1000 * 60 * 60 * 24))
      }))
    };
  }
});

export const getRecentActivity = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db
      .query("activity_logs")
      .order("desc")
      .take(10);
  }
});
