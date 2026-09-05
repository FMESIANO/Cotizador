import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AddSellerForm } from "@/components/admin/add-seller-form";
import { formatCurrency } from "@/lib/pricing";
import { Users, ChevronRight } from "lucide-react";

export default async function EquipoPage() {
  const supabase = await createClient();
  const [{ data: sellers }, { data: quotes }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("role", "vendedor").eq("active", true),
    supabase.from("quotes").select("seller_id, status, total"),
  ]);

  const rows = (sellers ?? []).map((s) => {
    const mine = (quotes ?? []).filter((q) => q.seller_id === s.id);
    const sent = mine.filter((q) => q.status !== "borrador");
    const approved = mine.filter((q) => q.status === "aprobada");
    const rate = sent.length ? Math.round((approved.length / sent.length) * 100) : 0;
    const revenue = approved.reduce((sum, q) => sum + Number(q.total), 0);
    return { ...s, total: mine.length, approved: approved.length, rate, revenue };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Equipo</h1>
        <p className="text-sm text-gray-500 mt-1">Actividad y desempeño de cada vendedor.</p>
      </div>

      <Card className="p-6">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Agregar vendedor</h3>
        <AddSellerForm />
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 px-6 pt-6 pb-3">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="text-[15px] font-semibold text-gray-900">Vendedores</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="font-medium px-6 py-2">Vendedor</th>
              <th className="font-medium px-6 py-2">Cotizaciones</th>
              <th className="font-medium px-6 py-2">Aprobadas</th>
              <th className="font-medium px-6 py-2">Conversión</th>
              <th className="font-medium px-6 py-2">Ventas cerradas</th>
              <th className="px-6 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-50">
                <td className="p-0">
                  <Link
                    href={`/admin/equipo/${r.id}`}
                    className="block px-6 py-3.5 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {r.full_name}
                  </Link>
                </td>
                <td className="px-6 py-3.5 text-sm text-gray-600">{r.total}</td>
                <td className="px-6 py-3.5 text-sm text-gray-600">{r.approved}</td>
                <td className="px-6 py-3.5 text-sm text-gray-600">{r.rate}%</td>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{formatCurrency(r.revenue)}</td>
                <td className="px-6 py-3.5">
                  <Link href={`/admin/equipo/${r.id}`} className="text-gray-300 hover:text-blue-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                  Todavía no hay vendedores cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
