import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/pricing";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { QuoteRow } from "@/lib/types";

export default async function SellerQuotesPage({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;
  const supabase = await createClient();

  const { data: seller } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", sellerId)
    .single();

  if (!seller) notFound();

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*, clients(name, whatsapp), payment_methods(name)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/equipo" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Equipo
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{seller.full_name}</h1>
        <p className="text-sm text-gray-500 mt-1">Todas sus cotizaciones.</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="font-medium px-6 py-3">Cliente</th>
              <th className="font-medium px-6 py-3">Estado</th>
              <th className="font-medium px-6 py-3">Total</th>
              <th className="font-medium px-6 py-3">Fecha</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {((quotes as QuoteRow[]) ?? []).map((q) => (
              <tr key={q.id} className="border-t border-gray-50">
                <td className="p-0">
                  <Link href={`/admin/cotizaciones/${q.id}`} className="block px-6 py-3.5 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    {q.clients?.name}
                  </Link>
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={q.status} />
                </td>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{formatCurrency(q.total)}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">
                  {new Date(q.created_at).toLocaleDateString("es-AR")}
                </td>
                <td className="px-6 py-3.5">
                  <Link href={`/admin/cotizaciones/${q.id}`} className="text-gray-300 hover:text-blue-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {!quotes?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  Este vendedor todavía no generó cotizaciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
