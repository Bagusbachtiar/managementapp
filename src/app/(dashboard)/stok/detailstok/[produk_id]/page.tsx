import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { PenjualanForm } from "./PenjualanForm";
import { StokVarianCard } from "./StokVarianCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DetailStokPage({ params }: { params: Promise<{ produk_id: string }> }) {
  const { produk_id } = await params;
  const produk = await prisma.produk.findUnique({
    where: { id: Number(produk_id) },
    include: {
      sales: true,
      stoks: { include: { kategori: true }, orderBy: { nama_tipe: "asc" } },
      historyPenjualan: {
        orderBy: { tanggal_penjualan: "desc" },
        include: { kategori: true },
        take: 50,
      },
    },
  });
  if (!produk) notFound();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/stok" className="icon-btn icon-btn-slate" style={{ width: "2.4rem", height: "2.4rem" }}>
              <ArrowLeft size={18} />
            </Link>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{produk.nama}</h1>
          </div>
          <p className="page-subtitle" style={{ marginLeft: "3.4rem" }}>Sales: {produk.sales.sales}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <StokVarianCard stoks={produk.stoks} />

        <div className="card" style={{ padding: "1.4rem 1.5rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: "1rem" }}>
            Catat Penjualan
          </div>
          <PenjualanForm stoks={produk.stoks} />
        </div>
      </div>

      {/* History table — desktop */}
      <div className="history-table-wrap card overflow-hidden">
        <div className="card-header">
          <span className="card-title">Riwayat Penjualan</span>
          <span className="badge badge-slate">{produk.historyPenjualan.length} entri</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Kategori</th>
              <th style={{ textAlign: "right" }}>Terjual</th>
              <th style={{ textAlign: "right" }}>Sebelum</th>
              <th style={{ textAlign: "right" }}>Sesudah</th>
            </tr>
          </thead>
          <tbody>
            {produk.historyPenjualan.length === 0 && (
              <tr><td colSpan={6} className="empty-state">Belum ada riwayat</td></tr>
            )}
            {produk.historyPenjualan.map((h) => (
              <tr key={h.id}>
                <td style={{ color: "var(--text-muted)" }}>{formatDate(h.tanggal_penjualan)}</td>
                <td style={{ fontWeight: 600 }}>{h.nama_tipe}</td>
                <td style={{ color: "var(--text-muted)" }}>{h.kategori.kategori}</td>
                <td style={{ textAlign: "right" }}>
                  <span className="badge badge-red">-{h.jumlah_terjual}</span>
                </td>
                <td style={{ textAlign: "right", color: "var(--text-muted)" }}>{h.stok_sebelum}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{h.stok_sesudah}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History cards — mobile */}
      <div className="history-cards">
        <div className="flex items-center justify-between" style={{ marginBottom: "0.65rem" }}>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>Riwayat Penjualan</span>
          <span className="badge badge-slate">{produk.historyPenjualan.length} entri</span>
        </div>
        {produk.historyPenjualan.length === 0 && (
          <div className="card empty-state">Belum ada riwayat</div>
        )}
        {produk.historyPenjualan.map((h) => (
          <div key={h.id} className="card" style={{ padding: "0.9rem 1.1rem" }}>
            <div className="flex items-start justify-between" style={{ marginBottom: "0.5rem" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{h.nama_tipe}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {h.kategori.kategori} · {formatDate(h.tanggal_penjualan)}
                </div>
              </div>
              <span className="badge badge-red" style={{ flexShrink: 0 }}>-{h.jumlah_terjual}</span>
            </div>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span>Sebelum: <strong style={{ color: "var(--text)" }}>{h.stok_sebelum}</strong></span>
              <span>→</span>
              <span>Sesudah: <strong style={{ color: "var(--text)" }}>{h.stok_sesudah}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
