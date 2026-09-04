import { createClient } from "@/lib/supabase/server";
import { QuoteBuilder } from "@/components/seller/quote-builder";

export default async function NuevaCotizacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: products }, { data: paymentMethods }, { data: profile }] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).order("created_at"),
    supabase.from("payment_methods").select("*").eq("active", true).order("id"),
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Nueva cotización</h1>
        <p className="text-sm text-gray-500 mt-1">Cargá al cliente, elegí productos y enviá por WhatsApp.</p>
      </div>
      <QuoteBuilder
        products={products ?? []}
        paymentMethods={paymentMethods ?? []}
        sellerName={profile?.full_name ?? "tu vendedor"}
      />
    </div>
  );
}
