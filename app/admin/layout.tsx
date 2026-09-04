import { TopNav } from "@/components/top-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav
        brandLabel="Cotizador · Admin"
        links={[
          { href: "/admin", label: "Resumen" },
          { href: "/admin/catalogo", label: "Catálogo" },
          { href: "/admin/equipo", label: "Equipo" },
        ]}
      />
      <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
