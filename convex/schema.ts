import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cars: defineTable({
    slug: v.string(),
    make: v.string(),
    model: v.string(),
    variant: v.optional(v.string()),
    year: v.number(),
    price_inr: v.number(),
    price_negotiable: v.boolean(),
    km: v.number(),
    fuel_type: v.string(),
    transmission: v.string(),
    body_type: v.string(),
    color: v.string(),
    owners: v.number(),
    reg_state: v.optional(v.string()),
    status: v.string(),
    featured: v.boolean(),
    description: v.optional(v.string()),
    features: v.array(v.string()),
    deleted_at: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_featured", ["featured"])
    .index("by_status", ["status"])
    .index("by_body_type", ["body_type"])
    .index("by_make", ["make"]),

  car_images: defineTable({
    car_id: v.id("cars"),
    url: v.string(),
    alt: v.optional(v.string()),
    sort_order: v.number(),
  }).index("by_car", ["car_id", "sort_order"]),

  enquiries: defineTable({
    type: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    message: v.optional(v.string()),
    car_id: v.optional(v.id("cars")),
    car_details: v.optional(v.any()),
    status: v.string(),
  }).index("by_status", ["status"]),

  site_content: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),
});
