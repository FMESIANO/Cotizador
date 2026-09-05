"use client";

import { useActionState, useEffect, useRef } from "react";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addSeller } from "@/app/admin/equipo/actions";

export function AddSellerForm() {
  const [state, formAction, pending] = useActionState(addSeller, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <Input name="fullName" placeholder="Nombre y apellido" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="text" placeholder="Contraseña temporal" required minLength={6} />
        <Button type="submit" disabled={pending} className="justify-center">
          <UserPlus className="w-4 h-4" /> {pending ? "Creando..." : "Agregar vendedor"}
        </Button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">
          Vendedor creado. Ya puede iniciar sesión con ese email y esa contraseña.
        </p>
      )}
    </form>
  );
}
