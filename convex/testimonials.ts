import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

export const list = query({
  handler: async (ctx) => {
    const list = await ctx.db.query("testimonials").collect();
    return list.sort((a, b) => a.order - b.order);
  },
});

export const add = mutation({
  args: {
    token: v.string(),
    client_name: v.string(),
    location: v.optional(v.string()),
    car_title: v.string(),
    review: v.string(),
    rating: v.number(),
    image_url: v.string(),
    delivery_date: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const { token, ...data } = args;
    await requireAdmin(ctx, token);
    return await ctx.db.insert("testimonials", data);
  },
});

export const remove = mutation({
  args: {
    token: v.string(),
    id: v.id("testimonials"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});
