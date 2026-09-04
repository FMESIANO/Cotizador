import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/pricing";
import { ShoppingCart, TrendingUp, Clock, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("status, total");

  const all = quotes ?? [];
  const sent = all.filter((q) => q.status !== "borrador");
  const approved = all.filter((q) => q.status === "aprobada");
  const conversion = sent.length ? Math.round((approved.length / sent.length) * 100) : 0;
  const projected = all
    .filter((q) => q.status === "enviada")
    .reduce((s, q) => s + Number(q.total), 0);
  const closed = approved.reduce((s, q) => s + Number(q.total), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Resumen</h1>
        <p className="text-sm text-gray-500 mt-1">Estado general del embudo de ventas.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Cotizaciones enviadas" value={sent.length} />
        <StatCard icon={TrendingUp} label="Tasa de conversión" value={`${conversion}%`} tone="text-blue-600" />
        <StatCard icon={Clock} label="Ingresos proyectados" value={formatCurrency(projected)} />
        <StatCard icon={DollarSign} label="Ventas cerradas" value={formatCurrency(closed)} tone="text-green-600" />
      </div>
    </div>
  );
}
