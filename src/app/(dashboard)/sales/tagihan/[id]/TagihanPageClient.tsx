"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { AlignLeft, Eye, Pencil, X, ArrowLeft, Plus, Minus } from "lucide-react";
import { HistoriTagihanModal } from "./HistoriTagihanModal";
import { createTagihan, updateTagihan } from "@/actions/tagihan";
import { createPembayaran } from "@/actions/pembayaran";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { RupiahInput } from "@/components/ui/RupiahInput";
import { formatRupiah } from "@/lib/utils";
import type { Kategori, Produk, Sales, Stok, Tagihan } from "@prisma/client";

type TagihanWithProduk = Tagihan & { produk: Produk };
type SalesWithProduks = Sales & {
  produks: (Produk & { stoks: (Stok & { kategori: Kategori })[] })[];
};

interface Props { sales: SalesWithProduks; tagihans: TagihanWithProduk[]; }

export function TagihanPageClient({ sales, tagihans }: Props) {
  const [isPending, startTransition] = useTransition();

  const [showPesan, setShowPesan] = useState(false);
  const [showBayar, setShowBayar] = useState(false);
  const [notesItem, setNotesItem] = useState<TagihanWithProduk | null>(null);
  const [notaItem, setNotaItem] = useState<TagihanWithProduk | null>(null);
  const [editItem, setEditItem] = useState<TagihanWithProduk | null>(null);

  const [pesanProdukId, setPesanProdukId] = useState<number>(sales.produks[0]?.id ?? 0);
  const [pesanTagihan, setPesanTagihan] = useState("");
  const [pesanNotes, setPesanNotes] = useState("");
  const [pesanTanggal, setPesanTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [pesanImage, setPesanImage] = useState("");
  const [pesanVariantQty, setPesanVariantQty] = useState<Record<number, number>>({});

  const [bayarTagihanId, setBayarTagihanId] = useState<number>(0);
  const [bayarJumlah, setBayarJumlah] = useState("");
  const [bayarGambar, setBayarGambar] = useState("");
  const bayarGambarRef = useRef("");
  const [bayarUploading, setBayarUploading] = useState(false);
  const [pesanUploading, setPesanUploading] = useState(false);
  const pesanImageRef = useRef("");

  const [editTagihan, setEditTagihan] = useState("");
  const [editTanggal, setEditTanggal] = useState("");
  const [editImage, setEditImage] = useState("");

  const unpaid = tagihans.filter((t) => t.tagihan !== "Lunas");
  const totalUnpaid = unpaid.reduce((sum, t) => sum + Number(t.tagihan), 0);
  const selectedPesan = sales.produks.find((p) => p.id === pesanProdukId);

  function openBayar() { setBayarTagihanId(unpaid[0]?.id ?? 0); setBayarJumlah(""); setBayarGambar(""); bayarGambarRef.current = ""; setShowBayar(true); }
  function openEdit(t: TagihanWithProduk) {
    setEditItem(t); setEditTagihan(t.tagihan === "Lunas" ? "0" : t.tagihan);
    setEditTanggal(new Date(t.tanggal).toISOString().split("T")[0]); setEditImage(t.image);
  }

  function handlePesan(e: React.FormEvent) {
    e.preventDefault();
    if (!pesanImage) { toast.error("Bukti foto wajib diupload"); return; }
    startTransition(async () => {
      try {
        const variants = Object.entries(pesanVariantQty).filter(([, q]) => q > 0).map(([id, jumlah]) => ({ stok_id: Number(id), jumlah }));
        await createTagihan({ sales_id: sales.id, produk_id: pesanProdukId, tagihan: pesanTagihan, notes: pesanNotes, tanggal: pesanTanggal, image: pesanImageRef.current || pesanImage, variants });
        toast.success("Tagihan berhasil dibuat"); setShowPesan(false); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal membuat tagihan"); }
    });
  }

  function handleBayar(e: React.FormEvent) {
    e.preventDefault();
    const bayarNum = Number(bayarJumlah);
    if (bayarNum <= 0) { toast.error("Jumlah harus lebih dari 0"); return; }
    startTransition(async () => {
      try {
        await createPembayaran({ tagihan_id: bayarTagihanId, jumlah: bayarNum, gambar: bayarGambarRef.current || undefined });
        toast.success("Pembayaran berhasil dicatat"); setShowBayar(false); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal mencatat pembayaran"); }
    });
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    startTransition(async () => {
      try {
        await updateTagihan(editItem.id, { sales_id: sales.id, produk_id: editItem.produk_id, tagihan: editTagihan, tanggal: editTanggal, image: editImage || undefined });
        toast.success("Tagihan berhasil diperbarui"); setEditItem(null); window.location.reload();
      } catch (err: any) { toast.error(err.message || "Gagal memperbarui tagihan"); }
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/sales" className="btn btn-secondary btn-sm" style={{ padding: "0.5rem 0.7rem" }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">Tagihan {sales.sales}</h1>
            <p className="page-subtitle">{tagihans.length} tagihan · {unpaid.length} belum lunas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/sales/tagihan/history/${sales.id}`} className="btn btn-secondary">History</Link>
          <button onClick={openBayar} disabled={unpaid.length === 0} className="btn btn-primary">Bayar</button>
          <button onClick={() => setShowPesan(true)} className="btn btn-primary">Pesan</button>
        </div>
      </div>

      {/* Table — desktop */}
      <div className="tagihan-table-wrap card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>No</th>
              <th>Tanggal</th>
              <th>Produk</th>
              <th>Tagihan</th>
              <th style={{ textAlign: "center", width: 200 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tagihans.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Belum ada tagihan</td></tr>
            )}
            {tagihans.map((t, i) => (
              <tr key={t.id}>
                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{i + 1}</td>
                <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </td>
                <td style={{ fontWeight: 600 }}>{t.produk.nama}</td>
                <td>
                  {t.tagihan === "Lunas"
                    ? <span className="badge badge-green">Lunas</span>
                    : <span style={{ fontWeight: 700, color: "var(--text)" }}>{formatRupiah(t.tagihan)}</span>
                  }
                </td>
                <td>
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => setNotesItem(t)} className="icon-btn icon-btn-teal" title="Catatan"><AlignLeft size={14} /></button>
                    <button onClick={() => setNotaItem(t)} className="icon-btn icon-btn-slate" title="Nota"><Eye size={14} /></button>
                    <button onClick={() => openEdit(t)} className="icon-btn icon-btn-amber" title="Edit"><Pencil size={14} /></button>
                    <HistoriTagihanModal tagihanId={t.id} produkNama={t.produk.nama} tagihan={t.tagihan} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {tagihans.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={3} style={{ fontWeight: 700 }}>Total Tagihan Belum Dibayar</td>
                <td style={{ fontWeight: 800, fontSize: "1rem", color: "var(--primary)" }}>{formatRupiah(String(totalUnpaid))}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="tagihan-cards">
        {tagihans.length === 0 && (
          <div className="card empty-state">Belum ada tagihan</div>
        )}
        {tagihans.map((t, i) => (
          <div key={t.id} className="card" style={{ padding: "1rem 1.1rem" }}>
            <div className="flex items-start justify-between" style={{ marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{t.produk.nama}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                  #{i + 1} · {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {t.tagihan === "Lunas"
                  ? <span className="badge badge-green">Lunas</span>
                  : <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text)" }}>{formatRupiah(t.tagihan)}</span>
                }
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setNotesItem(t)} className="icon-btn icon-btn-teal" title="Catatan"><AlignLeft size={14} /></button>
              <button onClick={() => setNotaItem(t)} className="icon-btn icon-btn-slate" title="Nota"><Eye size={14} /></button>
              <button onClick={() => openEdit(t)} className="icon-btn icon-btn-amber" title="Edit"><Pencil size={14} /></button>
              <HistoriTagihanModal tagihanId={t.id} produkNama={t.produk.nama} tagihan={t.tagihan} />
            </div>
          </div>
        ))}
        {tagihans.length > 0 && (
          <div className="card" style={{ padding: "0.9rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-muted)" }}>Total Belum Dibayar</span>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--primary)" }}>{formatRupiah(String(totalUnpaid))}</span>
          </div>
        )}
      </div>

      {/* Pesan Modal */}
      {showPesan && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <span className="modal-title">Buat Tagihan Baru</span>
              <button className="modal-close" onClick={() => setShowPesan(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handlePesan}>
              <div className="modal-body">
                <div className="modal-grid">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                    <div className="form-group">
                      <label className="form-label">Produk</label>
                      <div className="select-wrap">
                        <select value={pesanProdukId} onChange={(e) => setPesanProdukId(Number(e.target.value))} className="form-input">
                          {sales.produks.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Jumlah Tagihan</label>
                      <RupiahInput value={pesanTagihan} onChange={setPesanTagihan} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tanggal</label>
                      <input type="date" value={pesanTanggal} onChange={(e) => setPesanTanggal(e.target.value)} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Catatan</label>
                      <textarea value={pesanNotes} onChange={(e) => setPesanNotes(e.target.value)} className="form-input" rows={2} />
                    </div>
                    {selectedPesan && selectedPesan.stoks.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">Tambah Stok Varian</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {selectedPesan.stoks.map((s) => (
                            <div key={s.id} style={{ background: "#f8fafc", border: "1.5px solid var(--border)", borderRadius: "0.65rem", padding: "0.65rem 0.9rem" }}>
                              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
                                {s.nama_tipe} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({s.kategori.kategori})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button"
                                  onClick={() => setPesanVariantQty((p) => ({ ...p, [s.id]: Math.max(0, (p[s.id] ?? 0) - 1) }))}
                                  disabled={(pesanVariantQty[s.id] ?? 0) <= 0}
                                  className="icon-btn icon-btn-slate" style={{ width: "2.4rem", height: "2.4rem", flexShrink: 0 }}>
                                  <Minus size={15} />
                                </button>
                                <div style={{
                                  flex: 1, textAlign: "center", fontWeight: 700, fontSize: "1.2rem",
                                  color: "var(--text)", background: "white", border: "1.5px solid var(--border)",
                                  borderRadius: "0.45rem", padding: "0.35rem 0", lineHeight: 1,
                                }}>
                                  {pesanVariantQty[s.id] ?? 0}
                                </div>
                                <button type="button"
                                  onClick={() => setPesanVariantQty((p) => ({ ...p, [s.id]: (p[s.id] ?? 0) + 1 }))}
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
                    <ImageUpload onUpload={(url) => { pesanImageRef.current = url; setPesanImage(url); }} onLoadingChange={setPesanUploading} currentUrl={pesanImage || undefined} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowPesan(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending || pesanUploading} className="btn btn-primary">{pesanUploading ? "Mengupload..." : isPending ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bayar Modal */}
      {showBayar && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Bayar Tagihan</span>
              <button className="modal-close" onClick={() => setShowBayar(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleBayar}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Pilih Tagihan</label>
                  <div className="select-wrap">
                    <select value={bayarTagihanId} onChange={(e) => setBayarTagihanId(Number(e.target.value))} className="form-input">
                      {unpaid.map((t) => <option key={t.id} value={t.id}>{t.produk.nama} — {formatRupiah(t.tagihan)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah Bayar</label>
                  <RupiahInput value={bayarJumlah} onChange={setBayarJumlah} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Bukti Bayar (opsional)</label>
                  <ImageUpload onUpload={(url) => { bayarGambarRef.current = url; setBayarGambar(url); }} onLoadingChange={setBayarUploading} currentUrl={bayarGambar || undefined} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowBayar(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending || bayarUploading} className="btn btn-primary">{bayarUploading ? "Mengupload..." : isPending ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {notesItem && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">Catatan</span>
              <button className="modal-close" onClick={() => setNotesItem(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text)" }}>{notesItem.notes || <span style={{ color: "var(--text-muted)" }}>Tidak ada catatan</span>}</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setNotesItem(null)} className="btn btn-secondary">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Nota Modal */}
      {notaItem && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <span className="modal-title">Nota</span>
              <button className="modal-close" onClick={() => setNotaItem(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {notaItem.image
                ? <div style={{ position: "relative", width: "100%", height: 280, borderRadius: "0.5rem", overflow: "hidden" }}>
                    <Image src={notaItem.image} alt="nota" fill style={{ objectFit: "contain" }} />
                  </div>
                : <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0" }}>Tidak ada gambar</p>
              }
            </div>
            <div className="modal-footer">
              <button onClick={() => setNotaItem(null)} className="btn btn-secondary">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Edit Tagihan</span>
              <button className="modal-close" onClick={() => setEditItem(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Jumlah Tagihan</label>
                  <RupiahInput value={editTagihan} onChange={setEditTagihan} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input type="date" value={editTanggal} onChange={(e) => setEditTanggal(e.target.value)} required className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ganti Nota (opsional)</label>
                  <ImageUpload onUpload={setEditImage} currentUrl={editImage || undefined} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditItem(null)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">{isPending ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
