import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TagihanPageClient } from "./TagihanPageClient";

export default async function TagihanSalesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const salesId = Number(id);

  const [sales, tagihans] = await Promise.all([
    prisma.sales.findUnique({
      where: { id: salesId },
      include: {
        produks: {
          include: { stoks: { include: { kategori: true } } },
        },
      },
    }),
    prisma.tagihan.findMany({
      where: { sales_id: salesId },
      include: { produk: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!sales) notFound();

  return <TagihanPageClient sales={sales} tagihans={tagihans} />;
}
