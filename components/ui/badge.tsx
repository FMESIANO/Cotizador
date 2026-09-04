import type { QuoteStatus } from "@/lib/types";

const STATUS_META: Record<QuoteStatus, { label: string; chip: string; dot: string }> = {
  borrador: { label: "Borrador", chip: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  enviada: { label: "Enviada", chip: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  aprobada: { label: "Aprobada", chip: "bg-green-50 text-green-700", dot: "bg-green-500" },
  rechazada: { label: "Rechazada", chip: "bg-red-50 text-red-600", dot: "bg-red-500" },
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
