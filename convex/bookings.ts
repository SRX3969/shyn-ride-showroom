import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";
import { validatePhoneAndEmail } from "./otp";
import { api } from "./_generated/api";

export const create = mutation({
  args: {
    car_id: v.optional(v.id("cars")),
    car_title: v.optional(v.string()),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    booking_type: v.string(), // "test_drive" | "home_visit" | "vehicle_hold"
    preferred_date: v.string(),
    preferred_slot: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Validate contact info (Phone & Email format/authenticity)
    const check = validatePhoneAndEmail(args.phone, args.email);
    if (!check.valid) {
      throw new Error(check.message || "Invalid phone number or email address.");
    }

    const bookingId = await ctx.db.insert("bookings", {
      car_id: args.car_id,
      car_title: args.car_title,
      name: args.name,
      phone: args.phone,
      email: args.email,
      booking_type: args.booking_type,
      preferred_date: args.preferred_date,
      preferred_slot: args.preferred_slot,
      notes: args.notes,
      status: "pending",
      created_at: Date.now(),
    });

    const bookingMsg = `[${args.booking_type.toUpperCase()}] Date: ${args.preferred_date}, Slot: ${args.preferred_slot}. ${args.notes || ""}`;

    // Also record as a lead enquiry for central CRM
    await ctx.db.insert("enquiries", {
      type: "booking",
      name: args.name,
      phone: args.phone,
      email: args.email,
      message: bookingMsg,
      car_id: args.car_id,
      car_details: { title: args.car_title },
      status: "new",
      source: `online_booking_${args.booking_type}`,
    });

    // Schedule real-time email notification to shreeram.prakasan23@gmail.com
    try {
      await ctx.scheduler.runAfter(0, api.notifications.sendLeadEmailAlert, {
        leadType: `Online Booking (${args.booking_type})`,
        customerName: args.name,
        customerPhone: args.phone,
        customerEmail: args.email,
        details: `${args.car_title || "Car"} | ${bookingMsg}`,
      });
    } catch (err) {
      console.error("Scheduler notification error:", err);
    }

    return { ok: true, bookingId };
  },
});

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    id: v.id("bookings"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.id, { status: args.status });
    return { ok: true };
  },
});
