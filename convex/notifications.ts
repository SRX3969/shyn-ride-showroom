import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sends real-time email lead alert to shreeram.prakasan23@gmail.com
 */
export const sendLeadEmailAlert = action({
  args: {
    leadType: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminEmail = "shreeram.prakasan23@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;

    console.log(`[REAL-TIME LEAD ALERT] To: ${adminEmail} | ${args.leadType} from ${args.customerName} (${args.customerPhone})`);

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not set in environment variables. Email logged to console.");
      return { ok: true, sent: false, reason: "No RESEND_API_KEY configured" };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SHYN RIDE Leads <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `🚨 New ${args.leadType.toUpperCase()} Lead: ${args.customerName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f1012; color: #ffffff; border-radius: 12px;">
              <h2 style="color: #DAAE6E; margin-top: 0;">🏎️ New Lead Received — SHYN RIDE</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 8px; color: #888;">Lead Type:</td><td style="padding: 8px; font-weight: bold; color: #fff;">${args.leadType}</td></tr>
                <tr><td style="padding: 8px; color: #888;">Customer Name:</td><td style="padding: 8px; font-weight: bold; color: #fff;">${args.customerName}</td></tr>
                <tr><td style="padding: 8px; color: #888;">Phone Number:</td><td style="padding: 8px; font-weight: bold; color: #DAAE6E;"><a href="tel:${args.customerPhone}" style="color: #DAAE6E;">${args.customerPhone}</a></td></tr>
                <tr><td style="padding: 8px; color: #888;">Email:</td><td style="padding: 8px; color: #fff;">${args.customerEmail || "N/A"}</td></tr>
                <tr><td style="padding: 8px; color: #888;">Details / Message:</td><td style="padding: 8px; color: #ddd;">${args.details || "None"}</td></tr>
              </table>
              <div style="margin-top: 25px; text-align: center;">
                <a href="https://wa.me/${args.customerPhone.replace(/\D/g, "")}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 8px;">
                  Open WhatsApp Chat
                </a>
              </div>
            </div>
          `,
        }),
      });

      const resData = await response.json();
      return { ok: true, sent: true, resData };
    } catch (err: any) {
      console.error("Failed to send Resend email alert:", err);
      return { ok: false, error: err.message };
    }
  },
});
