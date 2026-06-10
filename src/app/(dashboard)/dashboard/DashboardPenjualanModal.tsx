"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Minus, X } from "lucide-react";
import { recordPenjualan } from "@/actions/stok";
import type { Kategori, Produk, Stok } from "@prisma/client";

type ProdukWithStoks = Produk & {
  stoks: (Stok & { kategori: Kategori })[];
};

export function DashboardPenjualanModal({ produks }: { produks: ProdukWithStoks[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [produkId, setProdukId] = useState<number>(produks[0]?.id ?? 0);
  const [stokId, setStokId] = useState<number>(produks[0]?.stoks[0]?.id ?? 0);
  const [jumlah, setJumlah] = useState(1);

  const selectedProduk = produks.find((p) => p.id === produkId);
  const selectedStok = selectedProduk?.stoks.find((s) => s.id === stokId);

  function handleProdukChange(id: number) {
    setProdukId(id);
    const p = produks.find((p) => p.id === id);
    setStokId(p?.stoks[0]?.id ?? 0);
    setJumlah(1);
  }

  function handleOpen() {
    setProdukId(produks[0]?.id ?? 0);
    setStokId(produks[0]?.stoks[0]?.id ?? 0);
    setJumlah(1);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stokId) return;
    startTransition(async () => {
      try {
        await recordPenjualan({ stok_id: stokId, jumlah_terjual: jumlah });
        toast.success("Penjualan berhasil dicatat");
        setOpen(false); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal mencatat penjualan"); }
    });
  }

  return (
    <>
      <button onClick={handleOpen} disabled={produks.length === 0} className="btn btn-primary btn-sm">
        <Plus size={15} /> Catat
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">Catat Penjualan</span>
              <button className="modal-close" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Produk</label>
                  <div className="select-wrap">
                    <select value={produkId} onChange={(e) => handleProdukChange(Number(e.target.value))} className="form-input">
                      {produks.map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Varian</label>
                  <div className="select-wrap">
                    <select value={stokId} onChange={(e) => { setStokId(Number(e.target.value)); setJumlah(1); }} className="form-input">
                      {selectedProduk?.stoks.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama_tipe} ({s.kategori.kategori}) — Stok: {s.jumlah}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedStok && (
                    <p style={{ fontSize: "0.78rem", color: selectedStok.jumlah <= 0 ? "#dc2626" : "var(--text-muted)", marginTop: 4 }}>
                      Stok tersedia: <strong>{selectedStok.jumlah}</strong>
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Jumlah Terjual</label>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setJumlah((v) => Math.max(1, v - 1))}
                      disabled={jumlah <= 1}
                      className="icon-btn icon-btn-slate" style={{ width: "2.75rem", height: "2.75rem", flexShrink: 0 }}>
                      <Minus size={17} />
                    </button>
                    <div style={{
                      flex: 1, textAlign: "center", fontWeight: 700, fontSize: "1.4rem",
                      color: "var(--text)", background: "var(--bg)", border: "1.5px solid var(--border)",
                      borderRadius: "0.55rem", padding: "0.5rem 0", lineHeight: 1,
                    }}>
                      {jumlah}
                    </div>
                    <button type="button"
                      onClick={() => setJumlah((v) => Math.min(selectedStok?.jumlah ?? 1, v + 1))}
                      disabled={jumlah >= (selectedStok?.jumlah ?? 1)}
                      className="icon-btn icon-btn-indigo" style={{ width: "2.75rem", height: "2.75rem", flexShrink: 0 }}>
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending || !selectedStok || selectedStok.jumlah === 0} className="btn btn-primary">
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
