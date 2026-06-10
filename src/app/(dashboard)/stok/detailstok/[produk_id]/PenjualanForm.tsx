"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { recordPenjualan } from "@/actions/stok";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import type { Kategori, Stok } from "@prisma/client";

interface Props {
  stoks: (Stok & { kategori: Kategori })[];
}

export function PenjualanForm({ stoks }: Props) {
  const router = useRouter();
  const [stokId, setStokId] = useState<number>(stoks[0]?.id ?? 0);
  const [jumlah, setJumlah] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  const selectedStok = stoks.find((s) => s.id === stokId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stokId || jumlah < 1) return;
    startTransition(async () => {
      try {
        await recordPenjualan({ stok_id: stokId, jumlah_terjual: jumlah });
        toast.success("Penjualan berhasil dicatat");
        setJumlah(1);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Gagal mencatat penjualan");
      }
    });
  }

  if (stoks.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Tidak ada varian stok</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="form-group">
        <label className="form-label">Pilih Varian</label>
        <select
          value={stokId}
          onChange={(e) => setStokId(Number(e.target.value))}
          className="form-input"
        >
          {stoks.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama_tipe} ({s.kategori.kategori}) — Stok: {s.jumlah}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Jumlah Terjual</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setJumlah((v) => Math.max(1, v - 1))}
            disabled={jumlah <= 1}
            className="icon-btn icon-btn-slate"
            style={{ width: "2.75rem", height: "2.75rem", flexShrink: 0 }}
          >
            <Minus size={17} />
          </button>
          <div style={{
            flex: 1, textAlign: "center", fontWeight: 700, fontSize: "1.4rem",
            color: "var(--text)", background: "var(--bg)", border: "1.5px solid var(--border)",
            borderRadius: "0.55rem", padding: "0.5rem 0", lineHeight: 1,
          }}>
            {jumlah}
          </div>
          <button
            type="button"
            onClick={() => setJumlah((v) => Math.min(selectedStok?.jumlah ?? 1, v + 1))}
            disabled={jumlah >= (selectedStok?.jumlah ?? 1)}
            className="icon-btn icon-btn-indigo"
            style={{ width: "2.75rem", height: "2.75rem", flexShrink: 0 }}
          >
            <Plus size={17} />
          </button>
        </div>
        {selectedStok && (
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Stok tersedia: {selectedStok.jumlah}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending || !selectedStok || selectedStok.jumlah === 0}
        className="btn btn-primary"
        style={{ width: "100%" }}
      >
        {isPending ? "Menyimpan..." : "Catat Penjualan"}
      </button>
    </form>
  );
}
