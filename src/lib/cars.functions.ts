import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function serverPublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export type CarSummary = {
  id: string;
  slug: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  price_inr: number;
  price_negotiable: boolean;
  km: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  status: string;
  featured: boolean;
  cover_url: string | null;
};

export type CarDetail = CarSummary & {
  owners: number;
  reg_state: string | null;
  description: string | null;
  features: string[];
  images: { url: string; alt: string | null; sort_order: number }[];
};

async function withCover(rows: any[]): Promise<CarSummary[]> {
  const sb = serverPublicClient();
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];
  const { data: imgs } = await sb
    .from("car_images")
    .select("car_id, url, sort_order")
    .in("car_id", ids)
    .order("sort_order", { ascending: true });
  const cover = new Map<string, string>();
  for (const img of imgs ?? []) {
    if (!cover.has(img.car_id)) cover.set(img.car_id, img.url);
  }
  return rows.map((r) => ({ ...r, cover_url: cover.get(r.id) ?? null }));
}

export const listCars = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        featured: z.boolean().optional(),
        bodyType: z.string().optional(),
        make: z.string().optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        limit: z.number().min(1).max(100).optional(),
        sort: z.enum(["newest", "price_asc", "price_desc", "year_desc"]).optional(),
      })
      .default({})
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = serverPublicClient();
    let q = sb
      .from("cars")
      .select(
        "id, slug, make, model, variant, year, price_inr, price_negotiable, km, fuel_type, transmission, body_type, color, status, featured",
      )
      .is("deleted_at", null);
    if (data.featured) q = q.eq("featured", true);
    if (data.bodyType) q = q.eq("body_type", data.bodyType);
    if (data.make) q = q.eq("make", data.make);
    if (data.fuelType) q = q.eq("fuel_type", data.fuelType);
    if (data.transmission) q = q.eq("transmission", data.transmission);
    if (data.minPrice) q = q.gte("price_inr", data.minPrice);
    if (data.maxPrice) q = q.lte("price_inr", data.maxPrice);
    const sort = data.sort ?? "newest";
    if (sort === "newest") q = q.order("created_at", { ascending: false });
    if (sort === "price_asc") q = q.order("price_inr", { ascending: true });
    if (sort === "price_desc") q = q.order("price_inr", { ascending: false });
    if (sort === "year_desc") q = q.order("year", { ascending: false });
    if (data.limit) q = q.limit(data.limit);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return await withCover(rows ?? []);
  });

export const getCarBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }): Promise<CarDetail | null> => {
    const sb = serverPublicClient();
    const { data: car, error } = await sb
      .from("cars")
      .select("*")
      .eq("slug", data.slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!car) return null;
    const { data: imgs } = await sb
      .from("car_images")
      .select("url, alt, sort_order")
      .eq("car_id", car.id)
      .order("sort_order", { ascending: true });
    return {
      id: car.id,
      slug: car.slug,
      make: car.make,
      model: car.model,
      variant: car.variant,
      year: car.year,
      price_inr: Number(car.price_inr),
      price_negotiable: car.price_negotiable,
      km: car.km,
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      body_type: car.body_type,
      color: car.color,
      owners: car.owners,
      reg_state: car.reg_state,
      status: car.status,
      featured: car.featured,
      description: car.description,
      features: car.features ?? [],
      cover_url: imgs?.[0]?.url ?? null,
      images: imgs ?? [],
    };
  });

export const listCarSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublicClient();
  const { data } = await sb.from("cars").select("slug").is("deleted_at", null);
  return data ?? [];
});

export const getBodyTypeCounts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublicClient();
  const { data } = await sb
    .from("cars")
    .select("body_type")
    .is("deleted_at", null);
  const counts: Record<string, number> = {};
  for (const r of data ?? []) counts[r.body_type] = (counts[r.body_type] ?? 0) + 1;
  return counts;
});

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublicClient();
  const { data } = await sb.from("site_content").select("key, value");
  const out: Record<string, any> = {};
  for (const r of data ?? []) out[r.key] = r.value;
  return out;
});
