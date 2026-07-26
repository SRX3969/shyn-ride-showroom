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
    original_price: v.optional(v.number()),
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
    video_url: v.optional(v.string()),
    rc_status: v.optional(v.string()),
    insurance_validity: v.optional(v.string()),
    // Admin fields
    purchase_price: v.optional(v.number()),
    purchase_date: v.optional(v.string()),
    purchase_source: v.optional(v.string()),
    sold_price: v.optional(v.number()),
    sold_date: v.optional(v.string()),
    internal_notes: v.optional(v.string()),
    is_deleted: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_featured", ["featured"])
    .index("by_status", ["status"])
    .index("by_body_type", ["body_type"])
    .index("by_make", ["make"])
    .index("by_is_deleted", ["is_deleted"]),

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
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
    follow_up_date: v.optional(v.string()),
  }).index("by_status", ["status"]),

  bookings: defineTable({
    car_id: v.optional(v.id("cars")),
    car_title: v.optional(v.string()),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    booking_type: v.string(),
    preferred_date: v.string(),
    preferred_slot: v.string(),
    status: v.string(),
    notes: v.optional(v.string()),
    created_at: v.optional(v.number()),
  }).index("by_status", ["status"]),

  analytics_events: defineTable({
    event_type: v.string(),
    car_id: v.optional(v.id("cars")),
    car_slug: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.string()),
  })
    .index("by_event_type", ["event_type"])
    .index("by_car", ["car_id"])
    .index("by_timestamp", ["timestamp"]),

  site_content: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  admin_users: defineTable({
    username: v.string(),
    password_hash: v.string(),
    role: v.string(),
  }).index("by_username", ["username"]),

  sessions: defineTable({
    token: v.string(),
    admin_id: v.id("admin_users"),
    expires_at: v.number(),
  }).index("by_token", ["token"]),

  activity_logs: defineTable({
    action: v.string(),
    entity: v.string(),
    entity_id: v.string(),
    admin_user: v.string(),
    detail: v.optional(v.string()),
  }),

  login_attempts: defineTable({
    username: v.string(),
    ip: v.string(),
    timestamp: v.number(),
    successful: v.boolean(),
  }).index("by_username", ["username"])
    .index("by_ip", ["ip"]),

  site_settings: defineTable({
    emiDownPaymentPct: v.number(),
    emiAnnualRatePct: v.number(),
    emiTenureMonths: v.number(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    workingHours: v.optional(v.string()),
  }),

  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    order: v.number(),
  }),
});
