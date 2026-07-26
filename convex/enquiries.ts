import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

import { api } from "./_generated/api";

export const submit = mutation({
  args: {
    type: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    message: v.optional(v.string()),
    car_id: v.optional(v.id("cars")),
    car_details: v.optional(v.any()),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
    follow_up_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("enquiries", {
      type: args.type,
      name: args.name,
      phone: args.phone,
      email: args.email,
      message: args.message,
      car_id: args.car_id,
      car_details: args.car_details,
      status: "new",
      source: args.source || "website",
      notes: args.notes,
      follow_up_date: args.follow_up_date,
    });

    // Schedule real-time email notification to shreeram.prakasan23@gmail.com
    try {
      await ctx.scheduler.runAfter(0, api.notifications.sendLeadEmailAlert, {
        leadType: args.type || "General Inquiry",
        customerName: args.name,
        customerPhone: args.phone,
        customerEmail: args.email,
        details: args.message || (args.car_details ? JSON.stringify(args.car_details) : undefined),
      });
    } catch (err) {
      console.error("Scheduler notification error:", err);
    }

    return { ok: true, id };
  },
});

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const enquiries = await ctx.db.query("enquiries").order("desc").collect();
    return enquiries;
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    id: v.id("enquiries"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.id, { status: args.status });
    return { ok: true };
  },
});

export const updateLead = mutation({
  args: {
    token: v.string(),
    id: v.id("enquiries"),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
    follow_up_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const updates: Partial<{ status: string; notes: string; follow_up_date: string }> = {};
    if (args.status !== undefined) updates.status = args.status;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.follow_up_date !== undefined) updates.follow_up_date = args.follow_up_date;

    await ctx.db.patch(args.id, updates);
    return { ok: true };
  },
});
