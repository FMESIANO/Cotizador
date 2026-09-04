"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/pricing";
import { moveQuote } from "@/app/seller/actions";
import type { QuoteRow, QuoteStatus } from "@/lib/types";

const STATUS_ORDER: QuoteStatus[] = ["borrador", "enviada", "aprobada", "rechazada"];

function relTime(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "recién";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
}

export function Pipeline({ quotes }: { quotes: QuoteRow[] }) {
  // Optimistic overlay: while a move is in flight (or just after), we show
  // the new status immediately without waiting for the server round-trip.
  // Once the server data catches up, the overlay and the real prop agree,
  // so we just keep rendering from `quotes` merged with any pending moves.
  const [pending, setPending] = useState<Record<string, QuoteStatus>>({});
  const [, startTransition] = useTransition();

  const items = quotes.map((q) => (pending[q.id] ? { ...q, status: pending[q.id] } : q));

  const moveTo = (quoteId: string, status: QuoteStatus) => {
    if (!quoteId) return;
    setPending((prev) => ({ ...prev, [quoteId]: status }));
    startTransition(() => {
      moveQuote(quoteId, status).finally(() => {
        setPending((prev) => {
          const next = { ...prev };
          delete next[quoteId];
          return next;
        });
      });
    });
  };

  if (!items.length) {
    return (
      <Card className="p-16 text-center">
        <p className="text-gray-400 text-sm">
          Todavía no hay cotizaciones. Creá la primera desde &quot;Nueva cotización&quot;.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {STATUS_ORDER.map((status) => {
        const columnItems = items.filter((q) => q.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => moveTo(e.dataTransfer.getData("text/plain"), status)}
            className="bg-gray-50 rounded-2xl p-3 min-h-[220px]"
          >
            <div className="flex items-center justify-between px-1 mb-3">
              <StatusBadge status={status} />
              <span className="text-xs text-gray-400">{columnItems.length}</span>
            </div>
            <div className="space-y-2">
              {columnItems.map((q) => (
                <div
                  key={q.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", q.id)}
                  className="bg-white rounded-xl border border-gray-100 p-3.5 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">{q.clients?.name}</div>
                  <div className="text-[15px] font-semibold text-gray-900 mb-2">{formatCurrency(q.total)}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{relTime(q.created_at)}</span>
                    <Link
                      href={`/quote/${q.token}`}
                      target="_blank"
                      className="text-gray-300 hover:text-blue-600 transition-colors"
                      title="Ver como cliente"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
