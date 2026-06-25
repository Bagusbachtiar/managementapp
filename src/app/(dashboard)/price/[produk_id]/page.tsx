import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { HargaImageUploader } from "./HargaImageUploader";

export default async function HargaImagePage({ params }: { params: Promise<{ produk_id: string }> }) {
  const { produk_id } = await params;
  const produkId = parseInt(produk_id, 10);
  if (isNaN(produkId)) notFound();

  const produk = await prisma.produk.findUnique({
    where: { id: produkId },
    include: { hargaImages: { orderBy: { createdAt: "desc" } } },
  });
  if (!produk) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/price" className="flex items-center gap-1" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem", textDecoration: "none" }}>
            <ChevronLeft size={14} /> Kembali ke Harga
          </Link>
          <h1 className="page-title">Foto Harga — {produk.nama}</h1>
          <p className="page-subtitle">{produk.hargaImages.length} foto tersimpan</p>
        </div>
      </div>

      <HargaImageUploader
        produkId={produk.id}
        produkNama={produk.nama}
        images={produk.hargaImages}
      />
    </div>
  );
}
