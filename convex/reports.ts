import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

export const getLedger = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    // Only return cars that have purchase_price OR are sold
    const cars = await ctx.db.query("cars")
      .filter((q) => q.neq(q.field("is_deleted"), true))
      .collect();

    const ledgerItems = cars
      .filter(c => c.purchase_price || c.status === "sold")
      .map(c => {
        const cost = c.purchase_price || 0;
        const revenue = c.sold_price || 0;
        const profit = c.status === "sold" ? revenue - cost : 0;
        const margin = c.status === "sold" && revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          id: c._id,
          make: c.make,
          model: c.model,
          year: c.year,
          status: c.status,
          purchase_date: c.purchase_date,
          sold_date: c.sold_date,
          purchase_price: cost,
          sold_price: revenue,
          profit,
          margin,
          source: c.purchase_source,
        };
      })
      .sort((a, b) => {
        // Sort by sold date desc, then purchase date desc
        const aDate = a.sold_date ? new Date(a.sold_date).getTime() : a.purchase_date ? new Date(a.purchase_date).getTime() : 0;
        const bDate = b.sold_date ? new Date(b.sold_date).getTime() : b.purchase_date ? new Date(b.purchase_date).getTime() : 0;
        return bDate - aDate;
      });

    return ledgerItems;
  }
});

export const getAnalytics = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const cars = await ctx.db.query("cars")
      .filter((q) => q.neq(q.field("is_deleted"), true))
      .collect();

    const soldCars = cars.filter(c => c.status === "sold" && c.sold_date);

    // Group by make for popular makes
    const makesCount: Record<string, number> = {};
    for (const c of soldCars) {
      makesCount[c.make] = (makesCount[c.make] || 0) + 1;
    }
    const popularMakes = Object.entries(makesCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Financial totals (YTD)
    const currentYear = new Date().getFullYear();
    const ytdSold = soldCars.filter(c => new Date(c.sold_date!).getFullYear() === currentYear);
    
    let ytdRevenue = 0;
    let ytdCost = 0;
    for (const c of ytdSold) {
      ytdRevenue += c.sold_price || 0;
      ytdCost += c.purchase_price || 0;
    }
    const ytdProfit = ytdRevenue - ytdCost;

    return {
      popularMakes,
      ytd: {
        revenue: ytdRevenue,
        cost: ytdCost,
        profit: ytdProfit,
        margin: ytdRevenue > 0 ? (ytdProfit / ytdRevenue) * 100 : 0
      }
    };
  }
});
