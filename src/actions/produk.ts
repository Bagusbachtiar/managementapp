"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const variantSchema = z.object({
  id: z.number().optional(),
  nama_tipe: z.string().min(1),
  kategori_id: z.number(),
  jumlah: z.number().int().min(0),
});

const produkSchema = z.object({
  sales_name: z.string().min(1, "Nama sales wajib diisi"),
  nama: z.string().min(1, "Nama produk wajib diisi"),
  variants: z.array(variantSchema).min(1, "Minimal 1 varian"),
});

export async function createProduk(raw: unknown) {
  const data = produkSchema.parse(raw);

  const sales = await prisma.sales.create({ data: { sales: data.sales_name } });
  await prisma.produk.create({
    data: {
      nama: data.nama,
      id_sales: sales.id,
      stoks: {
        createMany: {
          data: data.variants.map((v) => ({
            nama_tipe: v.nama_tipe,
            kategori_id: v.kategori_id,
            jumlah: v.jumlah,
          })),
        },
      },
    },
  });

  revalidatePath("/produk");
  revalidatePath("/stok");
  return { success: true };
}

export async function updateProduk(produkId: number, raw: unknown) {
  const data = produkSchema.parse(raw);

  const produk = await prisma.produk.findUnique({
    where: { id: produkId },
    include: { stoks: true, sales: true },
  });
  if (!produk) throw new Error("Produk tidak ditemukan");

  const submittedIds = data.variants.filter((v) => v.id).map((v) => v.id!);
  const toDelete = produk.stoks.filter((s) => !submittedIds.includes(s.id));

  await prisma.$transaction([
    prisma.sales.update({
      where: { id: produk.id_sales },
      data: { sales: data.sales_name },
    }),
    prisma.produk.update({
      where: { id: produkId },
      data: { nama: data.nama },
    }),
    ...toDelete.map((s) => prisma.stok.delete({ where: { id: s.id } })),
    ...data.variants
      .filter((v) => v.id)
      .map((v) =>
        prisma.stok.update({
          where: { id: v.id! },
          data: { nama_tipe: v.nama_tipe, kategori_id: v.kategori_id, jumlah: v.jumlah },
        })
      ),
    ...(data.variants.filter((v) => !v.id).length > 0
      ? [
          prisma.stok.createMany({
            data: data.variants
              .filter((v) => !v.id)
              .map((v) => ({
                produk_id: produkId,
                nama_tipe: v.nama_tipe,
                kategori_id: v.kategori_id,
                jumlah: v.jumlah,
              })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/produk");
  revalidatePath("/stok");
  return { success: true };
}

const inventoriSchema = z.object({
  nama: z.string().min(1, "Nama produk wajib diisi"),
  variants: z.array(variantSchema).min(1, "Minimal 1 varian"),
});

export async function createInventoriProduk(raw: unknown) {
  const data = inventoriSchema.parse(raw);

  let inventori = await prisma.sales.findFirst({ where: { sales: "Inventori" } });
  if (!inventori) inventori = await prisma.sales.create({ data: { sales: "Inventori" } });

  await prisma.produk.create({
    data: {
      nama: data.nama,
      id_sales: inventori.id,
      stoks: {
        createMany: {
          data: data.variants.map((v) => ({
            nama_tipe: v.nama_tipe,
            kategori_id: v.kategori_id,
            jumlah: v.jumlah,
          })),
        },
      },
    },
  });

  revalidatePath("/stok");
  revalidatePath("/produk");
  return { success: true };
}

const addVariantsSchema = z.object({
  produk_id: z.number(),
  variants: z.array(variantSchema).min(1),
});

export async function addVariantsToInventori(raw: unknown) {
  const data = addVariantsSchema.parse(raw);
  await prisma.stok.createMany({
    data: data.variants.map((v) => ({
      produk_id: data.produk_id,
      nama_tipe: v.nama_tipe,
      kategori_id: v.kategori_id,
      jumlah: v.jumlah,
    })),
  });
  revalidatePath("/stok");
  revalidatePath("/produk");
  return { success: true };
}

export async function deleteProduk(id: number) {
  const produk = await prisma.produk.findUnique({ where: { id } });
  if (!produk) throw new Error("Produk tidak ditemukan");
  await prisma.sales.delete({ where: { id: produk.id_sales } });
  revalidatePath("/produk");
  revalidatePath("/stok");
  return { success: true };
}
