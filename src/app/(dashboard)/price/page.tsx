import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { PriceRow } from "./PriceRow";

export default async function PricePage() {
  const produks = await prisma.produk.findMany({
    include: {
      stoks: { include: { kategori: true }, orderBy: { nama_tipe: "asc" } },
      _count: { select: { hargaImages: true } },
    },
    orderBy: { nama: "asc" },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Harga</h1>
          <p className="page-subtitle">Kelola harga jual per tipe produk</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {produks.length === 0 && <div className="card empty-state">Belum ada produk</div>}
        {produks.map((p) => (
          <div key={p.id} className="card overflow-hidden">
            <div className="card-header">
              <span className="card-title">{p.nama}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-indigo">{p.stoks.length} tipe</span>
              <Link href={`/price/${p.id}`} className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <ImageIcon size={14} />
                Foto Harga
                {p._count.hargaImages > 0 && (
                  <span className="badge badge-green" style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>{p._count.hargaImages}</span>
                )}
              </Link>
            </div>
            </div>
            {p.stoks.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem" }}>Belum ada varian</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table" style={{ tableLayout: "fixed", width: "100%" }}>
                  <colgroup>
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "80px" }} />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Tipe</th>
                      <th>Stok</th>
                      <th>Harga Jual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.stoks.map((s) => (
                      <PriceRow
                        key={s.id}
                        stokId={s.id}
                        namaTipe={s.nama_tipe}
                        kategori={s.kategori.kategori}
                        jumlah={s.jumlah}
                        harga={s.harga}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
