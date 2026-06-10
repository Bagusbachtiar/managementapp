import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DashboardPesanModal } from "./DashboardPesanModal";
import { DashboardBayarModal } from "./DashboardBayarModal";
import { DashboardPenjualanModal } from "./DashboardPenjualanModal";

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
      take: 5,
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Recent 3 cards */}
      <div className="grid lg:grid-cols-3 gap-5">

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
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Penjualan Terbaru</span>
            <DashboardPenjualanModal produks={allProduks} />
          </div>
          <div>
            {recentPenjualan.length === 0 && <div className="empty-state" style={{ padding: "2rem" }}>Belum ada penjualan</div>}
            {recentPenjualan.map((h, i) => (
              <div key={h.id} style={{
                padding: "0.85rem 1.25rem",
                borderBottom: i < recentPenjualan.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {h.produk.nama}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{h.nama_tipe}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span className="badge badge-red" style={{ fontSize: "0.75rem" }}>-{h.jumlah_terjual}</span>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 3 }}>{formatDate(h.tanggal_penjualan)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
