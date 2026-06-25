"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addSchema = z.object({
  produk_id: z.number().int().positive(),
  image: z.string().url(),
});

export async function addHargaImage(raw: unknown) {
  const data = addSchema.parse(raw);
  const count = await prisma.hargaImage.count({ where: { produk_id: data.produk_id } });
  if (count >= 3) throw new Error("Maksimal 3 foto per produk");
  await prisma.hargaImage.create({ data: { produk_id: data.produk_id, image: data.image } });
  revalidatePath(`/price/${data.produk_id}`);
  return { success: true };
}

export async function deleteHargaImage(id: number, produk_id: number) {
  await prisma.hargaImage.delete({ where: { id } });
  revalidatePath(`/price/${produk_id}`);
  return { success: true };
}
