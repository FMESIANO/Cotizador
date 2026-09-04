"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Card className="w-full max-w-sm p-8">
        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-6">
          <span className="text-white text-sm font-semibold">C</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Iniciar sesión</h1>
        <p className="text-sm text-gray-500 mb-6">Accedé a tu panel de cotizaciones.</p>
        <form action={formAction} className="space-y-3">
          <Input type="email" name="email" placeholder="Email" required />
          <Input type="password" name="password" placeholder="Contraseña" required />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
