import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const enquirySchema = z.object({
  type: z.enum(["car_enquiry", "sell_request"]),
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone"),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  car_id: z.string().uuid().optional().nullable(),
  car_details: z.record(z.string()).optional(),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    const sb = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, storage: undefined, autoRefreshToken: false } },
    );
    const { error } = await sb.from("enquiries").insert({
      type: data.type,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      message: data.message || null,
      car_id: data.car_id ?? null,
      car_details: data.car_details ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
