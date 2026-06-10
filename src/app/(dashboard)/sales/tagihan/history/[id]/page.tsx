import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImageModal } from "./ImageModal";

const PER_PAGE = 10;

export default async function HistoryPembayaranPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const salesId = Number(id);
  const page = Math.max(1, Number(pageStr ?? 1));

  const sales = await prisma.sales.findUnique({ where: { id: salesId } });
  if (!sales) notFound();

  const [payments, total] = await Promise.all([
    prisma.historiPembayaran.findMany({
      where: { tagihan: { sales_id: salesId } },
      include: { tagihan: { include: { produk: true } } },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
    }),
    prisma.historiPembayaran.count({ where: { tagihan: { sales_id: salesId } } }),
  ]);

  const totalSum = await prisma.historiPembayaran.aggregate({
    where: { tagihan: { sales_id: salesId } },
    _sum: { jumlah: true },
  });

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href={`/sales/tagihan/${salesId}`} className="icon-btn icon-btn-slate" style={{ width: "2.4rem", height: "2.4rem" }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="page-title">Riwayat Pembayaran</h1>
            <p className="page-subtitle">{sales.sales} · {total} entri</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1.5px solid #bbf7d0" }}>
        <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#15803d", marginBottom: "0.25rem" }}>Total Pembayaran</p>
        <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#15803d", letterSpacing: "-0.02em" }}>
          {formatRupiah(totalSum._sum.jumlah ?? 0)}
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>No</th>
              <th>Tgl Bayar</th>
              <th>Produk</th>
              <th>Tgl Tagihan</th>
              <th style={{ textAlign: "center", width: 110 }}>Nota</th>
              <th style={{ textAlign: "right" }}>Jumlah</th>
              <th style={{ textAlign: "center", width: 110 }}>Bukti Bayar</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={7} className="empty-state">Belum ada riwayat pembayaran</td></tr>
            )}
            {payments.map((p, i) => (
              <tr key={p.id}>
                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{(page - 1) * PER_PAGE + i + 1}</td>
                <td style={{ color: "var(--text-muted)" }}>{formatDate(p.createdAt)}</td>
                <td style={{ fontWeight: 600 }}>{p.tagihan.produk.nama}</td>
                <td style={{ color: "var(--text-muted)" }}>
                  {formatDate(p.tagihan.tanggal)}
                </td>
                <td style={{ textAlign: "center" }}>
                  {p.tagihan.image
                    ? <ImageModal src={p.tagihan.image} alt="nota tagihan" />
                    : <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>—</span>
                  }
                </td>
                <td style={{ textAlign: "right" }}>
                  <span className="badge badge-green" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    {formatRupiah(p.jumlah)}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  {p.gambar
                    ? <ImageModal src={p.gambar} alt="bukti bayar" />
                    : <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`?page=${p}`}
              className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
