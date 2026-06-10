"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { createPembayaran } from "@/actions/pembayaran";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { formatRupiah } from "@/lib/utils";
import { RupiahInput } from "@/components/ui/RupiahInput";
import type { Produk, Sales, Tagihan } from "@prisma/client";

type UnpaidTagihan = Tagihan & { produk: Produk; sales: Sales };

export function DashboardBayarModal({ unpaid }: { unpaid: UnpaidTagihan[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [tagihanId, setTagihanId] = useState<number>(unpaid[0]?.id ?? 0);
  const [jumlah, setJumlah] = useState("");
  const [gambar, setGambar] = useState("");
  const [uploading, setUploading] = useState(false);
  const gambarRef = useRef("");

  function handleOpen() {
    setTagihanId(unpaid[0]?.id ?? 0);
    setJumlah(""); setGambar(""); gambarRef.current = "";
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const jumlahNum = Number(jumlah);
    if (jumlahNum <= 0) { toast.error("Jumlah harus lebih dari 0"); return; }
    startTransition(async () => {
      try {
        await createPembayaran({ tagihan_id: tagihanId, jumlah: jumlahNum, gambar: gambarRef.current || undefined });
        toast.success("Pembayaran berhasil dicatat");
        setOpen(false); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal mencatat pembayaran"); }
    });
  }

  const selected = unpaid.find((t) => t.id === tagihanId);

  return (
    <>
      <button onClick={handleOpen} disabled={unpaid.length === 0} className="btn btn-primary btn-sm">
        Bayar
      </button>

      {open && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Bayar Tagihan</span>
              <button className="modal-close" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Pilih Tagihan</label>
                  <div className="select-wrap">
                    <select value={tagihanId} onChange={(e) => setTagihanId(Number(e.target.value))} className="form-input">
                      {unpaid.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.sales.sales} · {t.produk.nama} — {formatRupiah(t.tagihan)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selected && (
                    <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {selected.image ? (
                        <img src={selected.image} alt="nota"
                          style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "0.5rem", border: "1.5px solid var(--border)", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: "0.5rem", border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "var(--text-muted)", flexShrink: 0 }}>
                          No nota
                        </div>
                      )}
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        Sisa tagihan: <strong style={{ color: "var(--text)" }}>{formatRupiah(selected.tagihan)}</strong>
                      </p>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah Bayar</label>
                  <RupiahInput value={jumlah} onChange={setJumlah} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Bukti Bayar (opsional)</label>
                  <ImageUpload
                    onUpload={(url) => { gambarRef.current = url; setGambar(url); }}
                    onLoadingChange={setUploading}
                    currentUrl={gambar || undefined}
                  />
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
