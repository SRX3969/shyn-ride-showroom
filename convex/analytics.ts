import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

export const logEvent = mutation({
  args: {
    event_type: v.string(), // "page_view" | "whatsapp_click" | "call_click" | "booking_click" | "sell_click"
    car_id: v.optional(v.id("cars")),
    car_slug: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analytics_events", {
      event_type: args.event_type,
      car_id: args.car_id,
      car_slug: args.car_slug,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
    return { ok: true };
  },
});

export const getMetrics = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);

    const allEvents = await ctx.db.query("analytics_events").collect();
    const cars = await ctx.db.query("cars").filter((q) => q.eq(q.field("is_deleted"), undefined)).collect();
    const enquiries = await ctx.db.query("enquiries").collect();

    // Aggregates
    let totalViews = 0;
    let totalWhatsappClicks = 0;
    let totalCalls = 0;
    let totalBookings = 0;

    const carViewsMap: Record<string, number> = {};

    allEvents.forEach((ev) => {
      if (ev.event_type === "page_view") {
        totalViews++;
        if (ev.car_slug) {
          carViewsMap[ev.car_slug] = (carViewsMap[ev.car_slug] || 0) + 1;
        }
      } else if (ev.event_type === "whatsapp_click") {
        totalWhatsappClicks++;
      } else if (ev.event_type === "call_click") {
        totalCalls++;
      } else if (ev.event_type === "booking_click") {
        totalBookings++;
      }
    });

    // Top 5 viewed cars
    const topCars = cars
      .map((car) => ({
        id: car._id,
        slug: car.slug,
        title: `${car.year} ${car.make} ${car.model} ${car.variant || ""}`.trim(),
        price_inr: car.price_inr,
        views: carViewsMap[car.slug] || 0,
        status: car.status,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Source Breakdown
    const sources: Record<string, number> = {};
    enquiries.forEach((e) => {
      const src = e.source || e.type || "other";
      sources[src] = (sources[src] || 0) + 1;
    });

    return {
      totalViews,
      totalWhatsappClicks,
      totalCalls,
      totalBookings,
      totalEnquiries: enquiries.length,
      topCars,
      sources,
    };
  },
});
