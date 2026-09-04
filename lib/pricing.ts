export type PricingLine = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRatePct: number;
};

export type PricingResult = {
  subtotal: number;
  taxAmount: number;
  adjustmentAmount: number;
  total: number;
};

/**
 * Single source of truth for how a quote's totals are calculated.
 * Used both when a seller builds a draft (client-side, live) and when
 * a quote is persisted to the database (server-side, on submit).
 */
export function calculatePricing(lines: PricingLine[], adjustmentPct: number): PricingResult {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const taxAmount = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity * (l.taxRatePct / 100), 0);
  const base = subtotal + taxAmount;
  const adjustmentAmount = base * (adjustmentPct / 100);
  const total = base + adjustmentAmount;
  return { subtotal, taxAmount, adjustmentAmount, total };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

export function generateToken(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36)).join("").toUpperCase().slice(0, 8);
}
