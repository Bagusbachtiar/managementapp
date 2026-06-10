"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role_id: z.number().int().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  role_id: z.number().int().optional(),
});

export async function createUser(raw: unknown) {
  const data = createSchema.parse(raw);
  const hashed = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashed },
  });

  if (data.role_id) {
    await prisma.modelHasRole.create({
      data: { roleId: data.role_id, modelId: user.id, modelType: "User" },
    });
  }

  revalidatePath("/users");
  return { success: true };
}

export async function updateUser(id: string, raw: unknown) {
  const data = updateSchema.parse(raw);

  const updateData: { name: string; email: string; password?: string } = {
    name: data.name,
    email: data.email,
  };
  if (data.password && data.password.length > 0) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }

  await prisma.user.update({ where: { id }, data: updateData });

  await prisma.modelHasRole.deleteMany({ where: { modelId: id } });
  if (data.role_id) {
    await prisma.modelHasRole.create({
      data: { roleId: data.role_id, modelId: id, modelType: "User" },
    });
  }

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
  return { success: true };
}
