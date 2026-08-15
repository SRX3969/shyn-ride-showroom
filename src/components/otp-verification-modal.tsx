import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ShieldCheck, X, RefreshCw, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: string; // phone or email
  contactType: "phone" | "email";
  onVerified: () => void;
  title?: string;
}

export function OtpVerificationModal({
  isOpen,
  onClose,
  contact,
  contactType,
  onVerified,
  title = "Verify Contact Number / Email",
}: OtpVerificationModalProps) {
  const sendOtpAction = useAction(api.otp.sendOtp);
  const verifyOtpMutation = useMutation(api.otp.verifyOtp);

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);

  // Send initial OTP when modal opens
  useEffect(() => {
    if (isOpen && contact) {
      handleSendOtp();
    }
  }, [isOpen, contact]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleSendOtp = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await sendOtpAction({
        contact,
        type: contactType,
      });

      if (!res.ok) {
        setError(res.error || "Failed to send OTP code.");
      } else {
        if (res.devCode) {
          setDevCode(res.devCode);
        }
        setTimer(60);
      }
    } catch (err: any) {
      setError(err.message || "Error sending OTP code.");
    } finally {
      setSending(false);
    }
  };

  const triggerVerify = async (codeToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOtpMutation({
        contact,
        code: codeToVerify.trim(),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onVerified();
        }, 500);
      } else {
        setError(res.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      setError(err.message || "Verification error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    await triggerVerify(otpCode);
  };

  const handleInputChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setOtpCode(cleaned);
    if (cleaned.length === 6 && !loading) {
      triggerVerify(cleaned);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121318] border border-[#DAAE6E]/30 rounded-2xl p-6 shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-[#DAAE6E]/10 rounded-xl text-[#DAAE6E] border border-[#DAAE6E]/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-gray-400">
              Verify real contact details to prevent spam
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
          We sent a 6-digit verification code to:{" "}
          <span className="font-mono font-bold text-[#DAAE6E]">{contact}</span>
        </div>

        {/* Demo / Local Test OTP pill if available */}
        {devCode && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#DAAE6E]/10 border border-[#DAAE6E]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#DAAE6E]">
              <KeyRound className="w-4 h-4" />
              <span>Test OTP Code: <strong className="font-mono text-sm tracking-widest text-white">{devCode}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setOtpCode(devCode)}
              className="px-2 py-1 bg-[#DAAE6E] text-black font-semibold rounded text-[10px] hover:bg-[#c49a5b] transition-colors"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div className="py-6 text-center text-emerald-400 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-12 h-12 animate-bounce" />
            <p className="font-bold text-sm">Verified Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[12px] font-mono text-2xl py-3 px-4 rounded-xl bg-black/50 border border-white/20 text-white focus:outline-none focus:border-[#DAAE6E] transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 bg-[#DAAE6E] hover:bg-[#c49a5b] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#DAAE6E]/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Submit Query"
              )}
            </button>

            {/* Resend Link */}
            <div className="text-center pt-2">
              {timer > 0 ? (
                <span className="text-xs text-gray-500">
                  Resend code in <strong className="text-gray-300">{timer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sending}
                  className="text-xs text-[#DAAE6E] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`} />
                  Resend OTP Code
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
