import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { RoleForm } from "@/components/forms/RoleForm";
import { createRole } from "@/actions/roles";

export default async function CreateRolePage() {
  const canCreate = await hasPermission("role-create");
  if (!canCreate) redirect("/dashboard");

  const permissions = await prisma.permission.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Tambah Peran</h1>
      <RoleForm permissions={permissions} onSubmit={async (data) => { "use server"; return createRole(data); }} />
    </div>
  );
}
