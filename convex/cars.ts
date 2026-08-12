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
    cars = cars.filter((c) => !c.deleted_at && !c.is_deleted);

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
          original_price: car.original_price ?? null,
          price_negotiable: car.price_negotiable,
          km: car.km,
          fuel_type: car.fuel_type,
          transmission: car.transmission,
          body_type: car.body_type,
          color: car.color,
          reg_state: car.reg_state ?? null,
          status: car.status,
          featured: car.featured,
          cover_url: images[0]?.url ?? null,
          images: images.map((img) => ({
            url: img.url,
            sort_order: img.sort_order,
          })),
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

    if (!car || car.deleted_at || car.is_deleted) return null;

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
      original_price: car.original_price ?? null,
      price_negotiable: car.price_negotiable,
      km: car.km,
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      body_type: car.body_type,
      color: car.color,
      owners: car.owners,
      reg_state: car.reg_state ?? null,
      reg_year: car.reg_year ?? car.year,
      rc_status: car.rc_status ?? "Valid",
      insurance_validity: car.insurance_validity ?? null,
      accident_history: car.accident_history ?? "None Reported",
      service_history: car.service_history ?? "Authorized Dealer",
      keys: car.keys ?? 2,
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

export const getRelatedCars = query({
  args: { 
    slug: v.string(),
    body_type: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let cars = await ctx.db
      .query("cars")
      .withIndex("by_body_type", (q) => q.eq("body_type", args.body_type))
      .collect();

    // Filter out the current car and any deleted ones
    cars = cars.filter(c => c.slug !== args.slug && !c.deleted_at && !c.is_deleted);
    
    // Sort by newest
    cars.sort(
      (a, b) =>
        new Date(b._creationTime).getTime() -
        new Date(a._creationTime).getTime(),
    );

    // Limit
    const limit = args.limit ?? 4;
    cars = cars.slice(0, limit);

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
          original_price: car.original_price ?? null,
          price_negotiable: car.price_negotiable,
          km: car.km,
          fuel_type: car.fuel_type,
          transmission: car.transmission,
          body_type: car.body_type,
          color: car.color,
          reg_state: car.reg_state ?? null,
          status: car.status,
          featured: car.featured,
          cover_url: images[0]?.url ?? null,
        };
      })
    );

    return result;
  },
});

export const getBodyTypeCounts = query({
  handler: async (ctx) => {
    const cars = await ctx.db.query("cars").collect();
    const counts: Record<string, number> = {};
    for (const car of cars) {
      if (!car.deleted_at && !car.is_deleted) {
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
      .filter((c) => !c.deleted_at && !c.is_deleted)
      .map((c) => ({ slug: c.slug }));
  },
});

import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/requireAdmin";

export const create = mutation({
  args: {
    token: v.string(),
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
    description: v.optional(v.string()),
    features: v.array(v.string()),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { token, images, ...carData } = args;
    await requireAdmin(ctx, token);
    const slug = `${carData.year}-${carData.make}-${carData.model}-${Math.random().toString(36).slice(2, 6)}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const carId = await ctx.db.insert("cars", {
      ...carData,
      slug,
      status: "available",
      featured: false,
    });

    if (images && images.length > 0) {
      await Promise.all(
        images.map((url, index) => 
          ctx.db.insert("car_images", {
            car_id: carId,
            url,
            sort_order: index,
          })
        )
      );
    }

    return carId;
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("cars"),
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
    description: v.optional(v.string()),
    features: v.array(v.string()),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { token, id, images, ...rest } = args;
    await requireAdmin(ctx, token);
    await ctx.db.patch(id, rest);

    if (images !== undefined) {
      // Delete existing images
      const existingImages = await ctx.db
        .query("car_images")
        .withIndex("by_car", (q) => q.eq("car_id", id))
        .collect();
      
      await Promise.all(existingImages.map((img) => ctx.db.delete(img._id)));

      // Insert new images
      await Promise.all(
        images.map((url, index) => 
          ctx.db.insert("car_images", {
            car_id: id,
            url,
            sort_order: index,
          })
        )
      );
    }

    return { ok: true };
  },
});

export const updateStatus = mutation({
  args: { token: v.string(), id: v.id("cars"), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.id, { status: args.status });
  }
});

export const toggleFeatured = mutation({
  args: { token: v.string(), id: v.id("cars"), featured: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.id, { featured: args.featured });
  }
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("cars") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.patch(args.id, { deleted_at: new Date().toISOString() });
  }
});
