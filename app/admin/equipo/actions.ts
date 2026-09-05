"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

type AddSellerState = { error?: string; success?: boolean };

export async function addSeller(
  _prevState: AddSellerState | undefined,
  formData: FormData
): Promise<AddSellerState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email) {
    return { error: "Completá el nombre y el email." };
  }
  if (password.length < 6) {
    return { error: "La contraseña tiene que tener al menos 6 caracteres." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    return { error: error.message === "User already registered" ? "Ese email ya tiene una cuenta." : error.message };
  }

  revalidatePath("/admin/equipo");
  return { success: true };
}
