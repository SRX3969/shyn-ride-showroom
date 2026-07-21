import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

export const submit = mutation({
  args: {
    type: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    message: v.optional(v.string()),
    car_id: v.optional(v.id("cars")),
    car_details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("enquiries", {
      type: args.type,
      name: args.name,
      phone: args.phone,
      email: args.email,
      message: args.message,
      car_id: args.car_id,
      car_details: args.car_details,
      status: "new",
    });
    return { ok: true };
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
