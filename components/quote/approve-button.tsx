"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApproveButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const approve = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/quotes/${token}/approve`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError("No se pudo aprobar. Probá de nuevo en unos segundos.");
      return;
    }
    router.refresh();
  };

  return (
    <div>
      <Button variant="primary" className="w-full py-3.5 text-[15px]" onClick={approve} disabled={loading}>
        <Check className="w-4 h-4" /> {loading ? "Aprobando..." : "Aprobar presupuesto"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
    </div>
  );
}
