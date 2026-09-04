import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cotizador",
  description: "Cotizaciones B2B/B2C — creación, seguimiento y aprobación online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 font-sans">{children}</body>
    </html>
  );
}
