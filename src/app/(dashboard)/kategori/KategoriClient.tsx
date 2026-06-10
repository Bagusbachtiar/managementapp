"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createKategori, updateKategori, deleteKategori } from "@/actions/kategori";
import type { Kategori } from "@prisma/client";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export function KategoriClient({ kategoris: initial }: { kategoris: Kategori[] }) {
  const [kategoris, setKategoris] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Kategori | null>(null);
  const [createVal, setCreateVal] = useState("");
  const [editVal, setEditVal] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createVal.trim()) return;
    const fd = new FormData();
    fd.set("kategori", createVal);
    startTransition(async () => {
      try {
        await createKategori(fd);
        setCreateVal(""); setShowCreate(false);
        toast.success("Kategori berhasil ditambahkan");
        window.location.reload();
      } catch { toast.error("Gagal menambahkan kategori"); }
    });
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem || !editVal.trim()) return;
    const fd = new FormData();
    fd.set("kategori", editVal);
    startTransition(async () => {
      try {
        await updateKategori(editItem.id, fd);
        setEditItem(null);
        toast.success("Kategori berhasil diperbarui");
        window.location.reload();
      } catch { toast.error("Gagal memperbarui kategori"); }
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Hapus kategori ini?")) return;
    startTransition(async () => {
      try {
        await deleteKategori(id);
        setKategoris((prev) => prev.filter((k) => k.id !== id));
        toast.success("Kategori dihapus");
      } catch { toast.error("Gagal menghapus kategori"); }
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori</h1>
          <p className="page-subtitle">{kategoris.length} kategori terdaftar</p>
        </div>
        <button onClick={() => { setCreateVal(""); setShowCreate(true); }} className="btn btn-primary">
          <Plus size={17} /> Tambah
        </button>
      </div>

      {/* Table — desktop */}
      <div className="kategori-table-wrap card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>No</th>
              <th>Nama Kategori</th>
              <th style={{ width: 100, textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kategoris.length === 0 && (
              <tr><td colSpan={3} className="empty-state">Belum ada kategori</td></tr>
            )}
            {kategoris.map((k, i) => (
              <tr key={k.id}>
                <td className="text-sm" style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{k.kategori}</td>
                <td>
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => { setEditItem(k); setEditVal(k.kategori); }} className="icon-btn icon-btn-indigo" style={{ width: "2.75rem", height: "2.75rem" }}>
                      <Pencil size={17} />
                    </button>
                    <button onClick={() => handleDelete(k.id)} className="icon-btn icon-btn-red" style={{ width: "2.75rem", height: "2.75rem" }}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="kategori-cards">
        {kategoris.length === 0 && (
          <div className="card empty-state">Belum ada kategori</div>
        )}
        {kategoris.map((k, i) => (
          <div key={k.id} className="card" style={{ padding: "1rem 1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", minWidth: "1.25rem" }}>{i + 1}</span>
              <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)" }}>{k.kategori}</span>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => { setEditItem(k); setEditVal(k.kategori); }} className="icon-btn icon-btn-indigo" style={{ width: "2.75rem", height: "2.75rem" }}>
                <Pencil size={17} />
              </button>
              <button onClick={() => handleDelete(k.id)} className="icon-btn icon-btn-red" style={{ width: "2.75rem", height: "2.75rem" }}>
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Tambah Kategori</span>
              <button className="modal-close" onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Kategori</label>
                  <input autoFocus value={createVal} onChange={(e) => setCreateVal(e.target.value)}
                    placeholder="Masukkan nama kategori..." className="form-input" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editItem && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Edit Kategori</span>
              <button className="modal-close" onClick={() => setEditItem(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Kategori</label>
                  <input autoFocus value={editVal} onChange={(e) => setEditVal(e.target.value)} className="form-input" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditItem(null)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
