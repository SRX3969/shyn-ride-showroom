import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Calendar, Clock, X, CheckCircle, Car, User, Phone, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { getWhatsAppUrl, COMPANY_PHONE_INTL, COMPANY_EMAIL } from "../lib/whatsapp";
import { OtpVerificationModal } from "./otp-verification-modal";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId?: Id<"cars">;
  carTitle?: string;
}

export function BookingModal({ isOpen, onClose, carId, carTitle }: BookingModalProps) {
  const createBooking = useMutation(api.bookings.create);
  const logAnalytics = useMutation(api.analytics.logEvent);

  const [bookingType, setBookingType] = useState<"test_drive" | "home_visit" | "vehicle_hold">("test_drive");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("Morning (10 AM - 1 PM)");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Honeypot bot check
    if (honeypot) return;

    if (!name.trim() || !phone.trim() || !preferredDate) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setValidationError("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    if (/^(\d)\1{9}$/.test(cleanPhone) || ["1234567890", "9876543210"].includes(cleanPhone)) {
      setValidationError("Please provide a real mobile number.");
      return;
    }

    if (!email || email.trim() === "") {
      setValidationError("Please enter your email address to receive your verification OTP code.");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email.trim())) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    // Open OTP verification modal
    setShowOtpModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowOtpModal(false);
    setLoading(true);
    try {
      await createBooking({
        car_id: carId,
        car_title: carTitle,
        name,
        phone,
        email: email || undefined,
        booking_type: bookingType,
        preferred_date: preferredDate,
        preferred_slot: preferredSlot,
        notes: notes || undefined,
      });

      // Log analytics event
      await logAnalytics({
        event_type: "booking_click",
        car_id: carId,
        metadata: `${bookingType}:${name}`,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Booking error:", err);
      setValidationError(err.message || "Booking submission failed.");
    } finally {
      setLoading(false);
    }
  };


  const handleWhatsAppRedirect = () => {
    const waUrl = getWhatsAppUrl("booking", { carTitle: carTitle || "vehicle", date: preferredDate });
    window.open(waUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {!success ? (
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-ui/10 text-gold-ui">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Schedule VIP Experience</h3>
                <p className="text-xs text-muted-foreground">{carTitle || "SHYN RIDE Luxury Experience"}</p>
              </div>
            </div>

            {validationError && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handlePreSubmit} className="mt-6 space-y-4">
              {/* Honeypot field (hidden from real users) */}
              <input
                type="text"
                name="b_website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Type Selection */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Type</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { id: "test_drive", label: "Showroom Drive" },
                    { id: "home_visit", label: "Home Visit" },
                    { id: "vehicle_hold", label: "Hold Reservation" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBookingType(item.id as any)}
                      className={`rounded-lg py-2.5 px-2 text-xs font-medium transition-all ${
                        bookingType === item.id
                          ? "bg-gold-ui text-white font-bold shadow-md shadow-gold-ui/20"
                          : "border border-border bg-background text-muted-foreground hover:border-gold-ui/50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Slot */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold-ui" /> Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold-ui focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold-ui" /> Time Slot
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold-ui focus:outline-none"
                  >
                    <option>Morning (10 AM - 1 PM)</option>
                    <option>Afternoon (1 PM - 4 PM)</option>
                    <option>Evening (4 PM - 7 PM)</option>
                  </select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gold-ui" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-gold-ui focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gold-ui" /> Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9902500649"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-gold-ui focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-gold-ui" /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="shreeram.prakasan23@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-gold-ui focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gold-ui py-3 text-sm font-bold text-white shadow-lg shadow-gold-ui/20 transition-all hover:bg-gold-ui/90 disabled:opacity-50 flex items-center justify-center gap-2 btn-shine"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {loading ? "Processing Booking..." : "Verify OTP & Complete Booking"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto h-14 w-14 text-emerald-500 animate-pulse-glow" />
            <h3 className="mt-4 font-display text-2xl font-bold text-foreground">Booking Confirmed!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you {name}. Our luxury concierge will contact you at <span className="font-semibold text-foreground">{COMPANY_PHONE_INTL}</span> shortly.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleWhatsAppRedirect}
                className="w-full rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#25D366]/90 flex items-center justify-center gap-2"
              >
                Instant Confirmation on WhatsApp
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* OTP Verification Modal Step */}
        <OtpVerificationModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          contact={email || phone}
          contactType={email ? "email" : "phone"}
          onVerified={handleFinalSubmit}
          title="Verify Contact details for VIP Experience"
        />
      </div>
    </div>
  );
}

