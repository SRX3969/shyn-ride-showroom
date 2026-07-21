import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKm(km: number): string {
  return new Intl.NumberFormat("en-IN").format(km) + " km";
}

export function calculateEMI(price: number, downPaymentPct: number, annualRatePct: number, tenureMonths: number): number {
  if (!price || price <= 0) return 0;
  const principal = price * (1 - downPaymentPct / 100);
  const r = annualRatePct / 12 / 100;
  const n = tenureMonths;
  
  if (r === 0) return principal / n;
  
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}
