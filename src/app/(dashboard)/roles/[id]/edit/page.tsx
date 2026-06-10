import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import { RoleForm } from "@/components/forms/RoleForm";
import { updateRole } from "@/actions/roles";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const canEdit = await hasPermission("role-edit");
  if (!canEdit) redirect("/dashboard");

  const { id } = await params;
  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({
      where: { id: Number(id) },
      include: { permissions: true },
    }),
    prisma.permission.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!role) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Edit Peran</h1>
      <RoleForm
        permissions={permissions}
        roleId={role.id}
        initialData={{ name: role.name, permission_ids: role.permissions.map((p) => p.permissionId) }}
        onSubmit={async (data) => { "use server"; return updateRole(role.id, data); }}
      />
    </div>
  );
}
