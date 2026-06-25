"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tags,
  BarChart2,
  Users,
  FileText,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  CircleDollarSign,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/kategori", label: "Kategori", icon: Tags },
  { href: "/stok", label: "Stok", icon: BarChart2 },
  { href: "/price", label: "Harga", icon: CircleDollarSign },
  { href: "/sales", label: "Sales", icon: Users },
  { href: "/tasks", label: "Tugas", icon: ClipboardList },
  { href: "/users", label: "Pengguna", icon: FileText },
  { href: "/roles", label: "Peran", icon: ShieldCheck },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "white", letterSpacing: "-0.01em" }}>
          Toko Rizki
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", padding: "0 0.6rem 0.5rem", textTransform: "uppercase" }}>
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "ripple-target flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 group relative",
                active
                  ? "text-white"
                  : "text-white/50 hover:text-white/90"
              )}
              style={active ? {
                background: "rgba(99,102,241,0.18)",
                boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2)",
              } : {}}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "#818cf8" }} />
              )}
              <span className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg transition-all",
                active
                  ? "text-indigo-300"
                  : "text-white/40 group-hover:text-white/70"
              )}>
                <Icon size={20} />
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: active ? 600 : 500 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all text-white/40 hover:text-white/80 hover:bg-white/5"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </span>
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all text-white/40 hover:text-red-400 hover:bg-red-500/10"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg">
            <LogOut size={17} />
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Keluar</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 shadow-md"
        style={{ background: "#111827", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, color: "white", fontSize: "1rem", textDecoration: "none" }}>
          Toko Rizki
        </Link>
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-20" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
          onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 z-30 w-64 h-full flex flex-col transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: "#111827" }}>
        <NavContent onClose={() => setOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0"
        style={{ background: "#111827", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
        <NavContent />
      </div>
    </>
  );
}
