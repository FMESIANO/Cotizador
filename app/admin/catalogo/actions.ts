"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addProduct(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  const price = Number(formData.get("price") || 0);
  const taxRate = Number(formData.get("taxRate") || 0);
  if (!name || price <= 0) return;

  await supabase.from("products").insert({
    name,
    base_price: price,
    tax_rate_pct: taxRate,
  });
  revalidatePath("/admin/catalogo");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/catalogo");
}

export async function addPaymentMethod(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  const adjustment = Number(formData.get("adjustment") || 0);
  if (!name) return;

  await supabase.from("payment_methods").insert({
    name,
    adjustment_pct: adjustment,
  });
  revalidatePath("/admin/catalogo");
}

export async function deletePaymentMethod(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("payment_methods").delete().eq("id", id);
  revalidatePath("/admin/catalogo");
}
