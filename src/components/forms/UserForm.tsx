"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";

interface Props {
  roles: Role[];
  initialData?: { name: string; email: string; role_id?: number };
  userId?: string;
  onSubmit: (data: { name: string; email: string; password?: string; role_id?: number }) => Promise<{ success: boolean }>;
}

export function UserForm({ roles, initialData, userId, onSubmit }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | undefined>(initialData?.role_id);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await onSubmit({ name, email, password: password || undefined, role_id: roleId });
        toast.success(userId ? "Pengguna berhasil diperbarui" : "Pengguna berhasil ditambahkan");
        router.push("/users");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password {userId && <span className="text-gray-400 text-xs">(kosongkan jika tidak diubah)</span>}
          </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required={!userId} minLength={userId ? undefined : 8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peran</label>
          <select value={roleId ?? ""} onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tidak ada peran</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={isPending}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-60">
          {isPending ? "Menyimpan..." : "Simpan"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
          Batal
        </button>
      </div>
    </form>
  );
}
