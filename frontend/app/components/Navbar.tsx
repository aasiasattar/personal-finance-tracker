"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, LayoutDashboard, List, Plus } from "lucide-react";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, disabled: false },
  { href: "/transactions", label: "Transactions", icon: List, disabled: false },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0F0F1A]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/25">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Finance<span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Tracker</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon, disabled }) => {
            const active = pathname === href;
            if (disabled) {
              return (
                <span
                  key={href}
                  title="Coming soon"
                  className="flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-600">
                    soon
                  </span>
                </span>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-violet-500/40 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Link>
      </div>
    </nav>
  );
}
