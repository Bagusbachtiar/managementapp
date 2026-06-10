"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Kategori, Stok } from "@prisma/client";

interface Variant {
  id?: number;
  nama_tipe: string;
  kategori_id: number;
  jumlah: number;
}

interface Props {
  kategoris: Kategori[];
  initialSalesName?: string;
  initialProdukName?: string;
  initialVariants?: (Stok & { kategori: Kategori })[];
  produkId?: number;
  onSubmit: (data: { sales_name: string; nama: string; variants: Variant[] }) => Promise<{ success: boolean }>;
}

export function ProdukForm({ kategoris, initialSalesName = "", initialProdukName = "", initialVariants = [], produkId, onSubmit }: Props) {
  const router = useRouter();
  const [salesName, setSalesName] = useState(initialSalesName);
  const [produkName, setProdukName] = useState(initialProdukName);
  const [variants, setVariants] = useState<Variant[]>(
    initialVariants.length > 0
      ? initialVariants.map((v) => ({ id: v.id, nama_tipe: v.nama_tipe, kategori_id: v.kategori_id, jumlah: v.jumlah }))
      : [{ nama_tipe: "", kategori_id: kategoris[0]?.id ?? 0, jumlah: 0 }]
  );
  const [isPending, startTransition] = useTransition();

  function addVariant() {
    setVariants((prev) => [...prev, { nama_tipe: "", kategori_id: kategoris[0]?.id ?? 0, jumlah: 0 }]);
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateVariant(idx: number, field: keyof Variant, value: string | number) {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await onSubmit({ sales_name: salesName, nama: produkName, variants });
        toast.success(produkId ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
        router.push("/produk");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sales</label>
          <input
            value={salesName}
            onChange={(e) => setSalesName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
          <input
            value={produkName}
            onChange={(e) => setProdukName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Varian Stok</h2>
          <button type="button" onClick={addVariant} className="text-blue-700 text-sm flex items-center gap-1 hover:underline">
            <Plus size={15} /> Tambah Varian
          </button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  value={v.nama_tipe}
                  onChange={(e) => updateVariant(i, "nama_tipe", e.target.value)}
                  placeholder="Nama tipe/varian"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={v.kategori_id}
                onChange={(e) => updateVariant(i, "kategori_id", Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {kategoris.map((k) => (
                  <option key={k.id} value={k.id}>{k.kategori}</option>
                ))}
              </select>
              <input
                type="number"
                value={v.jumlah}
                onChange={(e) => updateVariant(i, "jumlah", Number(e.target.value))}
                min={0}
                placeholder="Jumlah"
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
