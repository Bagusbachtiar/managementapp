import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { HargaImageUploader } from "./HargaImageUploader";
import { PriceRow } from "../PriceRow";

export default async function HargaImagePage({ params }: { params: Promise<{ produk_id: string }> }) {
  const { produk_id } = await params;
  const produkId = parseInt(produk_id, 10);
  if (isNaN(produkId)) notFound();

  const produk = await prisma.produk.findUnique({
    where: { id: produkId },
    include: {
      hargaImages: { orderBy: { createdAt: "desc" } },
      stoks: { include: { kategori: true }, orderBy: { nama_tipe: "asc" } },
    },
  });
  if (!produk) notFound();

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/price" className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
            <ChevronLeft size={18} /> Kembali
          </Link>
          <div>
            <h1 className="page-title">{produk.nama}</h1>
            <p className="page-subtitle">Edit harga &amp; foto harga</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Price table */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Harga per Tipe</span>
          </div>
          {produk.stoks.length === 0 ? (
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
                    <th>Harga Net</th>
                  </tr>
                </thead>
                <tbody>
                  {produk.stoks.map((s) => (
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

        {/* Photo gallery */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <span className="card-title">Foto Harga</span>
            <span className="badge badge-indigo">{produk.hargaImages.length}/3</span>
          </div>
          <div style={{ padding: "1rem" }}>
            <HargaImageUploader
              produkId={produk.id}
              produkNama={produk.nama}
              images={produk.hargaImages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
