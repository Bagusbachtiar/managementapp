import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export default async function SalesPage() {
  const sales = await prisma.sales.findMany({
    where: { sales: { not: "Inventori" } },
    orderBy: { createdAt: "desc" },
    include: { tagihans: true, produks: true },
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales</h1>
      </div>

      {/* Table — desktop */}
      <div className="sales-table-wrap card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>No</th>
              <th>Nama Sales</th>
              <th>Total Tagihan</th>
              <th>Belum Lunas</th>
              <th style={{ width: 120, textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr><td colSpan={5} className="empty-state">Belum ada sales</td></tr>
            )}
            {sales.map((s, i) => {
              const unpaid = s.tagihans.filter(t => t.tagihan !== "Lunas");
              const sisaTotal = unpaid.reduce((sum, t) => sum + (parseInt(t.tagihan) || 0), 0);
              return (
                <tr key={s.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, marginBottom: s.produks.length ? "0.35rem" : 0 }}>{s.sales}</div>
                    {s.produks.length > 0 && (
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        {s.produks.map(p => (
                          <span key={p.id} className="badge badge-indigo" style={{ fontSize: "0.68rem" }}>{p.nama}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>{unpaid.length} pesanan</td>
                  <td>
                    {unpaid.length === 0
                      ? <span className="badge badge-green">Lunas semua</span>
                      : <span className="badge badge-red">{formatRupiah(sisaTotal)}</span>
                    }
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Link href={`/sales/tagihan/${s.id}`} className="btn btn-primary btn-sm">Detail</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="sales-cards">
        {sales.length === 0 && (
          <div className="card empty-state">Belum ada sales</div>
        )}
        {sales.map((s, i) => {
          const unpaid = s.tagihans.filter(t => t.tagihan !== "Lunas");
          const sisaTotal = unpaid.reduce((sum, t) => sum + (parseInt(t.tagihan) || 0), 0);
          return (
            <div key={s.id} className="card" style={{ padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", minWidth: "1.25rem" }}>{i + 1}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{s.sales}</span>
                </div>
                <Link href={`/sales/tagihan/${s.id}`} className="btn btn-primary btn-sm">Detail</Link>
              </div>
              {s.produks.length > 0 && (
                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                  {s.produks.map(p => (
                    <span key={p.id} className="badge badge-indigo" style={{ fontSize: "0.68rem" }}>{p.nama}</span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className="badge badge-indigo" style={{ fontSize: "0.72rem" }}>{unpaid.length} belum lunas</span>
                {unpaid.length === 0
                  ? <span className="badge badge-green" style={{ fontSize: "0.72rem" }}>Lunas semua</span>
                  : <span className="badge badge-red" style={{ fontSize: "0.72rem" }}>{formatRupiah(sisaTotal)}</span>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
