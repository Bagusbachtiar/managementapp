"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Minus, X, Trash2 } from "lucide-react";
import { recordPenjualanBulk } from "@/actions/stok";
import { formatRupiah } from "@/lib/utils";
import type { Kategori, Produk, Stok } from "@prisma/client";

type ProdukWithStoks = Produk & {
  stoks: (Stok & { kategori: Kategori })[];
};

interface Item {
  produkId: number;
  stokId: number;
  jumlah: number;
}

function makeDefaultItem(produks: ProdukWithStoks[]): Item {
  return {
    produkId: produks[0]?.id ?? 0,
    stokId: produks[0]?.stoks[0]?.id ?? 0,
    jumlah: 1,
  };
}

export function DashboardPenjualanModal({ produks }: { produks: ProdukWithStoks[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<Item[]>([makeDefaultItem(produks)]);
  const [catatan, setCatatan] = useState("");

  function handleOpen() {
    setItems([makeDefaultItem(produks)]);
    setCatatan("");
    setOpen(true);
  }

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  function handleProdukChange(idx: number, produkId: number) {
    const p = produks.find((p) => p.id === produkId);
    updateItem(idx, { produkId, stokId: p?.stoks[0]?.id ?? 0, jumlah: 1 });
  }

  function handleStokChange(idx: number, stokId: number) {
    updateItem(idx, { stokId, jumlah: 1 });
  }

  function addItem() {
    setItems((prev) => [...prev, makeDefaultItem(produks)]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function getStok(item: Item) {
    const p = produks.find((p) => p.id === item.produkId);
    return p?.stoks.find((s) => s.id === item.stokId);
  }

  const grandTotal = items.reduce((sum, item) => {
    const stok = getStok(item);
    return sum + (stok?.harga ?? 0) * item.jumlah;
  }, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.some((it) => !it.stokId)) return;
    startTransition(async () => {
      try {
        await recordPenjualanBulk({
          items: items.map((it) => ({ stok_id: it.stokId, jumlah_terjual: it.jumlah })),
          catatan: catatan || undefined,
        });
        toast.success("Penjualan berhasil dicatat");
        setOpen(false);
        window.location.reload();
      } catch (err: any) {
        toast.error(err.message || "Gagal mencatat penjualan");
      }
    });
  }

  return (
    <>
      <button onClick={handleOpen} disabled={produks.length === 0} className="btn btn-primary btn-sm">
        <Plus size={15} /> Catat
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span className="modal-title">Catat Penjualan</span>
              <button className="modal-close" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Catatan <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opsional)</span></label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="form-input"
                    placeholder="Catatan penjualan..."
                  />
                </div>

                {items.map((item, idx) => {
                  const selectedProduk = produks.find((p) => p.id === item.produkId);
                  const selectedStok = selectedProduk?.stoks.find((s) => s.id === item.stokId);
                  const itemTotal = (selectedStok?.harga ?? 0) * item.jumlah;

                  return (
                    <div key={idx} style={{
                      border: "1.5px solid var(--border)", borderRadius: "var(--radius)",
                      padding: "0.9rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative",
                    }}>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="icon-btn icon-btn-red"
                          style={{ position: "absolute", top: "0.6rem", right: "0.6rem", width: "1.7rem", height: "1.7rem", borderRadius: "0.35rem" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", paddingRight: items.length > 1 ? "2rem" : 0 }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Produk</label>
                          <div className="select-wrap">
                            <select value={item.produkId} onChange={(e) => handleProdukChange(idx, Number(e.target.value))} className="form-input">
                              {produks.map((p) => (
                                <option key={p.id} value={p.id}>{p.nama}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Varian</label>
                          <div className="select-wrap">
                            <select value={item.stokId} onChange={(e) => handleStokChange(idx, Number(e.target.value))} className="form-input">
                              {selectedProduk?.stoks.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.nama_tipe} ({s.kategori.kategori})
                                </option>
                              ))}
                            </select>
                          </div>
                          {selectedStok && (
                            <p style={{ fontSize: "0.72rem", color: selectedStok.jumlah <= 0 ? "#dc2626" : "var(--text-muted)", marginTop: 3 }}>
                              Stok: <strong>{selectedStok.jumlah}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Jumlah Terjual</label>
                        <div className="flex items-center gap-3">
                          <button type="button"
                            onClick={() => updateItem(idx, { jumlah: Math.max(1, item.jumlah - 1) })}
                            disabled={item.jumlah <= 1}
                            className="icon-btn icon-btn-slate" style={{ width: "2.5rem", height: "2.5rem", flexShrink: 0 }}>
                            <Minus size={16} />
                          </button>
                          <div style={{
                            flex: 1, textAlign: "center", fontWeight: 700, fontSize: "1.3rem",
                            color: "var(--text)", background: "var(--bg)", border: "1.5px solid var(--border)",
                            borderRadius: "0.55rem", padding: "0.4rem 0", lineHeight: 1,
                          }}>
                            {item.jumlah}
                          </div>
                          <button type="button"
                            onClick={() => updateItem(idx, { jumlah: Math.min(selectedStok?.jumlah ?? 1, item.jumlah + 1) })}
                            disabled={item.jumlah >= (selectedStok?.jumlah ?? 1)}
                            className="icon-btn icon-btn-indigo" style={{ width: "2.5rem", height: "2.5rem", flexShrink: 0 }}>
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {selectedStok && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.3rem", borderTop: "1px solid var(--border)" }}>
                          {selectedStok.harga > 0 ? (
                            <>
                              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                {formatRupiah(selectedStok.harga)} × {item.jumlah}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#4ade80" }}>
                                {formatRupiah(itemTotal)}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Harga belum diset</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addItem}
                  className="btn btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center" }}
                >
                  <Plus size={14} /> Tambah Produk
                </button>

                {grandTotal > 0 && (
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "var(--radius)",
                    padding: "0.75rem 1rem",
                  }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#4ade80" }}>{formatRupiah(grandTotal)}</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending || items.some((it) => !it.stokId)} className="btn btn-primary">
                  {isPending ? "Menyimpan..." : `Simpan (${items.length} item)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
