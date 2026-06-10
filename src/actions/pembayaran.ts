"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getHistoriByTagihan(tagihan_id: number) {
  return prisma.historiPembayaran.findMany({
    where: { tagihan_id },
    orderBy: { createdAt: "desc" },
  });
}

const schema = z.object({
  tagihan_id: z.number().int().positive(),
  jumlah: z.number().int().min(1, "Jumlah pembayaran minimal 1"),
  gambar: z.string().optional(),
});

export async function createPembayaran(raw: unknown) {
  const data = schema.parse(raw);

  const tagihan = await prisma.tagihan.findUnique({
    where: { id: data.tagihan_id },
    include: { sales: true },
  });
  if (!tagihan) throw new Error("Tagihan tidak ditemukan");
  if (tagihan.tagihan === "Lunas") throw new Error("Tagihan sudah lunas");

  const remaining = Number(tagihan.tagihan) - data.jumlah;

  await prisma.$transaction([
    prisma.tagihan.update({
      where: { id: data.tagihan_id },
      data: { tagihan: remaining <= 0 ? "Lunas" : String(remaining) },
    }),
    prisma.historiPembayaran.create({
      data: {
        tagihan_id: data.tagihan_id,
        jumlah: data.jumlah,
        gambar: data.gambar,
      },
    }),
  ]);

  revalidatePath(`/sales/tagihan/${tagihan.sales_id}`);
  revalidatePath(`/sales/tagihan/history/${tagihan.sales_id}`);
  return { success: true };
}
