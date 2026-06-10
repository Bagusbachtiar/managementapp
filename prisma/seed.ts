import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const permissions = await Promise.all(
    ["role-list", "role-create", "role-edit", "role-delete"].map((name) =>
      prisma.permission.upsert({
        where: { name_guardName: { name, guardName: "web" } },
        update: {},
        create: { name, guardName: "web" },
      })
    )
  );

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", guardName: "web" },
  });

  await Promise.all(
    permissions.map((p) =>
      prisma.roleHasPermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      })
    )
  );

  const hashedPassword = await bcrypt.hash("password", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "Admin", email: "admin@example.com", password: hashedPassword },
  });

  await prisma.modelHasRole.upsert({
    where: { roleId_modelId_modelType: { roleId: adminRole.id, modelId: admin.id, modelType: "User" } },
    update: {},
    create: { roleId: adminRole.id, modelId: admin.id, modelType: "User" },
  });

  console.log("Seed complete. Admin: admin@example.com / password");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
