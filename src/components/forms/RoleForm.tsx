"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Permission } from "@prisma/client";

interface Props {
  permissions: Permission[];
  initialData?: { name: string; permission_ids: number[] };
  roleId?: number;
  onSubmit: (data: { name: string; permission_ids: number[] }) => Promise<{ success: boolean }>;
}

export function RoleForm({ permissions, initialData, roleId, onSubmit }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [selectedIds, setSelectedIds] = useState<number[]>(initialData?.permission_ids ?? []);
  const [isPending, startTransition] = useTransition();

  function togglePermission(id: number) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await onSubmit({ name, permission_ids: selectedIds });
        toast.success(roleId ? "Peran berhasil diperbarui" : "Peran berhasil ditambahkan");
        router.push("/roles");
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peran</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Izin</label>
          <div className="space-y-2">
            {permissions.map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={() => togglePermission(p.id)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">{p.name}</span>
              </label>
            ))}
          </div>
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
