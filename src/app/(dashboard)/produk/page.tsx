import { prisma } from "@/lib/prisma";
import { ProdukClient } from "./ProdukClient";

export default async function ProdukPage() {
  const [sales, kategoris] = await Promise.all([
    prisma.sales.findMany({
      where: { sales: { not: "Inventori" } },
      include: {
        produks: {
          include: { stoks: { include: { kategori: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.kategori.findMany({ orderBy: { kategori: "asc" } }),
  ]);

  return <ProdukClient sales={sales} kategoris={kategoris} />;
}
