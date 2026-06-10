"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pesanSchema = z.object({
  sales_id: z.number().int().positive(),
  produk_id: z.number().int().positive(),
  tagihan: z.string().min(1),
  notes: z.string().optional(),
  tanggal: z.string().min(1),
  image: z.string().min(1, "Bukti foto wajib diupload"),
  variants: z.array(z.object({ stok_id: z.number(), jumlah: z.number().int().min(0) })),
});

const updateSchema = z.object({
  sales_id: z.number().int().positive(),
  produk_id: z.number().int().positive(),
  tagihan: z.string().min(1),
  tanggal: z.string().min(1),
  image: z.string().optional(),
});

export async function createTagihan(raw: unknown) {
  const data = pesanSchema.parse(raw);
  const activeVariants = data.variants.filter((v) => v.jumlah > 0);

  await prisma.$transaction([
    prisma.tagihan.create({
      data: {
        sales_id: data.sales_id,
        produk_id: data.produk_id,
        tagihan: data.tagihan,
        notes: data.notes,
        image: data.image,
        tanggal: new Date(data.tanggal),
      },
    }),
    ...activeVariants.map((v) =>
      prisma.stok.update({
        where: { id: v.stok_id },
        data: { jumlah: { increment: v.jumlah } },
      })
    ),
  ]);

  revalidatePath(`/sales/tagihan/${data.sales_id}`);
  revalidatePath("/stok");
  return { success: true };
}

export async function updateTagihan(id: number, raw: unknown) {
  const data = updateSchema.parse(raw);

  const updateData: {
    sales_id: number;
    produk_id: number;
    tagihan: string;
    tanggal: Date;
    image?: string;
  } = {
    sales_id: data.sales_id,
    produk_id: data.produk_id,
    tagihan: data.tagihan,
    tanggal: new Date(data.tanggal),
  };
  if (data.image) updateData.image = data.image;

  await prisma.tagihan.update({ where: { id }, data: updateData });

  revalidatePath(`/sales/tagihan/${data.sales_id}`);
  return { success: true };
}

export async function deleteTagihan(id: number, salesId: number) {
  await prisma.tagihan.delete({ where: { id } });
  revalidatePath(`/sales/tagihan/${salesId}`);
  return { success: true };
}
