"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculatePricing, generateToken } from "@/lib/pricing";
import type { QuoteStatus } from "@/lib/types";

export async function createQuote(input: {
  clientName: string;
  clientWhatsapp: string;
  paymentMethodId: string;
  items: { productId: string; quantity: number }[];
}): Promise<{ token: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  if (!input.clientName.trim() || !input.clientWhatsapp.trim() || !input.items.length) {
    return { error: "Faltan datos obligatorios." };
  }

  const productIds = input.items.map((i) => i.productId);
  const { data: products } = await supabase.from("products").select("*").in("id", productIds);
  const { data: method } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("id", input.paymentMethodId)
    .single();

  if (!products?.length || !method) return { error: "Datos de catálogo inválidos." };

  const lines = input.items.map((i) => {
    const p = products.find((pp) => pp.id === i.productId)!;
    return {
      productId: p.id,
      name: p.name,
      quantity: i.quantity,
      unitPrice: Number(p.base_price),
      taxRatePct: Number(p.tax_rate_pct),
    };
  });
  const pricing = calculatePricing(lines, Number(method.adjustment_pct));

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      seller_id: user.id,
      name: input.clientName.trim(),
      whatsapp: input.clientWhatsapp.replace(/\D/g, ""),
    })
    .select()
    .single();
  if (clientError || !client) return { error: "No se pudo guardar el cliente." };

  const token = generateToken();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      token,
      seller_id: user.id,
      client_id: client.id,
      payment_method_id: method.id,
      status: "enviada",
      subtotal: pricing.subtotal,
      tax_amount: pricing.taxAmount,
      adjustment_amount: pricing.adjustmentAmount,
      total: pricing.total,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (quoteError || !quote) return { error: "No se pudo crear la cotización." };

  await supabase.from("quote_items").insert(
    lines.map((l) => ({
      quote_id: quote.id,
      product_id: l.productId,
      quantity: l.quantity,
      unit_price: l.unitPrice,
      tax_rate_pct: l.taxRatePct,
    }))
  );

  await supabase
    .from("quote_events")
    .insert({ quote_id: quote.id, actor: `seller:${user.id}`, event: "sent" });

  revalidatePath("/seller");
  return { token };
}

export async function moveQuote(quoteId: string, status: QuoteStatus) {
  const supabase = await createClient();
  await supabase
    .from("quotes")
    .update({
      status,
      responded_at: status === "aprobada" || status === "rechazada" ? new Date().toISOString() : null,
    })
    .eq("id", quoteId);
  revalidatePath("/seller");
}
