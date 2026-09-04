export type UserRole = "admin" | "vendedor";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  tax_rate_pct: number;
  active: boolean;
};

export type PaymentMethod = {
  id: string;
  name: string;
  adjustment_pct: number;
  active: boolean;
};

export type QuoteStatus = "borrador" | "enviada" | "aprobada" | "rechazada";

export type QuoteItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  tax_rate_pct: number;
  products?: { name: string } | null;
};

export type QuoteRow = {
  id: string;
  token: string;
  seller_id: string;
  client_id: string;
  payment_method_id: string;
  status: QuoteStatus;
  subtotal: number;
  tax_amount: number;
  adjustment_amount: number;
  total: number;
  expires_at: string;
  created_at: string;
  responded_at: string | null;
  clients?: { name: string; whatsapp: string } | null;
  payment_methods?: { name: string; adjustment_pct: number } | null;
  quote_items?: QuoteItemRow[];
};
