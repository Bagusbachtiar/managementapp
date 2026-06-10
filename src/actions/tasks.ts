"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1, "Nama tugas wajib diisi") });

export async function createTask(formData: FormData) {
  const data = schema.parse({ name: formData.get("name") });
  await prisma.task.create({ data });
  revalidatePath("/tasks");
  return { success: true };
}

export async function updateTask(id: number, formData: FormData) {
  const data = schema.parse({ name: formData.get("name") });
  await prisma.task.update({ where: { id }, data });
  revalidatePath("/tasks");
  return { success: true };
}

export async function deleteTask(id: number) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  return { success: true };
}
