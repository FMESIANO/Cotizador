import { createClient } from "@/lib/supabase/server";
import { Pipeline } from "@/components/seller/pipeline";
import type { QuoteRow } from "@/lib/types";

export default async function SellerPipelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*, clients(name, whatsapp), payment_methods(name)")
    .eq("seller_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Arrastrá una tarjeta para cambiar su estado.</p>
      </div>
      <Pipeline quotes={(quotes as QuoteRow[]) ?? []} />
    </div>
  );
}
