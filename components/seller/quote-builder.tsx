"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Minus, Plus, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculatePricing, formatCurrency } from "@/lib/pricing";
import { createQuote } from "@/app/seller/actions";
import type { PaymentMethod, Product } from "@/lib/types";

export function QuoteBuilder({
  products,
  paymentMethods,
  sellerName,
}: {
  products: Product[];
  paymentMethods: PaymentMethod[];
  sellerName: string;
}) {
  const [clientName, setClientName] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<{ token: string; link: string } | null>(null);

  const lines = useMemo(
    () =>
      Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => {
          const p = products.find((pp) => pp.id === productId)!;
          return {
            productId,
            name: p.name,
            quantity,
            unitPrice: Number(p.base_price),
            taxRatePct: Number(p.tax_rate_pct),
          };
        }),
    [qty, products]
  );

  const method = paymentMethods.find((m) => m.id === paymentMethodId);
  const pricing = calculatePricing(lines, Number(method?.adjustment_pct ?? 0));
  const canSubmit = clientName.trim() && clientWhatsapp.trim() && lines.length > 0 && paymentMethodId;

  const setProductQty = (id: string, delta: number) => {
    setQty((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    const result = await createQuote({
      clientName,
      clientWhatsapp,
      paymentMethodId,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });

    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    const link = `${window.location.origin}/quote/${result.token}`;
    const cleanPhone = clientWhatsapp.replace(/\D/g, "");
    const message = `Hola ${clientName.trim()} 👋 Soy ${sellerName}.\n\nTu presupuesto ya está listo, con el detalle completo y el precio final: ${link}\n\nCualquier duda, quedo a disposición 🙌`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");

    setConfirmation({ token: result.token, link });
    setClientName("");
    setClientWhatsapp("");
    setQty({});
  };

  if (confirmation) {
    return (
      <Card className="p-10 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Cotización enviada</h3>
        <p className="text-sm text-gray-500 mb-6">Se abrió WhatsApp con el mensaje y el enlace precargados.</p>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-6">
          <span className="flex-1 text-sm text-gray-600 truncate text-left">{confirmation.link}</span>
          <button
            onClick={() => navigator.clipboard?.writeText(confirmation.link)}
            className="text-gray-400 hover:text-gray-700"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <Button variant="secondary" onClick={() => setConfirmation(null)}>
          Crear otra cotización
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-5 gap-6">
      <div className="md:col-span-3 space-y-6">
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Datos del cliente</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nombre y apellido" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <Input
              placeholder="WhatsApp (ej. 5491122334455)"
              value={clientWhatsapp}
              onChange={(e) => setClientWhatsapp(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Productos y servicios</h3>
          <div className="space-y-1">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400">
                    {formatCurrency(p.base_price)} · IVA {p.tax_rate_pct}%
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setProductQty(p.id, -1)}
                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <span className="w-5 text-center text-sm font-medium text-gray-900">{qty[p.id] || 0}</span>
                  <button
                    onClick={() => setProductQty(p.id, 1)}
                    className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))}
            {!products.length && <p className="text-sm text-gray-400 py-2">El admin todavía no cargó productos.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Forma de pago</h3>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMethodId(m.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                  paymentMethodId === m.id ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-sm text-gray-900">{m.name}</span>
                <span
                  className={`text-sm font-medium ${
                    m.adjustment_pct > 0 ? "text-orange-600" : m.adjustment_pct < 0 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {m.adjustment_pct > 0 ? "+" : ""}
                  {m.adjustment_pct}%
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="p-6 sticky top-4">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Resumen</h3>
          {lines.length ? (
            <div className="space-y-2 mb-4">
              {lines.map((l) => (
                <div key={l.productId} className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {l.quantity} × {l.name}
                  </span>
                  <span className="text-gray-900">{formatCurrency(l.unitPrice * l.quantity)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">Elegí uno o más productos.</p>
          )}
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Impuestos</span>
              <span>{formatCurrency(pricing.taxAmount)}</span>
            </div>
            {method && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>{method.name}</span>
                <span>
                  {pricing.adjustmentAmount >= 0 ? "+" : ""}
                  {formatCurrency(pricing.adjustmentAmount)}
                </span>
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-medium text-gray-900">Total</span>
            <span className="text-2xl font-semibold text-gray-900">{formatCurrency(pricing.total)}</span>
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          <Button variant="primary" className="w-full mt-5" disabled={!canSubmit || submitting} onClick={submit}>
            <Send className="w-4 h-4" /> {submitting ? "Generando..." : "Generar y enviar por WhatsApp"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
