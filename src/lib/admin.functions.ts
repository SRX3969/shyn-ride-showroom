import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [carsRes, enquiriesRes, recentRes] = await Promise.all([
      context.supabase.from("cars").select("id, status", { count: "exact" }).is("deleted_at", null),
      context.supabase.from("enquiries").select("id, status, created_at"),
      context.supabase
        .from("enquiries")
        .select("id, type, name, phone, car_id, status, created_at, message")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    const cars = carsRes.data ?? [];
    const enquiries = enquiriesRes.data ?? [];
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 3600 * 1000;
    return {
      totalCars: cars.length,
      soldThisMonth: cars.filter((c) => c.status === "sold").length,
      newEnquiries: enquiries.filter(
        (e) => e.status === "new" && new Date(e.created_at).getTime() > weekAgo,
      ).length,
      pendingSellRequests: enquiries.filter((e) => e.status === "new").length,
      recent: recentRes.data ?? [],
    };
  });

export const listAdminCars = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cars")
      .select("id, slug, make, model, year, price_inr, status, featured, updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAdminEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("enquiries")
      .select("id, type, name, phone, email, message, car_id, car_details, status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
