"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Plus, Minus, X } from "lucide-react";
import { createTagihan } from "@/actions/tagihan";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { RupiahInput } from "@/components/ui/RupiahInput";
import type { Kategori, Produk, Sales, Stok } from "@prisma/client";

type SalesWithProduks = Sales & {
  produks: (Produk & { stoks: (Stok & { kategori: Kategori })[] })[];
};

export function DashboardPesanModal({ allSales }: { allSales: SalesWithProduks[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [salesId, setSalesId] = useState<number>(allSales[0]?.id ?? 0);
  const [produkId, setProdukId] = useState<number>(allSales[0]?.produks[0]?.id ?? 0);
  const [tagihan, setTagihan] = useState("");
  const [notes, setNotes] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [variantQty, setVariantQty] = useState<Record<number, number>>({});
  const imageRef = useRef("");

  const selectedSales = allSales.find((s) => s.id === salesId);
  const selectedProduk = selectedSales?.produks.find((p) => p.id === produkId);

  function handleSalesChange(id: number) {
    setSalesId(id);
    const s = allSales.find((s) => s.id === id);
    const firstProduk = s?.produks[0];
    setProdukId(firstProduk?.id ?? 0);
    setVariantQty({});
  }

  function handleProdukChange(id: number) {
    setProdukId(id);
    setVariantQty({});
  }

  function resetForm() {
    const firstSales = allSales[0];
    setSalesId(firstSales?.id ?? 0);
    setProdukId(firstSales?.produks[0]?.id ?? 0);
    setTagihan(""); setNotes("");
    setTanggal(new Date().toISOString().split("T")[0]);
    setImage(""); imageRef.current = "";
    setVariantQty({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageRef.current) { toast.error("Bukti foto wajib diupload"); return; }
    startTransition(async () => {
      try {
        const variants = Object.entries(variantQty)
          .filter(([, q]) => q > 0)
          .map(([id, jumlah]) => ({ stok_id: Number(id), jumlah }));
        await createTagihan({
          sales_id: salesId, produk_id: produkId,
          tagihan, notes, tanggal, image: imageRef.current, variants,
        });
        toast.success("Tagihan berhasil dibuat");
        resetForm(); setOpen(false); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal membuat tagihan"); }
    });
  }

  return (
    <>
      <button onClick={() => { resetForm(); setOpen(true); }} className="btn btn-primary btn-sm">
        <Plus size={15} /> Pesan
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <span className="modal-title">Buat Tagihan Baru</span>
              <button className="modal-close" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                    <div className="form-group">
                      <label className="form-label">Sales</label>
                      <div className="select-wrap">
                        <select value={salesId} onChange={(e) => handleSalesChange(Number(e.target.value))} className="form-input">
                          {allSales.map((s) => <option key={s.id} value={s.id}>{s.sales}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Produk</label>
                      <div className="select-wrap">
                        <select value={produkId} onChange={(e) => handleProdukChange(Number(e.target.value))} className="form-input">
                          {selectedSales?.produks.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Jumlah Tagihan</label>
                      <RupiahInput value={tagihan} onChange={setTagihan} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tanggal</label>
                      <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Catatan</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="form-input" rows={2} />
                    </div>
                    {selectedProduk && selectedProduk.stoks.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">Tambah Stok Varian</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {selectedProduk.stoks.map((s) => (
                            <div key={s.id} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "0.65rem", padding: "0.65rem 0.9rem" }}>
                              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
                                {s.nama_tipe} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({s.kategori.kategori})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button"
                                  onClick={() => setVariantQty((p) => ({ ...p, [s.id]: Math.max(0, (p[s.id] ?? 0) - 1) }))}
                                  disabled={(variantQty[s.id] ?? 0) <= 0}
                                  className="icon-btn icon-btn-slate" style={{ width: "2.4rem", height: "2.4rem", flexShrink: 0 }}>
                                  <Minus size={15} />
                                </button>
                                <div style={{
                                  flex: 1, textAlign: "center", fontWeight: 700, fontSize: "1.2rem",
                                  color: "var(--text)", background: "var(--bg)", border: "1.5px solid var(--border)",
                                  borderRadius: "0.45rem", padding: "0.35rem 0", lineHeight: 1,
                                }}>
                                  {variantQty[s.id] ?? 0}
                                </div>
                                <button type="button"
                                  onClick={() => setVariantQty((p) => ({ ...p, [s.id]: (p[s.id] ?? 0) + 1 }))}
                                  className="icon-btn icon-btn-indigo" style={{ width: "2.4rem", height: "2.4rem", flexShrink: 0 }}>
                                  <Plus size={15} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bukti Foto *</label>
                    <ImageUpload
                      onUpload={(url) => { imageRef.current = url; setImage(url); }}
                      onLoadingChange={setUploading}
                      currentUrl={image || undefined}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending || uploading} className="btn btn-primary">
                  {uploading ? "Mengupload..." : isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
