import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/requireAdmin";

export const list = query({
  handler: async (ctx) => {
    const faqs = await ctx.db.query("faqs").collect();
    // Sort by order ascending
    faqs.sort((a, b) => a.order - b.order);
    return faqs;
  }
});

export const add = mutation({
  args: {
    token: v.string(),
    question: v.string(),
    answer: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const { token, ...faq } = args;
    await requireAdmin(ctx, token);
    return await ctx.db.insert("faqs", faq);
  }
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("faqs"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { token, id, ...updates } = args;
    await requireAdmin(ctx, token);
    await ctx.db.patch(id, updates);
  }
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("faqs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
  }
});

// Seed data function if table is empty
export const seedInitialFaqs = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const existing = await ctx.db.query("faqs").collect();
    if (existing.length > 0) return;

    const seedFaqs = [
      { question: "How to contact / schedule a visit", answer: "You can reach out to us via our Contact Page or call us directly. Our team will help you schedule a showroom visit at your convenience.", order: 1 },
      { question: "RC transfer & documentation assistance", answer: "We provide end-to-end assistance with RC transfer and all RTO documentation. Our team handles the paperwork so you have a hassle-free experience.", order: 2 },
      { question: "How the buying process works", answer: "1. Browse our inventory online.\n2. Schedule a test drive.\n3. Finalize the vehicle and discuss financing/exchange.\n4. Complete payment and documentation.\n5. Drive home your SHYN RIDE.", order: 3 },
      { question: "Warranty information", answer: "Warranty coverage varies by vehicle age and brand. Please check the specific vehicle listing or ask our sales representative for detailed warranty terms on a particular car.", order: 4 },
      { question: "What makes/models are typically in stock", answer: "We maintain a diverse inventory of premium pre-owned cars across various popular makes, including hatchbacks, sedans, and SUVs. Our inventory is constantly updated.", order: 5 },
      { question: "Inspection process", answer: "Every car goes through a rigorous multi-point inspection before it is listed. We check engine health, transmission, electricals, exterior, and interior condition.", order: 6 },
      { question: "Test drive process", answer: "Select the car you are interested in and contact us to schedule a test drive. Make sure to bring your valid driving license.", order: 7 },
      { question: "Vehicle history reports", answer: "We provide transparency on vehicle history, including ownership count, insurance status, and RC status. You can find this information directly on the car detail page.", order: 8 },
      { question: "Financing options", answer: "We have tie-ups with leading banks and NBFCs to offer competitive financing options. You can use the EMI calculator on our listings for an indicative estimate.", order: 9 },
      { question: "Sell / Exchange program", answer: "Yes! We offer a comprehensive exchange program. You can trade in your current car and apply its value toward your new SHYN RIDE purchase. Visit our Sell Your Car page for more details.", order: 10 },
    ];

    for (const faq of seedFaqs) {
      await ctx.db.insert("faqs", faq);
    }
  }
});
