"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Check, Trash2 } from "lucide-react";
import { updateStok, deleteStok } from "@/actions/stok";
import type { Kategori, Stok } from "@prisma/client";

type StokWithKategori = Stok & { kategori: Kategori };

export function StokVarianCard({ stoks: initial }: { stoks: StokWithKategori[] }) {
  const [editing, setEditing] = useState(false);
  const [stoks, setStoks] = useState(initial);
  const [names, setNames] = useState<Record<number, string>>(
    Object.fromEntries(initial.map((s) => [s.id, s.nama_tipe]))
  );
  const [isPending, startTransition] = useTransition();

  function handleDone() {
    startTransition(async () => {
      try {
        await Promise.all(
          stoks
            .filter((s) => names[s.id] !== s.nama_tipe)
            .map((s) => updateStok({ id: s.id, nama_tipe: names[s.id], kategori_id: s.kategori_id, jumlah: s.jumlah }))
        );
        setStoks((prev) => prev.map((s) => ({ ...s, nama_tipe: names[s.id] ?? s.nama_tipe })));
        setEditing(false);
      } catch (err: any) { toast.error(err.message || "Gagal menyimpan"); }
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteStok(id);
        setStoks((prev) => prev.filter((s) => s.id !== id));
        setNames((prev) => { const n = { ...prev }; delete n[id]; return n; });
        toast.success("Varian dihapus");
      } catch (err: any) { toast.error(err.message || "Gagal menghapus"); }
    });
  }

  return (
    <div className="card" style={{ padding: "1.4rem 1.5rem" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>Stok Varian</span>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm" style={{ gap: "0.4rem" }}>
            <Pencil size={14} /> Edit
          </button>
        ) : (
          <button onClick={handleDone} disabled={isPending} className="btn btn-primary btn-sm" style={{ gap: "0.4rem" }}>
            <Check size={14} /> {isPending ? "Menyimpan..." : "Selesai"}
          </button>
        )}
      </div>

      <div>
        {stoks.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Tidak ada varian</p>
        )}
        {stoks.map((s, i) => (
          <div key={s.id} className="flex justify-between items-center"
            style={{ padding: "0.75rem 0", borderBottom: i < stoks.length - 1 ? "1px solid var(--border)" : "none", gap: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              {editing ? (
                <input
                  value={names[s.id] ?? s.nama_tipe}
                  onChange={(e) => setNames((p) => ({ ...p, [s.id]: e.target.value }))}
                  className="form-input"
                  style={{ fontSize: "0.88rem", padding: "0.4rem 0.7rem", minHeight: "unset" }}
                />
              ) : (
                <>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>{s.nama_tipe}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{s.kategori.kategori}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${s.jumlah <= 0 ? "badge-red" : "badge-green"}`}
                style={{ fontSize: "0.9rem", fontWeight: 700, padding: "0.3rem 0.8rem" }}>
                {s.jumlah}
              </span>
              {editing && (
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={isPending}
                  className="icon-btn icon-btn-red"
                  style={{ width: "2.2rem", height: "2.2rem" }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
