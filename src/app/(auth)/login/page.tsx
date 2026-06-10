"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      toast.error("Email atau password salah");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0f172a" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(145deg, #1e1b4b 0%, #111827 60%, #0c1a2e 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
            <TrendingUp size={20} className="text-white" />
          </div>
          <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, color: "white", fontSize: "1.1rem" }}>
            Sales Manager
          </span>
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Kelola bisnis<br />
            <span style={{ background: "linear-gradient(90deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              lebih cerdas.
            </span>
          </h2>
          <p className="mt-4" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Sistem manajemen penjualan dan inventaris untuk bisnis Anda.
          </p>
        </div>
        <div className="flex gap-8">
          {[["Produk", "Kelola produk"], ["Stok", "Monitor stok"], ["Tagihan", "Catat tagihan"]].map(([t, d]) => (
            <div key={t}>
              <div style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{t}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem" }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
              <TrendingUp size={17} className="text-white" />
            </div>
            <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, color: "white" }}>Sales Manager</span>
          </div>

          <div className="mb-8">
            <h1 style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", letterSpacing: "-0.02em" }}>
              Selamat datang
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
              Masuk untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="admin@example.com"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.6rem",
                  padding: "0.7rem 1rem",
                  fontSize: "0.9rem",
                  color: "white",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.6rem",
                  padding: "0.7rem 1rem",
                  fontSize: "0.9rem",
                  color: "white",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full"
              style={{
                marginTop: "0.5rem",
                padding: "0.8rem",
                background: loading ? "#4338ca" : "linear-gradient(135deg, #4f46e5, #6d28d9)",
                color: "white",
                border: "none",
                borderRadius: "0.6rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.15s",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? "Memuat..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
