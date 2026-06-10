import { prisma } from "@/lib/prisma";
import { ProdukForm } from "@/components/forms/ProdukForm";
import { createProduk } from "@/actions/produk";

export default async function CreateProdukPage() {
  const kategoris = await prisma.kategori.findMany({ orderBy: { kategori: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Tambah Produk</h1>
      <ProdukForm
        kategoris={kategoris}
        onSubmit={async (data) => {
          "use server";
          return createProduk(data);
        }}
      />
    </div>
  );
}
