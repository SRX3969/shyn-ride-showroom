import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

// Get global settings, or return defaults if not found
export const get = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("site_settings").first();
    if (settings) return settings;

    // Return defaults if no settings are in DB yet
    return {
      emiDownPaymentPct: 20,
      emiAnnualRatePct: 10.5,
      emiTenureMonths: 60,
      address: "123 Main Street, in the heart of Bangalore, Karnataka",
      phone: "+91 98765 43210",
      workingHours: "Mon - Sun: 10:00 AM - 7:00 PM",
    };
  }
});

// Update or initialize global settings
export const update = mutation({
  args: {
    token: v.string(),
    emiDownPaymentPct: v.number(),
    emiAnnualRatePct: v.number(),
    emiTenureMonths: v.number(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    workingHours: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, ...restArgs } = args;
    await requireAdmin(ctx, token);
    const settings = await ctx.db.query("site_settings").first();
    if (settings) {
      await ctx.db.patch(settings._id, restArgs);
      return settings._id;
    } else {
      const newSettings = await ctx.db.insert("site_settings", restArgs);
      return newSettings;
    }
  }
});
