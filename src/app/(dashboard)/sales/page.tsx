import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SalesPage() {
  const sales = await prisma.sales.findMany({
    where: { sales: { not: "Inventori" } },
    orderBy: { createdAt: "desc" },
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
              <th style={{ width: 120, textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr><td colSpan={3} className="empty-state">Belum ada sales</td></tr>
            )}
            {sales.map((s, i) => (
              <tr key={s.id}>
                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{s.sales}</td>
                <td style={{ textAlign: "center" }}>
                  <Link href={`/sales/tagihan/${s.id}`} className="btn btn-primary btn-sm">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="sales-cards">
        {sales.length === 0 && (
          <div className="card empty-state">Belum ada sales</div>
        )}
        {sales.map((s, i) => (
          <div key={s.id} className="card" style={{ padding: "1rem 1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", minWidth: "1.25rem" }}>{i + 1}</span>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{s.sales}</span>
            </div>
            <Link href={`/sales/tagihan/${s.id}`} className="btn btn-primary btn-sm">Detail</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
