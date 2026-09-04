import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ApproveButton } from "@/components/quote/approve-button";
import { formatCurrency } from "@/lib/pricing";
import { Clock, MessageCircle, Sparkles, CheckCircle2, XCircle } from "lucide-react";

type QuoteDetail = {
  id: string;
  token: string;
  status: "borrador" | "enviada" | "aprobada" | "rechazada";
  subtotal: number;
  tax_amount: number;
  adjustment_amount: number;
  total: number;
  expires_at: string;
  clients: { name: string } | null;
  payment_methods: { name: string } | null;
  profiles: { full_name: string; phone: string | null } | null;
  quote_items: { id: string; quantity: number; unit_price: number; products: { name: string } | null }[];
};

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select(
      "id, token, status, subtotal, tax_amount, adjustment_amount, total, expires_at, clients(name), payment_methods(name), profiles(full_name, phone), quote_items(id, quantity, unit_price, products(name))"
    )
    .eq("token", token.toUpperCase())
    .single<QuoteDetail>();

  if (!quote) {
    return (
      <PageShell>
        <Card className="p-16 text-center">
          <p className="text-sm text-gray-400">No encontramos ningún presupuesto con ese código.</p>
        </Card>
      </PageShell>
    );
  }

  const isExpired = new Date(quote.expires_at) < new Date();
  const seller = quote.profiles;
  const waHref = seller?.phone
    ? `https://wa.me/${seller.phone}?text=${encodeURIComponent(
        `Hola ${seller.full_name}, tengo una consulta sobre mi presupuesto ${quote.token}.`
      )}`
    : undefined;

  if (isExpired) {
    return (
      <PageShell>
        <Card className="p-10 text-center">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Este presupuesto venció</h3>
          <p className="text-sm text-gray-500 mb-6">
            Pedile a {seller?.full_name ?? "tu vendedor"} que te genere uno nuevo.
          </p>
          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
              </Button>
            </a>
          )}
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Card className="overflow-hidden">
        <div className="p-8 pb-6 text-center border-b border-gray-50">
          <div className="w-10 h-10 rounded-full bg-gray-900 mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs text-gray-400 mb-1">Presupuesto para</p>
          <h2 className="text-xl font-semibold text-gray-900">{quote.clients?.name}</h2>
          <div className="mt-3">
            <StatusBadge status={quote.status} />
          </div>
        </div>

        <div className="p-8 pt-6">
          <div className="space-y-3 mb-5">
            {quote.quote_items.map((l) => (
              <div key={l.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {l.quantity} × {l.products?.name}
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
          <div className="border-t border-gray-100 mt-3 pt-4 flex justify-between items-baseline mb-1">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-3xl font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Válido hasta el {new Date(quote.expires_at).toLocaleDateString("es-AR")}
          </p>

          {quote.status === "enviada" && (
            <div className="space-y-3">
              <ApproveButton token={quote.token} />
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5 py-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Consultar por WhatsApp
                </a>
              )}
            </div>
          )}
          {quote.status === "aprobada" && (
            <div className="text-center py-2">
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                ¡Gracias! {seller?.full_name} se va a contactar para coordinar los próximos pasos.
              </p>
            </div>
          )}
          {quote.status === "rechazada" && (
            <div className="text-center py-2">
              <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">Este presupuesto fue marcado como rechazado.</p>
              {waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" /> Consultar por WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </Card>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
