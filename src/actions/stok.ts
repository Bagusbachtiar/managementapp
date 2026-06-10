"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateStokSchema = z.object({
  id: z.number().int().positive(),
  nama_tipe: z.string().min(1),
  kategori_id: z.number().int().positive(),
  jumlah: z.number().int().min(0),
});

export async function updateStok(raw: unknown) {
  const data = updateStokSchema.parse(raw);
  const stok = await prisma.stok.findUnique({ where: { id: data.id } });
  if (!stok) throw new Error("Stok tidak ditemukan");
  await prisma.stok.update({
    where: { id: data.id },
    data: { nama_tipe: data.nama_tipe, kategori_id: data.kategori_id, jumlah: data.jumlah },
  });
  revalidatePath(`/stok/detailstok/${stok.produk_id}`);
  revalidatePath("/stok");
  return { success: true };
}

export async function deleteStok(id: number) {
  const stok = await prisma.stok.findUnique({ where: { id } });
  if (!stok) throw new Error("Stok tidak ditemukan");
  await prisma.stok.delete({ where: { id } });
  revalidatePath(`/stok/detailstok/${stok.produk_id}`);
  revalidatePath("/stok");
  return { success: true };
}

const schema = z.object({
  stok_id: z.number().int().positive(),
  jumlah_terjual: z.number().int().min(1, "Jumlah terjual minimal 1"),
});

export async function recordPenjualan(raw: unknown) {
  const data = schema.parse(raw);

  const stok = await prisma.stok.findUnique({
    where: { id: data.stok_id },
    include: { kategori: true, produk: true },
  });
  if (!stok) throw new Error("Stok tidak ditemukan");
  if (stok.jumlah < data.jumlah_terjual) throw new Error("Stok tidak mencukupi");

  const stokSesudah = stok.jumlah - data.jumlah_terjual;

  await prisma.$transaction([
    prisma.stok.update({
      where: { id: stok.id },
      data: { jumlah: stokSesudah },
    }),
    prisma.historyPenjualan.create({
      data: {
        stok_id: stok.id,
        produk_id: stok.produk_id,
        kategori_id: stok.kategori_id,
        nama_tipe: stok.nama_tipe,
        jumlah_terjual: data.jumlah_terjual,
        stok_sebelum: stok.jumlah,
        stok_sesudah: stokSesudah,
        tanggal_penjualan: new Date(),
      },
    }),
  ]);

  revalidatePath(`/stok/detailstok/${stok.produk_id}`);
  revalidatePath("/stok");
  return { success: true };
}
