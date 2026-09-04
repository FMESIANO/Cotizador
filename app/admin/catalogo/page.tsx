import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/pricing";
import { Package, CreditCard, Plus, Trash2 } from "lucide-react";
import {
  addProduct,
  deleteProduct,
  addPaymentMethod,
  deletePaymentMethod,
} from "./actions";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: paymentMethods }] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).order("created_at"),
    supabase.from("payment_methods").select("*").eq("active", true).order("id"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Catálogo</h1>
        <p className="text-sm text-gray-500 mt-1">Productos, precios y medios de pago disponibles.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-4 h-4 text-gray-400" />
            <h3 className="text-[15px] font-semibold text-gray-900">Productos y precios</h3>
          </div>
          <div className="space-y-1 mb-5">
            {(products ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400">IVA {p.tax_rate_pct}%</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(p.base_price)}</span>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {!products?.length && <p className="text-sm text-gray-400 py-2">Todavía no cargaste productos.</p>}
          </div>
          <form action={addProduct} className="grid grid-cols-6 gap-2">
            <Input className="col-span-3" name="name" placeholder="Nombre del producto" required />
            <Input className="col-span-2" name="price" type="number" step="0.01" placeholder="Precio" required />
            <input type="hidden" name="taxRate" value="21" />
            <button className="col-span-1 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <h3 className="text-[15px] font-semibold text-gray-900">Medios de pago</h3>
          </div>
          <div className="space-y-1 mb-5">
            {(paymentMethods ?? []).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-900">{m.name}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium ${
                      m.adjustment_pct > 0 ? "text-orange-600" : m.adjustment_pct < 0 ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {m.adjustment_pct > 0 ? "+" : ""}
                    {m.adjustment_pct}%
                  </span>
                  <form action={deletePaymentMethod}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {!paymentMethods?.length && <p className="text-sm text-gray-400 py-2">Todavía no cargaste medios de pago.</p>}
          </div>
          <form action={addPaymentMethod} className="grid grid-cols-6 gap-2">
            <Input className="col-span-3" name="name" placeholder="Nombre del medio de pago" required />
            <Input className="col-span-2" name="adjustment" type="number" step="0.1" placeholder="Recargo/desc. %" required />
            <button className="col-span-1 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
