import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    featured: v.optional(v.boolean()),
    bodyType: v.optional(v.string()),
    make: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    transmission: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    limit: v.optional(v.number()),
    sort: v.optional(
      v.union(
        v.literal("newest"),
        v.literal("price_asc"),
        v.literal("price_desc"),
        v.literal("year_desc"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let cars = await ctx.db.query("cars").collect();

    // Filter out deleted
    cars = cars.filter((c) => !c.deleted_at);

    // Apply filters
    if (args.featured !== undefined) {
      cars = cars.filter((c) => c.featured === args.featured);
    }
    if (args.bodyType) {
      cars = cars.filter((c) => c.body_type === args.bodyType);
    }
    if (args.make) {
      cars = cars.filter((c) => c.make === args.make);
    }
    if (args.fuelType) {
      cars = cars.filter((c) => c.fuel_type === args.fuelType);
    }
    if (args.transmission) {
      cars = cars.filter((c) => c.transmission === args.transmission);
    }
    if (args.minPrice !== undefined) {
      cars = cars.filter((c) => c.price_inr >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      cars = cars.filter((c) => c.price_inr <= args.maxPrice!);
    }

    // Sort
    const sort = args.sort ?? "newest";
    if (sort === "newest") {
      cars.sort(
        (a, b) =>
          new Date(b._creationTime).getTime() -
          new Date(a._creationTime).getTime(),
      );
    } else if (sort === "price_asc") {
      cars.sort((a, b) => a.price_inr - b.price_inr);
    } else if (sort === "price_desc") {
      cars.sort((a, b) => b.price_inr - a.price_inr);
    } else if (sort === "year_desc") {
      cars.sort((a, b) => b.year - a.year);
    }

    // Limit
    if (args.limit) {
      cars = cars.slice(0, args.limit);
    }

    // Attach cover images
    const result = await Promise.all(
      cars.map(async (car) => {
        const images = await ctx.db
          .query("car_images")
          .withIndex("by_car", (q) => q.eq("car_id", car._id))
          .collect();
        images.sort((a, b) => a.sort_order - b.sort_order);
        return {
          _id: car._id,
          slug: car.slug,
          make: car.make,
          model: car.model,
          variant: car.variant ?? null,
          year: car.year,
          price_inr: car.price_inr,
          price_negotiable: car.price_negotiable,
          km: car.km,
          fuel_type: car.fuel_type,
          transmission: car.transmission,
          body_type: car.body_type,
          color: car.color,
          status: car.status,
          featured: car.featured,
          cover_url: images[0]?.url ?? null,
        };
      }),
    );

    return result;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const car = await ctx.db
      .query("cars")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!car || car.deleted_at) return null;

    const images = await ctx.db
      .query("car_images")
      .withIndex("by_car", (q) => q.eq("car_id", car._id))
      .collect();
    images.sort((a, b) => a.sort_order - b.sort_order);

    return {
      _id: car._id,
      slug: car.slug,
      make: car.make,
      model: car.model,
      variant: car.variant ?? null,
      year: car.year,
      price_inr: car.price_inr,
      price_negotiable: car.price_negotiable,
      km: car.km,
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      body_type: car.body_type,
      color: car.color,
      owners: car.owners,
      reg_state: car.reg_state ?? null,
      status: car.status,
      featured: car.featured,
      description: car.description ?? null,
      features: car.features,
      cover_url: images[0]?.url ?? null,
      images: images.map((img) => ({
        url: img.url,
        alt: img.alt ?? null,
        sort_order: img.sort_order,
      })),
    };
  },
});

export const getBodyTypeCounts = query({
  handler: async (ctx) => {
    const cars = await ctx.db.query("cars").collect();
    const counts: Record<string, number> = {};
    for (const car of cars) {
      if (!car.deleted_at) {
        counts[car.body_type] = (counts[car.body_type] ?? 0) + 1;
      }
    }
    return counts;
  },
});

export const listSlugs = query({
  handler: async (ctx) => {
    const cars = await ctx.db.query("cars").collect();
    return cars
      .filter((c) => !c.deleted_at)
      .map((c) => ({ slug: c.slug }));
  },
});

import { mutation } from "./_generated/server";

export const create = mutation({
  args: {
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
    description: v.optional(v.string()),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = `${args.year}-${args.make}-${args.model}-${Math.random().toString(36).slice(2, 6)}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const carId = await ctx.db.insert("cars", {
      ...args,
      slug,
      status: "available",
      featured: false,
    });
    return carId;
  },
});

export const update = mutation({
  args: {
    id: v.id("cars"),
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
    description: v.optional(v.string()),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
    return { ok: true };
  },
});

export const updateStatus = mutation({
  args: { id: v.id("cars"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  }
});

export const toggleFeatured = mutation({
  args: { id: v.id("cars"), featured: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { featured: args.featured });
  }
});

export const remove = mutation({
  args: { id: v.id("cars") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deleted_at: new Date().toISOString() });
  }
});
