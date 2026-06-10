"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Nama peran wajib diisi"),
  permission_ids: z.array(z.number().int()),
});

export async function createRole(raw: unknown) {
  const data = schema.parse(raw);

  await prisma.role.create({
    data: {
      name: data.name,
      permissions: {
        create: data.permission_ids.map((id) => ({ permissionId: id })),
      },
    },
  });

  revalidatePath("/roles");
  return { success: true };
}

export async function updateRole(id: number, raw: unknown) {
  const data = schema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.roleHasPermission.deleteMany({ where: { roleId: id } });
    await tx.role.update({
      where: { id },
      data: {
        name: data.name,
        permissions: {
          create: data.permission_ids.map((pid) => ({ permissionId: pid })),
        },
      },
    });
  });

  revalidatePath("/roles");
  return { success: true };
}

export async function deleteRole(id: number) {
  await prisma.role.delete({ where: { id } });
  revalidatePath("/roles");
  return { success: true };
}
