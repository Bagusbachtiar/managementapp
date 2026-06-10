"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPembayaran } from "@/actions/pembayaran";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface Props {
  tagihanId: number;
}

export function BayarForm({ tagihanId }: Props) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState<number>(0);
  const [gambarUrl, setGambarUrl] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (jumlah <= 0) { toast.error("Jumlah harus lebih dari 0"); return; }
    startTransition(async () => {
      try {
        await createPembayaran({ tagihan_id: tagihanId, jumlah, gambar: gambarUrl || undefined });
        toast.success("Pembayaran berhasil dicatat");
        setJumlah(0); setGambarUrl("");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Gagal mencatat pembayaran");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          value={jumlah || ""}
          onChange={(e) => setJumlah(Number(e.target.value))}
          placeholder="Jumlah bayar (Rp)"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
        >
          {isPending ? "..." : "Bayar"}
        </button>
      </div>
      <ImageUpload onUpload={setGambarUrl} currentUrl={gambarUrl || undefined} />
    </form>
  );
}
