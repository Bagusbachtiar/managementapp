"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createTagihan } from "@/actions/tagihan";
import type { Kategori, Produk, Sales, Stok } from "@prisma/client";

type SalesWithProduks = Sales & {
  produks: (Produk & { stoks: (Stok & { kategori: Kategori })[] })[];
};

interface Props {
  sales: SalesWithProduks;
}

export function TagihanForm({ sales }: Props) {
  const router = useRouter();
  const [produkId, setProdukId] = useState<number>(sales.produks[0]?.id ?? 0);
  const [tagihan, setTagihan] = useState("");
  const [notes, setNotes] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [variantQty, setVariantQty] = useState<Record<number, number>>({});
  const [isPending, startTransition] = useTransition();

  const selectedProduk = sales.produks.find((p) => p.id === produkId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) { toast.error("Bukti foto wajib diupload"); return; }
    startTransition(async () => {
      try {
        const variants = Object.entries(variantQty)
          .filter(([, qty]) => qty > 0)
          .map(([stok_id, jumlah]) => ({ stok_id: Number(stok_id), jumlah }));

        await createTagihan({
          sales_id: sales.id,
          produk_id: produkId,
          tagihan,
          notes,
          tanggal,
          image: imageUrl,
          variants,
        });
        toast.success("Tagihan berhasil dibuat");
        setTagihan(""); setNotes(""); setImageUrl(""); setVariantQty({});
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Gagal membuat tagihan");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Produk</label>
          <select
            value={produkId}
            onChange={(e) => setProdukId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sales.produks.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Tagihan (Rp)</label>
          <input
            type="number"
            value={tagihan}
            onChange={(e) => setTagihan(e.target.value)}
            required
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedProduk && selectedProduk.stoks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tambah Stok Varian</label>
            <div className="space-y-2">
              {selectedProduk.stoks.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1">{s.nama_tipe} ({s.kategori.kategori})</span>
                  <input
                    type="number"
                    min={0}
                    value={variantQty[s.id] ?? 0}
                    onChange={(e) => setVariantQty((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Foto *</label>
          <ImageUpload onUpload={setImageUrl} currentUrl={imageUrl || undefined} />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Buat Tagihan"}
        </button>
      </div>
    </form>
  );
}
