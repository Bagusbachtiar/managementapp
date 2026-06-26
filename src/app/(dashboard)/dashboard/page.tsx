import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DashboardPesanModal } from "./DashboardPesanModal";
import { DashboardBayarModal } from "./DashboardBayarModal";
import { DashboardPenjualanModal } from "./DashboardPenjualanModal";
import { TambahInventoriModal } from "@/app/(dashboard)/stok/TambahInventoriModal";

export default async function DashboardPage() {
  const session = await auth();

  const [
    produkCount,
    stokAgg,
    tagihanCount,
    taskCount,
    recentPembayaran,
    recentPenjualan,
    recentPesanan,
    allSales,
    unpaidTagihans,
    allProduks,
    kategoris,
  ] = await Promise.all([
    prisma.produk.count(),
    prisma.stok.aggregate({ _sum: { jumlah: true } }),
    prisma.tagihan.count({ where: { tagihan: { not: "Lunas" } } }),
    prisma.task.count(),
    prisma.historiPembayaran.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { tagihan: { include: { produk: true, sales: true } } },
    }),
    prisma.historyPenjualan.findMany({
      take: 20,
      orderBy: { tanggal_penjualan: "desc" },
      include: { produk: true },
    }),
    prisma.tagihan.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { produk: true, sales: true },
    }),
    prisma.sales.findMany({
      where: { sales: { not: "Inventori" } },
      include: { produks: { include: { stoks: { include: { kategori: true } } } } },
      orderBy: { sales: "asc" },
    }),
    prisma.tagihan.findMany({
      where: { tagihan: { not: "Lunas" } },
      include: { produk: true, sales: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.produk.findMany({
      include: { stoks: { include: { kategori: true } } },
      orderBy: { nama: "asc" },
    }),
    prisma.kategori.findMany({ orderBy: { kategori: "asc" } }),
  ]);

  const stats = [
    { label: "Total Produk", value: produkCount, bg: "var(--primary)", shadow: "rgba(79,70,229,0.3)" },
    { label: "Total Stok", value: stokAgg._sum.jumlah ?? 0, bg: "#059669", shadow: "rgba(5,150,105,0.3)" },
    { label: "Tagihan Belum Lunas", value: tagihanCount, bg: "#dc2626", shadow: "rgba(220,38,38,0.3)" },
    { label: "Tugas Aktif", value: taskCount, bg: "#d97706", shadow: "rgba(217,119,6,0.3)" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Selamat datang, {session?.user?.name}!</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: "var(--radius)", padding: "1.4rem 1.5rem",
            color: "white", boxShadow: `0 4px 20px ${s.shadow}`,
          }}>
            <p style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: "0.82rem", opacity: 0.88, marginTop: "0.4rem", fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent cards + stok — 2x2 on desktop */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Recent Pesanan */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Pesanan Terbaru</span>
            <DashboardPesanModal allSales={allSales} />
          </div>
          <div>
            {recentPesanan.length === 0 && <div className="empty-state" style={{ padding: "2rem" }}>Belum ada pesanan</div>}
            {recentPesanan.map((t, i) => (
              <div key={t.id} style={{
                padding: "0.85rem 1.25rem",
                borderBottom: i < recentPesanan.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.produk.nama}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{t.sales.sales}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span className={`badge ${t.tagihan === "Lunas" ? "badge-green" : "badge-red"}`} style={{ fontSize: "0.75rem" }}>
                      {t.tagihan === "Lunas" ? "Lunas" : formatRupiah(t.tagihan)}
                    </span>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 3 }}>{formatDate(t.tanggal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Pembayaran */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Pembayaran Terbaru</span>
            <DashboardBayarModal unpaid={unpaidTagihans} />
          </div>
          <div>
            {recentPembayaran.length === 0 && <div className="empty-state" style={{ padding: "2rem" }}>Belum ada pembayaran</div>}
            {recentPembayaran.map((p, i) => (
              <div key={p.id} style={{
                padding: "0.85rem 1.25rem",
                borderBottom: i < recentPembayaran.length - 1 ? "1px solid var(--border)" : "none",
                display: "flex", alignItems: "center", gap: "0.75rem",
              }}>
                {p.gambar ? (
                  <img src={p.gambar} alt="bukti" style={{ width: 40, height: 40, borderRadius: "0.4rem", objectFit: "cover", flexShrink: 0, border: "1.5px solid var(--border)" }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: "0.4rem", background: "#f1f5f9", flexShrink: 0, border: "1.5px solid var(--border)" }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.tagihan.produk.nama}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{p.tagihan.sales.sales}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span className="badge badge-green" style={{ fontSize: "0.75rem", fontWeight: 700 }}>{formatRupiah(p.jumlah)}</span>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 3 }}>{formatDate(p.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Penjualan */}
        {(() => {
          // Group by exact tanggal_penjualan timestamp (bulk records share same now)
          const groupMap = new Map<string, typeof recentPenjualan>();
          for (const h of recentPenjualan) {
            const key = h.tanggal_penjualan.toISOString();
            if (!groupMap.has(key)) groupMap.set(key, []);
            groupMap.get(key)!.push(h);
          }
          const groups = Array.from(groupMap.values()).slice(0, 5);
          return (
            <div className="card overflow-hidden">
              <div className="card-header">
                <span className="card-title">Penjualan Terbaru</span>
                <DashboardPenjualanModal produks={allProduks} />
              </div>
              <div>
                {groups.length === 0 && <div className="empty-state" style={{ padding: "2rem" }}>Belum ada penjualan</div>}
                {groups.map((items, gi) => {
                  const groupTotal = items.reduce((s, h) => s + h.harga_satuan * h.jumlah_terjual, 0);
                  return (
                    <div key={items[0].id} style={{
                      padding: "0.85rem 1.25rem",
                      borderBottom: gi < groups.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      {/* Catatan + date header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", fontStyle: items[0].catatan ? "normal" : "italic" }}>
                          {items[0].catatan || "Tanpa catatan"}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", flexShrink: 0 }}>{formatDate(items[0].tanggal_penjualan)}</span>
                      </div>
                      {/* Items */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        {items.map((h) => (
                          <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                                {h.produk.nama} · {h.nama_tipe}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                              <span className="badge badge-red" style={{ fontSize: "0.7rem" }}>-{h.jumlah_terjual}</span>
                              {h.harga_satuan > 0 && (
                                <span style={{ fontSize: "0.72rem", color: "#4ade80", fontWeight: 600 }}>+{formatRupiah(h.harga_satuan * h.jumlah_terjual)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Group total */}
                      {groupTotal > 0 && (
                        <div style={{ marginTop: "0.5rem", paddingTop: "0.4rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4ade80" }}>Total: +{formatRupiah(groupTotal)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}


        {/* Stok Summary */}
        <div className="card overflow-hidden">
        <div className="card-header">
          <span className="card-title">Ringkasan Stok</span>
          <TambahInventoriModal
            kategoris={kategoris}
            produks={allProduks.map(p => ({
              id: p.id,
              nama: p.nama,
              namaTipes: [...new Set(p.stoks.map(s => s.nama_tipe))].sort(),
              stoks: p.stoks.map(s => ({ nama_tipe: s.nama_tipe, jumlah: s.jumlah })),
            }))}
          />
        </div>
        <div style={{ maxHeight: "22rem", overflowY: "auto" }}>
          {allProduks.length === 0 && <div className="empty-state" style={{ padding: "2rem" }}>Belum ada produk</div>}
          {allProduks.map((p, i) => {
            const totalStok = p.stoks.reduce((sum, s) => sum + s.jumlah, 0);
            return (
              <div key={p.id} style={{
                padding: "0.85rem 1.25rem",
                borderBottom: i < allProduks.length - 1 ? "1px solid var(--border)" : "none",
                display: "flex", alignItems: "flex-start", gap: "0.75rem",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)", marginBottom: p.stoks.length ? "0.4rem" : 0 }}>
                    {p.nama}
                  </p>
                  {p.stoks.length > 0 && (
                    <div style={{ display: "flex", gap: "0.35rem", overflowX: "auto", paddingBottom: "0.2rem" }}>
                      {p.stoks.map(s => (
                        <span key={s.id} className="badge badge-indigo" style={{ fontSize: "0.72rem", flexShrink: 0 }}>
                          {s.nama_tipe} · {s.jumlah}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`badge ${totalStok <= 0 ? "badge-red" : "badge-green"}`} style={{ fontWeight: 700, flexShrink: 0 }}>
                  {totalStok}
                </span>
              </div>
            );
          })}
        </div>
        </div>

      </div>

    </div>
  );
}
