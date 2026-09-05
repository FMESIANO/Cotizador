import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/pricing";
import { ArrowLeft, Copy } from "lucide-react";
import type { QuoteRow } from "@/lib/types";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select(
      "*, clients(name, whatsapp), payment_methods(name, adjustment_pct), profiles(full_name), quote_items(id, quantity, unit_price, tax_rate_pct, products(name))"
    )
    .eq("id", id)
    .single<QuoteRow & { profiles: { full_name: string } | null }>();

  if (!quote) notFound();

  const publicLink = `/quote/${quote.token}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href={`/admin/equipo/${quote.seller_id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {quote.profiles?.full_name ?? "Vendedor"}
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{quote.clients?.name}</h1>
          <StatusBadge status={quote.status} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Cotizada por {quote.profiles?.full_name} el {new Date(quote.created_at).toLocaleDateString("es-AR")}
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Detalle</h3>
        <div className="space-y-3 mb-5">
          {quote.quote_items?.map((l) => (
            <div key={l.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {l.quantity} × {l.products?.name}
                <span className="text-gray-400"> · IVA {l.tax_rate_pct}%</span>
              </span>
              <span className="text-gray-900">{formatCurrency(l.unit_price * l.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Impuestos</span>
            <span>{formatCurrency(quote.tax_amount)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{quote.payment_methods?.name}</span>
            <span>
              {quote.adjustment_amount >= 0 ? "+" : ""}
              {formatCurrency(quote.adjustment_amount)}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-3 pt-4 flex justify-between items-baseline">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-2xl font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Cliente</h3>
        <p className="text-sm text-gray-600 mb-1">{quote.clients?.name}</p>
        <p className="text-sm text-gray-400 mb-4">WhatsApp: {quote.clients?.whatsapp}</p>
        <p className="text-xs text-gray-400 mb-1">Link enviado al cliente</p>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
          <span className="flex-1 text-sm text-gray-600 truncate">{publicLink}</span>
          <Link href={publicLink} target="_blank" className="text-gray-400 hover:text-gray-700">
            <Copy className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
