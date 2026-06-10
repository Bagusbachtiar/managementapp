"use client";

import { useState } from "react";
import { History, X, Loader2 } from "lucide-react";
import { getHistoriByTagihan } from "@/actions/pembayaran";
import { formatRupiah, formatDate } from "@/lib/utils";

type Histori = Awaited<ReturnType<typeof getHistoriByTagihan>>[number];

interface Props {
  tagihanId: number;
  produkNama: string;
  tagihan: string;
}

export function HistoriTagihanModal({ tagihanId, produkNama, tagihan }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Histori[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    setLoading(true);
    try {
      const data = await getHistoriByTagihan(tagihanId);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={handleOpen} className="icon-btn icon-btn-navy" title="Histori Bayar">
        <History size={14} />
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-title">Histori Pembayaran</span>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {produkNama} · Tagihan: {tagihan === "Lunas" ? "Lunas" : formatRupiah(tagihan)}
                </div>
              </div>
              <button className="modal-close" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>

            <div className="modal-body" style={{ padding: "1.25rem 1.5rem" }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2.5rem 0", color: "var(--primary)" }}>
                  <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : items.length === 0 ? (
                <div className="empty-state" style={{ padding: "2rem 0" }}>Belum ada pembayaran</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {items.map((item, i) => (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: "1rem",
                      padding: "0.9rem 1rem", background: "#f8fafc",
                      border: "1.5px solid var(--border)", borderRadius: "0.65rem",
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
                          {formatRupiah(item.jumlah)}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                      {item.gambar ? (
                        <img
                          src={item.gambar}
                          alt="bukti"
                          onClick={() => setLightbox(item.gambar)}
                          style={{
                            width: 64, height: 64, objectFit: "cover",
                            borderRadius: "0.5rem", border: "2px solid var(--border)",
                            cursor: "zoom-in", flexShrink: 0,
                            transition: "transform 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        />
                      ) : (
                        <div style={{
                          width: 64, height: 64, borderRadius: "0.5rem",
                          border: "2px dashed var(--border)", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          fontSize: "0.7rem", color: "var(--text-muted)", flexShrink: 0,
                        }}>
                          No foto
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setOpen(false)} className="btn btn-secondary">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute", top: "1.25rem", right: "1.25rem",
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "0.5rem",
              color: "white", width: "2.4rem", height: "2.4rem",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
          <img
            src={lightbox}
            alt="bukti"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "88vh", borderRadius: "0.75rem", objectFit: "contain", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
          />
        </div>
      )}
    </>
  );
}
