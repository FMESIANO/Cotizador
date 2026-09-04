import { TopNav } from "@/components/top-nav";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav
        brandLabel="Cotizador"
        links={[
          { href: "/seller", label: "Pipeline" },
          { href: "/seller/nueva", label: "Nueva cotización" },
        ]}
      />
      <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
