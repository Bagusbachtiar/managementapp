import { prisma } from "@/lib/prisma";
import { ProdukForm } from "@/components/forms/ProdukForm";
import { updateProduk } from "@/actions/produk";
import { notFound } from "next/navigation";

export default async function EditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [produk, kategoris] = await Promise.all([
    prisma.produk.findUnique({
      where: { id: Number(id) },
      include: { sales: true, stoks: { include: { kategori: true } } },
    }),
    prisma.kategori.findMany({ orderBy: { kategori: "asc" } }),
  ]);

  if (!produk) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Edit Produk</h1>
      <ProdukForm
        kategoris={kategoris}
        initialSalesName={produk.sales.sales}
        initialProdukName={produk.nama}
        initialVariants={produk.stoks}
        produkId={produk.id}
        onSubmit={async (data) => {
          "use server";
          return updateProduk(produk.id, data);
        }}
      />
    </div>
  );
}
