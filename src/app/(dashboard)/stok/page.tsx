import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TambahInventoriModal } from "./TambahInventoriModal";

export default async function StokPage() {
  const [produks, kategoris] = await Promise.all([
    prisma.produk.findMany({
      include: {
        sales: true,
        stoks: { include: { kategori: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.kategori.findMany({ orderBy: { kategori: "asc" } }),
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stok</h1>
          <p className="page-subtitle">{produks.length} produk terdaftar</p>
        </div>
        <TambahInventoriModal
          kategoris={kategoris}
          produks={produks.map(p => ({
            id: p.id,
            nama: p.nama,
            namaTipes: [...new Set(p.stoks.map(s => s.nama_tipe))].sort(),
            stoks: p.stoks.map(s => ({ nama_tipe: s.nama_tipe, jumlah: s.jumlah, kategori_id: s.kategori_id })),
          }))}
        />
      </div>

      {/* Table — desktop */}
      <div className="stok-table-wrap card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>No</th>
              <th>Produk</th>
              <th>Total Stok</th>
              <th style={{ width: 120, textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produks.length === 0 && (
              <tr><td colSpan={4} className="empty-state">Belum ada produk</td></tr>
            )}
            {produks.map((p, i) => {
              const totalStok = p.stoks.reduce((sum, s) => sum + s.jumlah, 0);
              return (
                <tr key={p.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, marginBottom: p.stoks.length ? "0.45rem" : 0 }}>{p.nama}</div>
                    {p.stoks.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.stoks.map((s) => (
                          <span key={s.id} className="badge badge-indigo" style={{ fontSize: "0.72rem" }}>
                            {s.nama_tipe} · {s.kategori.kategori} · {s.jumlah}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${totalStok <= 0 ? "badge-red" : "badge-green"}`}>
                      {totalStok}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Link href={`/stok/detailstok/${p.id}`} className="btn btn-primary btn-sm">
                      Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="stok-cards">
        {produks.length === 0 && (
          <div className="card empty-state">Belum ada produk</div>
        )}
        {produks.map((p) => {
          const totalStok = p.stoks.reduce((sum, s) => sum + s.jumlah, 0);
          return (
            <div key={p.id} className="card" style={{ padding: "1rem 1.1rem" }}>
              <div className="flex items-start justify-between" style={{ marginBottom: p.stoks.length ? "0.65rem" : "0.75rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{p.nama}</div>
                <span className={`badge ${totalStok <= 0 ? "badge-red" : "badge-green"}`} style={{ fontWeight: 700, flexShrink: 0 }}>
                  {totalStok}
                </span>
              </div>
              {p.stoks.length > 0 && (
                <div className="flex flex-wrap gap-1" style={{ marginBottom: "0.75rem" }}>
                  {p.stoks.map((s) => (
                    <span key={s.id} className="badge badge-indigo" style={{ fontSize: "0.72rem" }}>
                      {s.nama_tipe} · {s.kategori.kategori} · {s.jumlah}
                    </span>
                  ))}
                </div>
              )}
              <Link href={`/stok/detailstok/${p.id}`} className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                Detail
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
