import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/forms/UserForm";
import { updateUser } from "@/actions/users";
import { notFound } from "next/navigation";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, roles] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!user) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Edit Pengguna</h1>
      <UserForm
        roles={roles}
        userId={user.id}
        initialData={{ name: user.name, email: user.email, role_id: user.roles[0]?.role.id }}
        onSubmit={async (data) => { "use server"; return updateUser(user.id, data); }}
      />
    </div>
  );
}
