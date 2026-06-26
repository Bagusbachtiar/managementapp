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
  catatan: z.string().optional(),
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
        harga_satuan: stok.harga,
        stok_sebelum: stok.jumlah,
        stok_sesudah: stokSesudah,
        tanggal_penjualan: new Date(),
        catatan: data.catatan || null,
      },
    }),
  ]);

  revalidatePath(`/stok/detailstok/${stok.produk_id}`);
  revalidatePath("/stok");
  return { success: true };
}

const bulkSchema = z.object({
  items: z.array(z.object({
    stok_id: z.number().int().positive(),
    jumlah_terjual: z.number().int().min(1),
  })).min(1),
  catatan: z.string().optional(),
});

export async function recordPenjualanBulk(raw: unknown) {
  const data = bulkSchema.parse(raw);
  const now = new Date();

  const stoks = await prisma.stok.findMany({
    where: { id: { in: data.items.map((i) => i.stok_id) } },
    include: { kategori: true },
  });

  const stokMap = new Map(stoks.map((s) => [s.id, s]));

  for (const item of data.items) {
    const stok = stokMap.get(item.stok_id);
    if (!stok) throw new Error(`Stok tidak ditemukan`);
    if (stok.jumlah < item.jumlah_terjual) throw new Error(`Stok ${stok.nama_tipe} tidak mencukupi (tersedia: ${stok.jumlah})`);
  }

  const ops: any[] = [];
  for (const item of data.items) {
    const stok = stokMap.get(item.stok_id)!;
    const stokSesudah = stok.jumlah - item.jumlah_terjual;
    ops.push(
      prisma.stok.update({ where: { id: stok.id }, data: { jumlah: stokSesudah } }),
      prisma.historyPenjualan.create({
        data: {
          stok_id: stok.id,
          produk_id: stok.produk_id,
          kategori_id: stok.kategori_id,
          nama_tipe: stok.nama_tipe,
          jumlah_terjual: item.jumlah_terjual,
          harga_satuan: stok.harga,
          stok_sebelum: stok.jumlah,
          stok_sesudah: stokSesudah,
          tanggal_penjualan: now,
          catatan: data.catatan || null,
        },
      })
    );
  }

  await prisma.$transaction(ops);
  revalidatePath("/stok");
  revalidatePath("/dashboard");
  return { success: true };
}

const updateHargaSchema = z.object({
  id: z.number().int().positive(),
  harga: z.number().int().min(0),
});

export async function updateStokHarga(raw: unknown) {
  const data = updateHargaSchema.parse(raw);
  await prisma.stok.update({ where: { id: data.id }, data: { harga: data.harga } });
  revalidatePath("/price");
  return { success: true };
}
