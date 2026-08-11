export const COMPANY_PHONE = "9902500649";
export const COMPANY_PHONE_INTL = "+91 99025 00649";
export const COMPANY_EMAIL = "shreeram.prakasan23@gmail.com";
export const WHATSAPP_NUMBER = "919902500649";

export interface CarWhatsAppDetails {
  make: string;
  model: string;
  year: number;
  price_inr?: number;
  variant?: string;
  slug?: string;
  carTitle?: string;
  date?: string;
}

/**
 * Builds standard WhatsApp click-to-chat URL with pre-filled message formatted for SHYN RIDE.
 */
export function getWhatsAppUrl(type: "general" | "car" | "sell" | "booking", details?: CarWhatsAppDetails | Record<string, any>): string {
  let message = "Hi SHYN RIDE, I'm interested in pre-owned luxury cars from your showroom.";

  if (type === "car" && details) {
    const priceStr = details.price_inr ? ` priced at ₹${details.price_inr.toLocaleString("en-IN")}` : "";
    message = `Hi SHYN RIDE, I am interested in buying the ${details.year} ${details.make} ${details.model} ${details.variant || ""}${priceStr} (Ref: ${details.slug || "listing"}). Is it available for inspection?`;
  } else if (type === "sell") {
    const makeModel = details?.make && details?.model ? `${details.year || ""} ${details.make} ${details.model}` : "my vehicle";
    message = `Hi SHYN RIDE, I would like to get a valuation to sell ${makeModel}. Please assist me with the next steps.`;
  } else if (type === "booking" && details) {
    message = `Hi SHYN RIDE, I would like to confirm my test drive / reservation booking for ${details.carTitle || "a vehicle"} on ${details.date || "the scheduled date"}.`;
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
