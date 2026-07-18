export function formatINR(paise: number): string {
  // paise here is actually rupees. Format in Indian style (lakh/crore).
  const n = Number(paise);
  if (!Number.isFinite(n)) return "—";
  if (n >= 10000000) {
    const cr = n / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  }
  if (n >= 100000) {
    const l = n / 100000;
    return `₹${l.toFixed(l % 1 === 0 ? 0 : 2)} L`;
  }
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatKm(km: number): string {
  return `${Number(km).toLocaleString("en-IN")} km`;
}
