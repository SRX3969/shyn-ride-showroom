import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Comprehensive disposable email domain blacklist
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com",
  "mailinator.com",
  "yopmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "sharklasers.com",
  "dispostable.com",
  "getnada.com",
  "temp-mail.org",
  "crazymailing.com",
  "nada.ltd",
  "trashmail.com",
  "fakeinbox.com",
  "maildrop.cc",
  "binkmail.com",
]);

// Dummy phone blacklisted patterns
const DUMMY_PHONE_PATTERNS = [
  "1234567890",
  "0987654321",
  "9876543210",
  "0123456789",
];

export function validatePhoneAndEmail(phone: string, email?: string) {
  const cleanPhone = phone.replace(/\D/g, "");

  // Require 10 digits for Indian standard (or 10-12 digits international)
  if (cleanPhone.length !== 10) {
    return { valid: false, message: "Please enter a valid 10-digit mobile number." };
  }

  // Reject phone numbers starting with 0-5 for Indian mobile numbers
  if (!/^[6-9]/.test(cleanPhone)) {
    return { valid: false, message: "Mobile number must start with 6, 7, 8, or 9." };
  }

  // Reject all identical digits (e.g. 9999999999, 0000000000)
  if (/^(\d)\1{9}$/.test(cleanPhone)) {
    return { valid: false, message: "Please enter a valid mobile number." };
  }

  if (email && email.trim() !== "") {
    const cleanEmail = email.trim().toLowerCase();
    
    // RFC 5322 pattern check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return { valid: false, message: "Please enter a valid email address." };
    }

    const domain = cleanEmail.split("@")[1];
    if (!domain || DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      return { valid: false, message: "Temporary or disposable email addresses are not allowed." };
    }

    // Check suspicious dummy handles
    const handle = cleanEmail.split("@")[0];
    if (["test", "asdf", "abc", "123", "admin", "null", "undefined", "dummy"].includes(handle)) {
      return { valid: false, message: "Please provide your genuine personal or business email." };
    }
  }

  return { valid: true };
}

/**
 * Validates lead contact details (Phone & Email) before processing
 */
export const validateContact = query({
  args: {
    phone: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    return validatePhoneAndEmail(args.phone, args.email);
  },
});

/**
 * Generate and send OTP to phone or email
 */
