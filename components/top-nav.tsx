"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

type NavLink = { href: string; label: string };

export function TopNav({ brandLabel, links }: { brandLabel: string; links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">C</span>
            </div>
            <span className="text-[15px] font-semibold text-gray-900">{brandLabel}</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  pathname === l.href ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logout}>
          <button className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Cerrar sesión</button>
        </form>
      </div>
    </div>
  );
}
