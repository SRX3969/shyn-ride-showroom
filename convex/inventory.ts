import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { requireAdmin } from "./lib/requireAdmin";

// Get paginated inventory
export const list = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    make: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, { token, status, make, search, page, limit }) => {
    await requireAdmin(ctx, token);

    let allCars = status
      ? await ctx.db.query("cars").withIndex("by_status", (q) => q.eq("status", status)).filter((q) => q.neq(q.field("is_deleted"), true)).order("desc").collect()
      : await ctx.db.query("cars").filter((q) => q.neq(q.field("is_deleted"), true)).order("desc").collect();

    // Filter by make manually if status index was used, or vice versa
    if (make && make !== "all") {
      allCars = allCars.filter(c => c.make === make);
    }

    if (search) {
      const s = search.toLowerCase();
      allCars = allCars.filter(c => 
        c.make.toLowerCase().includes(s) || 
        c.model.toLowerCase().includes(s) ||
        (c.reg_state && c.reg_state.toLowerCase().includes(s))
      );
    }

    // Get enquiries count for each car
    const allEnquiries = await ctx.db.query("enquiries").collect();
    const carsWithStats = allCars.map(c => ({
      ...c,
      enquiriesCount: allEnquiries.filter(e => e.car_id === c._id).length,
      daysListed: Math.round((Date.now() - c._creationTime) / (1000 * 60 * 60 * 24))
    }));

    const total = carsWithStats.length;
    const start = (page - 1) * limit;
    const items = carsWithStats.slice(start, start + limit);

    // Fetch cover image for each returned item
    const itemsWithImages = await Promise.all(
      items.map(async (car) => {
        const images = await ctx.db
          .query("car_images")
          .withIndex("by_car", (q) => q.eq("car_id", car._id))
          .collect();
        return {
          ...car,
          coverImage: images.length > 0 ? images[0] : null,
          images
        };
      })
    );

    return {
      items: itemsWithImages,
      total,
      pages: Math.ceil(total / limit)
    };
  }
});

// Create upload URL for drag-and-drop photos
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.storage.generateUploadUrl();
  }
});

// Soft Delete
export const softDelete = mutation({
  args: { token: v.string(), id: v.id("cars") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(id, { is_deleted: true });
  }
});

export const bulkSoftDelete = mutation({
  args: { token: v.string(), ids: v.array(v.id("cars")) },
  handler: async (ctx, { token, ids }) => {
    await requireAdmin(ctx, token);
    for (const id of ids) {
      await ctx.db.patch(id, { is_deleted: true });
    }
  }
});

export const updateStatus = mutation({
  args: { token: v.string(), id: v.id("cars"), status: v.string() },
  handler: async (ctx, { token, id, status }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(id, { status });
  }
});

export const bulkUpdateStatus = mutation({
  args: { token: v.string(), ids: v.array(v.id("cars")), status: v.string() },
  handler: async (ctx, { token, ids, status }) => {
    await requireAdmin(ctx, token);
    for (const id of ids) {
      await ctx.db.patch(id, { status });
    }
  }
});

export const saveCar = mutation({
  args: {
    token: v.string(),
    id: v.optional(v.id("cars")),
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
    // Admin fields
    purchase_price: v.optional(v.number()),
    purchase_date: v.optional(v.string()),
    purchase_source: v.optional(v.string()),
    sold_price: v.optional(v.number()),
    sold_date: v.optional(v.string()),
    internal_notes: v.optional(v.string()),
    
    // Images
    images: v.array(v.object({
      storageId: v.optional(v.string()), // Used for new uploads
      url: v.string(), // Used for existing or after storageId is resolved
      alt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { token, id, images, ...carData } = args;
    await requireAdmin(ctx, token);
    
    let carId = id;
    if (carId) {
      await ctx.db.patch(carId, carData);
    } else {
      carId = await ctx.db.insert("cars", carData);
    }

    // Handle images
    // For simplicity, we delete all existing images and recreate them in the new order
    const existingImages = await ctx.db
      .query("car_images")
      .withIndex("by_car", (q) => q.eq("car_id", carId!))
      .collect();
      
    for (const img of existingImages) {
      await ctx.db.delete(img._id);
    }

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      let finalUrl = img.url;
      
      // If it's a newly uploaded file to Convex storage, get the actual URL
      if (img.storageId) {
        const url = await ctx.storage.getUrl(img.storageId as any);
        if (url) {
          finalUrl = url;
        }
      }

      await ctx.db.insert("car_images", {
        car_id: carId!,
        url: finalUrl,
        alt: img.alt,
        sort_order: i,
      });
    }

    return carId;
  }
});