export const sendOtp = action({
  args: {
    contact: v.string(), // phone or email
    type: v.string(), // "phone" | "email"
  },
  handler: async (ctx, args) => {
    const contactClean = args.contact.trim();

    // Perform validation check first
    let validationResult;
    if (args.type === "phone") {
      validationResult = validatePhoneAndEmail(contactClean, undefined);
    } else {
      validationResult = validatePhoneAndEmail("9876543210", contactClean);
    }

    if (!validationResult.valid) {
      return { ok: false, error: validationResult.message };
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Save OTP to DB via internal mutation helper
    await ctx.runMutation(api.otp.storeOtpRecord, {
      contact: contactClean.toLowerCase(),
      type: args.type,
      code,
      expiresAt,
    });

    let sentViaEmail = false;
    let sentViaSms = false;

    // 1. Send SMS OTP if contact is a phone number
    if (args.type === "phone" || !contactClean.includes("@")) {
      const fast2smsKey = process.env.FAST2SMS_API_KEY;
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

      const cleanPhone = contactClean.replace(/\D/g, "");

      if (fast2smsKey) {
        try {
          const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
              "authorization": fast2smsKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              variables_values: code,
              route: "otp",
              numbers: cleanPhone,
            }),
          });
          const smsData = await smsRes.json();
          if (smsData.return) sentViaSms = true;
          console.log("[SMS OTP FAST2SMS]", smsData);
        } catch (err) {
          console.error("Fast2SMS API error:", err);
        }
      } else if (twilioSid && twilioToken && twilioFrom) {
        try {
          const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
          const twilioRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                To: `+91${cleanPhone}`,
                From: twilioFrom,
                Body: `${code} is your SHYN RIDE showroom verification code.`,
              }),
            }
          );
          const twData = await twilioRes.json();
          if (twData.sid) sentViaSms = true;
          console.log("[SMS OTP TWILIO]", twData.sid);
        } catch (err) {
          console.error("Twilio API error:", err);
        }
      }
    }

    // 2. Send email OTP if type is email or if contact contains @
    if (args.type === "email" || contactClean.includes("@")) {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "SHYN RIDE Verification <onboarding@resend.dev>",
              to: [contactClean],
              subject: `${code} is your SHYN RIDE Verification Code`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f1012; color: #ffffff; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #2a2d34;">
                  <h2 style="color: #DAAE6E; margin-top: 0; font-size: 22px;">🏎️ SHYN RIDE Showroom</h2>
                  <p style="color: #ccc; font-size: 15px;">Your one-time verification code (OTP) for your inquiry / booking is:</p>
                  <div style="background-color: #1a1c23; border: 1px dashed #DAAE6E; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #DAAE6E;">${code}</span>
                  </div>
                  <p style="color: #888; font-size: 13px;">This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
                </div>
              `,
            }),
          });
          sentViaEmail = true;
        } catch (err) {
          console.error("Resend OTP send error:", err);
        }
      }
    }

    console.log(`[OTP GENERATED] Contact: ${contactClean} | Code: ${code} | SentViaSms: ${sentViaSms} | SentViaEmail: ${sentViaEmail}`);

    const isLiveSent = sentViaSms || sentViaEmail;

    return {
      ok: true,
      message: sentViaSms
        ? `OTP SMS sent to ${contactClean}`
        : sentViaEmail
        ? `OTP email sent to ${contactClean}`
        : `OTP generated for ${contactClean}`,
      // Expose devCode ONLY if live SMS/Email API is not configured
      devCode: isLiveSent ? undefined : code,
      isLiveSent,
    };
  },
});

/**
 * Mutation to store newly generated OTP
 */
export const storeOtpRecord = mutation({
  args: {
    contact: v.string(),
    type: v.string(),
    code: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const contactKey = args.contact.toLowerCase();

    // Invalidate existing active OTPs for this contact
    const existing = await ctx.db
      .query("otp_verifications")
      .withIndex("by_contact", (q) => q.eq("contact", contactKey))
      .collect();

    for (const record of existing) {
      await ctx.db.delete(record._id);
    }

    await ctx.db.insert("otp_verifications", {
      contact: contactKey,
      code: args.code,
      type: args.type,
      expires_at: args.expiresAt,
      verified: false,
      attempts: 0,
      created_at: Date.now(),
    });
  },
});

/**
 * Verify user submitted OTP
 */
export const verifyOtp = mutation({
  args: {
    contact: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const contactKey = args.contact.trim().toLowerCase();
    const records = await ctx.db
      .query("otp_verifications")
      .withIndex("by_contact", (q) => q.eq("contact", contactKey))
      .collect();

    const activeRecord = records[0];

    if (!activeRecord) {
      return { ok: false, message: "No active OTP request found. Please request a new OTP code." };
    }

    if (Date.now() > activeRecord.expires_at) {
      await ctx.db.delete(activeRecord._id);
      return { ok: false, message: "OTP has expired. Please request a new code." };
    }

    if (activeRecord.attempts >= 5) {
      await ctx.db.delete(activeRecord._id);
      return { ok: false, message: "Too many failed attempts. Please request a new OTP." };
    }

    if (activeRecord.code !== args.code.trim()) {
      await ctx.db.patch(activeRecord._id, {
        attempts: activeRecord.attempts + 1,
      });
      return { ok: false, message: "Invalid OTP code. Please check and try again." };
    }

    // Mark verified
    await ctx.db.patch(activeRecord._id, {
      verified: true,
    });

    return { ok: true, message: "Verification successful!" };
  },
});

/**
 * Check if a contact was recently verified via OTP
 */
export const isContactVerified = query({
  args: {
    contact: v.string(),
  },
  handler: async (ctx, args) => {
    const contactKey = args.contact.trim().toLowerCase();
    const records = await ctx.db
      .query("otp_verifications")
      .withIndex("by_contact", (q) => q.eq("contact", contactKey))
      .collect();

    const record = records[0];
    if (!record) return false;
    return record.verified && Date.now() < record.expires_at;
  },
});

import { api } from "./_generated/api";
