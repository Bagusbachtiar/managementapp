"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Minus } from "lucide-react";
import { createProduk, updateProduk, deleteProduk } from "@/actions/produk";
import type { Kategori, Produk, Sales, Stok } from "@prisma/client";
import Link from "next/link";

type SalesWithProduks = Sales & {
  produks: (Produk & { stoks: (Stok & { kategori: Kategori })[] })[];
};

interface Variant { id?: number; nama_tipe: string; kategori_id: number; jumlah: number; }
interface EditTarget { produkId: number; }

interface Props { sales: SalesWithProduks[]; kategoris: Kategori[]; }

export function ProdukClient({ sales, kategoris }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [isPending, startTransition] = useTransition();

  const [salesName, setSalesName] = useState("");
  const [produkName, setProdukName] = useState("");
  const [variants, setVariants] = useState<Variant[]>([{ nama_tipe: "", kategori_id: kategoris[0]?.id ?? 0, jumlah: 0 }]);

  const [editSalesName, setEditSalesName] = useState("");
  const [editProdukName, setEditProdukName] = useState("");
  const [editVariants, setEditVariants] = useState<Variant[]>([]);

  function openEdit(s: SalesWithProduks, p: Produk & { stoks: (Stok & { kategori: Kategori })[] }) {
    setEditSalesName(s.sales);
    setEditProdukName(p.nama);
    setEditVariants(p.stoks.map((stok) => ({ id: stok.id, nama_tipe: stok.nama_tipe, kategori_id: stok.kategori_id, jumlah: stok.jumlah })));
    setEditTarget({ produkId: p.id });
  }

  function resetCreate() {
    setSalesName(""); setProdukName("");
    setVariants([{ nama_tipe: "", kategori_id: kategoris[0]?.id ?? 0, jumlah: 0 }]);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createProduk({ sales_name: salesName, nama: produkName, variants });
        toast.success("Produk berhasil ditambahkan");
        resetCreate(); setShowCreate(false); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal menambahkan produk"); }
    });
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    startTransition(async () => {
      try {
        await updateProduk(editTarget.produkId, { sales_name: editSalesName, nama: editProdukName, variants: editVariants });
        toast.success("Produk berhasil diperbarui");
        setEditTarget(null); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal memperbarui produk"); }
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Hapus produk ini?")) return;
    startTransition(async () => {
      try {
        await deleteProduk(id);
        toast.success("Produk dihapus"); window.location.reload();
      } catch { toast.error("Gagal menghapus produk"); }
    });
  }

  const totalProduks = sales.reduce((n, s) => n + s.produks.length, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Produk</h1>
          <p className="page-subtitle">{totalProduks} produk terdaftar</p>
        </div>
        <button onClick={() => { resetCreate(); setShowCreate(true); }} className="btn btn-primary">
          <Plus size={17} /> Tambah Produk
        </button>
      </div>

      <div className="space-y-4">
        {sales.length === 0 && (
          <div className="card empty-state">Belum ada produk</div>
        )}
        {sales.map((s) =>
          s.produks.map((p) => (
            <div key={p.id} className="card" style={{ padding: "1.25rem 1.5rem" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{p.nama}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>Sales: {s.sales}</div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(s, p)} className="icon-btn icon-btn-indigo" style={{ width: "2.75rem", height: "2.75rem" }}><Pencil size={17} /></button>
                  <button onClick={() => handleDelete(p.id)} className="icon-btn icon-btn-red" style={{ width: "2.75rem", height: "2.75rem" }}><Trash2 size={17} /></button>
                </div>
              </div>
              {p.stoks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {p.stoks.map((stok) => (
                    <span key={stok.id} className="badge badge-indigo">
                      {stok.nama_tipe} · {stok.kategori.kategori} · {stok.jumlah}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <ProdukModal title="Tambah Produk" salesName={salesName} produkName={produkName} variants={variants}
          kategoris={kategoris} isPending={isPending}
          onSalesName={setSalesName} onProdukName={setProdukName} onVariants={setVariants}
          onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      )}
      {editTarget && (
        <ProdukModal title="Edit Produk" salesName={editSalesName} produkName={editProdukName} variants={editVariants}
          kategoris={kategoris} isPending={isPending}
          onSalesName={setEditSalesName} onProdukName={setEditProdukName} onVariants={setEditVariants}
          onSubmit={handleUpdate} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}

interface ModalProps {
  title: string; salesName: string; produkName: string; variants: Variant[];
  kategoris: Kategori[]; isPending: boolean;
  onSalesName: (v: string) => void; onProdukName: (v: string) => void;
  onVariants: (v: Variant[] | ((p: Variant[]) => Variant[])) => void;
  onSubmit: (e: React.FormEvent) => void; onClose: () => void;
}

function ProdukModal({ title, salesName, produkName, variants, kategoris, isPending, onSalesName, onProdukName, onVariants, onSubmit, onClose }: ModalProps) {
  function addVariant() { onVariants((p) => [...p, { nama_tipe: "", kategori_id: kategoris[0]?.id ?? 0, jumlah: 0 }]); }
  function removeVariant(i: number) { if (variants.length === 1) return; onVariants((p) => p.filter((_, idx) => idx !== i)); }
  function updateVariant(i: number, field: keyof typeof variants[0], value: string | number) {
    onVariants((p) => p.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div className="form-group">
              <label className="form-label">Nama Sales</label>
              <input value={salesName} onChange={(e) => onSalesName(e.target.value)} required className="form-input" placeholder="Nama sales..." />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Produk</label>
              <input value={produkName} onChange={(e) => onProdukName(e.target.value)} required className="form-input" placeholder="Nama produk..." />
            </div>

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
                      <input value={v.nama_tipe} onChange={(e) => updateVariant(i, "nama_tipe", e.target.value)}
                        required className="form-input" placeholder="Tipe varian..." />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Kategori</label>
                      <div className="select-wrap">
                        <select value={v.kategori_id} onChange={(e) => updateVariant(i, "kategori_id", Number(e.target.value))} className="form-input">
                          {kategoris.map((k) => <option key={k.id} value={k.id}>{k.kategori}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeVariant(i)} disabled={variants.length === 1}
                      className="icon-btn icon-btn-red" style={{ marginBottom: 0, alignSelf: "flex-end", borderRadius: "50%", width: "2.2rem", height: "2.2rem" }}>
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Batal</button>
            <button type="submit" disabled={isPending} className="btn btn-primary">{isPending ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
