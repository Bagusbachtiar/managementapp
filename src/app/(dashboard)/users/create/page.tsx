import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/forms/UserForm";
import { createUser } from "@/actions/users";

export default async function CreateUserPage() {
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Tambah Pengguna</h1>
      <UserForm roles={roles} onSubmit={async (data) => { "use server"; return createUser(data); }} />
    </div>
  );
}
