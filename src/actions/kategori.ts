"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({ kategori: z.string().min(1, "Nama kategori wajib diisi") });

export async function createKategori(formData: FormData) {
  const data = schema.parse({ kategori: formData.get("kategori") });
  await prisma.kategori.create({ data });
  revalidatePath("/kategori");
  return { success: true };
}

export async function updateKategori(id: number, formData: FormData) {
  const data = schema.parse({ kategori: formData.get("kategori") });
  await prisma.kategori.update({ where: { id }, data });
  revalidatePath("/kategori");
  return { success: true };
}

export async function deleteKategori(id: number) {
  await prisma.kategori.delete({ where: { id } });
  revalidatePath("/kategori");
  return { success: true };
}
