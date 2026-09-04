import type { LucideIcon } from "lucide-react";
import { Card } from "./card";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "text-gray-900",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-gray-50">
          <Icon className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
        </div>
        <span className="text-[13px] text-gray-500">{label}</span>
      </div>
      <div className={`text-[26px] font-semibold tracking-tight ${tone}`}>{value}</div>
    </Card>
  );
}
