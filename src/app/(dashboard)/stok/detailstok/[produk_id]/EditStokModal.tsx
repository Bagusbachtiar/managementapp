"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";
import { updateStok } from "@/actions/stok";
import type { Kategori, Stok } from "@prisma/client";

type StokWithKategori = Stok & { kategori: Kategori };

export function EditStokModal({
  stok,
  kategoris,
}: {
  stok: StokWithKategori;
  kategoris: Kategori[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [namaTipe, setNamaTipe] = useState(stok.nama_tipe);
  const [kategoriId, setKategoriId] = useState(stok.kategori_id);
  const [jumlah, setJumlah] = useState(stok.jumlah);

  function handleOpen() {
    setNamaTipe(stok.nama_tipe);
    setKategoriId(stok.kategori_id);
    setJumlah(stok.jumlah);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateStok({ id: stok.id, nama_tipe: namaTipe, kategori_id: kategoriId, jumlah });
        toast.success("Stok berhasil diperbarui");
        setOpen(false);
      } catch (err: any) { toast.error(err.message || "Gagal memperbarui stok"); }
    });
  }

  return (
    <>
      <button onClick={handleOpen} className="icon-btn icon-btn-amber" style={{ width: "2.2rem", height: "2.2rem" }}>
        <Pencil size={14} />
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">Edit Stok Varian</span>
              <button className="modal-close" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Nama Tipe</label>
                  <input
                    value={namaTipe}
                    onChange={(e) => setNamaTipe(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Nama tipe..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    value={kategoriId}
                    onChange={(e) => setKategoriId(Number(e.target.value))}
                    className="form-input"
                  >
                    {kategoris.map((k) => (
                      <option key={k.id} value={k.id}>{k.kategori}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah</label>
                  <input
                    type="number"
                    min={0}
                    value={jumlah}
                    onChange={(e) => setJumlah(Number(e.target.value))}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
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
