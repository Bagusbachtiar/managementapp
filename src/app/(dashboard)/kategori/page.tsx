import { prisma } from "@/lib/prisma";
import { KategoriClient } from "./KategoriClient";

export default async function KategoriPage() {
  const kategoris = await prisma.kategori.findMany({ orderBy: { createdAt: "desc" } });
  return <KategoriClient kategoris={kategoris} />;
}
