"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Minus, X } from "lucide-react";
import { createInventoriProduk, addVariantsToInventori } from "@/actions/produk";
import type { Kategori } from "@prisma/client";

interface Variant { nama_tipe: string; kategori_id: number; jumlah: number; }
interface StokInfo { nama_tipe: string; jumlah: number; }
interface ProdukOption { id: number; nama: string; namaTipes: string[]; stoks: StokInfo[]; }

export function TambahInventoriModal({
  kategoris,
  produks,
}: {
  kategoris: Kategori[];
  produks: ProdukOption[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedProdukId, setSelectedProdukId] = useState<number | "">("");
  const [nama, setNama] = useState("");
  const [variants, setVariants] = useState<Variant[]>([{ nama_tipe: "", kategori_id: kategoris[0]?.id ?? 0, jumlah: 0 }]);

  function reset() {
    setSelectedProdukId("");
    setNama("");
    setVariants([{ nama_tipe: "", kategori_id: kategoris[0]?.id ?? 0, jumlah: 0 }]);
  }

  function addVariant() {
    setVariants((p) => [...p, { nama_tipe: "", kategori_id: kategoris[0]?.id ?? 0, jumlah: 0 }]);
  }

  function removeVariant(i: number) {
    if (variants.length === 1) return;
    setVariants((p) => p.filter((_, idx) => idx !== i));
  }

  function updateVariant(i: number, field: keyof Variant, value: string | number) {
    setVariants((p) => p.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (selectedProdukId !== "") {
          await addVariantsToInventori({ produk_id: selectedProdukId, variants });
          toast.success("Varian berhasil ditambahkan ke produk");
        } else {
          await createInventoriProduk({ nama, variants });
          toast.success("Produk inventori berhasil ditambahkan");
        }
        reset(); setOpen(false); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal menyimpan"); }
    });
  }

  const isExisting = selectedProdukId !== "";
  const activeProduk = isExisting ? produks.find(p => p.id === selectedProdukId) : null;
  const activeNamaTipes = activeProduk?.namaTipes ?? [];

  return (
    <>
      <button onClick={() => { reset(); setOpen(true); }} className="btn btn-primary">
        <Plus size={17} /> Tambah Produk
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <span className="modal-title">Tambah Produk Inventori</span>
              <button className="modal-close" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                <div className="form-group">
                  <label className="form-label">Pilih Produk</label>
                  <div className="select-wrap">
                    <select
                      value={selectedProdukId}
                      onChange={(e) => setSelectedProdukId(e.target.value === "" ? "" : Number(e.target.value))}
                      className="form-input"
                    >
                      <option value="">— Buat Produk Baru —</option>
                      {produks.map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!isExisting && (
                  <div className="form-group">
                    <label className="form-label">Nama Produk Baru</label>
                    <input
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required={!isExisting}
                      className="form-input"
                      placeholder="Nama produk..."
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="form-label" style={{ margin: 0 }}>Variasi Produk</label>
                    <button type="button" onClick={addVariant} className="btn btn-secondary btn-sm">
                      <Plus size={14} /> Tambah Variasi
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {variants.map((v, i) => (
                        <div key={i} className="variant-row">
                          <div style={{ flex: 1 }}>
                            <label className="form-label">Nama Tipe</label>
                            {isExisting && activeNamaTipes.length > 0 ? (
                              <div className="select-wrap">
                                <select
                                  value={v.nama_tipe}
                                  onChange={(e) => {
                                    const newTipe = e.target.value;
                                    const match = activeProduk?.stoks.find(s => s.nama_tipe === newTipe);
                                    setVariants(p => p.map((vv, idx) => idx === i
                                      ? { ...vv, nama_tipe: newTipe, jumlah: match ? match.jumlah : vv.jumlah }
                                      : vv
                                    ));
                                  }}
                                  required className="form-input">
                                  <option value="">— Pilih tipe —</option>
                                  {activeNamaTipes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                            ) : (
                              <input
                                value={v.nama_tipe}
                                onChange={(e) => updateVariant(i, "nama_tipe", e.target.value)}
                                required className="form-input" placeholder="Tipe varian..." />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <label className="form-label">Kategori</label>
                            <div className="select-wrap">
                              <select value={v.kategori_id} onChange={(e) => updateVariant(i, "kategori_id", Number(e.target.value))} className="form-input">
                                {kategoris.map((k) => <option key={k.id} value={k.id}>{k.kategori}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="form-label">Jumlah</label>
                            <div className="stepper">
                              <button type="button" className="stepper-btn" disabled={v.jumlah <= 0}
                                onClick={() => updateVariant(i, "jumlah", Math.max(0, v.jumlah - 1))}>
                                <Minus size={14} />
                              </button>
                              <span className="stepper-val">{v.jumlah}</span>
                              <button type="button" className="stepper-btn"
                                onClick={() => updateVariant(i, "jumlah", v.jumlah + 1)}>
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeVariant(i)} disabled={variants.length === 1}
                            className="icon-btn icon-btn-red" style={{ alignSelf: "flex-end", width: "2.2rem", height: "2.2rem", borderRadius: "50%" }}>
                            <Minus size={14} />
                          </button>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">{isPending ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
